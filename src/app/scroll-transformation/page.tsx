'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../hero.module.css";
import ExperimentsDropdown from "../ExperimentsDropdown";

const SECTIONS = [
  {
    id: "hero",
    title: "Scroll Transformation",
    subtitle: "scroll down or up to interact",
    bgStyle: {
      backgroundColor: "#ffffff",
    },
    textColor: "#000000",
    slashColor: "#000000",
  },
  {
    id: "section-1",
    title: "Section 1",
    subtitle: "scroll down or up to interact",
    bgStyle: {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url("${encodeURI("/assets/Scroll Transformation/scroll-transformation-1.jpg")}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    textColor: "#ffffff",
    slashColor: "#ffffff",
    textShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
  },
  {
    id: "section-2",
    title: "Section 2",
    subtitle: "scroll down or up to interact",
    bgStyle: {
      backgroundColor: "#000000",
    },
    textColor: "#ffffff",
    slashColor: "#ffffff",
  },
  {
    id: "section-3",
    title: "Section 3",
    subtitle: "scroll down or up to interact",
    bgStyle: {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url("${encodeURI("/assets/Scroll Transformation/scroll-transformation-2.jpg")}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    textColor: "#ffffff",
    slashColor: "#ffffff",
    textShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
  },
  {
    id: "section-4",
    title: "Section 4",
    subtitle: "scroll down or up to interact",
    bgStyle: {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url("${encodeURI("/assets/Scroll Transformation/scroll-transformation-3.jpg")}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    textColor: "#ffffff",
    slashColor: "#ffffff",
    textShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
  },
];

export default function ScrollTransformationPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const leftHalfRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightHalfRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!pinRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=400%", // 4 transitions across 5 sections
          scrub: 1, // smooth scroll-driven momentum
          pin: true,
          anticipatePin: 1,
        },
      });

      for (let i = 0; i < SECTIONS.length - 1; i++) {
        const leftHalf = leftHalfRefs.current[i];
        const rightHalf = rightHalfRefs.current[i];
        const nextSec = sectionRefs.current[i + 1];

        const stepTime = i;

        // Current Section Left Half splits and slides UP (-100%)
        if (leftHalf) {
          tl.to(
            leftHalf,
            { yPercent: -100, ease: "none", duration: 1 },
            stepTime
          );
        }

        // Current Section Right Half splits and slides DOWN (+100%)
        if (rightHalf) {
          tl.to(
            rightHalf,
            { yPercent: 100, ease: "none", duration: 1 },
            stepTime
          );
        }

        // Next Section underneath subtle cinematic scale reveal (1.06 -> 1.0)
        if (nextSec) {
          tl.fromTo(
            nextSec,
            { scale: 1.06 },
            { scale: 1.0, ease: "none", duration: 1 },
            stepTime
          );
        }
      }
    }, mainRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main
      ref={mainRef}
      style={{
        position: "relative",
        width: "100vw",
        backgroundColor: "#ffffff",
        userSelect: "none",
      }}
    >
      {/* ── Fixed Top-Left Label ── */}
      <p
        className={`${styles.corner} ${styles.cornerTopLeft}`}
        style={{ position: "fixed", zIndex: 120 }}
      >
        andiindra <span className={styles.slash}>//</span> Playground
      </p>

      {/* ── Fixed Top-Right Experiments Dropdown ── */}
      <div style={{ position: "fixed", top: 0, right: 0, zIndex: 120, whiteSpace: "nowrap" }}>
        <ExperimentsDropdown />
      </div>

      {/* ── Inner Pinned Container so GSAP pin-spacer is inside <main> and doesn't break React unmount ── */}
      <div
        ref={pinRef}
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {SECTIONS.map((sec, i) => (
          <div
            key={sec.id}
            ref={(el) => { sectionRefs.current[i] = el; }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100vw",
              height: "100vh",
              overflow: "hidden",
              zIndex: SECTIONS.length - i,
              willChange: "transform",
            }}
          >
            {/* ── Left Half Split Panel (Left 50% width, moves UP on scroll) ── */}
            <div
              ref={(el) => { leftHalfRefs.current[i] = el; }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "50vw",
                height: "100vh",
                overflow: "hidden",
                willChange: "transform",
              }}
            >
              {/* Inner Background matching full 100vw */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  ...sec.bgStyle,
                }}
              />
              {/* Inner Typography matching full 100vw */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  padding: "0 20px",
                }}
              >
                <h1 className={styles.heroTitle}>
                  <span
                    className={styles.heroTitleMain}
                    style={{
                      color: sec.textColor,
                      mixBlendMode: "normal",
                      fontSize: "clamp(3.5rem, 11vw, 7rem)",
                      textShadow: sec.textShadow || "none",
                    }}
                  >
                    {sec.title}
                  </span>
                </h1>
                <p
                  style={{
                    marginTop: "clamp(20px, 3vw, 36px)",
                    fontSize: "clamp(0.7rem, 1.2vw, 0.85rem)",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: sec.textColor,
                    opacity: 0.8,
                    textShadow: sec.textShadow || "none",
                  }}
                >
                  {sec.subtitle}
                </p>
              </div>
            </div>

            {/* ── Right Half Split Panel (Right 50% width, moves DOWN on scroll) ── */}
            <div
              ref={(el) => { rightHalfRefs.current[i] = el; }}
              style={{
                position: "absolute",
                top: 0,
                left: "50vw",
                width: "50vw",
                height: "100vh",
                overflow: "hidden",
                willChange: "transform",
              }}
            >
              {/* Inner Background matching full 100vw, offset by -50vw so seam aligns 100% */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "-50vw",
                  width: "100vw",
                  height: "100vh",
                  ...sec.bgStyle,
                }}
              />
              {/* Inner Typography matching full 100vw, offset by -50vw so title aligns 100% */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "-50vw",
                  width: "100vw",
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  padding: "0 20px",
                }}
              >
                <h1 className={styles.heroTitle}>
                  <span
                    className={styles.heroTitleMain}
                    style={{
                      color: sec.textColor,
                      mixBlendMode: "normal",
                      fontSize: "clamp(3.5rem, 11vw, 7rem)",
                      textShadow: sec.textShadow || "none",
                    }}
                  >
                    {sec.title}
                  </span>
                </h1>
                <p
                  style={{
                    marginTop: "clamp(20px, 3vw, 36px)",
                    fontSize: "clamp(0.7rem, 1.2vw, 0.85rem)",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: sec.textColor,
                    opacity: 0.8,
                    textShadow: sec.textShadow || "none",
                  }}
                >
                  {sec.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Fixed Bottom-Left Links ── */}
      <p
        className={`${styles.corner} ${styles.cornerBottomLeft}`}
        style={{ position: "fixed", zIndex: 120 }}
      >
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
    </main>
  );
}
