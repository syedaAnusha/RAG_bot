/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useState } from "react";

export default function FileUpload({
  onUpload,
}: {
  onUpload: (documents: any) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setLoading(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      onUpload(data.documents);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
      <label className="block mb-2 text-sm font-medium text-gray-900">
        Upload Document (PDF, TXT, or DOCX)
        <input
          type="file"
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none mt-1"
          accept=".pdf,.txt,.docx"
          onChange={handleFileChange}
          disabled={loading}
        />
      </label>
      {loading && (
        <p className="text-sm text-gray-500">Processing document...</p>
      )}
    </div>
  );
}
