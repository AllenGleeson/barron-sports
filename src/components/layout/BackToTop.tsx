"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 480;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }}
      className={`fixed right-4 bottom-4 z-[70] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-brass bg-brass text-ink shadow-lg transition-all duration-300 hover:border-cream hover:bg-[#dcc392] sm:right-6 sm:bottom-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="2" />
      </svg>
    </button>
  );
}
