import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { Document } from "@langchain/core/documents";

export async function processFile(file: File): Promise<Document[]> {
  const blob = new Blob([file], { type: file.type });

  switch (file.type) {
    case "application/pdf":
      const pdfLoader = new PDFLoader(blob);
      return await pdfLoader.load();

    case "text/plain":
      const textContent = await blob.text();
      return [
        new Document({
          pageContent: textContent,
          metadata: { source: file.name },
        }),
      ];

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      const docxLoader = new DocxLoader(blob);
      return await docxLoader.load();

    default:
      throw new Error("Unsupported file type");
  }
}
