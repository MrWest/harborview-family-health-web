import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harborview Family Health Centre",
  description: "A fictional clinic administration proof environment.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
