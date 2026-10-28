import { compressImage } from "@/lib/admin/imageCompression";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * The admin image gallery, stored in Supabase.
 *
 * Files go to the public `images` Storage bucket after being compressed in
 * the browser; a row in the `images` table lists each one. Records such as
 * products only store the file's public URL. Schema and access rules:
 * supabase/migrations/20261028000000_image_uploads.sql.
 */

const BUCKET = "images";

export type LibraryImage = {
  id: string;
  name: string;
  /** Public URL, saved into a record's `imageUrl` when the image is chosen. */
  url: string;
  path: string;
  width: number | null;
  height: number | null;
  /** Stored size after compression. */
  bytes: number | null;
  createdAt: string;
};

export type UploadResult = LibraryImage & {
  /** Size of the file before compression, for showing the saving. */
  originalBytes: number;
};

type ImageRow = {
  id: string;
  path: string;
  name: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  created_at: string;
};

function client() {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error("Supabase isn't configured, so images can't be stored.");
  return supabase;
}

function fromRow(row: ImageRow): LibraryImage {
  const url = client().storage.from(BUCKET).getPublicUrl(row.path).data.publicUrl;
  return {
    id: row.id,
    name: row.name,
    url,
    path: row.path,
    width: row.width,
    height: row.height,
    bytes: row.bytes,
    createdAt: row.created_at,
  };
}

export const imageLibrary = {
  async list(): Promise<LibraryImage[]> {
    const { data, error } = await client()
      .from("images")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as ImageRow[]).map(fromRow);
  },

  async upload(file: File): Promise<UploadResult> {
    const supabase = client();
    const image = await compressImage(file);
    const path = `uploads/${crypto.randomUUID()}.${image.extension}`;

    const stored = await supabase.storage.from(BUCKET).upload(path, image.blob, {
      contentType: image.contentType,
      // File names are unique, so browsers and the CDN can cache them for a year.
      cacheControl: "31536000",
    });
    if (stored.error) throw new Error(stored.error.message);

    const { data, error } = await supabase
      .from("images")
      .insert({
        path,
        name: file.name,
        width: image.width,
        height: image.height,
        bytes: image.blob.size,
        content_type: image.contentType,
      })
      .select("*")
      .single();
    if (error) {
      // Don't leave an unlisted file behind.
      await supabase.storage.from(BUCKET).remove([path]);
      throw new Error(error.message);
    }
    return { ...fromRow(data as ImageRow), originalBytes: file.size };
  },

  async remove(image: LibraryImage) {
    const supabase = client();
    const stored = await supabase.storage.from(BUCKET).remove([image.path]);
    if (stored.error) throw new Error(stored.error.message);
    const { error } = await supabase.from("images").delete().eq("id", image.id);
    if (error) throw new Error(error.message);
  },
};

/** "1.2 MB" / "184 KB". */
export function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** True for URLs of files in the gallery bucket. */
export function isLibraryUrl(url: string) {
  return url.includes(`/storage/v1/object/public/${BUCKET}/`);
}
