"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { ADSENSE_CLIENT_ID } from "@/constants/site";
import { shouldLoadAds } from "@/lib/ads";

export function AdSenseLoader() {
  const pathname = usePathname();

  if (!ADSENSE_CLIENT_ID || !shouldLoadAds(pathname)) return null;

  return (
    <Script
      id="adsbygoogle-loader"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      onError={() => {
        // Ad blockers reject this script; ignore so the app still hydrates.
      }}
    />
  );
}
