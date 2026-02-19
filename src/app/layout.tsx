import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Artificial Intelligencer",
  description: "AI-Powered Editorial Content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
