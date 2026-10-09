"use client";

import React from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import { RiskMatrixView } from "@/components/risk/RiskMatrixView";

export default function AuthorityRiskPage() {
  return (
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] flex flex-col select-none">
      <AuthorityHeader pageTitle="AI Risk Engine" />

      <div className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
        <RiskMatrixView />
      </div>
    </div>
  );
}
