import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ASPIRE — AI-Powered Disaster Intelligence & Response Platform",
    template: "%s | ASPIRE",
  },
  description:
    "From Warning to Action. ASPIRE transforms real-time disaster data into actionable intelligence for government authorities and citizens.",
  keywords: [
    "disaster management",
    "AI",
    "GIS",
    "emergency response",
    "flood prediction",
    "cyclone",
    "disaster intelligence",
  ],
  authors: [{ name: "ASPIRE Team" }],
  openGraph: {
    title: "ASPIRE — AI-Powered Disaster Intelligence",
    description: "From Warning to Action.",
    type: "website",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className="h-full bg-[#F8F7F4] text-[#1C1929] antialiased selection:bg-[#7C3AED] selection:text-white"
        suppressHydrationWarning
      >
        {children}
        <Toaster
          position="top-right"
          theme="light"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              boxShadow: "0 10px 30px rgba(124, 58, 237, 0.08), 0 1px 4px rgba(0,0,0,0.05)",
              border: "1px solid rgba(124, 58, 237, 0.15)",
              borderRadius: "16px",
              color: "#1C1929",
              padding: "14px 18px",
            },
          }}
        />
      </body>
    </html>
  );
}
