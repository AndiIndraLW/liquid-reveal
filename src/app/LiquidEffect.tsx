'use client';

import { useEffect, useRef } from 'react';

interface Blob {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
}

export default function LiquidEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    // Canvas renders as a direct child of the hero section
    const hero = canvas.parentElement!;
    const ctx = canvas.getContext('2d')!;
    const blobs: Blob[] = [];

    /* ── Size canvas to hero ── */
    const resize = () => {
      canvas.width = hero.clientWidth;
      canvas.height = hero.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(hero);

    /* ── Shared blob spawner (used by both mouse and touch) ── */
    const prevPos = new Map<number, { x: number; y: number }>(); // keyed by pointer id

    const spawnAt = (x: number, y: number, pointerId: number) => {
      const prev = prevPos.get(pointerId) ?? { x, y };
      const speed = Math.hypot(x - prev.x, y - prev.y);
      prevPos.set(pointerId, { x, y });

      const count = Math.max(2, Math.min(6, Math.floor(speed / 8)));
      for (let i = 0; i < count; i++) {
        blobs.push({
          x: x + (Math.random() - 0.5) * 50,
          y: y + (Math.random() - 0.5) * 50,
          radius: 80 + Math.random() * 90,
          life: 0,
          maxLife: 70 + Math.random() * 70,
          vx: (Math.random() - 0.5) * 1.2,
          vy: 0.3 + Math.random() * 0.8,
        });
      }
    };

    /* ── Mouse ── */
    const onMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      spawnAt(e.clientX - rect.left, e.clientY - rect.top, -1);
    };

    /* ── Touch ── */
    const onTouch = (e: TouchEvent) => {
      e.preventDefault(); // prevent scroll/zoom interfering with the gesture
      const rect = hero.getBoundingClientRect();
      for (const t of Array.from(e.changedTouches)) {
        spawnAt(t.clientX - rect.left, t.clientY - rect.top, t.identifier);
      }
    };

    hero.addEventListener('mousemove', onMouseMove);
    // { passive: false } needed so e.preventDefault() is allowed
    hero.addEventListener('touchstart', onTouch, { passive: false });
    hero.addEventListener('touchmove', onTouch, { passive: false });

    /* ── Render loop ── */
    let rafId: number;

    const draw = () => {
      // Step 1: Fill canvas solid white — this IS the white hero background
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Step 2: destination-out — punch transparent holes where blobs are.
      // The SVG filter (feGaussianBlur + feColorMatrix on alpha) then merges
      // nearby holes into gooey liquid shapes.
      ctx.globalCompositeOperation = 'destination-out';

      for (let i = blobs.length - 1; i >= 0; i--) {
        const b = blobs[i];
        if (b.life >= b.maxLife) { blobs.splice(i, 1); continue; }

        b.life++;
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.02; // gravity — heavy, viscous feel

        const t = b.life / b.maxLife;
        const alpha = t < 0.1 ? t / 0.1 : 1 - ((t - 0.1) / 0.9);

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        // Source alpha drives how much of the white pixel's alpha is removed.
        // rgba colour doesn't matter here — only alpha is used by destination-out.
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over'; // reset for next frame
      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      hero.removeEventListener('mousemove', onMouseMove);
      hero.removeEventListener('touchstart', onTouch);
      hero.removeEventListener('touchmove', onTouch);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      {/*
        SVG filter — applies to the canvas via CSS `filter: url(#liquid-gooey)`:
        1. feGaussianBlur: blurs the canvas (including its alpha channel).
           Adjacent transparent holes blur into each other → semi-transparent gap.
        2. feColorMatrix: threshold on the ALPHA channel.
           A' = 24 * A - 10
           → A > 0.417 snaps to opaque (white), A < 0.417 snaps to transparent (reveals video).
           → Nearby holes merge into one gooey shape because their blurred alphas combine.
      */}
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute' }}
        aria-hidden="true"
      >
        <defs>
          {/*
            Filter pipeline:
            1. blur         — soft alpha edges, adjacent holes start merging
            2. gooey-mask   — strict threshold → white canvas with sharp gooey holes
            3. border-shape — looser threshold + fixed #0F52BA RGB → slightly larger holes in cobalt blue
            4. blue-border  — feComposite(out): border-shape where gooey-mask is transparent
                              = the cobalt ring between the two threshold radii
            5. over         — gooey-mask (white+transparent) composited over blue-border
                              Result: transparent inside → cobalt blue ring → white outside
          */}
          <filter
            id="liquid-gooey"
            x="-20%" y="-20%" width="140%" height="140%"
            colorInterpolationFilters="sRGB"
          >
            {/* Step 1 — blur */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />

            {/* Step 2 — main gooey mask: A' = 24A − 10, threshold at A ≈ 0.42 */}
            <feColorMatrix
              in="blur" type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 24 -10"
              result="gooeyMask"
            />

            {/* Step 3 — border shape: looser threshold (A' = 24A − 6, threshold at A ≈ 0.25)
                         RGB forced to #000926 = (0, 0.035, 0.149) */}
            <feColorMatrix
              in="blur" type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0.035
                      0 0 0 0 0.149
                      0 0 0 24 -6"
              result="borderShape"
            />

            {/* Step 4 — isolate the ring: borderShape where gooeyMask is transparent */}
            <feComposite in="borderShape" in2="gooeyMask" operator="out" result="blueBorder" />

            {/* Step 5 — gooey white mask over the blue ring */}
            <feComposite in="gooeyMask" in2="blueBorder" operator="over" />
          </filter>
        </defs>
      </svg>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          // SVG filter applies blur+alpha-threshold → gooey transparent holes
          filter: 'url(#liquid-gooey)',
        }}
      />
    </>
  );
}
