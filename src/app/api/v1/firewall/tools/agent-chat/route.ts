import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, handleCorsOptions } from "@/shared/utils/cors";
import { processAgentShieldChat, AgentChatMessage } from "@/lib/firewall";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message : "";
    const history: AgentChatMessage[] = Array.isArray(body?.history) ? body.history : [];

    const result = await processAgentShieldChat(message, history);
    return NextResponse.json(result, { headers: CORS_HEADERS });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Agent shield error";
    return NextResponse.json({ error: errorMsg }, { status: 500, headers: CORS_HEADERS });
  }
}
