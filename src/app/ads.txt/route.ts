import { ADSENSE_CLIENT_ID } from "@/constants/site";

// Serves /ads.txt. Google requires this file to authorize AdSense to monetize
// your inventory. The publisher ID is derived from ADSENSE_CLIENT_ID
// ("ca-pub-XXXX" -> "pub-XXXX"). Until configured, an explanatory placeholder
// is returned so the route never 404s.
export function GET() {
  const publisherId = ADSENSE_CLIENT_ID.replace(/^ca-/, "");

  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : "# Set NEXT_PUBLIC_ADSENSE_CLIENT_ID to generate your ads.txt entry.\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Cache for a day; Google re-crawls ads.txt periodically.
      "Cache-Control": "public, max-age=86400"
    }
  });
}
