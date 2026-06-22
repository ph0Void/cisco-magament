import { create } from "zustand";
import { persist } from "zustand/middleware";

interface stateUIStore {
  theme: "light" | "dark";
  isMenuOpen: boolean;

  openMenu: () => void;
  closeMenu: () => void;
  changeTheme: () => void;
}

export const useUiStore = create<stateUIStore>()(
  persist(
    (set) => ({
      theme: "light",
      isMenuOpen: false,

      openMenu: () => set({ isMenuOpen: true }),
      closeMenu: () => set({ isMenuOpen: false }),
      changeTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
    }),
    {
      name: "ui-storage",
    },
  ),
);
