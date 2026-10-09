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
        className="h-full bg-[#E9E9E7] text-[#4A4A4F] antialiased selection:bg-[#DCE7FB] selection:text-[#1D1D1F]"
        suppressHydrationWarning
      >
        {children}
        <Toaster
          position="top-right"
          theme="light"
          toastOptions={{
            style: {
              background: "#F1F1EF",
              boxShadow: "10px 10px 22px rgba(150,150,146,0.55), -10px -10px 22px rgba(255,255,255,0.95)",
              border: "1px solid #D4D4D1",
              borderRadius: "24px",
              color: "#1D1D1F",
              padding: "16px 20px",
            },
          }}
        />
      </body>
    </html>
  );
}
