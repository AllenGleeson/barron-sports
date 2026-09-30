export function assetPath(src: string) {
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!base) return src;
  if (src === base || src.startsWith(`${base}/`)) return src;

  return src.startsWith("/") ? `${base}${src}` : `${base}/${src}`;
}
