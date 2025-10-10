import { NextRequest, NextResponse } from "next/server";

// GET /api/messages/conversations
export async function GET(request: NextRequest) {
  return NextResponse.json([], { status: 200 }); // return empty list for now
}

// POST /api/messages/conversations
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "Conversations not implemented yet" },
    { status: 501 } // 501 = Not Implemented
  );
}
