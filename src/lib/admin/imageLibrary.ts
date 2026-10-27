/**
 * The admin image gallery.
 *
 * Editors only use the `ImageLibrary` interface, so the storage behind it can
 * change without touching them. For now `imageLibrary` keeps images in this
 * browser's IndexedDB, and each image's `url` is a compressed `data:` URL that
 * can be saved straight into a record's `imageUrl`.
 *
 * Planned live version (needs the Vercel + Supabase host, see AGENTS.md):
 * upload to a Supabase Storage bucket, list rows from an `images` table, and
 * return the bucket's public URL as `url`. Swap the export at the bottom.
 */

export type LibraryImage = {
  id: string;
  name: string;
  /** Saved into a record's `imageUrl` when the image is chosen. */
  url: string;
  width: number;
  height: number;
  createdAt: string;
};

export type ImageLibrary = {
  list: () => Promise<LibraryImage[]>;
  upload: (file: File) => Promise<LibraryImage>;
  remove: (id: string) => Promise<void>;
};

/** Largest side of an uploaded image after resizing, in pixels. */
const MAX_DIMENSION = 1600;
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const QUALITY = 0.85;

/** Resizes an image file and re-encodes it as WebP (keeps transparency). */
async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file isn't an image.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That image is over 20 MB. Choose a smaller one.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That image couldn't be read. Try a JPG, PNG or WebP file.");
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Browsers without WebP encoding fall back to PNG, which still works.
  return { url: canvas.toDataURL("image/webp", QUALITY), width, height };
}

const DB_NAME = "barron-images";
const STORE = "images";

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

const localImageLibrary: ImageLibrary = {
  async list() {
    const rows = await withStore<LibraryImage[]>("readonly", (store) => store.getAll());
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async upload(file) {
    const { url, width, height } = await compressImage(file);
    const image: LibraryImage = {
      id: `img-${crypto.randomUUID()}`,
      name: file.name,
      url,
      width,
      height,
      createdAt: new Date().toISOString(),
    };
    await withStore("readwrite", (store) => store.put(image));
    return image;
  },
  async remove(id) {
    await withStore("readwrite", (store) => store.delete(id));
  },
};

export const imageLibrary: ImageLibrary = localImageLibrary;
