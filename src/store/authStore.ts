import { create } from "zustand";

interface User {
  id: string;
  username: string;
  role: "ADMIN" | "STAFF" | "CLIENT";
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
    set({ user: null });
  },

  checkSession: async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (data.success && data.user) {
        set({ user: data.user });
      } else {
        set({ user: null });
      }
    } catch (err) {
      console.error("Error al verificar la sesión:", err);
      set({ user: null });
    }
  },
}));
