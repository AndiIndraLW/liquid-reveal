import styles from "./video-section.module.css";

export default function VideoSection() {
  return (
    <section className={styles.videoSection} aria-label="Liquid Reveal video">
      <video
        src="/assets/video-reveal.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
    </section>
  );
}
