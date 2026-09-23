"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

export function CustomRequestForm({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request = String(new FormData(event.currentTarget).get("request") || "").trim();
    setStatus("saving");
    setError("");
    const response = await fetch("/api/pack/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, request })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setError(body.error || "Could not save the request.");
      return;
    }
    setStatus("saved");
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3">
      <label className="grid gap-2 text-sm font-medium">
        What Excel sheet do you need?
        <textarea
          name="request"
          required
          minLength={20}
          maxLength={2000}
          placeholder="Example: attendance sheet for 12 staff, P/A/L codes, COUNTIF payable days, one month per tab."
          className="min-h-32 rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-sm outline-none focus:border-[var(--primary)]"
        />
      </label>
      <Button type="submit" variant="outline" disabled={status === "saving"}>
        {status === "saving" ? "Sending…" : "Send Excel request"}
      </Button>
      {status === "saved" ? (
        <p className="text-sm text-[var(--muted-foreground)]">Saved. We only build spreadsheet files — you will get an .xlsx, nothing else.</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
