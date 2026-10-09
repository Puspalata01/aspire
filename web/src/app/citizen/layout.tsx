import React from "react";
import { CitizenHeader } from "@/components/layout/CitizenHeader";
import { CitizenNav } from "@/components/layout/CitizenNav";
import { LiveAlertBanner } from "@/components/shared/LiveAlertBanner";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#E9E9E7] text-[#4A4A4F] flex flex-col font-sans">
      <CitizenHeader />
      <LiveAlertBanner />
      <CitizenNav />
      <main className="flex-1 p-4 md:p-6 max-w-5xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
