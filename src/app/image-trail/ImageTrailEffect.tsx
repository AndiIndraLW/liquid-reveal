'use client';

import { useEffect, useRef, useState } from 'react';

interface TrailItem {
  id: number;
  x: number;
  y: number;
  imageIndex: number;
  rotation: number;
}

const TRAIL_IMAGES = [
  '/assets/office-1.jpg',
  '/assets/office-2.jpg',
  '/assets/office-3.jpg',
  '/assets/office-4.jpg',
  '/assets/office-5.jpg',
  '/assets/office-6.jpg',
  '/assets/office-7.jpg',
];

export default function ImageTrailEffect() {
  const [items, setItems] = useState<TrailItem[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const counterRef = useRef(0);

  // Preload images into browser memory cache for 60fps instant rendering
  useEffect(() => {
    TRAIL_IMAGES.forEach((src) => {
      const img = new globalThis.Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const minDistance = 50; // smooth spacing threshold

    const handlePointerMove = (e: PointerEvent) => {
      const { clientX, clientY } = e;

      if (lastPosRef.current) {
        const dx = clientX - lastPosRef.current.x;
        const dy = clientY - lastPosRef.current.y;
        const distance = Math.hypot(dx, dy);

        if (distance < minDistance) return;
      }

      lastPosRef.current = { x: clientX, y: clientY };
      counterRef.current += 1;

      const newItem: TrailItem = {
        id: Date.now() + Math.random(),
        x: clientX,
        y: clientY,
        imageIndex: counterRef.current % TRAIL_IMAGES.length,
        rotation: (Math.random() - 0.5) * 26,
      };

      setItems((prev) => [...prev.slice(-10), newItem]);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Clean up items smoothly
  useEffect(() => {
    if (items.length === 0) return;
    const timer = setTimeout(() => {
      setItems((prev) => prev.slice(1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [items]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            transform: `translate3d(-50%, -50%, 0) rotate(${item.rotation}deg)`,
            willChange: 'transform, opacity',
            animation: 'trailPopFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            width: '185px',
            height: '260px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 16px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.12)',
            background: '#12141d',
          }}
        >
          <img
            src={TRAIL_IMAGES[item.imageIndex]}
            alt="Trail asset"
            loading="eager"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      ))}

      <style jsx global>{`
        @keyframes trailPopFade {
          0% {
            opacity: 0;
            transform: translate3d(-50%, -50%, 0) rotate(0deg) scale(0.65);
          }
          15% {
            opacity: 1;
            transform: translate3d(-50%, -50%, 0) rotate(var(--rot, 4deg)) scale(1);
          }
          70% {
            opacity: 0.95;
          }
          100% {
            opacity: 0;
            transform: translate3d(-50%, -40%, 0) rotate(var(--rot, 8deg)) scale(0.92);
          }
        }
      `}</style>
    </div>
  );
}
