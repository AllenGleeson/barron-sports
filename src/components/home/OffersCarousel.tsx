"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { CompactOfferCard } from "@/components/cards/CompactOfferCard";
import { CoverImage } from "@/components/media/CoverImage";
import { featuredOffers, offerHref } from "@/lib/site";

const FADE_MS = 1600;
const FADE_MS_MOBILE = 1000;
const FADE_MS_MANUAL = 180;
const HOLD_MS = 12000;
const HOLD_MS_MOBILE = 6500;

function Arrow({
  direction,
  onClick,
  label,
  className = "",
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center text-cream/90 transition hover:text-brass ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
        {direction === "prev" ? (
          <path d="M15 5L8 12l7 7" stroke="currentColor" strokeWidth="1.6" />
        ) : (
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" />
        )}
      </svg>
    </button>
  );
}

export function OffersCarousel() {
  const offers = featuredOffers;
  const total = offers.length;
  const loopedOffers = [...offers, ...offers];
  const carouselId = useId();

  const [index, setIndex] = useState(0);
  const [imageVisible, setImageVisible] = useState(true);
  const [marqueePaused, setMarqueePaused] = useState(false);
  const [fadePaused, setFadePaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [transitionMs, setTransitionMs] = useState(FADE_MS);
  const busy = useRef(false);
  const reduceMotion = useRef(false);
  const timers = useRef<number[]>([]);
  const fadeMs = isMobile ? FADE_MS_MOBILE : FADE_MS;
  const holdMs = isMobile ? HOLD_MS_MOBILE : HOLD_MS;
  const fadeMsRef = useRef(fadeMs);
  fadeMsRef.current = fadeMs;

  const active = ((index % total) + total) % total;

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const advance = useCallback(
    (direction: 1 | -1, quick = false) => {
      if (busy.current && !quick) return;

      clearTimers();
      busy.current = true;

      if (reduceMotion.current) {
        setImageVisible(true);
        setIndex((current) => current + direction);
        busy.current = false;
        return;
      }

      if (quick) {
        setTransitionMs(FADE_MS_MANUAL);
        setImageVisible(true);
        setIndex((current) => current + direction);
        const done = window.setTimeout(() => {
          busy.current = false;
        }, FADE_MS_MANUAL);
        timers.current.push(done);
        return;
      }

      const fade = fadeMsRef.current;
      setTransitionMs(fade);
      setImageVisible(false);
      const swap = window.setTimeout(() => {
        setIndex((current) => current + direction);
        setImageVisible(true);
        const done = window.setTimeout(() => {
          busy.current = false;
        }, fade);
        timers.current.push(done);
      }, fade);
      timers.current.push(swap);
    },
    [clearTimers],
  );

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      reduceMotion.current = motion.matches;
      setIsMobile(mobile.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    mobile.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      mobile.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (fadePaused) return;
    const timer = window.setInterval(() => advance(1), holdMs);
    return () => window.clearInterval(timer);
  }, [advance, fadePaused, holdMs]);

  useEffect(() => {
    const onVisibility = () => {
      const hidden = document.hidden;
      setMarqueePaused(hidden);
      setFadePaused(hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div className="relative">
      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div
          className="relative hidden min-w-0 px-0 lg:block lg:pr-4"
          onMouseEnter={() => setMarqueePaused(true)}
          onMouseLeave={() => setMarqueePaused(false)}
        >
          <div className="@container overflow-hidden" id={carouselId} aria-live="off">
            <div
              className={`offers-marquee-track flex w-max ${marqueePaused ? "is-paused" : ""}`}
            >
              {loopedOffers.map((offer, itemIndex) => (
                <div
                  key={`${offer.id}-${itemIndex}`}
                  className="w-[100cqi] shrink-0 px-2 sm:w-[50cqi] lg:w-[33.333cqi]"
                >
                  <CompactOfferCard offer={offer} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="relative h-full min-h-0"
          onMouseEnter={() => setFadePaused(true)}
          onMouseLeave={() => setFadePaused(false)}
        >
          <div className="relative aspect-[16/10] overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto">
            {offers.map((offer, offerIndex) => {
              const isActive = offerIndex === active && imageVisible;
              return (
                <Link
                  key={offer.id}
                  href={offerHref(offer)}
                  tabIndex={isActive ? 0 : -1}
                  aria-hidden={!isActive}
                  className="absolute inset-0 block bg-panel"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transition: `opacity ${transitionMs}ms ease`,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <div className="absolute inset-0 p-6">
                    <div className="relative h-full w-full">
                      <CoverImage
                        src={offer.image}
                        alt={offer.title}
                        sizes="(min-width: 1024px) 42vw, 100vw"
                        fit="contain"
                      />
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 flex flex-col justify-center px-6 py-6 sm:px-10">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-brass">
                      {offer.badge ?? offer.category}
                    </p>
                    <p className="mt-3 font-display text-3xl uppercase leading-[0.95] tracking-[0.08em] text-white sm:text-4xl">
                      {offer.title}
                    </p>
                    <p className="mt-4 text-lg text-cream">
                      {offer.rrp ? (
                        <>
                          <span className="mr-3 text-stone line-through">{offer.rrp}</span>
                          {offer.price}
                        </>
                      ) : (
                        offer.price
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <Arrow
            direction="next"
            onClick={() => advance(1, true)}
            label="Next featured offer"
            className="absolute top-1/2 right-2 z-10 hidden -translate-y-1/2 lg:flex"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-8 lg:hidden">
        <Arrow direction="prev" onClick={() => advance(-1, true)} label="Previous featured offer" />
        <Arrow direction="next" onClick={() => advance(1, true)} label="Next featured offer" />
      </div>
    </div>
  );
}
