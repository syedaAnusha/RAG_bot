/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { getVectorStore } from "@/utils/vectorStore";
import { withMonitoring } from "@/utils/monitoring";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

// Initialize Ollama chat model
const llm = new ChatOllama({
  model: "mistral", // Using mistral model for chat
  baseUrl: "http://localhost:11434", // Default Ollama server URL
});

// Create a custom prompt template for better context injection
const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful assistant answering questions based on the provided documents.
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context from documents: {context}

Question: {input}

Answer: `);

export async function POST(req: NextRequest) {
  return withMonitoring(req, "/api/chat", async () => {
    try {
      const { message, documents, history = "" } = await req.json();

      if (!message) {
        return NextResponse.json(
          { error: "Message is required" },
          { status: 400 }
        );
      }

      let vectorStore;

      if (documents) {
        // If documents are provided, create a new store
        vectorStore = await getVectorStore(documents as Document[]);
      } else {
        // Try to load existing store
        try {
          vectorStore = await getVectorStore();
        } catch (error) {
          return NextResponse.json(
            { error: "No documents available to search through" },
            { status: 400 }
          );
        }
      }

      // Create the document chain that combines retrieved documents
      const combineDocsChain = await createStuffDocumentsChain({
        llm,
        prompt,
      });

      // Create the retriever with configuration
      const retriever = vectorStore.asRetriever({
        k: 3, // Number of documents to retrieve
      });

      // Create the retrieval chain
      const retrievalChain = await createRetrievalChain({
        combineDocsChain,
        retriever,
      });

      // Get the response
      const response = await retrievalChain.invoke({
        input: message,
      });

      // Extract source documents from the response
      const sourceDocuments = response.context as Document[];

      return NextResponse.json({
        response: response.answer,
        sources: sourceDocuments?.map((doc: Document) => ({
          content: doc.pageContent.substring(0, 150) + "...",
          metadata: doc.metadata,
        })),
      });
    } catch (error) {
      console.error("Error in chat:", error);
      return NextResponse.json(
        { error: "Error processing request" },
        { status: 500 }
      );
    }
  });
}
