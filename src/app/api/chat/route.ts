/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { getVectorStore } from "@/utils/vectorStore";
import { Document } from "@langchain/core/documents";
import { checkRateLimit } from "@/utils/middleware";
import { withMonitoring } from "@/utils/monitoring";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const llm = new OpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Create a custom prompt template for better context injection
const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful assistant answering questions based on the provided documents.
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context: {context}

Question: {question}

Answer: `);

export async function POST(req: NextRequest) {
  return withMonitoring(req, "/api/chat", async () => {
    // Check rate limit
    const rateLimitResponse = checkRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    try {
      const { message, documents } = await req.json();

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
        } catch (error: any) {
          return NextResponse.json(
            { error: "No documents available to search through" },
            { status: 400 }
          );
        }
      }

      // Create a retrieval chain with custom prompt
      const chain = RetrievalQAChain.fromLLM(
        llm,
        vectorStore.asRetriever({
          searchKwargs: { fetchK: 3 },
        }),
        {
          prompt: promptTemplate,
          returnSourceDocuments: true,
        }
      );

      // Get the response
      const response = await chain.call({
        query: message,
      });

      // Return response with source information
      return NextResponse.json({
        response: response.text,
        sources: response.sourceDocuments?.map((doc: any) => ({
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
