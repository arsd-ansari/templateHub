"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GST_PACK } from "@/constants/pack";
import { CONTACT_EMAIL } from "@/constants/site";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay"));
    document.body.appendChild(script);
  });
}

export function PackCheckout({ paymentsReady }: { paymentsReady: boolean }) {
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    setStatus("working");
    setError("");
    try {
      const orderResponse = await fetch("/api/pack/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || "Could not start payment.");

      await loadRazorpay();
      if (!window.Razorpay) throw new Error("Could not open checkout.");

      const checkout = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "TemplateHub",
        description: GST_PACK.title,
        order_id: order.orderId,
        prefill: { email: order.email },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyResponse = await fetch("/api/pack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          });
          const verified = await verifyResponse.json();
          if (!verifyResponse.ok) throw new Error(verified.error || "Payment verify failed.");
          window.location.href = `${GST_PACK.href}/thanks?token=${encodeURIComponent(verified.token)}`;
        }
      });
      checkout.open();
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Payment failed.");
    }
  }

  if (!paymentsReady) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="font-semibold">Buy the pack — ₹{GST_PACK.priceInr}</p>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Card and UPI checkout is being connected. Email{" "}
          <a className="font-semibold text-[var(--primary)]" href={`mailto:${CONTACT_EMAIL}?subject=GST%20Compliance%20Pack`}>
            {CONTACT_EMAIL}
          </a>{" "}
          with subject “GST Compliance Pack” and we will send the zip after ₹{GST_PACK.priceInr} is received.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <p className="font-semibold">Pay ₹{GST_PACK.priceInr} once — UPI / card</p>
      <label className="grid gap-2 text-sm font-medium">
        Email for the download link
        <Input name="email" type="email" autoComplete="email" required placeholder="you@business.in" />
      </label>
      <Button type="submit" disabled={status === "working"}>
        {status === "working" ? "Opening checkout…" : `Pay ₹${GST_PACK.priceInr}`}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs leading-5 text-[var(--muted-foreground)]">
        After payment you get a private download link. Keep the email you used.
      </p>
    </form>
  );
}
