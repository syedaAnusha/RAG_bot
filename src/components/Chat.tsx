/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import { ChatHistoryManager } from "@/utils/chatHistory";

interface ChatProps {
  documents: any[];
}

export default function Chat({ documents }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatHistoryManager = useRef(new ChatHistoryManager());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setInput("");
    setError(null);
    setLoading(true);
    setIsProcessing(true);

    chatHistoryManager.current.addMessage(userMessage);
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          documents,
          history: chatHistoryManager.current.getRecentContext(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        sources: data.sources,
        timestamp: Date.now(),
      };

      chatHistoryManager.current.addMessage(assistantMessage);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-lg relative">
        {messages.map((message, index) => (
          <div key={index} className="mb-6 fade-in">
            <div
              className={`mb-2 p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-auto max-w-[80%]"
                  : "bg-gray-100 mr-auto max-w-[80%]"
              }`}
            >
              <div className="text-sm text-gray-500 mb-1">
                {message.role === "user" ? "You" : "Assistant"}
                {message.timestamp && (
                  <span className="ml-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
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
        <div ref={messagesEndRef} />
        {isProcessing && (
          <div className="flex items-center justify-center gap-2 text-gray-500 my-4">
            <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full"></div>
            <div
              className="animate-bounce h-2 w-2 bg-gray-500 rounded-full"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="animate-bounce h-2 w-2 bg-gray-500 rounded-full"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 mb-4 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
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
          className={`px-4 py-2 rounded-lg text-white transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}
