const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload document");
  }

  return response.json();
}

export async function sendChatMessage(query: string, conversationId?: string) {
  const response = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      conversation_id: conversationId || Date.now().toString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}

export async function clearVectorStore() {
  const response = await fetch(`${BACKEND_URL}/clear`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to clear vector store");
  }

  return response.json();
}
