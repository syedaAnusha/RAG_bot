/* eslint-disable @typescript-eslint/no-unused-vars */
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Initialize embeddings with Google Generative AI
const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001", // Google's text embedding model
  apiKey: process.env.GOOGLE_API_KEY,
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
