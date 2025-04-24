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
