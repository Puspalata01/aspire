import React from "react";
import { CitizenHeader } from "@/components/layout/CitizenHeader";
import { CitizenNav } from "@/components/layout/CitizenNav";
import { LiveAlertBanner } from "@/components/shared/LiveAlertBanner";
import { AuthorityDock } from "@/components/layout/AuthorityDock";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C1929] flex flex-col font-sans selection:bg-[#7C3AED] selection:text-white pb-28">
      <CitizenHeader />
      <LiveAlertBanner />
      <CitizenNav />
      <main className="flex-1 p-4 md:p-6 max-w-5xl w-full mx-auto">
        {children}
      </main>
      <AuthorityDock />
    </div>
  );
}
