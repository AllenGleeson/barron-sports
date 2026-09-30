"use client";

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="border border-line bg-moss p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const name = String(data.get("name") ?? "");
        const email = String(data.get("email") ?? "");
        const message = String(data.get("message") ?? "");
        const subject = encodeURIComponent(`Enquiry from ${name}`);
        const body = encodeURIComponent(`${message}\n\n${name}\n${email}`);
        const mailto = `mailto:gary@barronsports.ie?subject=${subject}&body=${body}`;
        window.location.assign(mailto);
        setSent(true);
      }}
    >
      <div className="grid gap-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="mt-2 w-full border border-line bg-ink px-3 py-3 text-cream outline-none focus:border-brass"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full border border-line bg-ink px-3 py-3 text-cream outline-none focus:border-brass"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone">Message</span>
          <textarea
            name="message"
            required
            rows={6}
            className="mt-2 w-full resize-y border border-line bg-ink px-3 py-3 text-cream outline-none focus:border-brass"
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-4 inline-flex bg-brass px-6 py-3 text-[12px] font-medium uppercase tracking-[0.18em] text-ink hover:bg-[#dcc392]"
      >
        Send message
      </button>
      {sent ? (
        <p className="mt-4 text-sm text-parchment" role="status">
          Your email application should open with the message ready to send.
        </p>
      ) : null}
    </form>
  );
}
