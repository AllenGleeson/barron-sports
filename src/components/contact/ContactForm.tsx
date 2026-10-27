"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ActionButton } from "@/components/ui/Button";
import { fieldClass, fieldLabelClass } from "@/components/ui/styles";
import { site } from "@/lib/site";

const SUBJECTS = [
  "Product",
  "Brand",
  "Special offer",
  "Repair or service",
  "Firearms course",
  "Stock or availability",
] as const;


export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [subjectError, setSubjectError] = useState(false);

  return (
    <form
      className="border border-line bg-moss p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const name = String(data.get("name") ?? "");
        const email = String(data.get("email") ?? "");
        const topic = String(data.get("subject") ?? "").trim();
        const message = String(data.get("message") ?? "");

        if (!topic) {
          setSubjectError(true);
          return;
        }

        setSubjectError(false);
        const subject = encodeURIComponent(`${topic} enquiry from ${name}`);
        const body = encodeURIComponent(`${message}\n\n${name}\n${email}`);
        // site.email.href is an absolute mailto: link, so the base path doesn't apply.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(`${site.email.href}?subject=${subject}&body=${body}`);
        setSent(true);
      }}
    >
      <div className="grid gap-4">
        <label className="block">
          <span className={fieldLabelClass}>Name</span>
          <input name="name" required autoComplete="name" className={fieldClass} />
        </label>
        <label className="block">
          <span className={fieldLabelClass}>Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </label>
        <SubjectSearch error={subjectError} onChange={() => setSubjectError(false)} />
        <label className="block">
          <span className={fieldLabelClass}>Message</span>
          <textarea name="message" required rows={6} className={`${fieldClass} resize-y`} />
        </label>
      </div>
      <ActionButton type="submit" className="mt-4">
        Send message
      </ActionButton>
      {sent ? (
        <p className="mt-4 text-sm text-parchment" role="status">
          Your email application should open with the message ready to send.
        </p>
      ) : null}
    </form>
  );
}

function SubjectSearch({ error, onChange }: { error: boolean; onChange: () => void }) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? SUBJECTS.filter((subject) => subject.toLowerCase().includes(needle))
    : SUBJECTS;
  const subject = (checked ?? query).trim();

  useEffect(() => {
    const closeIfOutside = (node: EventTarget | null) => {
      if (!rootRef.current?.contains(node as Node)) setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => closeIfOutside(event.target);
    const onFocusIn = (event: FocusEvent) => closeIfOutside(event.target);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggle = (next: string) => {
    onChange();
    if (checked === next) {
      setChecked(null);
      return;
    }
    setChecked(next);
    setQuery(next);
  };

  return (
    <div ref={rootRef} className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-stone" id={`${listId}-label`}>
        Subject
      </span>
      <div className="relative mt-2">
        <input
          type="search"
          role="combobox"
          aria-labelledby={`${listId}-label`}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={error || undefined}
          placeholder="Search subjects or type your own"
          value={query}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onMouseDown={() => setOpen(true)}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setOpen(true);
            onChange();
            if (checked && next !== checked) setChecked(null);
          }}
          className="subject-search w-full border border-line bg-ink px-3 py-3 pr-10 text-cream outline-none focus:border-brass"
        />
        <input type="hidden" name="subject" value={subject} />
        {query ? (
          <button
            type="button"
            aria-label="Clear subject"
            className="absolute inset-y-0 right-1 z-10 flex cursor-pointer items-center px-2 text-brass hover:text-cream"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("");
              setChecked(null);
              onChange();
              setOpen(true);
            }}
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        ) : (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone" aria-hidden="true">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </span>
        )}
        {open ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-px w-full border border-line bg-ink py-1 shadow-2xl shadow-black/40"
            onMouseDown={(event) => event.preventDefault()}
          >
            {matches.map((item) => {
              const isChecked = checked === item;
              return (
                <li key={item} role="option" aria-selected={isChecked}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm text-cream hover:bg-moss">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(item)}
                      className="h-4 w-4 shrink-0 accent-brass"
                    />
                    {item}
                  </label>
                </li>
              );
            })}
            {matches.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-parchment">
                No matching subjects. “{query.trim()}” will be used.
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-brass" role="alert">
          Tick a subject or type your own.
        </p>
      ) : null}
    </div>
  );
}
