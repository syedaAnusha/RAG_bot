"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
// import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

import {
  ChevronLeft,
  ChevronRight,
  Upload,
  FolderOpen,
  //   Search,
  FileText,
  File,
  FileIcon,
  Trash2,
  Eye,
  X,
  Menu,
} from "lucide-react";
import { Document } from "@/types/chat";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";

interface DocumentSidebarProps {
  documents: Document[];
  setDocuments: (
    docs: Document[] | ((prevDocs: Document[]) => Document[])
  ) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  showMobileSidebar: boolean;
  setShowMobileSidebar: (show: boolean) => void;
}

export default function DocumentSidebar({
  documents,
  setDocuments,
  darkMode,
  //   setDarkMode,
  sidebarCollapsed,
  setSidebarCollapsed,
  showMobileSidebar,
  setShowMobileSidebar,
}: DocumentSidebarProps) {
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Process each file
      acceptedFiles.forEach((file) => {
        // Check file size (200MB limit)
        if (file.size > 200 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 200MB limit.`,
            duration: 3000,
          });
          return;
        }

        // Create a new document object
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

        // Simulate processing with progress
        const interval = setInterval(() => {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === newDoc.id
                ? {
                    ...doc,
                    progress: doc.progress
                      ? Math.min(doc.progress + 5, 100)
                      : 5,
                  }
                : doc
            )
          );
        }, 150);

        // Simulate completion after 3-6 seconds
        setTimeout(() => {
          clearInterval(interval);
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === newDoc.id
                ? {
                    ...doc,
                    status: "ready",
                    progress: 100,
                    summary: "Document processed successfully.",
                    content: `Sample content from ${file.name}`,
                  }
                : doc
            )
          );
          toast({
            title: "Document processed",
            description: `${file.name} is ready to use.`,
            duration: 3000,
          });
        }, 3000 + Math.random() * 3000);
      });
    },
    [setDocuments, toast]
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
    <>
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        >
          {showMobileSidebar ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out md:relative",
          darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900",
          sidebarCollapsed ? "w-[70px]" : "w-[280px]",
          showMobileSidebar
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!sidebarCollapsed && (
            <h1 className="font-bold text-lg">Documents</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Document List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {!sidebarCollapsed && (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-700"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">
                  {isDragActive
                    ? "Drop the files here..."
                    : "Drag & drop files here, or click to select"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported: PDF, DOCX, TXT (max 200MB)
                </p>
              </div>
            )}

            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      "p-3 rounded-lg border",
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
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">
                                {doc.name}
                              </h4>
                              <Badge
                                variant={
                                  doc.status === "ready" ? "default" : "outline"
                                }
                                className={cn(
                                  "ml-2",
                                  doc.status === "processing" &&
                                    "bg-yellow-500/10 text-yellow-500",
                                  doc.status === "ready" &&
                                    "bg-green-500/10 text-green-500",
                                  doc.status === "error" &&
                                    "bg-red-500/10 text-red-500"
                                )}
                              >
                                {doc.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatFileSize(doc.size)}
                            </p>
                            {doc.status === "processing" && doc.progress && (
                              <Progress
                                value={doc.progress}
                                className="h-1 mt-2"
                              />
                            )}
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
                <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No documents uploaded yet</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button className="w-full" {...getRootProps()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
