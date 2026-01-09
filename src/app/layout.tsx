import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";

export const metadata: Metadata = {
  title: "ThriftFinder - Fashion Resale Discovery Platform",
  description: "Find the best deals on secondhand fashion across Depop, Poshmark, eBay, and more. Compare prices, discover trending styles, and shop sustainably.",
  keywords: ["secondhand fashion", "resale", "thrift", "vintage", "sustainable fashion", "Depop", "Poshmark", "eBay"],
  openGraph: {
    title: "ThriftFinder - Fashion Resale Discovery Platform",
    description: "Find the best deals on secondhand fashion across multiple platforms",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white">
        <Navigation />
        <main className="min-h-screen pb-16 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
