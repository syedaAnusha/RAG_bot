"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "./ui/use-toast";
import { uploadDocument } from "@/lib/api";

import {
  ChevronLeft,
  Upload,
  FolderOpen,
  FileText,
  Zap,
  File,
  FileIcon,
  Trash2,
  Eye,
} from "lucide-react";
import { Document } from "@/types/chat";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface DocumentSidebarProps {
  documents: Document[];
  setDocuments: (
    docs: Document[] | ((prevDocs: Document[]) => Document[])
  ) => void;
  darkMode: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  onClearDocuments: () => Promise<void>;
}

export default function DocumentSidebar({
  documents,
  setDocuments,
  darkMode,
  sidebarCollapsed,
  setSidebarCollapsed,
  onClearDocuments,
}: DocumentSidebarProps) {
  const { toast } = useToast();
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (documents.length > 0) {
        toast({
          title: "Upload not allowed",
          description:
            "Please clear the current document before uploading a new one.",
          duration: 3000,
        });
        return;
      }

      for (const file of acceptedFiles) {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 10MB limit.`,
            duration: 3000,
          });
          continue;
        }

        // Create initial document object
        const newDoc: Document = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date(),
          status: "processing",
          progress: 0,
        };

        // Add the document to the list
        setDocuments((prev) => [...prev, newDoc]);

        try {
          // Upload and process the file using the api function
          const data = await uploadDocument(file);

          // Update document with processed content
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === newDoc.id
                ? {
                    ...doc,
                    status: "ready",
                    progress: 100,
                    content: data.message || "",
                    summary: data.message,
                  }
                : doc
            )
          );

          toast({
            title: "Document processed",
            description: `${file.name} is ready to use.`,
            duration: 3000,
          });
        } catch (error) {
          console.error("Error processing file:", error);
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === newDoc.id
                ? {
                    ...doc,
                    status: "error",
                    progress: 100,
                  }
                : doc
            )
          );

          toast({
            title: "Processing failed",
            description: `Failed to process ${file.name}. Please try again.`,
            duration: 3000,
          });
        }
      }
    },
    [setDocuments, toast, documents.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 5,
  });

  const removeDocument = (id: string) => {
    setDocuments((prev: Document[]) =>
      prev.filter((doc: Document) => doc.id !== id)
    );
    toast({
      title: "Document removed",
      description: "The document has been removed.",
      duration: 3000,
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <File className="h-5 w-5 text-red-500" />;
    if (type.includes("word") || type.includes("docx"))
      return <FileText className="h-5 w-5 text-blue-500" />;
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-[50] flex h-screen flex-col transition-all duration-300 ease-in-out",
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900",
        // Mobile: start with mini width, expand with absolute positioning
        "w-[70px] absolute",
        !sidebarCollapsed && "w-[280px]",
        // Desktop: relative positioning with proper widths
        "md:relative md:w-auto",
        sidebarCollapsed ? "md:w-[70px]" : "md:w-[280px]"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-1 rounded-md",
                darkMode ? "bg-indigo-600" : "bg-indigo-100"
              )}
            >
              <Zap
                className={cn(
                  "h-5 w-5",
                  darkMode ? "text-white" : "text-indigo-600"
                )}
              />
            </div>
            <h1 className="font-bold text-lg">DocuMind</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "transition-all duration-300",
            sidebarCollapsed ? "ml-auto rotate-180" : "ml-auto"
          )}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Document List */}
      <ScrollArea className="flex-1 h-[calc(100vh-10rem)]">
        <div className="p-4 space-y-4">
          {!sidebarCollapsed && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-700",
                documents.length > 0
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              )}
            >
              <input {...getInputProps()} disabled={documents.length > 0} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                {documents.length > 0
                  ? "Document already uploaded"
                  : isDragActive
                  ? "Drop the files here..."
                  : "Drag & drop files here, or click to select"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported: PDF, DOCX, TXT (max 10MB)
              </p>
            </div>
          )}

          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    darkMode
                      ? "border-gray-800 hover:bg-gray-800/50"
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {sidebarCollapsed ? (
                    <div className="flex justify-center">
                      {getFileIcon(doc.type)}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        {getFileIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate max-w-[100px]">
                              {doc.name}
                            </h4>
                            <Badge
                              variant={
                                doc.status === "ready" ? "default" : "outline"
                              }
                              className={cn(
                                "flex-shrink-0",
                                doc.status === "processing" &&
                                  "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
                                doc.status === "ready" &&
                                  "bg-green-500/10 text-green-500 hover:bg-green-500/20",
                                doc.status === "error" &&
                                  "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                              )}
                            >
                              {doc.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {formatFileSize(doc.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Preview functionality
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="h-8 w-8 mx-auto mb-3 text-[#818CF8]" />
              <p className={cn("text-gray-500", sidebarCollapsed && "hidden")}>
                No documents uploaded yet
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Sidebar Footer */}
      {!sidebarCollapsed && (
        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
          {" "}
          <Button
            className="w-full"
            {...getRootProps()}
            disabled={documents.length > 0}
          >
            <Upload className="h-4 w-4 mr-2" />
            {documents.length > 0 ? "Document Uploaded" : "Upload Document"}
          </Button>
          {documents.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onClearDocuments}
              className="mt-4"
            >
              Clear Document
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
