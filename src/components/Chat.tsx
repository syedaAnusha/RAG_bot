/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

interface Source {
  content: string;
  metadata: {
    fileName: string;
    chunkIndex: number;
    [key: string]: any;
  };
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export default function Chat({ documents }: { documents: any[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          documents,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          sources: data.sources,
        },
      ]);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-lg">
        {messages.map((message, index) => (
          <div key={index} className="mb-6">
            <div
              className={`mb-2 p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-auto max-w-[80%]"
                  : "bg-gray-100 mr-auto max-w-[80%]"
              }`}
            >
              {message.content}
            </div>
            {message.sources && (
              <div className="ml-4 text-sm text-gray-600">
                <p className="font-semibold mb-1">Sources:</p>
                {message.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="mb-2 pl-2 border-l-2 border-gray-300"
                  >
                    <p className="font-medium">
                      From: {source.metadata.fileName}
                    </p>
                    <p className="text-gray-500">{source.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-center text-gray-500">Thinking...</div>
        )}
        {error && <div className="text-center text-red-500 mb-4">{error}</div>}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          Send
        </button>
      </form>
    </div>
  );
}
