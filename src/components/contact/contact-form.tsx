"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONTACT_EMAIL } from "@/constants/site";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "opened">("idle");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = encodeURIComponent(`TemplateHub message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStatus("opened");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <label className="grid gap-2 text-sm font-medium">
        Name
        <Input name="name" autoComplete="name" required />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Email
        <Input name="email" type="email" autoComplete="email" required />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Message
        <textarea
          name="message"
          required
          minLength={20}
          placeholder="Template request, correction, or question — include enough detail to reply."
          className="min-h-36 rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-sm outline-none focus:border-[var(--primary)]"
        />
      </label>
      <Button type="submit">Open email to send</Button>
      {status === "opened" ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Your mail app should open with the message addressed to {CONTACT_EMAIL}. If it does not, copy that address and send the note directly.
        </p>
      ) : null}
    </form>
  );
}
