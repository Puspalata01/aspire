"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, User, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("Puri, Odisha");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Account registered successfully! Welcome to ASPIRE Citizen Safety.");
    router.push("/citizen/home");
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C1929] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md p-8 rounded-[24px] border border-[#E7E2DA] bg-white/95 shadow-xl space-y-6 backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] shadow-sm flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#1C1929] tracking-tight">Create Citizen Profile</h2>
          <p className="text-xs text-[#5D5775]">
            Register your household for early-warning sirens and priority evacuation
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="text-[#5D5775] font-semibold block mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767092]" />
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Chandra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-full pl-10 pr-4 py-2.5 text-[#1C1929] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] placeholder-[#767092]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#5D5775] font-semibold block mb-1">
              Mobile Phone (For Emergency CAP SMS)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767092]" />
              <input
                type="tel"
                required
                placeholder="+91 98000 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-full pl-10 pr-4 py-2.5 text-[#1C1929] font-mono focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] placeholder-[#767092]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#5D5775] font-semibold block mb-1">
              Residential Coastal Block / Ward
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767092]" />
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-full pl-10 pr-4 py-2.5 text-[#1C1929] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-full shadow-sm transition-all mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Create Profile & Enroll <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </form>

        <div className="text-center text-xs text-[#767092]">
          <span>Already registered? </span>
          <Link href="/login" className="text-[#7C3AED] hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
