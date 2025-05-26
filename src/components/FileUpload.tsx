/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useState } from "react";
import { uploadDocument } from "@/lib/api";
import { Progress } from "./ui/progress";

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
      const result = await uploadDocument(file);
      onUpload([
        {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date(),
          status: "ready",
          content: result.message,
        },
      ]);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.docx,.txt"
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {loading && <Progress value={30} className="w-full mt-4" />}
    </div>
  );
}
