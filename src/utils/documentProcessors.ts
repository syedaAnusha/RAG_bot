/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Configure text splitter with optimal chunk sizes for RAG
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
});

async function splitIntoChunks(documents: Document[]): Promise<Document[]> {
  return await textSplitter.splitDocuments(documents);
}

export async function processFile(file: File): Promise<Document[]> {
  const blob = new Blob([file], { type: file.type });
  let documents: Document[] = [];

  try {
    switch (file.type) {
      case "application/pdf":
        const pdfLoader = new PDFLoader(blob);
        documents = await pdfLoader.load();
        break;

      case "text/plain":
        const textContent = await blob.text();
        // For text files, create a document with the full content
        documents = [
          new Document({
            pageContent: textContent,
            metadata: {
              source: file.name,
              type: "text",
              timestamp: new Date().toISOString(),
            },
          }),
        ];
        // Split the text into chunks
        documents = await splitIntoChunks(documents);
        break;

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const docxLoader = new DocxLoader(blob);
        documents = await docxLoader.load();
        break;

      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }

    // Add additional metadata to chunks
    return documents.map((doc, index) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        chunkIndex: index,
        fileName: file.name,
        fileType: file.type,
      },
    }));
  } catch (error: any) {
    console.error("Error processing file:", error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
}
