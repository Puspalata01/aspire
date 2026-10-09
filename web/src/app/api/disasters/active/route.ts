import { NextResponse } from "next/server";
import { MOCK_ACTIVE_DISASTER } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_ACTIVE_DISASTER);
}
