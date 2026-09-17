"use client";

import Image from "next/image";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { frameSrc, TOTAL_FRAMES } from "@/lib/heroSequence";

export interface HeroFrameCanvasHandle {
  /** Paint the sequence at the given position — a float from 1 to
   * TOTAL_FRAMES. Whole numbers show that frame exactly; fractional values
   * cross-fade between the two nearest frames, so scrubbing reads as a
   * smooth, continuous motion instead of a hard cut between stills. */
  draw: (position: number) => void;
}

/**
 * Single responsive <canvas> that draws the hero image sequence — never 30
 * <img> elements, never a video. Frame 1 is fetched eagerly (drives first
 * paint); frames 2..N load progressively in the background afterward,
 * lowest priority first, so they don't compete with the initial page load.
 *
 * Scroll/pin orchestration lives in Hero.tsx — this component only knows
 * how to preload and paint; it exposes an imperative `draw(position)` so a
 * fast-firing ScrollTrigger onUpdate can push frames without going through
 * React state/re-renders.
 */
const HeroFrameCanvas = forwardRef<
  HeroFrameCanvasHandle,
  { className?: string; priorityFrame?: number }
>(function HeroFrameCanvas({ className = "", priorityFrame }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<(HTMLImageElement | null)[]>(
      new Array(TOTAL_FRAMES).fill(null)
    );
    const lastDrawnRef = useRef<number>(1);
    const requestedRef = useRef<number>(1);

    /** Draw one image into the canvas with object-fit: cover math,
     * optionally at reduced alpha (for cross-fading a second frame on
     * top) and a small extra `scale` about the box center (for the
     * subtle zoom/depth-push applied during a frame transition). Does
     * NOT clear the canvas — callers control that. */
    const paintImage = useCallback(
      (
        img: HTMLImageElement,
        alpha: number,
        cssWidth: number,
        cssHeight: number,
        scale: number = 1
      ) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx) return;

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const boxRatio = cssWidth / cssHeight;
        let drawW: number, drawH: number, dx: number, dy: number;
        if (imgRatio > boxRatio) {
          drawH = cssHeight;
          drawW = drawH * imgRatio;
          dx = (cssWidth - drawW) / 2;
          dy = 0;
        } else {
          drawW = cssWidth;
          drawH = drawW / imgRatio;
          dx = 0;
          dy = (cssHeight - drawH) / 2;
        }

        if (scale !== 1) {
          const scaledW = drawW * scale;
          const scaledH = drawH * scale;
          dx -= (scaledW - drawW) / 2;
          dy -= (scaledH - drawH) / 2;
          drawW = scaledW;
          drawH = scaledH;
        }

        ctx.globalAlpha = alpha;
        ctx.drawImage(img, dx, dy, drawW, drawH);
        ctx.globalAlpha = 1;
      },
      []
    );

    const drawFrame = useCallback(
      (position: number, force: boolean = false) => {
        const clamped = Math.max(1, Math.min(TOTAL_FRAMES, position));
        requestedRef.current = clamped;

        // Scroll can fire far more update ticks than the position actually
        // moves in any visible way — skip the (relatively expensive) full
        // canvas redraw when nothing would change on screen. Callers that
        // need to repaint regardless (a newly-loaded image, a resize) pass
        // force: true.
        if (!force && Math.abs(clamped - lastDrawnRef.current) < 0.004) {
          return;
        }

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cssWidth = container.clientWidth;
        const cssHeight = container.clientHeight;
        if (cssWidth === 0 || cssHeight === 0) return;

        if (
          canvas.width !== Math.round(cssWidth * dpr) ||
          canvas.height !== Math.round(cssHeight * dpr)
        ) {
          canvas.width = Math.round(cssWidth * dpr);
          canvas.height = Math.round(cssHeight * dpr);
          canvas.style.width = `${cssWidth}px`;
          canvas.style.height = `${cssHeight}px`;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Nearest whole frame to the current scroll position — these are
        // real photos of different compositions (a wide face shot next to
        // a macro skin close-up), not frames of one continuous exposure,
        // so blending two of them shows both at once (a visible "double
        // exposure" ghost) no matter how the blend is weighted. A single
        // sharp frame at a time is the correct rendering for this content;
        // the illusion of continuous motion comes from how densely the 30
        // frames are spaced across the scroll distance, not from blending.
        const nearest = Math.round(clamped);
        const img =
          imagesRef.current[nearest - 1] ??
          imagesRef.current[Math.floor(clamped) - 1] ??
          imagesRef.current[Math.ceil(clamped) - 1];

        // Nothing loaded yet for this position — leave whatever was last
        // painted on screen; the loader below repaints as frames arrive.
        if (!img) return;

        ctx.clearRect(0, 0, cssWidth, cssHeight);
        paintImage(img, 1, cssWidth, cssHeight);
        lastDrawnRef.current = clamped;
      },
      [paintImage]
    );

    useImperativeHandle(ref, () => ({ draw: drawFrame }), [drawFrame]);

    useEffect(() => {
      let cancelled = false;

      // Frame 1: load eagerly, it's the hero's first paint.
      const first = new window.Image();
      first.decoding = "async";
      first.fetchPriority = "high";
      first.src = frameSrc(1);
      first.onload = () => {
        if (cancelled) return;
        imagesRef.current[0] = first;
        drawFrame(lastDrawnRef.current, true);
      };

      // Optional priority frame (e.g. the sequence's final frame for
      // prefers-reduced-motion, which lands directly on it) — load it
      // eagerly too, ahead of the low-priority progressive queue below.
      if (priorityFrame && priorityFrame !== 1) {
        const priority = new window.Image();
        priority.decoding = "async";
        priority.fetchPriority = "high";
        priority.src = frameSrc(priorityFrame);
        priority.onload = () => {
          if (cancelled) return;
          imagesRef.current[priorityFrame - 1] = priority;
          if (requestedRef.current === priorityFrame) drawFrame(priorityFrame, true);
        };
      }

      // Frames 2..N: progressive background preload, low priority, a few
      // in flight at a time so we don't saturate the connection.
      const remaining = Array.from({ length: TOTAL_FRAMES - 1 }, (_, i) => i + 2).filter(
        (n) => n !== priorityFrame
      );
      const CONCURRENCY = 4;
      let cursor = 0;

      const loadNext = () => {
        if (cancelled || cursor >= remaining.length) return;
        const n = remaining[cursor++];
        const img = new window.Image();
        img.decoding = "async";
        img.fetchPriority = "low";
        img.src = frameSrc(n);
        img.onload = () => {
          if (cancelled) return;
          imagesRef.current[n - 1] = img;
          // If this frame is part of the currently requested position
          // (its floor or ceil neighbor), repaint now that it's available.
          const req = requestedRef.current;
          if (Math.floor(req) === n || Math.ceil(req) === n) {
            drawFrame(req, true);
          }
          loadNext();
        };
        img.onerror = () => {
          if (cancelled) return;
          loadNext();
        };
      };

      for (let i = 0; i < CONCURRENCY; i++) loadNext();

      // Redraw the current position on resize (canvas backing store + cover
      // math both depend on container size).
      const container = containerRef.current;
      let resizeObserver: ResizeObserver | undefined;
      if (container && "ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(() => {
          drawFrame(lastDrawnRef.current, true);
        });
        resizeObserver.observe(container);
      }

      return () => {
        cancelled = true;
        resizeObserver?.disconnect();
      };
    }, [drawFrame, priorityFrame]);

    return (
      <div
        ref={containerRef}
        className={`relative h-full w-full overflow-hidden bg-ivory-300 ${className}`}
      >
        {/* Server-rendered frame 1 — visible immediately (even before JS
            hydrates or the canvas can draw), so there's never a blank box
            on first paint. The canvas paints the identical frame on top
            the moment it's ready, so this is invisible in practice; it only
            matters for that brief pre-hydration window. */}
        <Image
          src={frameSrc(1)}
          alt="Skin and laser pigmentation treatment illustration"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full"
          aria-hidden="true"
        />
      </div>
    );
  }
);

export default HeroFrameCanvas;
