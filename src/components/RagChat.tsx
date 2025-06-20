"use client";

import { useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import Chat from "./Chat";
import DocumentSidebar from "./DocumentSidebar";
import { Document } from "@/types/chat";
import { cn } from "@/lib/utils";
import { clearVectorStore } from "@/lib/api";
import { toast } from "sonner";

export default function RagChat() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [darkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [chatKey, setChatKey] = useState(0); // Add this to force chat component reset

  const handleClearDocuments = async () => {
    try {
      await clearVectorStore();
      setDocuments([]);
      setChatKey((prev) => prev + 1); // This will reset the Chat component
      toast.success("Documents cleared successfully");
    } catch (error) {
      console.error("Error clearing documents:", error);
      toast.error("Failed to clear documents");
    }
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={darkMode ? "dark" : "light"}
      enableSystem={false}
    >
      <div className="h-screen w-screen overflow-hidden bg-background">
        <div className="relative flex h-full">
          <DocumentSidebar
            documents={documents}
            setDocuments={setDocuments}
            darkMode={darkMode}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            onClearDocuments={handleClearDocuments}
          />
          <main
            className={cn(
              "flex-1 relative",
              // Desktop: adjust margin based on sidebar state
              "md:transition-[margin] md:duration-300 md:ease-in-out",
              sidebarCollapsed ? "md:ml-[10px]" : "md:ml-[20px]",
              // Mobile: don't adjust margin, let sidebar overlay
              "ml-[70px]"
            )}
          >
            <Chat key={chatKey} documents={documents} />
          </main>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
