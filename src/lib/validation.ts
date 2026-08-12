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
