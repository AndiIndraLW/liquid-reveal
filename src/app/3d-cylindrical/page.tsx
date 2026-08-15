import styles from '../hero.module.css';
import cylStyles from './cylindrical-gallery.module.css';
import ExperimentsDropdown from '../ExperimentsDropdown';
import CylindricalGallery from './CylindricalGallery';

export const metadata = {
  title: '3D Cylindrical — andiindra Playground',
  description:
    'A 3D cylindrical project gallery with smooth CSS perspective transforms and spring physics.',
};

export default function Cylindrical3DPage() {
  return (
    <main
      style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        color: '#000000',
      }}
    >
      {/* ── Top-left label ── */}
      <p
        className={`${styles.corner} ${styles.cornerTopLeft}`}
        style={{ color: '#000000', mixBlendMode: 'normal', zIndex: 300 }}
      >
        andiindra{' '}
        <span
          className={styles.slash}
          style={{ color: '#000000', mixBlendMode: 'normal' }}
        >
          //
        </span>{' '}
        Playground
      </p>

      {/* ── Top-right dropdown ── */}
      <ExperimentsDropdown />

      {/* ── Swipe hint & title — centered in header row ── */}
      <div className={cylStyles.headerGroup}>
        <p
          aria-hidden="true"
          style={{
            margin: 0,
            fontSize: 'clamp(0.6rem, 1.1vw, 0.75rem)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#000000',
            lineHeight: 1.5,
            opacity: 0.7,
          }}
        >
          ← swipe to explore →
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(1.4rem, 3.2vw, 2.6rem)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: '#000000',
            lineHeight: 1.1,
          }}
        >
          3D Cylindrical
        </h1>
      </div>



      {/* ── 3D Cylindrical Gallery fills the whole page ── */}
      <CylindricalGallery />

      {/* ── Bottom-left label ── */}
      <p
        className={`${styles.corner} ${styles.cornerBottomLeft}`}
        style={{ color: '#000000', mixBlendMode: 'normal', zIndex: 300 }}
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
        <span
          className={styles.slash}
          style={{ color: '#000000', mixBlendMode: 'normal' }}
        >
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
    </main>
  );
}
