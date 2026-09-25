import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, handleCorsOptions } from "@/shared/utils/cors";
import { generateCanaryToken, inspectResponseForCanary } from "@/lib/firewall";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const label = searchParams.get("label") || "Primary Agent Canary";
  const canary = generateCanaryToken(label);
  return NextResponse.json(canary, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const responseText = typeof body?.responseText === "string" ? body.responseText : "";
    const activeCanaries: string[] = Array.isArray(body?.activeCanaries) ? body.activeCanaries : [];

    const result = inspectResponseForCanary(responseText, activeCanaries);
    return NextResponse.json(result, { headers: CORS_HEADERS });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Canary inspection error";
    return NextResponse.json({ error: errorMsg }, { status: 500, headers: CORS_HEADERS });
  }
}
