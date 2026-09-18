import { NextResponse } from "next/server";
import { globalSearch } from "@/services/search-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const results = await globalSearch(q);
  return NextResponse.json(results.slice(0, 6).map((result) => ({ title: result.title, href: result.href, type: result.type })));
}
