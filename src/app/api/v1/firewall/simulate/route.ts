import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, handleCorsOptions } from "@/shared/utils/cors";
import { DEMO_SCENARIOS, processFirewallScan } from "@/lib/firewall";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET() {
  return NextResponse.json({ scenarios: DEMO_SCENARIOS }, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scenarioId = body?.scenarioId;
    const attackType = body?.attackType;

    let scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario && attackType) {
      scenario = DEMO_SCENARIOS.find((s) => s.expected_attack.toLowerCase() === String(attackType).toLowerCase());
    }

    if (!scenario) {
      scenario = DEMO_SCENARIOS[1]; // Fallback to DEMO 2 (Instruction Override)
    }

    const result = await processFirewallScan(scenario.input, scenario.source);

    return NextResponse.json({
      scenario,
      result,
    }, { headers: CORS_HEADERS });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Simulation execution error";
    return NextResponse.json({ error: errorMsg }, { status: 500, headers: CORS_HEADERS });
  }
}
