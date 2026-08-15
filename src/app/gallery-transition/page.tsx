'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from "../hero.module.css";
import ExperimentsDropdown from "../ExperimentsDropdown";

interface GalleryItem {
  id: number;
  src: string;
  title: string;
  category: string;
  description: string;
}

const GALLERY_IMAGES: GalleryItem[] = [
  {
    id: 1,
    src: '/assets/office-1.jpg',
    title: 'Urban Monolith',
    category: 'Architecture 01',
    description: 'A study in brutalist architectural geometry and raw structural forms.',
  },
  {
    id: 2,
    src: '/assets/office-2.jpg',
    title: 'Minimal Void',
    category: 'Architecture 02',
    description: 'Exploring negative space and clean monochrome interior perspectives.',
  },
  {
    id: 3,
    src: '/assets/office-3.jpg',
    title: 'Concrete Geometry',
    category: 'Architecture 03',
    description: 'Precision line work and angular patterns captured in modern concrete design.',
  },
  {
    id: 4,
    src: '/assets/office-4.jpg',
    title: 'Linear Facade',
    category: 'Architecture 04',
    description: 'Rhythmic vertical glass panels reflecting ambient light and shade.',
  },
  {
    id: 5,
    src: '/assets/office-5.jpg',
    title: 'Monochrome Space',
    category: 'Architecture 05',
    description: 'High-contrast light gradients illuminating minimalist structural interiors.',
  },
  {
    id: 6,
    src: '/assets/office-6.jpg',
    title: 'Glass Horizon',
    category: 'Architecture 06',
    description: 'Transparent facade elements blending interior work environments with urban views.',
  },
  {
    id: 7,
    src: '/assets/office-7.jpg',
    title: 'Brutalist Form',
    category: 'Architecture 07',
    description: 'Heavy structural massing combined with dramatic vertical light play.',
  },
  {
    id: 8,
    src: '/assets/maarten-deckers-T5nXYXCf50I-unsplash.jpg',
    title: 'Shadow Study',
    category: 'Architecture 08',
    description: 'Intricate shadow cast dynamics across contemporary architectural surfaces.',
  },
];

export default function GalleryTransitionPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGlimpses, setShowGlimpses] = useState(false);
  const [clickedRect, setClickedRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  // Preload images into memory
  useEffect(() => {
    GALLERY_IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, []);

  // Handle responsive visible count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, GALLERY_IMAGES.length - visibleCount);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handleCardClick = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setClickedRect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
    setSelectedImageIndex(index);
    setIsDetailOpen(true);
    setIsAnimating(false);
    setShowGlimpses(false);

    // Trigger expansion animation from origin rect to center 16:9 widescreen
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
        // Reveal left and right project glimpses AFTER center image expands to 16:9
        setTimeout(() => {
          setShowGlimpses(true);
        }, 750);
      });
    });
  };

  const handleCloseDetail = useCallback(() => {
    setShowGlimpses(false);
    setIsAnimating(false);
    setTimeout(() => {
      setIsDetailOpen(false);
      setClickedRect(null);
    }, 850);
  }, []);

  const handleDetailPrev = useCallback(() => {
    setSelectedImageIndex((prev) => (prev === null || prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1));
  }, []);

  const handleDetailNext = useCallback(() => {
    setSelectedImageIndex((prev) => (prev === null || prev === GALLERY_IMAGES.length - 1 ? 0 : prev + 1));
  }, []);

  // Handle keyboard navigation & Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDetailOpen) {
        handleCloseDetail();
      } else if (e.key === 'ArrowLeft') {
        if (isDetailOpen) {
          handleDetailPrev();
        } else {
          handlePrev();
        }
      } else if (e.key === 'ArrowRight') {
        if (isDetailOpen) {
          handleDetailNext();
        } else {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailOpen, handleCloseDetail, handleDetailPrev, handleDetailNext, handlePrev, handleNext]);

  const selectedItem = selectedImageIndex !== null ? GALLERY_IMAGES[selectedImageIndex] : null;

  return (
    <main
      style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#0a0c10',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        isolation: 'isolate',
        padding: '0 20px',
      }}
    >
      {/* ── Background Video ── */}
      <video
        src="/assets/bg-gallery-transition.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* ── Top-left label ── */}
      <p className={`${styles.corner} ${styles.cornerTopLeft}`}>
        andiindra <span className={styles.slash}>//</span> Playground
      </p>

      {/* ── Top-right dropdown menu ── */}
      <ExperimentsDropdown />

      {/* ── Hero View: Title Header & Inline Small Gallery ── */}
      <div
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          maxWidth: '1400px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(12px, 2vw, 24px)',
            flexWrap: 'wrap',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {/* Word 1: Gallery (Slides LEFT on click) */}
          <span
            style={{
              fontSize: 'clamp(2.2rem, 6.5vw, 6rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: '#ffffff',
              textShadow: '0 4px 24px rgba(0, 0, 0, 0.7)',
              whiteSpace: 'nowrap',
              transform: isDetailOpen && isAnimating ? 'translateX(-120vw)' : 'translateX(0)',
              opacity: isDetailOpen && isAnimating ? 0 : 1,
              transition: 'transform 0.85s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.55s ease',
              willChange: 'transform, opacity',
            }}
          >
            Gallery
          </span>

          {/* Small Embedded 9:16 Gallery Carousel Component with Chevrons */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              verticalAlign: 'middle',
              padding: '6px',
              borderRadius: '20px',
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transform: isDetailOpen && isAnimating ? 'scale(0.85)' : 'scale(1)',
              opacity: isDetailOpen && isAnimating ? 0 : 1,
              pointerEvents: isDetailOpen ? 'none' : 'auto',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
            }}
          >
            {/* Left Chevron Button */}
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              style={{
                flexShrink: 0,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.3)';
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Small Gallery Viewport (Showing 4 9:16 Images) */}
            <div
              style={{
                width: `calc(${visibleCount} * clamp(55px, 8.5vw, 80px) + ${(visibleCount - 1) * 8}px)`,
                height: 'clamp(98px, 15vw, 142px)',
                overflow: 'hidden',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  height: '100%',
                  transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: `translateX(calc(-${currentIndex} * (clamp(55px, 8.5vw, 80px) + 8px)))`,
                }}
              >
                {GALLERY_IMAGES.map((img, idx) => {
                  const isActive = idx >= currentIndex && idx < currentIndex + visibleCount;
                  const isThisSelected = isDetailOpen && selectedImageIndex === idx;
                  return (
                    <div
                      key={img.id}
                      onClick={(e) => handleCardClick(idx, e)}
                      style={{
                        flex: '0 0 clamp(55px, 8.5vw, 80px)',
                        height: '100%',
                        aspectRatio: '9 / 16',
                        position: 'relative',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundColor: '#121620',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                        transition: 'all 0.4s ease',
                        opacity: isThisSelected ? 0 : isActive ? 1 : 0.4,
                        scale: isActive ? '1' : '0.94',
                        cursor: 'pointer',
                      }}
                      className="gallery-card"
                    >
                      <img
                        src={img.src}
                        alt={img.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Chevron Button */}
            <button
              onClick={handleNext}
              aria-label="Next image"
              style={{
                flexShrink: 0,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.3)';
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Word 2: Transition (Slides RIGHT on click) */}
          <span
            style={{
              fontSize: 'clamp(2.2rem, 6.5vw, 6rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: '#ffffff',
              textShadow: '0 4px 24px rgba(0, 0, 0, 0.7)',
              whiteSpace: 'nowrap',
              transform: isDetailOpen && isAnimating ? 'translateX(120vw)' : 'translateX(0)',
              opacity: isDetailOpen && isAnimating ? 0 : 1,
              transition: 'transform 0.85s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.55s ease',
              willChange: 'transform, opacity',
            }}
          >
            Transition
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '0.85rem',
            fontWeight: 500,
            letterSpacing: '0.08em',
            color: '#000000',
            transform: isDetailOpen && isAnimating ? 'translateY(15px)' : 'translateY(0)',
            opacity: isDetailOpen && isAnimating ? 0 : 1,
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
            pointerEvents: 'none',
          }}
        >
          click the image to interact
        </p>
      </div>

      {/* ── Morphing Image Origin Animation (Zero Fade: 9:16 thumbnail -> 16:9 center widescreen) ── */}
      {isDetailOpen && selectedItem && !showGlimpses && (
        <div
          style={{
            position: 'fixed',
            zIndex: 90,
            opacity: 1,
            pointerEvents: 'none',
            borderRadius: isAnimating ? '20px' : '10px',
            overflow: 'hidden',
            backgroundColor: '#121620',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: isAnimating
              ? '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(56, 189, 248, 0.35)'
              : '0 8px 20px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'top, left, width, height, aspect-ratio, transform',
            ...(isAnimating
              ? {
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -55%)',
                  width: 'clamp(280px, 54vw, 700px)',
                  aspectRatio: '16 / 9',
                }
              : {
                  top: `${clickedRect?.top ?? 0}px`,
                  left: `${clickedRect?.left ?? 0}px`,
                  transform: 'none',
                  width: `${clickedRect?.width ?? 80}px`,
                  height: `${clickedRect?.height ?? 142}px`,
                  aspectRatio: '9 / 16',
                }),
          }}
        >
          <img
            src={selectedItem.src}
            alt={selectedItem.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'all 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      )}

      {/* ── Fullscreen Project Detail Overlay View (Horizontal Sliding Track with Glimpses) ── */}
      {isDetailOpen && selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: isAnimating ? 'auto' : 'none',
            opacity: isAnimating ? 1 : 0,
            transition: 'opacity 0.4s ease',
            overflow: 'hidden',
          }}
        >
          {/* Sleek Close Button at Top Center */}
          <button
            onClick={handleCloseDetail}
            aria-label="Close detail view"
            style={{
              position: 'absolute',
              top: 'clamp(20px, 3.5vw, 40px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              background: 'rgba(12, 14, 20, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '30px',
              padding: '8px 20px',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.25)';
              e.currentTarget.style.borderColor = '#38bdf8';
              e.currentTarget.style.color = '#38bdf8';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(12, 14, 20, 0.85)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';
            }}
          >
            <span>CLOSE</span>
            <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>✕</span>
          </button>

          {/* ── 16:9 Sliding Track Container with Left & Right Project Glimpses (Revealed after 16:9 expansion) ── */}
          <div
            style={{
              position: 'absolute',
              top: '46%',
              left: 0,
              width: '100vw',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              transition: 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: `translate3d(calc(50vw - ((${selectedImageIndex ?? 0} + 0.5) * (clamp(280px, 54vw, 700px) + 24px))), -50%, 0)`,
              willChange: 'transform',
            }}
          >
            {GALLERY_IMAGES.map((img, idx) => {
              const isCenter = idx === selectedImageIndex;
              const isAdjacent =
                Math.abs(idx - (selectedImageIndex ?? 0)) === 1 ||
                (selectedImageIndex === 0 && idx === GALLERY_IMAGES.length - 1) ||
                (selectedImageIndex === GALLERY_IMAGES.length - 1 && idx === 0);

              const cardOpacity = isCenter ? (showGlimpses ? 1 : 0) : showGlimpses && isAdjacent ? 0.38 : 0;
              const cardScale = isCenter ? 'scale(1)' : showGlimpses ? 'scale(0.88)' : 'scale(0.7)';

              return (
                <div
                  key={img.id}
                  onClick={() => {
                    if (!isCenter && showGlimpses) {
                      setSelectedImageIndex(idx);
                    }
                  }}
                  style={{
                    flex: '0 0 clamp(280px, 54vw, 700px)',
                    aspectRatio: '16 / 9',
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    backgroundColor: '#121620',
                    border: isCenter ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isCenter
                      ? '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.35)'
                      : '0 12px 32px rgba(0, 0, 0, 0.5)',
                    opacity: cardOpacity,
                    transform: cardScale,
                    transition: 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: isCenter ? 'default' : 'pointer',
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Title Positioned Below Featured 16:9 Image */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(50% + clamp(100px, 18vw, 220px))',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              zIndex: 100,
              width: '100%',
              maxWidth: '800px',
              opacity: showGlimpses ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(1.4rem, 3.5vw, 2.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
                transition: 'all 0.4s ease',
              }}
            >
              {selectedItem.title}
            </h2>
          </div>

          {/* Fullscreen Navigation Bar: Bottom Controls */}
          <div
            style={{
              position: 'absolute',
              bottom: 'clamp(20px, 3.5vw, 40px)',
              left: 'clamp(20px, 3.5vw, 40px)',
              right: 'clamp(20px, 3.5vw, 40px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 100,
              pointerEvents: 'auto',
              opacity: showGlimpses ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            {/* Bottom-Left: PREVIOUS PROJECT */}
            <button
              onClick={handleDetailPrev}
              aria-label="Previous project"
              style={{
                background: 'rgba(12, 14, 20, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '30px',
                padding: '10px 20px',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.25)';
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.color = '#38bdf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(12, 14, 20, 0.85)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>PREVIOUS PROJECT</span>
            </button>

            {/* Bottom-Center: Image Info & Number */}
            <div
              style={{
                textAlign: 'center',
                maxWidth: '460px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '0 16px',
              }}
            >
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  color: '#38bdf8',
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
                }}
              >
                0{(selectedImageIndex ?? 0) + 1} / 0{GALLERY_IMAGES.length}
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: 'rgba(255, 255, 255, 0.75)',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
                }}
              >
                {selectedItem.description}
              </p>
            </div>

            {/* Bottom-Right: NEXT PROJECT */}
            <button
              onClick={handleDetailNext}
              aria-label="Next project"
              style={{
                background: 'rgba(12, 14, 20, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '30px',
                padding: '10px 20px',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.25)';
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.color = '#38bdf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(12, 14, 20, 0.85)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              <span>NEXT PROJECT</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom-left label ── */}
      <p className={`${styles.corner} ${styles.cornerBottomLeft}`}>
        <a
          href="https://www.instagram.com/andiindra.dev"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cornerLink}
        >
          instagram
        </a>
        <span className={styles.slash}> / </span>
        <a
          href="https://www.andiindra.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cornerLink}
        >
          portfolio
        </a>
      </p>

      {/* Hover Card Animation */}
      <style jsx global>{`
        .gallery-card:hover img {
          transform: scale(1.12);
        }
        .gallery-card:hover {
          border-color: rgba(56, 189, 248, 0.5) !important;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.7), 0 0 18px rgba(56, 189, 248, 0.3) !important;
        }
      `}</style>
    </main>
  );
}




