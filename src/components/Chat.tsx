"use client";

import { useState } from "react";
import {
  Bot,
  User,
  Loader2,
  BookOpen,
  MessageSquare,
  Upload,
  Send,
} from "lucide-react";
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
    <div className="flex flex-col h-full relative">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b sticky top-0 z-10 bg-background">
        <div className="p-2 rounded-md bg-[#1E1C3C]">
          <Bot className="h-6 w-6 text-[#818CF8]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">DocuMind</h2>
          <p className="text-sm text-muted-foreground">
            Ask questions about your documents
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 h-[calc(100vh-13rem)]">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center">
              <Card className="p-6 bg-[#191E25] gap-[0.5rem]">
                <Bot className="h-12 w-12 mx-auto text-[#818CF8]" />
                <h3 className="text-lg font-semibold">Welcome to DocuMind</h3>
                <p className="text-muted-foreground">
                  {documents.length > 0
                    ? "Ask questions about your documents and I'll help you find answers."
                    : "Ask questions about your documents and get accurate answers powered by AI."}
                </p>
                {documents.length === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-5">
                    <Card className={cn("p-4", "bg-[#1F2937]")}>
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={cn(
                            "rounded-full p-2 mb-2",
                            "bg-blue-900/20"
                          )}
                        >
                          <BookOpen className="h-5 w-5 text-blue-500" />
                        </div>
                        <h3 className="font-medium mb-1">
                          1. Browse Documents
                        </h3>
                        <p className="text-xs text-gray-500">
                          View and manage your document collection
                        </p>
                      </div>
                    </Card>

                    <Card className={cn("p-4", "bg-[#1F2937]")}>
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={cn(
                            "rounded-full p-2 mb-2",
                            "bg-green-900/20"
                          )}
                        >
                          <Upload className="h-5 w-5 text-green-500" />
                        </div>
                        <h3 className="font-medium mb-1">2. Upload Files</h3>
                        <p className="text-xs text-gray-500">
                          Upload PDFs, TXT, or DOCX files
                        </p>
                      </div>
                    </Card>

                    <Card className={cn("p-4", "bg-[#1F2937]")}>
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={cn(
                            "rounded-full p-2 mb-2",
                            "bg-purple-900/20"
                          )}
                        >
                          <MessageSquare className="h-5 w-5 text-purple-500" />
                        </div>
                        <h3 className="font-medium mb-1">3. Ask Questions</h3>
                        <p className="text-xs text-gray-500">
                          Get answers from your documents
                        </p>
                      </div>
                    </Card>
                  </div>
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
      <div className="p-4 border-t sticky bottom-0 bg-background">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              documents.length > 0
                ? "Ask a question about your documents..."
                : "Upload documents first to ask questions"
            }
            className="min-h-[40px] max-h-[200px] resize-none bg-[#191E25]"
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
            size="icon"
            className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
            disabled={documents.length === 0 || loading || !input.trim()}
          >
            <Send className="h-4 w-4 text-white" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
