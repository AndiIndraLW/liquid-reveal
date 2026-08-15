'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './cylindrical-gallery.module.css';

// ─── Project Data ────────────────────────────────────────────────────────────

interface Project {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  year: string;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Urban Monolith',
    subtitle: 'Architecture 01',
    description: 'A study in brutalist architectural geometry and raw structural forms.',
    image: '/assets/office-1.jpg',
    year: '2024',
  },
  {
    id: 2,
    title: 'Minimal Void',
    subtitle: 'Architecture 02',
    description: 'Exploring negative space and clean monochrome interior perspectives.',
    image: '/assets/office-2.jpg',
    year: '2024',
  },
  {
    id: 3,
    title: 'Concrete Geometry',
    subtitle: 'Architecture 03',
    description: 'Precision line work and angular patterns in modern concrete design.',
    image: '/assets/office-3.jpg',
    year: '2023',
  },
  {
    id: 4,
    title: 'Linear Facade',
    subtitle: 'Architecture 04',
    description: 'Rhythmic vertical glass panels reflecting ambient light and shade.',
    image: '/assets/office-4.jpg',
    year: '2023',
  },
  {
    id: 5,
    title: 'Monochrome Space',
    subtitle: 'Architecture 05',
    description: 'High-contrast light gradients illuminating minimalist structural interiors.',
    image: '/assets/office-5.jpg',
    year: '2023',
  },
  {
    id: 6,
    title: 'Glass Horizon',
    subtitle: 'Architecture 06',
    description: 'Transparent facade elements blending interior work with urban views.',
    image: '/assets/office-6.jpg',
    year: '2022',
  },
  {
    id: 7,
    title: 'Brutalist Form',
    subtitle: 'Architecture 07',
    description: 'Heavy structural massing combined with dramatic vertical light play.',
    image: '/assets/office-7.jpg',
    year: '2022',
  },
  {
    id: 8,
    title: 'Shadow Study',
    subtitle: 'Architecture 08',
    description: 'Intricate shadow cast dynamics across contemporary architectural surfaces.',
    image: '/assets/maarten-deckers-T5nXYXCf50I-unsplash.jpg',
    year: '2022',
  },
];

const N = PROJECTS.length;

// ─── Constants ───────────────────────────────────────────────────────────────
const ANGLE_PER_ITEM = 360 / N;      // 45° per item for 8 items
const RADIUS = 400;                   // tight cylinder radius — all 8 cards visible
const SPRING_STIFFNESS = 0.065;
const SPRING_DAMPING = 0.80;
// Swipe detection thresholds
const SWIPE_PX_THRESHOLD = 50;       // minimum px to count as a swipe
const SWIPE_VEL_THRESHOLD = 0.35;    // px/ms — fast flick still triggers even if short
const DRAG_SENSITIVITY = 0.28;       // degrees of cylinder rotation per pixel dragged
const WHEEL_SENSITIVITY = 0.18;      // degrees per wheel deltaX unit (trackpad)
const AUTO_SLIDE_MS = 3000;          // ms between auto-advances
const AUTO_RESUME_DELAY = 2000;      // ms after last interaction before auto-slide resumes

// Card dimensions — smaller cards centered in the viewport
const CARD_W = 320; // px
const CARD_H = CARD_W * (9 / 16);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CylindricalGallery() {
  const [dims, setDims] = useState({ cardW: 320, radius: 400 });
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDims({ cardW: 190, radius: 240 });
      } else if (window.innerWidth < 1024) {
        setDims({ cardW: 250, radius: 320 });
      } else {
        setDims({ cardW: 320, radius: 400 });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rotationRef = useRef(0);        // live cylinder rotation (degrees, continuous)
  const targetRotRef = useRef(0);       // spring target rotation
  const velRef = useRef(0);             // spring velocity
  const rafRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null); // for non-passive wheel listener

  const [activeIndex, setActiveIndex] = useState(0);
  const [, forceRender] = useState(0);  // drives rAF re-renders

  const prevActiveRef = useRef(0);

  // Live drag tracking
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartRotRef = useRef(0);  // rotationRef value at drag start
  const lastDragXRef = useRef(0);     // for velocity estimation on release
  const lastDragVelRef = useRef(0);   // running velocity estimate (deg/frame)

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isTouchHRef = useRef<boolean | null>(null);

  // Auto-slide
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Trackpad wheel settle timer
  const wheelSettleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWheelActiveRef = useRef(false);

  // ── Animation loop ────────────────────────────────────────────────────────

  const loop = useCallback(() => {
    if (isDraggingRef.current) {
      // While dragging: cylinder follows finger directly, spring stays in sync
      targetRotRef.current = rotationRef.current;
      velRef.current = 0;
    } else {
      // Spring eases toward target
      const delta = targetRotRef.current - rotationRef.current;
      velRef.current = velRef.current * SPRING_DAMPING + delta * SPRING_STIFFNESS;
      rotationRef.current += velRef.current;

      if (Math.abs(delta) < 0.008 && Math.abs(velRef.current) < 0.008) {
        rotationRef.current = targetRotRef.current;
        velRef.current = 0;
      }
    }

    // Sync active index
    const stepFromZero = rotationRef.current / ANGLE_PER_ITEM;
    const nearest = mod(Math.round(stepFromZero), N);
    if (nearest !== prevActiveRef.current) {
      prevActiveRef.current = nearest;
      setActiveIndex(nearest);
    }

    forceRender(n => n + 1);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [loop]);

  // ── Auto-slide ────────────────────────────────────────────────────────────

  const stopAutoSlide = useCallback(() => {
    if (autoTimerRef.current !== null) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    if (resumeTimerRef.current !== null) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const startAutoSlide = useCallback(() => {
    stopAutoSlide();
    autoTimerRef.current = setInterval(() => {
      // Advance by one step from the current target (avoids stale activeIndex)
      targetRotRef.current += ANGLE_PER_ITEM;
    }, AUTO_SLIDE_MS);
  }, [stopAutoSlide]);

  // Pause auto-slide on interaction; resume after AUTO_RESUME_DELAY ms
  const pauseAndResume = useCallback(() => {
    stopAutoSlide();
    resumeTimerRef.current = setTimeout(() => {
      startAutoSlide();
    }, AUTO_RESUME_DELAY);
  }, [stopAutoSlide, startAutoSlide]);

  // Start on mount, clean up on unmount
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [startAutoSlide, stopAutoSlide]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const goTo = useCallback((index: number) => {
    const norm = mod(index, N);
    let target = norm * ANGLE_PER_ITEM;
    const current = targetRotRef.current;
    // Choose shortest arc
    while (target - current > 180) target -= 360;
    while (current - target > 180) target += 360;
    targetRotRef.current = target;
    pauseAndResume();
  }, [pauseAndResume]);

  const goNext = useCallback(() => {
    const next = mod(activeIndex + 1, N);
    goTo(next);
    if (selectedProjectIndex !== null) setSelectedProjectIndex(next);
  }, [activeIndex, goTo, selectedProjectIndex]);

  const goPrev = useCallback(() => {
    const prev = mod(activeIndex - 1, N);
    goTo(prev);
    if (selectedProjectIndex !== null) setSelectedProjectIndex(prev);
  }, [activeIndex, goTo, selectedProjectIndex]);

  const handleCardClick = useCallback((index: number) => {
    goTo(index);
    stopAutoSlide();
    setSelectedProjectIndex((prev) => (prev === index ? null : index));
  }, [goTo, stopAutoSlide]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProjectIndex !== null) {
        setSelectedProjectIndex(null);
      }
      if (e.key === 'ArrowRight') {
        const next = mod(activeIndex + 1, N);
        goTo(next);
        if (selectedProjectIndex !== null) setSelectedProjectIndex(next);
      }
      if (e.key === 'ArrowLeft') {
        const prev = mod(activeIndex - 1, N);
        goTo(prev);
        if (selectedProjectIndex !== null) setSelectedProjectIndex(prev);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [activeIndex, goTo, selectedProjectIndex]);

  // ── Mouse drag (live) ────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    stopAutoSlide();
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartRotRef.current = rotationRef.current;
    lastDragXRef.current = e.clientX;
    lastDragVelRef.current = 0;
    velRef.current = 0;
    e.preventDefault();
  }, [stopAutoSlide]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    // Drag left = positive rotation = next cards come to front
    rotationRef.current = dragStartRotRef.current - dx * DRAG_SENSITIVITY;
    // Track velocity
    lastDragVelRef.current = -(e.clientX - lastDragXRef.current) * DRAG_SENSITIVITY;
    lastDragXRef.current = e.clientX;
  }, []);

  const onMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    // Inject the last drag velocity into the spring, then snap to nearest
    velRef.current = lastDragVelRef.current;
    const nearest = mod(Math.round(rotationRef.current / ANGLE_PER_ITEM), N);
    let target = nearest * ANGLE_PER_ITEM;
    const cur = rotationRef.current;
    while (target - cur > 180) target -= 360;
    while (cur - target > 180) target += 360;
    targetRotRef.current = target;
    pauseAndResume();
  }, [pauseAndResume]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ── Touch drag (live) ────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
    isTouchHRef.current = null;
    // Don’t mark dragging yet — wait until direction is confirmed horizontal
    dragStartXRef.current = t.clientX;
    dragStartRotRef.current = rotationRef.current;
    lastDragXRef.current = t.clientX;
    lastDragVelRef.current = 0;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    const dx = t.clientX - touchStartXRef.current;
    const dy = t.clientY - touchStartYRef.current;
    // Lock direction on first significant movement
    if (isTouchHRef.current === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        isTouchHRef.current = Math.abs(dx) > Math.abs(dy);
        if (isTouchHRef.current) {
          stopAutoSlide();
          isDraggingRef.current = true;
          velRef.current = 0;
        }
      }
    }
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const totalDx = t.clientX - dragStartXRef.current;
    rotationRef.current = dragStartRotRef.current - totalDx * DRAG_SENSITIVITY;
    lastDragVelRef.current = -(t.clientX - lastDragXRef.current) * DRAG_SENSITIVITY;
    lastDragXRef.current = t.clientX;
  }, [stopAutoSlide]);

  const onTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    isTouchHRef.current = null;
    velRef.current = lastDragVelRef.current;
    const nearest = mod(Math.round(rotationRef.current / ANGLE_PER_ITEM), N);
    let target = nearest * ANGLE_PER_ITEM;
    const cur = rotationRef.current;
    while (target - cur > 180) target -= 360;
    while (cur - target > 180) target += 360;
    targetRotRef.current = target;
    pauseAndResume();
  }, [pauseAndResume]);

  // ── Trackpad wheel (two-finger swipe) ────────────────────────────────────────
  // Must be added with { passive: false } so we can preventDefault().
  // React’s onWheel prop is passive in modern React and cannot prevent scroll.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Only handle horizontal scroll (deltaX). If mostly vertical, ignore.
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 0.5) return;
      e.preventDefault();

      if (!isWheelActiveRef.current) {
        isWheelActiveRef.current = true;
        stopAutoSlide();
      }

      // Rotate cylinder live with the trackpad delta
      rotationRef.current += e.deltaX * WHEEL_SENSITIVITY;
      targetRotRef.current = rotationRef.current; // spring stays in sync during active scroll

      // Clear previous settle timer
      if (wheelSettleRef.current !== null) clearTimeout(wheelSettleRef.current);

      // After 120ms of no wheel events: snap to nearest card
      wheelSettleRef.current = setTimeout(() => {
        isWheelActiveRef.current = false;
        const nearest = mod(Math.round(rotationRef.current / ANGLE_PER_ITEM), N);
        let target = nearest * ANGLE_PER_ITEM;
        const cur = rotationRef.current;
        while (target - cur > 180) target -= 360;
        while (cur - target > 180) target += 360;
        targetRotRef.current = target;
        pauseAndResume();
      }, 120);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [stopAutoSlide, pauseAndResume]);

  // ── Render ────────────────────────────────────────────────────────────────

  const rot = rotationRef.current;
  const cardW = dims.cardW;
  const cardH = cardW * (9 / 16);
  const radius = dims.radius;

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
    >
      {/* perspective wrapper — must be separate from the transform-style: preserve-3d element */}
      <div className={styles.perspectiveWrapper}>
        {/* The scene is a zero-size origin point; cards radiate from it */}
        <div className={styles.scene}>
          {PROJECTS.map((project, i) => {
            const cardAngle = i * ANGLE_PER_ITEM;

            // How far this card is from the front-facing position
            let angleFromFront = cardAngle - rot;
            // Normalize to [-180, 180]
            angleFromFront = ((angleFromFront % 360) + 360) % 360;
            if (angleFromFront > 180) angleFromFront -= 360;

            const absAngle = Math.abs(angleFromFront);
            // Show ALL 8 cards around the full cylinder — no culling

            // cosA: +1 at front, 0 at 90°, -1 at back
            const cosA = Math.cos((angleFromFront * Math.PI) / 180);

            // Scale: front = 1.0, back = 0.30 (still visible but clearly behind)
            const scale = 0.30 + 0.70 * ((cosA + 1) / 2);
            // Opacity: front = 1, back = 0.25
            const opacity = 0.25 + 0.75 * ((cosA + 1) / 2);
            // Z-index: front cards on top
            const zIndex = Math.round(cosA * 100) + 100;

            const isActive = absAngle < ANGLE_PER_ITEM * 0.5;
            const isSelected = selectedProjectIndex === i;
            const currentScale = isSelected ? scale * 1.06 : scale;

            return (
              <div
                key={project.id}
                className={styles.cardContainer}
                style={{
                  // Place card at its angle on the cylinder, then push it out by radius
                  transform: `rotateY(${angleFromFront}deg) translateZ(${radius}px) scale(${currentScale})`,
                  opacity: selectedProjectIndex !== null && !isSelected ? 0.35 : opacity,
                  zIndex: isSelected ? 600 : zIndex,
                  // Center the card on the origin
                  width: cardW,
                  height: cardH,
                  marginLeft: -cardW / 2,
                  marginTop: -cardH / 2,
                  cursor: 'pointer',
                }}
                onClick={() => handleCardClick(i)}
              >
                {/* Main Card */}
                <div
                  className={styles.card}
                  style={{
                    boxShadow: isSelected
                      ? '0 30px 90px rgba(0,0,0,0.8), 0 0 35px rgba(56, 189, 248, 0.5), 0 0 0 2px rgba(56, 189, 248, 0.6)'
                      : isActive
                      ? '0 30px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04)'
                      : '0 8px 28px rgba(0,0,0,0.09)',
                  }}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className={styles.cardImage}
                    draggable={false}
                  />
                  {/* Darkening veil: deeper around cylinder = darker */}
                  <div
                    className={styles.cardVeil}
                    style={{ opacity: isSelected ? 0 : isActive ? 0 : Math.min(0.70, (1 - cosA) * 0.55) }}
                  />
                </div>

                {/* Mirror Reflection Effect (blur & middle-low opacity) */}
                <div
                  className={styles.reflectionCard}
                  style={{
                    opacity: isSelected ? 0.45 : isActive ? 0.35 : 0.22,
                  }}
                >
                  <img
                    src={project.image}
                    alt=""
                    className={styles.cardImage}
                    draggable={false}
                  />
                  <div
                    className={styles.cardVeil}
                    style={{ opacity: isSelected ? 0.05 : isActive ? 0.05 : Math.min(0.70, (1 - cosA) * 0.55) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info panel removed */}

      {/* ── Nav buttons ── */}
      <button className={`${styles.navBtn} ${styles.navLeft}`} onClick={goPrev} aria-label="Previous project">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button className={`${styles.navBtn} ${styles.navRight}`} onClick={goNext} aria-label="Next project">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* ── Dot indicators ── */}
      <div className={styles.dots} role="tablist">
        {PROJECTS.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIndex}
            className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
            onClick={() => handleCardClick(i)}
            aria-label={`Go to project ${i + 1}`}
          />
        ))}
      </div>

      {/* ── 70% Black Focus Backdrop ── */}
      <div
        className={`${styles.focusBackdrop} ${
          selectedProjectIndex !== null ? styles.focusBackdropVisible : ''
        }`}
        onClick={() => setSelectedProjectIndex(null)}
      />

      {/* ── Project Information Panel (When Image is Clicked) ── */}
      {selectedProjectIndex !== null && PROJECTS[selectedProjectIndex] && (
        <div className={styles.projectInfoPanel}>
          <div className={styles.projectInfoTop}>
            <span className={styles.projectInfoTag}>
              {PROJECTS[selectedProjectIndex].subtitle}
            </span>
            <span className={styles.projectInfoDot}>•</span>
            <span className={styles.projectInfoYear}>
              {PROJECTS[selectedProjectIndex].year}
            </span>
          </div>

          <h2 className={styles.projectInfoTitle}>
            {PROJECTS[selectedProjectIndex].title}
          </h2>

          <p className={styles.projectInfoDesc}>
            {PROJECTS[selectedProjectIndex].description}
          </p>

          <button
            className={styles.closeFocusBtn}
            onClick={() => setSelectedProjectIndex(null)}
            aria-label="Close detail view"
          >
            <span>CLOSE</span>
            <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>✕</span>
          </button>
        </div>
      )}
    </div>
  );
}
