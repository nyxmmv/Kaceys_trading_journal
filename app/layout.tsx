import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kacey’s Trading Journal",
  description: "Trade ideas, chart screenshots, and lessons in one private journal.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
