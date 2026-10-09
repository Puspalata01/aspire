import { create } from "zustand";
import { SOSRequest, SeverityLevel } from "@/types";
import { MOCK_SOS_REQUESTS } from "@/lib/mock-data";

interface SOSState {
  requests: SOSRequest[];
  filterUrgency: SeverityLevel | "all";
  filterStatus: SOSRequest["status"] | "all";
  selectedRequest: SOSRequest | null;
  searchQuery: string;
  addSOS: (req: SOSRequest) => void;
  updateStatus: (id: string, status: SOSRequest["status"], team?: string) => void;
  setFilterUrgency: (urgency: SeverityLevel | "all") => void;
  setFilterStatus: (status: SOSRequest["status"] | "all") => void;
  setSearchQuery: (query: string) => void;
  setSelectedRequest: (req: SOSRequest | null) => void;
}

export const useSOSStore = create<SOSState>((set) => ({
  requests: MOCK_SOS_REQUESTS,
  filterUrgency: "all",
  filterStatus: "all",
  selectedRequest: null,
  searchQuery: "",

  addSOS: (req) =>
    set((state) => ({
      requests: [req, ...state.requests],
    })),

  updateStatus: (id, status, team) =>
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
    })),

  setFilterUrgency: (filterUrgency) => set({ filterUrgency }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedRequest: (selectedRequest) => set({ selectedRequest }),
}));
