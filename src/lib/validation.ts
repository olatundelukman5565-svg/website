export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ALLOWED_PDF_TYPE = "application/pdf";
export const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
export const MAX_PDF_SIZE = 40 * 1024 * 1024; // 40MB
export const MAX_ADDITIONAL_FILE_SIZE = 40 * 1024 * 1024; // 40MB

export function isRealFile(file: FormDataEntryValue | null): file is File {
  return !!file && typeof file === "object" && "size" in file && file.size > 0;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name}: only JPG, PNG, and WebP images are allowed.`;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `${file.name}: image exceeds the 15MB limit.`;
  }
  return null;
}

export function validatePdfFile(file: File): string | null {
  if (file.type !== ALLOWED_PDF_TYPE) {
    return `${file.name}: only PDF files are allowed.`;
  }
  if (file.size > MAX_PDF_SIZE) {
    return `${file.name}: PDF exceeds the 40MB limit.`;
  }
  return null;
}

export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const ALLOWED_CHAT_DOC_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
];
export const MAX_CHAT_ATTACHMENT_SIZE = 20 * 1024 * 1024; // 20MB per file
export const MAX_CHAT_ATTACHMENTS_PER_MESSAGE = 5;
export const MAX_CHAT_MESSAGE_LENGTH = 4000;

export function chatAttachmentKind(contentType: string): "image" | "pdf" | "video" | "file" {
  if (ALLOWED_IMAGE_TYPES.includes(contentType)) return "image";
  if (contentType === ALLOWED_PDF_TYPE) return "pdf";
  if (ALLOWED_VIDEO_TYPES.includes(contentType)) return "video";
  return "file";
}

export function validateChatAttachment(file: File): string | null {
  const isAllowed =
    ALLOWED_IMAGE_TYPES.includes(file.type) ||
    file.type === ALLOWED_PDF_TYPE ||
    ALLOWED_VIDEO_TYPES.includes(file.type) ||
    ALLOWED_CHAT_DOC_TYPES.includes(file.type);
  if (!isAllowed) {
    return `${file.name}: file type not supported. Please send images, PDFs, videos, Word/Excel docs, or ZIP files.`;
  }
  if (file.size > MAX_CHAT_ATTACHMENT_SIZE) {
    return `${file.name}: exceeds the 20MB per-file limit.`;
  }
  return null;
}
