import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

// Initialize embeddings with the API key
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
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
