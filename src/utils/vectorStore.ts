import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { Document } from "@langchain/core/documents";

if (!process.env.HUGGINGFACE_API_KEY) {
  throw new Error("Missing HUGGINGFACE_API_KEY environment variable");
}

// Initialize embeddings with Hugging Face
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "BAAI/bge-base-en-v1.5", // One of the best embedding models, optimized for RAG
});

// In-memory storage for vector store between requests
let inMemoryStore: MemoryVectorStore | null = null;

export async function getVectorStore(documents?: Document[]) {
  try {
    if (documents) {
      // If new documents provided, create a new store
      inMemoryStore = await MemoryVectorStore.fromDocuments(
        documents,
        embeddings
      );
      return inMemoryStore;
    }

    // If no documents provided and we have an in-memory store, return it
    if (inMemoryStore) {
      return inMemoryStore;
    }

    // If no in-memory store exists yet, create an empty one
    inMemoryStore = await MemoryVectorStore.fromDocuments([], embeddings);
    return inMemoryStore;
  } catch (error) {
    console.error("Error with vector store:", error);
    throw error;
  }
}
