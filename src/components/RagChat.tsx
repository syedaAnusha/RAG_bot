"use client";

import { useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import Chat from "./Chat";
import DocumentSidebar from "./DocumentSidebar";
import { Document } from "@/types/chat";
import { cn } from "@/lib/utils";

export default function RagChat() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [darkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

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
            <Chat documents={documents} />
          </main>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
