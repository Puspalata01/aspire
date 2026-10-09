"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useAuthStore();
  const [email, setEmail] = useState("commander.patnaik@odisha.gov.in");
  const [role, setUserRole] = useState<"authority" | "citizen">("authority");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(role);
    toast.success(`Authenticated as ${role === "authority" ? "Disaster Response Commander" : "Citizen / Resident"}`);
    if (role === "authority") {
      router.push("/authority/dashboard");
    } else {
      router.push("/citizen/home");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C1929] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md p-8 rounded-[24px] border border-[#E7E2DA] bg-white/95 shadow-xl space-y-6 backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] shadow-sm flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#1C1929] tracking-tight">Sign In to ASPIRE</h2>
          <p className="text-xs text-[#5D5775]">
            Unified authentication for Incident Commanders & Citizens
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-[#5D5775] font-semibold block mb-1.5">
              Portal Access Role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setUserRole("authority")}
                className={`py-2 px-3 rounded-full font-bold transition-all text-xs cursor-pointer ${
                  role === "authority"
                    ? "bg-[#7C3AED] text-white shadow-sm border border-[#7C3AED]"
                    : "bg-[#FAF8F5] text-[#5D5775] border border-[#E7E2DA] hover:text-[#1C1929]"
                }`}
              >
                Authority HQ
              </button>
              <button
                type="button"
                onClick={() => setUserRole("citizen")}
                className={`py-2 px-3 rounded-full font-bold transition-all text-xs cursor-pointer ${
                  role === "citizen"
                    ? "bg-[#7C3AED] text-white shadow-sm border border-[#7C3AED]"
                    : "bg-[#FAF8F5] text-[#5D5775] border border-[#E7E2DA] hover:text-[#1C1929]"
                }`}
              >
                Citizen Portal
              </button>
            </div>
          </div>

          <div>
            <label className="text-[#5D5775] font-semibold block mb-1">
              Email Address / Mobile Number
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767092]" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-full pl-10 pr-4 py-2.5 text-[#1C1929] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#5D5775] font-semibold block mb-1">
              Password or OTP
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767092]" />
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-full pl-10 pr-4 py-2.5 text-[#1C1929] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-full shadow-sm transition-all mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Authenticate & Proceed <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#767092]">
          <span>Don&apos;t have an account? </span>
          <Link href="/register" className="text-[#7C3AED] hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
