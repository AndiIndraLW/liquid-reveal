import styles from "../hero.module.css";
import ExperimentsDropdown from "../ExperimentsDropdown";
import ImageTrailEffect from "./ImageTrailEffect";

export default function ImageTrailPage() {
  return (
    <main
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundImage: "url(/assets/bg-image-trail.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#0a0c10",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      <ImageTrailEffect />

      {/* ── Top-left label ── */}
      <p className={`${styles.corner} ${styles.cornerTopLeft}`}>
        andiindra <span className={styles.slash}>//</span> Playground
      </p>

      {/* ── Top-right dropdown menu ── */}
      <ExperimentsDropdown />

      {/* ── Center title ── */}
      <div style={{ textAlign: "center", zIndex: 10, pointerEvents: "none" }}>
        <h1 className={styles.heroTitle}>
          <span
            className={styles.heroTitleMain}
            style={{
              mixBlendMode: "normal",
              color: "#000926",
              WebkitTextFillColor: "initial",
              background: "none",
            }}
          >
            Image Trail
          </span>
        </h1>
        <p
          style={{
            marginTop: "clamp(32px, 5vw, 56px)",
            fontSize: "0.85rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#ffffff",
          }}
        >
          Move cursor around to interact
        </p>
      </div>

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
    </main>
  );
}
