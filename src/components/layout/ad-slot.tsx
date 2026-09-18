"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { ADSENSE_CLIENT_ID } from "@/constants/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  slot?: string;
  format?: string;
  responsive?: boolean;
  label?: string;
  className?: string;
};

class AdErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function AdSlotInner({
  slot,
  format = "auto",
  responsive = true,
  label = "AdSense-ready placement",
  className = ""
}: AdSlotProps) {
  const pushed = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  const [mounted, setMounted] = useState(false);
  const [filled, setFilled] = useState(false);
  const isLive = Boolean(ADSENSE_CLIENT_ID && slot);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isLive || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Ad blockers and unfilled units throw; never let that take down the page.
    }
  }, [mounted, isLive]);

  useEffect(() => {
    const el = insRef.current;
    if (!el) return;

    const sync = () => {
      setFilled(el.getAttribute("data-ad-status") === "filled");
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ["data-ad-status"] });
    return () => observer.disconnect();
  }, [mounted, isLive]);

  if (!isLive) {
    return <div className={`ad-slot rounded-lg ${className}`}>{label}</div>;
  }

  if (!mounted) return null;

  return (
    <div className={`ad-placement${filled ? " ad-placement--filled" : ""}`}>
      <ins
        ref={insRef}
        className={`adsbygoogle ${className}`.trim()}
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

export function AdSlot(props: AdSlotProps) {
  return (
    <AdErrorBoundary>
      <AdSlotInner {...props} />
    </AdErrorBoundary>
  );
}
