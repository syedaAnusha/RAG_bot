/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Source {
  content: string;
  metadata: {
    fileName: string;
    chunkIndex: number;
    [key: string]: any;
  };
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp?: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
  progress?: number;
  content?: string;
  summary?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface Chat {
  id: string;
  name: string;
  messages: ChatMessage[];
}
