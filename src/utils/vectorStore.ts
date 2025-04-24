import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import path from "path";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

// Initialize embeddings with the API key
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// For Vercel deployment, we'll use ephemeral storage
// For local development, we'll use persistent storage
const isProd = process.env.NODE_ENV === "production";

// ChromaDB configuration is handled internally by the Chroma class

// Collection name for our documents
const COLLECTION_NAME = "rag_documents";

export async function getVectorStore(documents?: Document[]) {
  try {
    if (documents) {
      // Create a new store with the documents
      return await Chroma.fromDocuments(documents, embeddings, {
        collectionName: COLLECTION_NAME,
        ...(isProd ? {} : { path: path.join(process.cwd(), ".chroma") }),
      });
    }

    // If no documents provided, try to load existing store
    try {
      return new Chroma(embeddings, {
        collectionName: COLLECTION_NAME,
        ...(isProd ? {} : { path: path.join(process.cwd(), ".chroma") }),
      });
    } catch (error) {
      console.error("Error loading existing store:", error);
      // If no store exists, create an empty one
      return await Chroma.fromDocuments([], embeddings, {
        collectionName: COLLECTION_NAME,
        ...(isProd ? {} : { path: path.join(process.cwd(), ".chroma") }),
      });
    }
  } catch (error) {
    console.error("Error with vector store:", error);
    throw error;
  }
}
