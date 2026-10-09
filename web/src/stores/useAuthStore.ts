import { create } from "zustand";
import { UserRole } from "@/types";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badge?: string;
  department?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  toggleDemoRole: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: "usr-comm-01",
    name: "Commander A. K. Patnaik, IAS",
    email: "commander.patnaik@odisha.gov.in",
    role: "authority",
    badge: "State Relief Commissioner",
    department: "OSDMA & NDMA Unified Command",
  },
  role: "authority",
  isAuthenticated: true,

  setRole: (role) =>
    set((state) => ({
      role,
      user: state.user
        ? {
            ...state.user,
            role,
            badge: role === "authority" ? "State Relief Commissioner" : "Citizen / Resident",
            department: role === "authority" ? "OSDMA Unified Command" : "Puri Coastal Ward 4",
          }
        : null,
    })),

  setUser: (user) => set({ user, isAuthenticated: !!user, role: user?.role || "citizen" }),

  logout: () => set({ user: null, isAuthenticated: false, role: "citizen" }),

  toggleDemoRole: () =>
    set((state) => {
      const nextRole: UserRole = state.role === "authority" ? "citizen" : "authority";
      return {
        role: nextRole,
        user: state.user
          ? {
              ...state.user,
              name: nextRole === "authority" ? "Commander A. K. Patnaik, IAS" : "Balaram Sahoo",
              role: nextRole,
              badge: nextRole === "authority" ? "State Relief Commissioner" : "Resident",
              department: nextRole === "authority" ? "OSDMA Unified Command" : "Puri Ward 4",
            }
          : null,
      };
    }),
}));
