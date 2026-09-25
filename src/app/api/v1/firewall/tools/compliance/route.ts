import { NextResponse } from "next/server";
import { CORS_HEADERS, handleCorsOptions } from "@/shared/utils/cors";
import { generateComplianceReport } from "@/lib/firewall/tools/complianceReport";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET() {
  const report = generateComplianceReport();
  return NextResponse.json(report, { headers: CORS_HEADERS });
}
