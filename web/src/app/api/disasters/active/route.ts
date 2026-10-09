import { NextResponse } from "next/server";
import { domainStore } from "@/server/domainStore";

export async function GET() {
  try {
    const disaster = domainStore.getActiveDisaster();
    return NextResponse.json(disaster);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    console.error("Error in /api/disasters/active:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

