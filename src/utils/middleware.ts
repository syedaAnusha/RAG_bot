import { NextRequest, NextResponse } from "next/server";

const rateLimit = new Map();
const MAX_REQUESTS = 50; // Maximum requests per window
const WINDOW_SIZE = 60 * 1000; // 1 minute window
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function getRateLimitConfig(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
  const now = Date.now();
  const windowStart = now - WINDOW_SIZE;

  // Clean up old entries
  rateLimit.forEach((timestamp, key) => {
    if (timestamp < windowStart) {
      rateLimit.delete(key);
    }
  });

  const requestCount = Array.from(rateLimit.values()).filter(
    (timestamp) => timestamp > windowStart
  ).length;

  return { ip, now, requestCount };
}

export function validateFileSize(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }
}

export function validateFileType(file: File) {
  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Unsupported file type. Only PDF, TXT, and DOCX files are allowed."
    );
  }
}

export function checkRateLimit(req: NextRequest) {
  const { ip, now, requestCount } = getRateLimitConfig(req);

  if (requestCount >= MAX_REQUESTS) {
    return new NextResponse(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  rateLimit.set(`${ip}-${now}`, now);
  return null;
}
