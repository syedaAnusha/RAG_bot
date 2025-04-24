import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";

// Initialize embeddings with Ollama
const embeddings = new OllamaEmbeddings({
  model: "mistral", // Using mistral model for embeddings
  baseUrl: "http://localhost:11434", // Default Ollama server URL
});

// Collection name for our documents
const COLLECTION_NAME = "rag_documents";

// In-memory storage for vector store between requests
let inMemoryStore: Chroma | null = null;

export async function getVectorStore(documents?: Document[]) {
  try {
    if (documents) {
      // If new documents provided, create a new store
      inMemoryStore = await Chroma.fromDocuments(documents, embeddings, {
        collectionName: COLLECTION_NAME,
      });
      return inMemoryStore;
    }

    // If no documents provided and we have an in-memory store, return it
    if (inMemoryStore) {
      return inMemoryStore;
    }

    // If no in-memory store exists yet, create an empty one
    inMemoryStore = await Chroma.fromDocuments([], embeddings, {
      collectionName: COLLECTION_NAME,
    });
    return inMemoryStore;
  } catch (error) {
    console.error("Error with vector store:", error);
    throw error;
  }
}
