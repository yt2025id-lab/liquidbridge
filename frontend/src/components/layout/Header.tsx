"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Zap, BarChart3, TrendingUp, Wallet } from "lucide-react";

const navLinks = [
  { href: "/",          label: "TRADE",     icon: <Zap       size={18} strokeWidth={1.75} /> },
  { href: "/pool",      label: "MARKETS",   icon: <BarChart3  size={18} strokeWidth={1.75} /> },
  { href: "/liquidity", label: "EARN",      icon: <TrendingUp size={18} strokeWidth={1.75} /> },
  { href: "/portfolio", label: "MY ASSETS", icon: <Wallet     size={18} strokeWidth={1.75} /> },
];

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0D1117" />
        <path d="M6 22 Q16 10 26 22" stroke="#00A3FF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M6 22 Q16 14 26 22" stroke="rgba(0,163,255,0.3)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="6" cy="22" r="2" fill="#00A3FF" />
        <circle cx="26" cy="22" r="2" fill="#00A3FF" />
        <circle cx="16" cy="11" r="1.5" fill="#00CC88" />
      </svg>
      <span
        className="hidden sm:block"
        style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: "2px", lineHeight: 1, color: "var(--text-primary)", textTransform: "uppercase" }}
      >
        Liquid<span style={{ color: "var(--accent-blue)" }}>Bridge</span>
      </span>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Restore saved theme on mount
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
    setIsDark(saved === "dark");

    // Scroll detection
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Watch for theme attribute changes (from toggle)
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  // colors handled by CSS .nav-link / .nav-active classes

  return (
    <header className={`navbar${scrolled ? " scrolled" : ""}`}>
      {/* 3-column grid: logo left | nav center | actions right */}
      <div
        className="w-full h-full hidden md:grid"
        style={{
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        {/* LEFT — Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Logo />
          </Link>
        </div>

        {/* CENTER — Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${isActive ? " nav-active" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  padding: "8px 16px",
                  borderRadius: 8,
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.6, display: "flex", flexShrink: 0 }}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT — Network + Toggle + Wallet */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--text-primary)",
              background: "rgba(0,204,136,0.08)",
              border: "1px solid rgba(0,204,136,0.20)",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#00CC88",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            Base Sepolia
          </span>

          {/* Wallet — RainbowKit, untouched */}
          <ConnectButton showBalance={false} chainStatus="none" accountStatus="address" />

          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid var(--border-strong)",
              background: "var(--bg-input)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isDark ? "#F0B429" : "#5A6478",
              flexShrink: 0,
              transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface-2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-input)"; }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      {/* Mobile: simple flex row (logo left, wallet right) */}
      <div
        className="md:hidden w-full h-full flex items-center justify-between"
        style={{ padding: "0 16px" }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo />
        </Link>
        <ConnectButton showBalance={false} chainStatus="none" accountStatus="address" />
      </div>

    </header>
  );
}
