import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";

export const metadata: Metadata = {
  title: "LiquidBridge — Invest in Tokenized Funds",
  description:
    "Buy and sell BlackRock BUIDL tokens at the real price, instantly. Powered by Chainlink.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen" style={{ color: "var(--text-primary)" }}>
        <Providers>
          <ConditionalNavbar />
          <main className="px-4 page-enter">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
