import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

// Initialize OpenAI client - make sure to set OPENAI_API_KEY in your .env.local
const llm = new OpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

export async function POST(req: NextRequest) {
  try {
    const { message, documents } = await req.json();

    if (!message || !documents) {
      return NextResponse.json(
        { error: "Message and documents are required" },
        { status: 400 }
      );
    }

    // Create vector store from the documents
    const vectorStore = await MemoryVectorStore.fromDocuments(
      documents,
      new OpenAIEmbeddings()
    );

    // Create a retrieval chain
    const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());

    // Get the response
    const response = await chain.call({
      query: message,
    });

    return NextResponse.json({ response: response.text });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
