"use client";

import { useState } from "react";
import { Bot, User, Loader2, BookOpen } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Document, ChatMessage, ChatAPISource } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatProps {
  documents: Document[];
}

export default function Chat({ documents }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(36) + "-" + (messages.length + 1),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Transform UI documents to LangChain format
      const processedDocs = documents
        .filter((doc) => doc.status === "ready")
        .map((doc) => ({
          pageContent: doc.content || "",
          metadata: {
            source: doc.name,
            type: doc.type,
            id: doc.id,
          },
        }));

      // Make API call to /api/chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          documents: processedDocs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(36) + "-" + (messages.length + 2),
        role: "assistant",
        content: data.text || "I couldn't process your request.",
        timestamp: new Date(),
        sources:
          data.sources?.map((source: ChatAPISource) => source.metadata.id) ||
          [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(36) + "-" + (messages.length + 2),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="p-2 rounded-md bg-primary/10">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">RAG Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Ask questions about your documents
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center">
              <Card className="p-6">
                <Bot className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Welcome to RAG Assistant
                </h3>
                <p className="text-muted-foreground mb-4">
                  {documents.length > 0
                    ? "Ask questions about your documents and I'll help you find answers."
                    : "Upload some documents to get started."}
                </p>
                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, DOCX, TXT
                  </p>
                )}
              </Card>
            </div>
          ) : (
            messages.map((message) => (
              <Card
                key={message.id}
                className={cn(
                  "p-4",
                  message.role === "user" ? "bg-muted" : "bg-primary/5"
                )}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {message.role === "user" ? (
                      <div className="p-2 rounded-md bg-muted-foreground/10">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-md bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {message.role === "user" ? "You" : "Assistant"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    {message.sources && message.sources.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <BookOpen className="h-3 w-3" />
                        <span>
                          Sources: {message.sources.length}{" "}
                          {message.sources.length === 1
                            ? "document"
                            : "documents"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
          {loading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              documents.length > 0
                ? "Ask a question about your documents..."
                : "Upload documents first to ask questions"
            }
            className="min-h-[60px] resize-none"
            disabled={documents.length === 0}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={documents.length === 0 || loading || !input.trim()}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
