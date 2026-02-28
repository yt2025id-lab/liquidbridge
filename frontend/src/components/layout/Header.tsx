"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Trade" },
  { href: "/pool", label: "Markets" },
  { href: "/liquidity", label: "Earn" },
  { href: "/portfolio", label: "My Assets" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/LogoLiquidBridgeTransparan.png"
                alt="LiquidBridge"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="text-slate-900 font-bold text-lg hidden sm:block tracking-tight">
                LiquidBridge
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    pathname === link.href
                      ? "bg-teal-50 text-teal-700 font-semibold"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Base Sepolia
            </span>
            <ConnectButton
              showBalance={false}
              chainStatus="none"
              accountStatus="address"
            />
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden border-t border-slate-100 flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex-1 text-center py-2.5 text-xs font-medium transition-colors",
              pathname === link.href
                ? "text-teal-700 border-b-2 border-teal-600"
                : "text-slate-400"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
