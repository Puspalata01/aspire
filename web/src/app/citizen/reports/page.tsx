"use client";

import React, { useState } from "react";
import { Camera, MapPin, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CitizenReportsPage() {
  const [reportType, setReportType] = useState("flooding");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Crowd report submitted! Geotagged to disaster AI verification engine.");
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F]">Submit Incident Report</h1>
        <p className="text-xs text-[#8A8A90] mt-1">
          Crowdsourced ground intelligence verifies sensor data and helps authorities dispatch aid.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-[24px] bg-[#F1F1EF] border border-[#D4D4D1] shadow-raise-2 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-[#2E9E6B] mx-auto" />
          <h3 className="text-lg font-bold text-[#1D1D1F]">Report Logged</h3>
          <p className="text-xs text-[#4A4A4F]">
            Thank you for contributing verified intelligence to the ASPIRE crisis network.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setDescription("");
            }}
            variant="soft"
            className="text-xs"
          >
            Submit Another Report
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-[#F1F1EF] p-6 rounded-[24px] border border-[#D4D4D1] shadow-raise-2">
          <div>
            <label className="text-xs font-semibold text-[#4A4A4F] block mb-1.5">
              Incident Category
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-full p-2.5 px-4 text-xs text-[#1D1D1F] shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2"
            >
              <option value="flooding">Water Level Rising / River Breach</option>
              <option value="tree_fall">Road Blockage / Fallen Tree / Pole</option>
              <option value="electrical">Live Fallen Electrical Cable Hazard</option>
              <option value="building_damage">Structural Wall Collapse</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#4A4A4F] block mb-1.5">
              Description & Landmarks
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Daya canal breach near Gop market bridge, water chest deep..."
              className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-[16px] p-3 text-xs text-[#1D1D1F] shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2 resize-none"
            />
          </div>

          <div className="p-4 rounded-[16px] border border-dashed border-[#D4D4D1] bg-[#E2E2E0] shadow-sink-1 text-center space-y-1">
            <Camera className="w-6 h-6 text-[#8A8A90] mx-auto" />
            <span className="text-xs text-[#1D1D1F] font-semibold block">Attach Geotagged Photo</span>
            <span className="text-[10px] text-[#8A8A90]">EXIF GPS will be preserved</span>
          </div>

          <button
            type="submit"
            className="w-full bg-[#8E8E93] hover:bg-[#9C9CA1] active:bg-[#E9E9E7] active:shadow-sink-1 text-[#1D1D1F] font-bold text-xs h-11 rounded-full shadow-raise-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Submit Intelligence
          </button>
        </form>
      )}
    </div>
  );
}
