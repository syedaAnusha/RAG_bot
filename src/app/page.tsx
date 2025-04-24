/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import Chat from "@/components/Chat";

export default function Home() {
  const [documents, setDocuments] = useState<any[]>([]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start"></main>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          RAG Document Q&A
        </h1>

        {documents.length === 0 ? (
          <FileUpload onUpload={setDocuments} />
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setDocuments([])}
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Upload Different Document
            </button>
            <Chat documents={documents} />
          </div>
        )}
      </div>
      <main className="min-h-screen p-8"></main>
    </div>
  );
}
