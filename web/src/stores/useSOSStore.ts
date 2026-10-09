import { create } from "zustand";
import { SOSRequest, SeverityLevel } from "@/types";
import { api } from "@/lib/api";

const INITIAL_SOS_REQUESTS: SOSRequest[] = [
  {
    id: "sos-01",
    requesterName: "Pravat Nayak",
    phone: "+91 94370 12345",
    location: { lat: 19.805, lng: 85.819 },
    address: "Pentakota Fishermen Colony, Ward 12, Puri",
    type: "rescue",
    urgency: "critical",
    status: "in_progress",
    peopleCount: 6,
    specialNeeds: ["Elderly (1)", "Infant (1)"],
    description: "Thatch house roof blown away, seawater entered ground floor up to waist level. Trapped on RCC water tank platform.",
    createdAt: "2026-10-09T03:15:00Z",
    assignedTeam: "NDRF Bravo-3",
    estimatedReachMinutes: 12,
  },
  {
    id: "sos-02",
    requesterName: "Dr. Sasmita Mishra",
    phone: "+91 98610 98765",
    location: { lat: 19.799, lng: 85.702 },
    address: "CHC Hospital Quarter, Brahmagiri",
    type: "medical_emergency",
    urgency: "critical",
    status: "received",
    peopleCount: 3,
    specialNeeds: ["Oxygen Support", "Pregnant woman in labor"],
    description: "Generator submerged; 2 critical ICU patients on manual Ambu bags. Immediate evacuation to DHH Puri needed.",
    createdAt: "2026-10-09T03:42:00Z",
    assignedTeam: null,
    estimatedReachMinutes: null,
  },
  {
    id: "sos-03",
    requesterName: "Ramesh Jena",
    phone: "+91 97780 45678",
    location: { lat: 19.889, lng: 86.094 },
    address: "Chandrabhaga Beach Basti, Konark",
    type: "rescue",
    urgency: "critical",
    status: "assigned",
    peopleCount: 14,
    specialNeeds: ["Children (5)"],
    description: "Tidal surge broke earthen bund; 3 kutcha houses collapsed. Community hall surrounded by 1.2m turbulent water.",
    createdAt: "2026-10-09T04:05:00Z",
    assignedTeam: "ODRAF Team 07",
    estimatedReachMinutes: 20,
  },
  {
    id: "sos-04",
    requesterName: "Basanti Dei",
    phone: "+91 94380 23456",
    location: { lat: 19.825, lng: 85.845 },
    address: "Galisahi, Near Jagannath Temple, Puri",
    type: "food",
    urgency: "high",
    status: "received",
    peopleCount: 9,
    specialNeeds: ["Infant (1)", "Diabetic medication"],
    description: "Waterlogged street; dry food rations exhausted since yesterday. Need baby milk and drinking water pouches.",
    createdAt: "2026-10-09T04:20:00Z",
    assignedTeam: null,
    estimatedReachMinutes: null,
  },
];

interface SOSState {
  requests: SOSRequest[];
  filterUrgency: SeverityLevel | "all";
  filterStatus: SOSRequest["status"] | "all";
  selectedRequest: SOSRequest | null;
  searchQuery: string;
  isLoading: boolean;
  fetchSOSRequests: () => Promise<void>;
  addSOS: (req: SOSRequest) => Promise<void>;
  updateStatus: (id: string, status: SOSRequest["status"], team?: string) => Promise<void>;
  setFilterUrgency: (urgency: SeverityLevel | "all") => void;
  setFilterStatus: (status: SOSRequest["status"] | "all") => void;
  setSearchQuery: (query: string) => void;
  setSelectedRequest: (req: SOSRequest | null) => void;
}

export const useSOSStore = create<SOSState>((set, get) => ({
  requests: INITIAL_SOS_REQUESTS,
  filterUrgency: "all",
  filterStatus: "all",
  selectedRequest: null,
  searchQuery: "",
  isLoading: false,

  fetchSOSRequests: async () => {
    set({ isLoading: true });
    try {
      const data = await api.getSOSRequests();
      if (data && data.length > 0) {
        set({ requests: data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addSOS: async (req) => {
    set((state) => ({
      requests: [req, ...state.requests],
    }));
    try {
      await api.submitSOS(req);
    } catch {
      // already added optimistically
    }
  },

  updateStatus: async (id, status, team) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              ...(team ? { assignedTeam: team } : {}),
            }
          : r
      ),
      selectedRequest:
        state.selectedRequest?.id === id
          ? {
              ...state.selectedRequest,
              status,
              ...(team ? { assignedTeam: team } : {}),
            }
          : state.selectedRequest,
    }));
    try {
      await api.updateSOSStatus(id, status, team);
    } catch {
      // optimistic update maintained
    }
  },

  setFilterUrgency: (filterUrgency) => set({ filterUrgency }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedRequest: (selectedRequest) => set({ selectedRequest }),
}));
