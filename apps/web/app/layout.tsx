import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "GrubCheck",
  description: "Rust skin mannequin previews with biome lighting and Steam pricing."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${monoFont.variable}`}>
        <div className="app-shell">
          <header className="site-header">
            <div>
              <p className="eyebrow">GrubCheck</p>
              <h1>Rust Skin Compositor</h1>
            </div>
            <nav className="site-nav">
              <Link href="/">Workbench</Link>
              <Link href="/internal/status">Status</Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
