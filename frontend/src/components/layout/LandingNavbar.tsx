"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function LandingNavbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
    setIsDark(saved === "dark");

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <nav style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 200,
      height: 64,
      padding: "0 48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "transparent",
      borderBottom: "none",
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <Image src="/LogoLiquidBridgeTransparan.png" width={44} height={44} alt="LiquidBridge" />
        <span style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 18, fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "1px",
          textTransform: "uppercase",
          transition: "color 0.3s ease",
        }}>
          Liquid<span style={{ color: "#00A3FF" }}>Bridge</span>
        </span>
      </Link>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "1px solid var(--border-strong)",
            background: "var(--bg-input)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: isDark ? "#F0B429" : "#5A6478",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface-2)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-input)"; }}
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <Link
          href="/trade"
          style={{
            fontSize: 13, fontWeight: 700,
            color: "white",
            textDecoration: "none",
            padding: "8px 20px",
            borderRadius: 9999,
            background: "#00A3FF",
            boxShadow: "0 2px 12px rgba(0,163,255,0.25)",
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "'Manrope', sans-serif",
            transition: "opacity 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "0.9";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          Launch App
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </nav>
  );
}
