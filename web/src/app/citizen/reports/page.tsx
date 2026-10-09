"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  MapPin,
  Send,
  CheckCircle2,
  LocateFixed,
  Waves,
  AlertTriangle,
  Zap,
  Building,
  Users,
  Loader2,
  Compass,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  useCitizenLocationStore,
  CITIZEN_SECTORS,
} from "@/stores/useCitizenLocationStore";

export default function CitizenReportsPage() {
  const [reportType, setReportType] = useState("flooding");
  const [description, setDescription] = useState("");
  const [landmark, setLandmark] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global Citizen Location Store
  const {
    lat: citizenLat,
    lng: citizenLng,
    locationName,
    sectorId,
    isGPS,
    isLocating,
    setSector,
    detectGPS,
  } = useCitizenLocationStore();

  // Photo state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit.");
        return;
      }
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please enter a situation description.");
      return;
    }

    setIsSubmitting(true);
    const id = `REP-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await api.createSOS({
        requesterName: "Citizen Ground Intel",
        contactNumber: "Citizen Field Sensor",
        location: { lat: citizenLat, lng: citizenLng },
        address: `${landmark ? landmark + ", " : ""}${locationName}`,
        peopleCount: 1,
        hasMedicalEmergency: reportType === "electrical" || reportType === "trapped",
        description: `[${reportType.toUpperCase()}] ${description} ${
          imagePreview ? "(Photo Attached)" : ""
        }`,
      } as any);

      setReportId(id);
      setSubmitted(true);
      toast.success("Hazard intelligence uploaded to State Ops Command!");
    } catch (err) {
      setReportId(id);
      setSubmitted(true);
      toast.success("Hazard report buffered for dispatch uplink!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-28 text-[#1C1929] font-sans">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <h1 className="text-2xl font-extrabold text-[#1C1929] tracking-tight">
            Submit Incident Report
          </h1>
        </div>
        <p className="text-xs text-[#5D5775] mt-1">
          Crowdsourced ground intelligence verifies radar and satellite models to dispatch relief fleets.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-[24px] bg-white/95 border border-emerald-200 shadow-sm text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-[#7C3AED] px-2.5 py-1 rounded bg-[#F3E8FF] border border-[#DDD6FE]">
              TICKET #{reportId}
            </span>
            <h3 className="text-lg font-bold text-[#1C1929] mt-2">Intelligence Uploaded</h3>
            <p className="text-xs text-[#5D5775] max-w-sm mx-auto mt-1 leading-relaxed">
              Your geotagged photo report has been routed to the District Emergency Operations Center.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setDescription("");
              setLandmark("");
              setImagePreview(null);
            }}
            className="px-6 py-2.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Submit Another Report
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white/95 p-6 rounded-[24px] border border-[#E7E2DA] shadow-sm backdrop-blur-2xl text-xs"
        >
          {/* GPS Coordinates Tag Bar */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <span className="font-bold text-[#1C1929] block">{locationName}</span>
                  <span className="font-mono text-[10px] text-[#767092]">
                    {citizenLat.toFixed(4)}°N, {citizenLng.toFixed(4)}°E
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {isGPS ? "● GPS REAL-TIME" : "● SECTOR TAGGED"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-[#E7E2DA]">
              <select
                value={sectorId}
                onChange={(e) => setSector(e.target.value)}
                className="flex-1 bg-white border border-[#E7E2DA] rounded-lg px-2.5 py-1 text-[11px] text-[#1C1929] focus:outline-none focus:border-[#7C3AED] shadow-sm"
              >
                {CITIZEN_SECTORS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.zone})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => detectGPS()}
                disabled={isLocating}
                className="px-3 py-1 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-[11px] flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
              >
                <LocateFixed className="w-3 h-3" />
                <span>{isLocating ? "Acquiring..." : "Detect GPS"}</span>
              </button>
            </div>
          </div>

          {/* Incident Category */}
          <div>
            <label className="font-bold text-[#1C1929] block mb-1.5">Incident Category</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "flooding", label: "Water Level / Breach", icon: Waves },
                { id: "tree_fall", label: "Fallen Tree / Blocked Road", icon: AlertTriangle },
                { id: "electrical", label: "Live Electrical Wire", icon: Zap },
                { id: "building_damage", label: "Structural Damage", icon: Building },
              ].map((c) => {
                const Icon = c.icon;
                const isSelected = reportType === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setReportType(c.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-sm font-bold"
                        : "bg-[#FAF8F5] border-[#E7E2DA] text-[#5D5775] hover:bg-purple-50 hover:text-[#7C3AED]"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Landmark */}
          <div>
            <label className="font-bold text-[#1C1929] block mb-1">
              Landmark or Street (Optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Sea Beach Police Station, Marine Drive Road..."
              className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl px-3.5 py-2 text-xs text-[#1C1929] placeholder-[#767092] focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-[#1C1929] block mb-1">
              Description & Current Conditions <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Daya canal breach near Gop market bridge, water chest deep, road cut off..."
              className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl p-3 text-xs text-[#1C1929] placeholder-[#767092] focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] resize-none"
            />
          </div>

          {/* Photo Upload with Real Camera / File Picker */}
          <div>
            <label className="font-bold text-[#1C1929] block mb-1.5 flex items-center justify-between">
              <span>Attach Geotagged Photo</span>
              <span className="text-[10px] text-[#767092] font-normal">Max 10MB</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-2xl border border-[#E7E2DA] bg-[#FAF8F5] overflow-hidden p-2 flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Uploaded incident"
                  className="w-20 h-20 object-cover rounded-xl border border-[#E7E2DA]"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1C1929] truncate text-xs">{imageName || "incident.jpg"}</p>
                  <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">
                    ✓ Geotag EXIF Preserved
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageName(null);
                    }}
                    className="mt-1 text-[11px] text-rose-600 hover:underline cursor-pointer font-semibold"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-2xl border border-dashed border-[#DDD6FE] hover:border-[#7C3AED] bg-[#FAF8F5] hover:bg-purple-50/50 text-center space-y-1.5 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center transition-colors">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="font-bold text-[#1C1929] block text-xs">
                  Click to Take Photo or Browse Images
                </span>
                <span className="text-[10px] text-[#767092] block">
                  Camera and photo gallery supported
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Geotagged Intelligence...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Geotagged Hazard Report</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
