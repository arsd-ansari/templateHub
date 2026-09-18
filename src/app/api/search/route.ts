import { NextResponse } from "next/server";
import { globalSearch } from "@/services/search-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  return NextResponse.json(await globalSearch(q));
}
