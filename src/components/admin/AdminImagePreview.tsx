"use client";

import { useState } from "react";

type AdminImagePreviewProps = {
  src: string | null | undefined;
  alt?: string;
  variant?: "photo" | "logo";
  emptyLabel?: string;
};

export function AdminImagePreview({
  src,
  alt = "",
  variant = "photo",
  emptyLabel = "No image",
}: AdminImagePreviewProps) {
  const trimmed = src?.trim() ?? "";
  // Remember which URL failed, so typing a new one clears the error.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === trimmed;

  const frame =
    variant === "logo"
      ? "flex aspect-[4/3] w-full items-center justify-center overflow-hidden border border-line bg-cream p-4"
      : "aspect-[4/3] w-full overflow-hidden border border-line bg-ink";

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-stone">Preview</p>
      <div className={`mt-2 ${frame}`}>
        {!trimmed ? (
          <p className="flex h-full items-center justify-center px-3 text-center text-xs text-stone">
            {emptyLabel}
          </p>
        ) : failed ? (
          <p className="flex h-full items-center justify-center px-3 text-center text-xs text-stone">
            Image could not be loaded
          </p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={trimmed}
            src={trimmed}
            alt={alt}
            onError={() => setFailedSrc(trimmed)}
            className={
              variant === "logo"
                ? "max-h-full max-w-full object-contain"
                : "h-full w-full object-cover"
            }
          />
        )}
      </div>
    </div>
  );
}
