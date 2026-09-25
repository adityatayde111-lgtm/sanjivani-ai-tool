import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, handleCorsOptions } from "@/shared/utils/cors";
import { getSecurityLogs, clearSecurityLogs, FirewallAction } from "@/lib/firewall";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const action = (searchParams.get("action") as FirewallAction) || undefined;

  const logs = getSecurityLogs(limit, action);
  return NextResponse.json({ logs, total: logs.length }, { headers: CORS_HEADERS });
}

export async function DELETE() {
  clearSecurityLogs();
  return NextResponse.json({ success: true, message: "Security logs cleared" }, { headers: CORS_HEADERS });
}
