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
    <div className="min-h-screen bg-[#E9E9E7] text-[#4A4A4F] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-3 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F1F1EF] text-[#2F6FE0] border border-[#D4D4D1] shadow-raise-1 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#1D1D1F]">Create Citizen Profile</h2>
          <p className="text-xs text-[#8A8A90]">
            Register your household for early-warning sirens and priority evacuation
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="text-[#4A4A4F] font-semibold block mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A90]" />
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Chandra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-full pl-10 pr-4 py-2.5 text-[#1D1D1F] shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2 placeholder-[#8A8A90]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#4A4A4F] font-semibold block mb-1">
              Mobile Phone (For Emergency CAP SMS)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A90]" />
              <input
                type="tel"
                required
                placeholder="+91 98000 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-full pl-10 pr-4 py-2.5 text-[#1D1D1F] font-mono shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2 placeholder-[#8A8A90]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#4A4A4F] font-semibold block mb-1">
              Residential Coastal Block / Ward
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A90]" />
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-full pl-10 pr-4 py-2.5 text-[#1D1D1F] shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-[#8E8E93] hover:bg-[#9C9CA1] active:bg-[#E9E9E7] active:shadow-sink-1 text-[#1D1D1F] font-bold text-xs rounded-full shadow-raise-2 transition-all mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Create Profile & Enroll <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </form>

        <div className="text-center text-xs text-[#8A8A90]">
          <span>Already registered? </span>
          <Link href="/login" className="text-[#2F6FE0] hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
