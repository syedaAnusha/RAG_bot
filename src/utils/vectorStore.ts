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

// ChromaDB collection name
const COLLECTION_NAME = "rag_documents";

export async function getVectorStore(documents?: Document[]) {
  try {
    if (documents) {
      // If documents are provided, create a new store
      return await Chroma.fromDocuments(documents, embeddings, {
        collectionName: COLLECTION_NAME,
      });
    }

    // If no documents provided, try to load existing store
    return new Chroma(embeddings, {
      collectionName: COLLECTION_NAME,
    });
  } catch (error) {
    console.error("Error with vector store:", error);
    throw error;
  }
}
