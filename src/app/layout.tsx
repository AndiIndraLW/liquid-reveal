import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Liquid Reveal — AndiIndra Playground",
  description: "A visual experiment by AndiIndra. Liquid Reveal is a playground hero showcasing fluid design aesthetics.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={mulish.variable}>
      <body>{children}</body>
    </html>
  );
}
