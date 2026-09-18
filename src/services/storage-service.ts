import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "@/lib/utils";

export interface StorageProvider {
  upload(file: File, folder: "templates" | "images"): Promise<string>;
}

class LocalStorageProvider implements StorageProvider {
  async upload(file: File, folder: "templates" | "images") {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name);
    const name = `${slugify(path.basename(file.name, ext))}-${Date.now()}${ext}`;
    const directory = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, name), buffer);
    return `/uploads/${folder}/${name}`;
  }
}

export const storage: StorageProvider = new LocalStorageProvider();
