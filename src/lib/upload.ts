import { randomUUID } from "crypto";
import { bucket } from "@/lib/firebase-admin";
import type { ProjectFile, ProjectImage } from "@/types";

function storageHost() {
  const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  if (emulatorHost) return `http://${emulatorHost}`;
  return "https://firebasestorage.googleapis.com";
}

function publicUrlFor(path: string, bucketName: string, token: string) {
  return `${storageHost()}/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

export async function uploadBuffer(options: {
  buffer: Buffer;
  path: string;
  contentType: string;
}): Promise<{ url: string; path: string }> {
  const { buffer, path, contentType } = options;
  const token = randomUUID();
  const file = bucket.file(path);
  await file.save(buffer, {
    contentType,
    metadata: {
      contentType,
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  return { url: publicUrlFor(path, bucket.name, token), path };
}

export async function uploadImageFile(
  file: File,
  folder: string
): Promise<ProjectImage> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${randomUUID()}.${ext}`;
  const { url } = await uploadBuffer({
    buffer,
    path,
    contentType: file.type || "image/jpeg",
  });
  return { url, path };
}

export async function uploadGenericFile(
  file: File,
  folder: string
): Promise<ProjectFile> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${randomUUID()}-${safeName}`;
  const { url } = await uploadBuffer({
    buffer,
    path,
    contentType: file.type || "application/octet-stream",
  });
  return { url, path, name: file.name, size: file.size };
}

export async function deleteStoragePath(path: string | null | undefined) {
  if (!path) return;
  try {
    await bucket.file(path).delete({ ignoreNotFound: true });
  } catch {
    // best-effort cleanup
  }
}
