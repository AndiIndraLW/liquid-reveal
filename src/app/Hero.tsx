import styles from "./hero.module.css";
import LiquidEffect from "./LiquidEffect";

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Liquid Reveal hero">

      <LiquidEffect />

      {/* ── Top-left label ── */}
      <p className={`${styles.corner} ${styles.cornerTopLeft}`}>
        andiindra <span className={styles.slash}>//</span> Playground
      </p>

      {/* ── Top-right label ── */}
      <p className={`${styles.corner} ${styles.cornerTopRight}`}>
        my other experiments
      </p>

      {/* ── Centre title ── */}
      <h1 className={styles.heroTitle}>
        <span className={styles.heroTitleMain}>Liquid Reveal</span>
      </h1>

      {/* ── Bottom-left label ── */}
      <p className={`${styles.corner} ${styles.cornerBottomLeft}`}>
        instagram <span className={styles.slash}>/</span> portfolio
      </p>

    </section>
  );
}
