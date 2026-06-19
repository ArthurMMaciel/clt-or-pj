import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractContractText(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const document = await pdfjs.getDocument({ data: bytes }).promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
    }

    return pages.join("\n\n");
  }

  if (extension === "docx") {
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
  }

  if (["txt", "md", "csv"].includes(extension ?? "")) {
    return file.text();
  }

  throw new Error("Formato não suportado. Envie PDF, DOCX, TXT ou MD.");
}
