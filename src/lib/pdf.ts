import path from "path";
import { pathToFileURL } from "url";

const pdfjsDistDir = path.join(process.cwd(), "node_modules", "pdfjs-dist");
const standardFontDataUrl = pathToFileURL(path.join(pdfjsDistDir, "standard_fonts") + path.sep).href;
const cMapUrl = pathToFileURL(path.join(pdfjsDistDir, "cmaps") + path.sep).href;

/**
 * Rasterizes page 1 of a PDF buffer into a PNG buffer, used to generate
 * a visual project-card preview for uploaded PDF drawings/documents.
 *
 * Both dependencies are dynamically imported (rather than imported at module
 * scope) so that a platform-loading failure in either one — e.g. a missing
 * native binary for @napi-rs/canvas on a given deployment runtime — throws
 * only when this function actually runs, and can be caught by the caller,
 * instead of crashing every server action in the module that imports this
 * file regardless of whether a PDF was even involved in that request.
 */
export async function generatePdfPreviewPng(pdfBuffer: Buffer): Promise<Buffer> {
  const [{ createCanvas }, pdfjsLib] = await Promise.all([
    import("@napi-rs/canvas"),
    import("pdfjs-dist/legacy/build/pdf.mjs"),
  ]);

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
    disableFontFace: true,
    useSystemFonts: false,
    standardFontDataUrl,
    cMapUrl,
    cMapPacked: true,
  });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });

  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));

  await page.render({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas: canvas as any,
    viewport,
  }).promise;

  const buffer = canvas.toBuffer("image/png");
  await loadingTask.destroy();
  return buffer;
}
