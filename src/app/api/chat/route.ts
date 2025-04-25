import { NextRequest, NextResponse } from "next/server";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { getVectorStore } from "@/utils/vectorStore";
import { withMonitoring } from "@/utils/monitoring";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
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

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

// Initialize the model with better configuration
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  // maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Create a custom prompt template with better context handling
const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful assistant answering questions based on the provided documents.
The following context contains relevant information to answer the user's question.
Be concise and accurate, and only use information from the provided context.
If the context doesn't contain enough information to answer the question, say so.

Context:
{context}

User Question: {input}
`);

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
