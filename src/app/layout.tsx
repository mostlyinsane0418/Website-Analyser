import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GEO Check - Generative Engine Optimization Analyzer",
  description: "Analyze your website's compatibility with AI-powered search engines. Check if your FAQs match the follow-up questions LLMs ask about your business.",
  keywords: ["GEO", "generative engine optimization", "AI SEO", "LLM optimization", "FAQ optimization"],
  authors: [{ name: "GEO Check" }],
  openGraph: {
    title: "GEO Check - Is Your Website AI-Ready?",
    description: "Analyze your website's compatibility with AI-powered search engines like Google AI Overview and ChatGPT.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
