import { NextResponse } from "next/server";
import { MOCK_SOS_REQUESTS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_SOS_REQUESTS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newRecord = {
      id: `sos-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      status: "received",
      ...body,
    };
    return NextResponse.json(newRecord, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
