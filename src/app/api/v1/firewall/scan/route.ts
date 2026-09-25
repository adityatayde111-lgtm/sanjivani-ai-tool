import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, handleCorsOptions } from "@/shared/utils/cors";
import { processFirewallScan, InputSourceType } from "@/lib/firewall";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const content = typeof body?.content === "string" ? body.content : "";
    const source: InputSourceType = body?.source || "user_text";
    const fileData = typeof body?.fileData === "string" ? body.fileData : undefined;
    const url = typeof body?.url === "string" ? body.url : undefined;
    const options = body?.options;

    const result = await processFirewallScan(content, source, {
      ...options,
      fileData,
      url,
    });

    return NextResponse.json(result, { headers: CORS_HEADERS });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal firewall error";
    return NextResponse.json(
      { error: errorMsg, is_malicious: true, action: "BLOCK", risk_score: 100 },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
