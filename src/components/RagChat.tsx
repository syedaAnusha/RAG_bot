"use client";

import { useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import Chat from "./Chat";
import DocumentSidebar from "./DocumentSidebar";
import { Document } from "@/types/chat";

export default function RagChat() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={darkMode ? "dark" : "light"}
      enableSystem={false}
    >
      <div className={`flex h-screen ${darkMode ? "dark" : ""}`}>
        <DocumentSidebar
          documents={documents}
          setDocuments={setDocuments}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          showMobileSidebar={showMobileSidebar}
          setShowMobileSidebar={setShowMobileSidebar}
        />
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            sidebarCollapsed ? "md:ml-[70px]" : "md:ml-[280px]"
          }`}
        >
          <Chat documents={documents} />
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
