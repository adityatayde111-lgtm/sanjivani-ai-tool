import { NextResponse } from "next/server";
import { CORS_HEADERS, handleCorsOptions } from "@/shared/utils/cors";
import { computeFirewallAnalytics } from "@/lib/firewall";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET() {
  const analytics = computeFirewallAnalytics();
  return NextResponse.json(analytics, { headers: CORS_HEADERS });
}
