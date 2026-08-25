import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HarborviewProofGuide } from "@/components/onboarding/HarborviewProofGuide";
import "./globals.css";

// Design: preserve Harborview's calm clinic-paper system while mounting one globally consistent, browser-only testing guide across every lane.

export const metadata: Metadata = {
  title: "Harborview Family Health Centre",
  description: "A fictional clinic administration proof environment.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <HarborviewProofGuide />
      </body>
    </html>
  );
}
