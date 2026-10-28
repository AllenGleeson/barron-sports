"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminField, AdminInput, adminButton } from "@/components/admin/fields";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminImagePreview } from "@/components/admin/AdminImagePreview";
import { ACCEPTED_IMAGE_TYPES, MAX_INPUT_BYTES } from "@/lib/admin/imageCompression";
import {
  formatBytes,
  imageLibrary,
  isLibraryUrl,
  type LibraryImage,
  type UploadResult,
} from "@/lib/admin/imageLibrary";
import { useAdminStore } from "@/lib/admin/store";

type Source = "url" | "gallery" | "upload";

const sources: { id: Source; label: string }[] = [
  { id: "url", label: "Image URL" },
  { id: "gallery", label: "Gallery" },
  { id: "upload", label: "Upload photo" },
];

type AdminImageFieldProps = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  /** Alt text for the preview. */
  alt?: string;
  required?: boolean;
  hint?: string;
  error?: string;
};

/**
 * Image picker for admin forms: type a URL, pick from the gallery, or upload a
 * photo. Whichever is used, the result is a URL in `value`, shown in the preview.
 */
export function AdminImageField({
  label = "Image",
  value,
  onChange,
  alt = "",
  required = false,
  hint,
  error,
}: AdminImageFieldProps) {
  const [source, setSource] = useState<Source>(isLibraryUrl(value) ? "gallery" : "url");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [lastUpload, setLastUpload] = useState<UploadResult | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function choose(next: Source) {
    setSource(next);
    setUploadError("");
    if (next === "gallery") setGalleryOpen(true);
    if (next === "upload") fileInput.current?.click();
  }

  async function upload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const image = await imageLibrary.upload(file);
      setLastUpload(image);
      onChange(image.url);
    } catch (reason) {
      setUploadError(reason instanceof Error ? reason.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_14rem] lg:col-span-2">
      <AdminField as="group" label={label} required={required} hint={hint} error={error}>
        <div className="mt-2 flex flex-wrap gap-2">
          {sources.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={source === item.id}
              className={source === item.id ? adminButton.primary : adminButton.secondary}
              onClick={() => choose(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void upload(file);
          }}
        />

        {source === "url" ? (
          <AdminInput
            aria-label={`${label} URL`}
            placeholder="https://… or /products/…"
            invalid={Boolean(error)}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : null}

        {source === "gallery" ? (
          <SourceNote>
            {value ? "Using an image from the gallery." : "No image chosen yet."}{" "}
            <button
              type="button"
              className={adminButton.ghost}
              onClick={() => setGalleryOpen(true)}
            >
              Open gallery
            </button>
          </SourceNote>
        ) : null}

        {source === "upload" ? (
          <>
            <SourceNote>
              {uploading
                ? "Compressing and uploading…"
                : lastUpload && lastUpload.url === value
                  ? `Using ${lastUpload.name}: ${lastUpload.width}×${lastUpload.height}, ${formatBytes(
                      lastUpload.bytes ?? 0,
                    )} (was ${formatBytes(lastUpload.originalBytes)}).`
                  : "No photo uploaded yet."}{" "}
              <button
                type="button"
                className={adminButton.ghost}
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                {lastUpload ? "Choose another" : "Choose a photo"}
              </button>
            </SourceNote>
            <p className="mt-1 text-xs text-stone">
              JPG, PNG, WebP, AVIF, GIF or HEIC up to {MAX_INPUT_BYTES / 1024 / 1024} MB. Photos are
              resized to fit 1600px and compressed before upload.
            </p>
          </>
        ) : null}

        {uploadError ? (
          <p role="alert" className="mt-2 text-xs text-red-300">
            {uploadError}
          </p>
        ) : null}
        {value ? (
          <button
            type="button"
            className="mt-2 text-xs text-stone underline-offset-2 hover:text-cream hover:underline"
            onClick={() => onChange("")}
          >
            Remove image
          </button>
        ) : null}
      </AdminField>

      <AdminImagePreview src={value} alt={alt} />

      {galleryOpen ? (
        <ImageGalleryModal
          selectedUrl={value}
          onClose={() => setGalleryOpen(false)}
          onSelect={(url) => {
            onChange(url);
            setGalleryOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function SourceNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 border border-line bg-ink px-3 py-2.5 text-sm text-parchment">
      {children}
    </p>
  );
}

/** Images already used by admin records, so they can be reused. */
function useSiteImages() {
  const { data } = useAdminStore();
  return useMemo(() => {
    const urls = [
      ...data.products.map((row) => row.imageUrl),
      ...data.services.map((row) => row.imageUrl),
      ...data.categories.map((row) => row.imageUrl),
    ];
    const usable = urls.filter(
      (url): url is string =>
        typeof url === "string" &&
        url.trim() !== "" &&
        !url.startsWith("data:") &&
        // Uploads are listed in their own section.
        !isLibraryUrl(url),
    );
    return [...new Set(usable)];
  }, [data]);
}

/** Names of the admin records that use an image URL. */
function useImageUsage() {
  const { data } = useAdminStore();
  return (url: string) => [
    ...data.products.filter((row) => row.imageUrl === url).map((row) => row.name),
    ...data.services.filter((row) => row.imageUrl === url).map((row) => row.title),
    ...data.brands.filter((row) => row.logoUrl === url).map((row) => row.name),
  ];
}

function ImageGalleryModal({
  selectedUrl,
  onSelect,
  onClose,
}: {
  selectedUrl: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [uploads, setUploads] = useState<LibraryImage[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [deleting, setDeleting] = useState<LibraryImage | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const siteImages = useSiteImages();
  const usedBy = useImageUsage();

  useEffect(() => {
    let active = true;
    imageLibrary
      .list()
      .then((rows) => active && setUploads(rows))
      .catch(
        (error: Error) => active && setLoadError(`The gallery couldn't be loaded: ${error.message}`),
      );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function removeUpload(image: LibraryImage) {
    setDeleteError("");
    try {
      await imageLibrary.remove(image);
      setUploads((rows) => rows?.filter((row) => row.id !== image.id) ?? null);
    } catch (error) {
      setDeleteError(`${image.name} couldn't be deleted: ${(error as Error).message}`);
    }
    setDeleting(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/80 px-4 py-10"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-gallery-title"
        className="my-auto w-full max-w-4xl border border-line bg-moss p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-brass">Gallery</p>
            <h2 id="image-gallery-title" className="mt-2 font-display text-3xl text-cream">
              Choose an image
            </h2>
          </div>
          <button type="button" className={adminButton.secondary} onClick={onClose}>
            Close
          </button>
        </div>

        <GallerySection title="Uploaded photos">
          {deleteError ? <p className="mb-3 text-sm text-red-300">{deleteError}</p> : null}
          {loadError ? (
            <p className="text-sm text-red-300">{loadError}</p>
          ) : uploads === null ? (
            <p className="text-sm text-stone">Loading…</p>
          ) : uploads.length === 0 ? (
            <p className="text-sm text-stone">
              No uploads yet. Photos you upload are saved here so you can reuse them.
            </p>
          ) : (
            <GalleryGrid>
              {uploads.map((image) => (
                <GalleryTile
                  key={image.id}
                  url={image.url}
                  label={image.name}
                  detail={image.bytes ? formatBytes(image.bytes) : undefined}
                  selected={image.url === selectedUrl}
                  onSelect={() => onSelect(image.url)}
                  onRemove={() => setDeleting(image)}
                />
              ))}
            </GalleryGrid>
          )}
        </GallerySection>

        <GallerySection title="Already on the site">
          {siteImages.length === 0 ? (
            <p className="text-sm text-stone">No images yet.</p>
          ) : (
            <GalleryGrid>
              {siteImages.map((url) => (
                <GalleryTile
                  key={url}
                  url={url}
                  label={url.split("/").pop() ?? url}
                  selected={url === selectedUrl}
                  onSelect={() => onSelect(url)}
                />
              ))}
            </GalleryGrid>
          )}
        </GallerySection>

        <p className="mt-6 text-xs leading-relaxed text-stone">
          Uploads are stored online and shared by everyone who uses the admin.
        </p>
      </div>
      {deleting ? (
        <AdminConfirmModal
          eyebrow="Confirm delete"
          title={`Delete ${deleting.name}?`}
          confirmLabel="Delete image"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={() => void removeUpload(deleting)}
        >
          <p>The file is removed from storage. This cannot be undone.</p>
          {usedBy(deleting.url).length > 0 ? (
            <p>
              It&apos;s still used by {usedBy(deleting.url).join(", ")}. Those will show no image
              until you choose another.
            </p>
          ) : null}
        </AdminConfirmModal>
      ) : null}
    </div>
  );
}

function GallerySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-stone">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function GalleryGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
      {children}
    </ul>
  );
}

function GalleryTile({
  url,
  label,
  detail,
  selected,
  onSelect,
  onRemove,
}: {
  url: string;
  label: string;
  detail?: string;
  selected: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}) {
  return (
    <li className="relative">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        title={label}
        className={`block w-full cursor-pointer overflow-hidden border bg-ink text-left ${
          selected ? "border-brass outline outline-1 outline-brass" : "border-line hover:border-brass"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
        <span className="block truncate px-2 py-1.5 text-xs text-parchment">
          {label}
          {detail ? <span className="text-stone"> · {detail}</span> : null}
        </span>
      </button>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Delete ${label} from the gallery`}
          className="absolute right-1.5 top-1.5 cursor-pointer bg-ink/85 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-red-200 hover:text-red-100"
          onClick={onRemove}
        >
          Delete
        </button>
      ) : null}
    </li>
  );
}
