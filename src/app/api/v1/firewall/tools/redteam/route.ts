import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, handleCorsOptions } from "@/shared/utils/cors";
import { runRedTeamFuzzing } from "@/lib/firewall";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt : "You are a customer service assistant.";
    const scorecard = await runRedTeamFuzzing(prompt);
    return NextResponse.json(scorecard, { headers: CORS_HEADERS });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fuzzing error";
    return NextResponse.json({ error: errorMsg }, { status: 500, headers: CORS_HEADERS });
  }
}
