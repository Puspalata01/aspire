import { NextResponse } from "next/server";
import { domainStore } from "@/server/domainStore";

export async function GET() {
  const sosList = domainStore.getSOSRequests();
  return NextResponse.json(sosList);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = domainStore.createSOSReport({
      location: body.location || { lat: 19.8135, lng: 85.8312 },
      request_type: body.type || body.request_type || "rescue",
      urgency: body.urgency || "critical",
      people_count: body.peopleCount || body.people_count || 1,
      description: body.description || "Emergency rescue requested",
      is_duplicate: false,
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

