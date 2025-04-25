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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
            showMobileSidebar={showMobileSidebar}
            setShowMobileSidebar={setShowMobileSidebar}
          />
          <main
            className={cn(
              "flex-1 relative",
              sidebarCollapsed ? "md:ml-[70px]" : "md:ml-[20px]",
              "transition-[margin] duration-300 ease-in-out"
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
