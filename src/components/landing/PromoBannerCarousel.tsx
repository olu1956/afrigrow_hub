"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { promoBannerSlides } from "@/lib/landing/promo-banner-slides";
import { useAuthenticatedUser } from "@/lib/use-authenticated-user";

const AUTO_ADVANCE_MS = 6000;

export function PromoBannerCarousel() {
  const { isAuthenticated } = useAuthenticatedUser();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slideCount = promoBannerSlides.length;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + slideCount) % slideCount);
    },
    [slideCount],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(goNext, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [goNext, paused]);

  const slide = promoBannerSlides[activeIndex];
  const Icon = slide.icon;
  const ctaHref =
    isAuthenticated && slide.authenticatedCtaHref
      ? slide.authenticatedCtaHref
      : slide.ctaHref;

  return (
    <section
      aria-label="AfriGrow Hub highlights"
      className="relative overflow-hidden border-b border-primary-dark/20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className={`relative bg-gradient-to-r ${slide.gradient} transition-[background] duration-700`}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full border-[3px] border-accent/30" />
          <div className="absolute -left-6 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border-2 border-white/10" />
          <div className="absolute -right-12 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border-[3px] border-accent/25" />
          <div className="absolute right-8 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full border-2 border-white/10" />
        </div>

        <div className="relative mx-auto flex min-h-[220px] max-w-6xl items-center px-4 py-8 sm:min-h-[240px] sm:px-6 sm:py-10 lg:px-8">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:inline-flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            key={slide.id}
            className="animate-banner-fade-in grid w-full flex-1 items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto] lg:gap-8"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-accent/40 bg-white/10 text-accent backdrop-blur-sm sm:h-20 sm:w-20">
                <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  {slide.eyebrow}
                </p>
                <p className="text-2xl font-bold leading-tight sm:text-3xl">{slide.title}</p>
                <p className={`mt-1 text-sm font-semibold sm:text-base ${slide.accentClass}`}>
                  {slide.tagline}
                </p>
              </div>
            </div>

            <div className="text-white lg:px-2">
              <p className="max-w-xl text-lg font-medium leading-snug sm:text-xl">
                {slide.headline}
              </p>
              <p className={`mt-2 text-sm font-bold uppercase tracking-wide sm:text-base ${slide.accentClass}`}>
                {slide.highlight}
              </p>
              <p className="mt-1 text-sm text-white/80">{slide.detail}</p>
            </div>

            <div className="flex justify-start lg:justify-end">
              <Link
                href={ctaHref}
                className="group inline-flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-accent text-center text-xs font-bold uppercase leading-tight tracking-wide text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-accent/90 sm:h-32 sm:w-32 sm:text-sm"
              >
                {slide.ctaLabel}
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:inline-flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex justify-center gap-2 pb-4">
          {promoBannerSlides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show slide ${index + 1}: ${item.eyebrow}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => goTo(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === activeIndex ? "bg-white" : "bg-white/35 hover:bg-white/55"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
