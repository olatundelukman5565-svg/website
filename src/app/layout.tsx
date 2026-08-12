import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Neo Vision Team — Architecture & 3D Visualization Studio",
    template: "%s — Neo Vision Team",
  },
  description:
    "Neo Vision Team is a digital architecture and 3D visualization studio specializing in 2D architectural drawings, 3D architectural visualization, character modeling, environment design, and props & object modeling.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-white font-sans text-stone-900 antialiased">{children}</body>
    </html>
  );
}
