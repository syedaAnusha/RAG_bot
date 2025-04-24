/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { processFile } from "@/utils/documentProcessors";
import {
  checkRateLimit,
  validateFileSize,
  validateFileType,
} from "@/utils/middleware";
import { withMonitoring } from "@/utils/monitoring";

export async function POST(req: NextRequest) {
  return withMonitoring(req, "/api/upload", async () => {
    // Check rate limit
    const rateLimitResponse = checkRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    try {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      // Validate file
      try {
        validateFileSize(file);
        validateFileType(file);
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const documents = await processFile(file);

      return NextResponse.json({
        documents,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          chunkCount: documents.length,
        },
      });
    } catch (error) {
      console.error("Error processing file:", error);
      return NextResponse.json(
        { error: "Error processing file" },
        { status: 500 }
      );
    }
  });
}
