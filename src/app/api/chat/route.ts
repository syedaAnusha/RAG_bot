import { NextRequest, NextResponse } from "next/server";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { getVectorStore } from "@/utils/vectorStore";
import { withMonitoring } from "@/utils/monitoring";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

interface DocumentInput {
  pageContent: string;
  metadata: {
    source: string;
    type: string;
    id: string;
    [key: string]: unknown;
  };
}

if (!process.env.HUGGINGFACE_API_KEY) {
  throw new Error("Missing HUGGINGFACE_API_KEY environment variable");
}

// Initialize Hugging Face model
const llm = new HuggingFaceInference({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  temperature: 0.7,
});

// Create a custom prompt template
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
      const { message, documents } = await req.json();

      if (!message) {
        return NextResponse.json(
          { error: "Message is required" },
          { status: 400 }
        );
      }

      // Transform documents into LangChain format if needed
      const langChainDocs = documents?.map(
        (doc: DocumentInput) => new Document(doc)
      );

      // Get or create vector store
      const vectorStore = await getVectorStore(langChainDocs);

      // Create the document chain
      const combineDocsChain = await createStuffDocumentsChain({
        llm,
        prompt,
      });

      // Create the retriever
      const retriever = vectorStore.asRetriever({
        k: 3, // Number of documents to retrieve
      });

      // Create and run the retrieval chain
      const retrievalChain = await createRetrievalChain({
        combineDocsChain,
        retriever,
      });

      // Get the response
      const response = await retrievalChain.invoke({
        input: message,
      });

      return NextResponse.json({
        text: response.answer,
        sources: response.context?.map((doc: Document) => ({
          id: doc.metadata.id,
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
