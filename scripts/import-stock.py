"""Convert documents/products/Stock.xlsx into src/data/firearm-stock.ts."""

from __future__ import annotations

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
XLSX = ROOT / "documents" / "products" / "Stock.xlsx"
OUT = ROOT / "src" / "data" / "firearm-stock.ts"

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

BRANDS = sorted(
    [
        "Cogswell & Harrison",
        "Webley & Scott",
        "Webley and Scott",
        "Webley Scott",
        "Classic Doubles",
        "Winchester",
        "Bettinsoli",
        "Browning",
        "Beretta",
        "Berretta",
        "Bergara",
        "Remington",
        "Anschutz",
        "Anschütz",
        "Hatsan",
        "Fabarm",
        "Rizzini",
        "Rizinni",
        "Huglu",
        "Yildiz",
        "Yaldiz",
        "Howa",
        "Ruger",
        "Tikka",
        "Steyr",
        "Sabatti",
        "Marlin",
        "Lanber",
        "Churchill",
        "Diamond",
        "Armsan",
        "Silma",
        "Fausti",
        "Baikal",
        "Revo",
        "Arigzaga",
        "Kestral",
        "Kestrel",
        "BSA",
        "Bsa",
        "AYA",
        "CZ",
        "Luger",
        "Blaser",
        "Miroku",
        "Pard",
        "Pulsar",
        "InfiRay",
        "Pixfra",
        "Vortex",
        "Champion",
        "Webley",
    ],
    key=len,
    reverse=True,
)

SKIP_NAMES = (
    "rimfire",
    "centerfire",
    "center fire",
    "semi-automatic",
    "over/unders",
    "over & under",
    "side by side",
    "all brands available",
    "many others",
    "stock is always changing",
    "many other models",
)

NOTE_PREFIXES = ("click",)


def colrow(ref: str) -> tuple[int, int]:
    col = ""
    row = ""
    for ch in ref:
        if ch.isalpha():
            col += ch
        else:
            row += ch
    n = 0
    for ch in col:
        n = n * 26 + (ord(ch.upper()) - 64)
    return n - 1, int(row) - 1


def clean(text: str) -> str:
    text = (text or "").replace("\xa0", " ").replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def load_workbook(path: Path):
    with zipfile.ZipFile(path) as z:
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        relmap = {el.attrib["Id"]: el.attrib["Target"] for el in rels}
        sheets = []
        for sh in wb.findall("m:sheets/m:sheet", NS):
            rid = sh.attrib[f"{REL_NS}id"]
            sheets.append((sh.attrib["name"], "xl/" + relmap[rid].lstrip("/")))
        strings = []
        ss = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in ss.findall("m:si", NS):
            texts = [
                t.text or ""
                for t in si.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")
            ]
            strings.append("".join(texts))

        def sheet_rows(xmlpath: str):
            root = ET.fromstring(z.read(xmlpath))
            rows: dict[int, dict[int, str]] = {}
            maxc = 0
            maxr = 0
            for c in root.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c"):
                ref = c.attrib.get("r")
                if not ref:
                    continue
                col, row = colrow(ref)
                t = c.attrib.get("t")
                v = c.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v")
                isel = c.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}is")
                val = ""
                if t == "s" and v is not None and v.text:
                    val = strings[int(v.text)]
                elif t == "inlineStr" and isel is not None:
                    val = "".join(
                        (t.text or "")
                        for t in isel.iter(
                            "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"
                        )
                    )
                elif v is not None and v.text:
                    val = v.text
                rows.setdefault(row, {})[col] = clean(val)
                maxc = max(maxc, col)
                maxr = max(maxr, row)
            table = []
            for r in range(maxr + 1):
                table.append([rows.get(r, {}).get(c, "") for c in range(maxc + 1)])
            return table

        return {name: sheet_rows(target) for name, target in sheets}


def skip_row(name: str) -> bool:
    lowered = name.lower()
    if not lowered:
        return True
    if is_featured_row(name):
        return False
    if any(lowered == s or lowered.startswith(s) for s in SKIP_NAMES):
        return True
    if any(lowered.startswith(p) for p in NOTE_PREFIXES):
        return True
    return False


def is_featured_row(name: str) -> bool:
    lowered = name.lower()
    return lowered.startswith("package deals") or lowered.startswith("new rimfire")


def featured_product(name: str, price_raw: str) -> dict:
    lowered = name.lower()
    price = format_price(price_raw)
    if lowered.startswith("package deals"):
        extras = ""
        if "=" in name:
            extras = name.split("=", 1)[1]
        extras = extras.replace(",", ", ").strip()
        if extras:
            extras = extras[0].upper() + extras[1:]
        item = {
            "name": "Rifle packages",
            "summary": summary_parts(
                extras or "Scope, moderator, bipod, case and strap",
                "Ask in the shop to build a package",
            ),
            "badge": "Featured",
            "featured": True,
        }
        if price:
            item["price"] = price
        return item
    item = {
        "name": "New rimfire rifles",
        "summary": "A range of new rimfire rifles. Call for current models in stock.",
        "badge": "Featured",
        "featured": True,
    }
    if price:
        item["price"] = price
    return item


def is_sold(price: str, stock: str) -> bool:
    blob = f"{price} {stock}".lower()
    if "order" in blob:
        return False
    return bool(re.search(r"\bsold\b", blob)) or stock.strip() == "0"


def format_price(raw: str) -> str | None:
    raw = clean(raw)
    if not raw:
        return None
    if re.fullmatch(r"[\d.]+", raw):
        n = float(raw)
        return f"€{int(n):,}"
    m = re.fullmatch(r"(\d+)\s*-\s*(\d+)", raw)
    if m:
        return f"€{int(m.group(1))}–€{int(m.group(2))}"
    m = re.search(r"(?i)from\s+(\d+)", raw)
    if m:
        return f"From €{m.group(1)}"
    m = re.search(r"(?i)start(?:ing)?\s*@?\s*(\d+)", raw)
    if m:
        return f"From €{m.group(1)}"
    return raw


def format_stock(raw: str) -> str | None:
    raw = clean(raw)
    if not raw:
        return None
    if re.fullmatch(r"\d+", raw):
        n = int(raw)
        if n <= 0:
            return None
        return f"{n} in stock"
    if re.search(r"order", raw, re.I):
        return re.sub(r"(?i)sold/", "", raw).strip()
    return raw


def brand_for(name: str) -> str | None:
    lowered = name.lower()
    for brand in BRANDS:
        if lowered.startswith(brand.lower()):
            if brand.lower() in {"yaldiz"}:
                return "Yildiz"
            if brand.lower() in {"berretta"}:
                return "Beretta"
            if brand.lower() in {"rizinni"}:
                return "Rizzini"
            if brand.lower() in {"webley scott", "webley and scott"}:
                return "Webley & Scott"
            if brand.lower() == "bsa":
                return "BSA"
            if brand.lower() == "anschutz":
                return "Anschütz"
            return brand
    first = re.split(r"[\s,/]+", name, maxsplit=1)[0]
    return first if first else None


def summary_parts(*parts: str | None) -> str:
    cleaned = [p for p in (clean(p) if p else "" for p in parts) if p]
    return " · ".join(cleaned)


def products_from_sheet(rows: list[list[str]], badge: str, kind: str) -> list[dict]:
    items = []
    for row in rows[1:]:
        while len(row) < 4:
            row.append("")
        name, spec, extra, price_raw = row[0], row[1], row[2], row[3]
        if skip_row(name):
            continue
        if is_featured_row(name):
            items.append(featured_product(name, price_raw))
            continue
        if is_sold(price_raw, extra if badge == "New" else ""):
            continue
        brand = brand_for(name)
        if kind == "rifle":
            stock = format_stock(extra) if badge == "New" else None
            condition = extra if badge == "Used" else None
            summary = summary_parts(spec, stock)
        else:
            stock = format_stock(extra) if badge == "New" else None
            condition = extra if badge == "Used" else None
            summary = summary_parts(spec, stock)
        if not summary:
            summary = "Ask in the shop for current details."
        price = format_price(price_raw)
        if price and re.search(r"(?i)\bsold\b", price):
            continue
        item = {
            "name": name,
            "summary": summary,
            "badge": badge,
        }
        if condition:
            item["condition"] = condition
        if price:
            item["price"] = price
        if brand:
            item["brands"] = [brand]
        items.append(item)
    featured = [item for item in items if item.get("featured")]
    rest = [item for item in items if not item.get("featured")]
    return featured + rest


def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def emit_array(name: str, items: list[dict]) -> str:
    lines = [f"export const {name} = ["]
    for item in items:
        lines.append("  {")
        lines.append(f"    name: {ts_string(item['name'])},")
        if item.get("brands"):
            brands = ", ".join(ts_string(b) for b in item["brands"])
            lines.append(f"    brands: [{brands}],")
        lines.append(f"    summary: {ts_string(item['summary'])},")
        if item.get("price"):
            lines.append(f"    price: {ts_string(item['price'])},")
        lines.append(f"    badge: {ts_string(item['badge'])},")
        if item.get("condition"):
            lines.append(f"    condition: {ts_string(item['condition'])},")
        if item.get("featured"):
            lines.append("    featured: true,")
        lines.append("  },")
    lines.append("];")
    return "\n".join(lines)


def main() -> None:
    sheets = load_workbook(XLSX)
    rifles = products_from_sheet(sheets["New Rifles"], "New", "rifle") + products_from_sheet(
        sheets["Used Rifles"], "Used", "rifle"
    )
    shotguns = products_from_sheet(sheets["New Shotguns"], "New", "shotgun") + products_from_sheet(
        sheets["Used Shotguns"], "Used", "shotgun"
    )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    body = "\n\n".join(
        [
            "/* Generated from documents/products/Stock.xlsx by scripts/import-stock.py */",
            emit_array("rifleStock", rifles),
            emit_array("shotgunStock", shotguns),
        ]
    )
    OUT.write_text(body + "\n", encoding="utf-8")
    print(f"Wrote {len(rifles)} rifles and {len(shotguns)} shotguns to {OUT}")


if __name__ == "__main__":
    main()
