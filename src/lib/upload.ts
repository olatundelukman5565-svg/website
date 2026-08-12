import { randomUUID } from "crypto";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";
import { getCloudinary } from "@/lib/cloudinary";
import type { ProjectFile, ProjectImage } from "@/types";

function uploadToCloudinary(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
  const cloudinary = getCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { overwrite: true, unique_filename: false, ...options },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Cloudinary upload failed"));
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/** Inserts an auto quality/format transformation into a Cloudinary image delivery URL. */
function withAutoOptimization(url: string): string {
  return url.replace("/image/upload/", "/image/upload/q_auto,f_auto/");
}

export async function uploadBuffer(options: {
  buffer: Buffer;
  path: string;
  contentType: string;
}): Promise<{ url: string; path: string }> {
  const { buffer, path, contentType } = options;
  const isImage = contentType.startsWith("image/");
  const result = await uploadToCloudinary(buffer, {
    public_id: path,
    resource_type: isImage ? "image" : "raw",
  });
  return {
    url: isImage ? withAutoOptimization(result.secure_url) : result.secure_url,
    path: result.public_id,
  };
}

export async function uploadImageFile(file: File, folder: string): Promise<ProjectImage> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadToCloudinary(buffer, {
    public_id: `${folder}/${randomUUID()}`,
    resource_type: "image",
  });
  return { url: withAutoOptimization(result.secure_url), path: result.public_id };
}

export async function uploadGenericFile(file: File, folder: string): Promise<ProjectFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const result = await uploadToCloudinary(buffer, {
    public_id: `${folder}/${randomUUID()}-${safeName}`,
    resource_type: "raw",
  });
  return { url: result.secure_url, path: result.public_id, name: file.name, size: file.size };
}

export async function deleteStoragePath(
  path: string | null | undefined,
  resourceType: "image" | "raw" = "image"
) {
  if (!path) return;
  try {
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(path, { resource_type: resourceType });
  } catch {
    // best-effort cleanup
  }
}
