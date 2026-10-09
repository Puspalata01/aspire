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
    <div className="min-h-screen bg-[#E9E9E7] text-[#4A4A4F] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-3 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F1F1EF] text-[#2F6FE0] border border-[#D4D4D1] shadow-raise-1 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#1D1D1F]">Sign In to ASPIRE</h2>
          <p className="text-xs text-[#8A8A90]">
            Unified authentication for Incident Commanders & Citizens
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-[#4A4A4F] font-semibold block mb-1.5">
              Portal Access Role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setUserRole("authority")}
                className={`py-2 px-3 rounded-full font-bold transition-all text-xs ${
                  role === "authority"
                    ? "bg-[#2F6FE0] text-white shadow-raise-2 border border-[#2F6FE0]"
                    : "bg-[#F1F1EF] text-[#4A4A4F] shadow-raise-1 hover:shadow-raise-2 active:shadow-sink-1"
                }`}
              >
                Authority HQ
              </button>
              <button
                type="button"
                onClick={() => setUserRole("citizen")}
                className={`py-2 px-3 rounded-full font-bold transition-all text-xs ${
                  role === "citizen"
                    ? "bg-[#2F6FE0] text-white shadow-raise-2 border border-[#2F6FE0]"
                    : "bg-[#F1F1EF] text-[#4A4A4F] shadow-raise-1 hover:shadow-raise-2 active:shadow-sink-1"
                }`}
              >
                Citizen Portal
              </button>
            </div>
          </div>

          <div>
            <label className="text-[#4A4A4F] font-semibold block mb-1">
              Email Address / Mobile Number
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A90]" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-full pl-10 pr-4 py-2.5 text-[#1D1D1F] shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2"
              />
            </div>
          </div>

          <div>
            <label className="text-[#4A4A4F] font-semibold block mb-1">
              Password or OTP
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A90]" />
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-full pl-10 pr-4 py-2.5 text-[#1D1D1F] shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-[#8E8E93] hover:bg-[#9C9CA1] active:bg-[#E9E9E7] active:shadow-sink-1 text-[#1D1D1F] font-bold text-xs rounded-full shadow-raise-2 transition-all mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Authenticate & Proceed <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#8A8A90]">
          <span>Don&apos;t have an account? </span>
          <Link href="/register" className="text-[#2F6FE0] hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
