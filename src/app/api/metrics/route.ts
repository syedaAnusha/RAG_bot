import { NextResponse } from "next/server";
import { getMetrics } from "@/utils/monitoring";

export async function GET() {
  const metrics = getMetrics();
  return NextResponse.json(metrics);
}
