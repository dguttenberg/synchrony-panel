import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synchrony Elevation Brief — Audience Panel",
  description:
    "Interactive audience simulation panel for evaluating Synchrony's Elevation Brief concepts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
