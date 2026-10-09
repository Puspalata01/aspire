import { NextResponse } from "next/server";
import { domainStore } from "@/server/domainStore";

export async function GET() {
  const shelters = domainStore.getShelters();
  return NextResponse.json(shelters);
}

