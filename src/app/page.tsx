import Hero from "./Hero";
import VideoSection from "./VideoSection";

export default function Home() {
  return (
    <main
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        isolation: "isolate", // contains blend-mode computation to this viewport
      }}
    >
      {/* Video rendered first → becomes the backdrop for the liquid reveal */}
      <VideoSection />
      {/* Hero sits on top in DOM order — no z-index, so no stacking context */}
      <Hero />
    </main>
  );
}
