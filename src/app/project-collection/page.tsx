'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../hero.module.css';
import pageStyles from './project-collection.module.css';
import ExperimentsDropdown from '../ExperimentsDropdown';

export const IMAGE_ASSETS: string[] = [
  '/assets/office-1.jpg',
  '/assets/office-2.jpg',
  '/assets/office-3.jpg',
  '/assets/office-4.jpg',
  '/assets/office-5.jpg',
  '/assets/office-6.jpg',
  '/assets/office-7.jpg',
  '/assets/maarten-deckers-T5nXYXCf50I-unsplash.jpg',
  '/assets/bg-image-trail.jpg',
];

// Helper to shuffle an array randomly
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Linear interpolation for velocity smoothing
function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}

// Dynamic screen dimension calculator for perfectly seamless mobile & desktop tiling
function getTileDimensions() {
  if (typeof window !== 'undefined' && window.innerWidth < 640) {
    const cardW = 260;
    const gap = 20;
    const cardH = cardW * (9 / 16);
    return {
      tileW: 5 * (cardW + gap), // 1400px
      tileH: 4 * (cardH + gap), // 665px
    };
  }
  const cardW = 340;
  const gap = 32;
  const cardH = cardW * (9 / 16);
  return {
    tileW: 5 * (cardW + gap), // 1860px
    tileH: 4 * (cardH + gap), // 893px
  };
}

export default function ProjectCollectionPage() {
  const [gridMatrix, setGridMatrix] = useState<string[][]>([]);
  const [isDraggingUI, setIsDraggingUI] = useState(false);
  const [tileDims, setTileDims] = useState({ tileW: 1860, tileH: 893 });

  // Fullscreen Expansion & Scatter Out State
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isScatterOut, setIsScatterOut] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showDetailControls, setShowDetailControls] = useState(false);
  const [selectedCardRect, setSelectedCardRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  const outerContainerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const startPointerRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const totalMovedDistanceRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Initialize responsive tile dimensions & handle resize
  useEffect(() => {
    const handleResize = () => {
      setTileDims(getTileDimensions());
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize 4 rows x 5 cols matrix with randomized 16:9 images
  useEffect(() => {
    const rows: string[][] = [];
    for (let r = 0; r < 4; r++) {
      rows.push(shuffle(IMAGE_ASSETS).slice(0, 5));
    }
    setGridMatrix(rows);

    // Preload images into memory
    IMAGE_ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // 60-120FPS Hardware Accelerated Physics & Render Loop
  const renderLoop = useCallback(() => {
    if (!isDraggingRef.current && !isDetailOpen) {
      const vx = velRef.current.x;
      const vy = velRef.current.y;
      if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) {
        posRef.current.x += vx;
        posRef.current.y += vy;
        velRef.current.x *= 0.88; // Slower, calmer momentum decay
        velRef.current.y *= 0.88;
      } else {
        velRef.current = { x: 0, y: 0 };
      }
    }

    if (outerContainerRef.current) {
      const { tileW, tileH } = getTileDimensions();
      const wx = ((posRef.current.x % tileW) + tileW) % tileW - tileW / 2;
      const wy = ((posRef.current.y % tileH) + tileH) % tileH - tileH / 2;

      outerContainerRef.current.style.transform = `translate3d(${wx.toFixed(2)}px, ${wy.toFixed(2)}px, 0)`;
    }

    animFrameRef.current = requestAnimationFrame(renderLoop);
  }, [isDetailOpen]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [renderLoop]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDetailOpen) return;
    isDraggingRef.current = true;
    setIsDraggingUI(true);
    totalMovedDistanceRef.current = 0;
    startPointerRef.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    velRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || isDetailOpen) return;
    const newX = e.clientX - startPointerRef.current.x;
    const newY = e.clientY - startPointerRef.current.y;

    const instVx = (e.clientX - lastPointerRef.current.x) * 0.45;
    const instVy = (e.clientY - lastPointerRef.current.y) * 0.45;

    totalMovedDistanceRef.current += Math.abs(instVx) + Math.abs(instVy);

    velRef.current.x = lerp(velRef.current.x, instVx, 0.35);
    velRef.current.y = lerp(velRef.current.y, instVy, 0.35);

    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    posRef.current = { x: newX, y: newY };
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDraggingUI(false);
  };

  // Wheel & Trackpad Impulse Integration
  const handleWheel = (e: React.WheelEvent) => {
    if (isDetailOpen) return;
    velRef.current.x -= e.deltaX * 0.08;
    velRef.current.y -= e.deltaY * 0.08;
  };

  // Handle Card Click
  const handleCardClick = (imgSrc: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (totalMovedDistanceRef.current > 5) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const assetIndex = IMAGE_ASSETS.indexOf(imgSrc);

    setSelectedCardRect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
    setSelectedImageIndex(assetIndex >= 0 ? assetIndex : 0);
    setIsDetailOpen(true);
    setIsScatterOut(false);
    setIsExpanding(false);
    setShowDetailControls(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsScatterOut(true);
        setTimeout(() => {
          setIsExpanding(true);
        }, 150);
        setTimeout(() => {
          setShowDetailControls(true);
        }, 750);
      });
    });
  };

  // Handle Close Detail View
  const handleCloseDetail = useCallback(() => {
    setShowDetailControls(false);
    setIsExpanding(false);
    setTimeout(() => {
      setIsScatterOut(false);
    }, 250);
    setTimeout(() => {
      setIsDetailOpen(false);
      setSelectedImageIndex(null);
      setSelectedCardRect(null);
    }, 850);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedImageIndex((prev) => (prev === null || prev === 0 ? IMAGE_ASSETS.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setSelectedImageIndex((prev) => (prev === null || prev === IMAGE_ASSETS.length - 1 ? 0 : prev + 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDetailOpen) {
        handleCloseDetail();
      } else if (e.key === 'ArrowLeft' && isDetailOpen) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && isDetailOpen) {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailOpen, handleCloseDetail, handlePrev, handleNext]);

  // Responsive 3x3 Tile Offsets
  const { tileW, tileH } = tileDims;
  const tileOffsets = [
    { x: -tileW, y: -tileH },
    { x: 0, y: -tileH },
    { x: tileW, y: -tileH },
    { x: -tileW, y: 0 },
    { x: 0, y: 0 },
    { x: tileW, y: 0 },
    { x: -tileW, y: tileH },
    { x: 0, y: tileH },
    { x: tileW, y: tileH },
  ];

  const currentFeaturedImage = selectedImageIndex !== null ? IMAGE_ASSETS[selectedImageIndex] : null;

  return (
    <div className={pageStyles.pageContainer}>
      {/* ── Top-left label ── */}
      <p
        className={`${styles.corner} ${styles.cornerTopLeft}`}
        style={{ color: '#000000', mixBlendMode: 'normal', zIndex: 120 }}
      >
        andiindra{' '}
        <span className={styles.slash} style={{ color: '#000000', mixBlendMode: 'normal' }}>
          //
        </span>{' '}
        Playground
      </p>

      {/* ── Top-right dropdown menu ── */}
      <ExperimentsDropdown />

      {/* ── Page Header (Smaller Title) ── */}
      <header
        className={`${pageStyles.headerSection} ${
          isScatterOut ? pageStyles.headerSectionHidden : ''
        }`}
      >
        <h1 className={pageStyles.headerTitle}>Project Collection</h1>
        <div className={pageStyles.headerSubtitle}>
          <span className={pageStyles.dragBadge}>
            <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>✥</span> Drag or swipe in any direction
          </span>
        </div>
      </header>

      {/* ── Hardware Accelerated 2D Infinite Drag Canvas ── */}
      <div
        className={`${pageStyles.canvasWrapper} ${
          isDraggingUI ? pageStyles.canvasWrapperDragging : ''
        } ${isScatterOut ? pageStyles.canvasScatterOut : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* Direct transform target ref driven at 60-120fps via requestAnimationFrame */}
        <div ref={outerContainerRef} className={pageStyles.outerTransformContainer}>
          {tileOffsets.map((offset, tileIdx) => (
            <div
              key={`tile-${tileIdx}`}
              className={pageStyles.tileBlock}
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
              }}
            >
              {gridMatrix.map((rowImages, rIdx) => (
                <div key={`tile-${tileIdx}-row-${rIdx}`} className={pageStyles.gridRow}>
                  {rowImages.map((imgSrc, cIdx) => (
                    <div
                      key={`tile-${tileIdx}-row-${rIdx}-col-${cIdx}`}
                      onClick={(e) => handleCardClick(imgSrc, e)}
                      className={pageStyles.imageCard}
                    >
                      <img
                        src={imgSrc}
                        alt={`Project visual ${rIdx * 5 + cIdx + 1}`}
                        className={pageStyles.cardImage}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Fullscreen Morphing Image & Detail Overlay View ── */}
      {isDetailOpen && currentFeaturedImage && (
        <>
          {/* Backdrop Blur Overlay */}
          <div
            className={`${pageStyles.detailBackdrop} ${
              isExpanding ? pageStyles.detailBackdropVisible : ''
            }`}
            onClick={handleCloseDetail}
          />

          {/* Morphing Expanding Image Card */}
          <div
            className={pageStyles.expandingCard}
            style={{
              ...(isExpanding
                ? {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -52%)',
                    width: 'clamp(300px, 72vw, 980px)',
                    aspectRatio: '16 / 9',
                    borderRadius: '24px',
                  }
                : {
                    top: `${selectedCardRect?.top ?? 0}px`,
                    left: `${selectedCardRect?.left ?? 0}px`,
                    transform: 'none',
                    width: `${selectedCardRect?.width ?? 340}px`,
                    height: `${selectedCardRect?.height ?? 191}px`,
                    borderRadius: '20px',
                  }),
            }}
          >
            <img
              src={currentFeaturedImage}
              alt="Featured project visual"
              className={pageStyles.expandingImage}
            />
          </div>

          {/* Header Close Button (Top Right) */}
          <div
            className={`${pageStyles.detailHeader} ${
              showDetailControls ? pageStyles.detailHeaderVisible : ''
            }`}
          >
            <button
              onClick={handleCloseDetail}
              className={pageStyles.closeBtn}
              aria-label="Close project view"
            >
              <span>CLOSE</span>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>×</span>
            </button>
          </div>

          {/* Fullscreen Navigation Bar: Bottom Controls */}
          <div
            className={`${pageStyles.detailBottomBar} ${
              showDetailControls ? pageStyles.detailBottomBarVisible : ''
            }`}
          >
            {/* Bottom Left: PREVIOUS */}
            <button
              onClick={handlePrev}
              className={pageStyles.navBtn}
              aria-label="Previous project image"
            >
              <span>← PREVIOUS</span>
            </button>

            {/* Bottom Center: Counter */}
            <div className={pageStyles.metaCenter}>
              <span className={pageStyles.metaCounter}>
                0{(selectedImageIndex ?? 0) + 1} / 0{IMAGE_ASSETS.length}
              </span>
              <h2 className={pageStyles.metaTitle}>Project Visual 0{(selectedImageIndex ?? 0) + 1}</h2>
            </div>

            {/* Bottom Right: NEXT */}
            <button
              onClick={handleNext}
              className={pageStyles.navBtn}
              aria-label="Next project image"
            >
              <span>NEXT →</span>
            </button>
          </div>
        </>
      )}

      {/* ── Bottom-left label ── */}
      <p
        className={`${styles.corner} ${styles.cornerBottomLeft}`}
        style={{ color: '#000000', mixBlendMode: 'normal', zIndex: 120 }}
      >
        <a
          href="https://www.instagram.com/andiindra.dev"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cornerLink}
          style={{ color: '#000000' }}
        >
          instagram
        </a>
        <span className={styles.slash} style={{ color: '#000000', mixBlendMode: 'normal' }}>
          {' '}
          /{' '}
        </span>
        <a
          href="https://www.andiindra.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cornerLink}
          style={{ color: '#000000' }}
        >
          portfolio
        </a>
      </p>
    </div>
  );
}
