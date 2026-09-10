import { create } from "zustand";
import { persist } from "zustand/middleware";
import { newVehicle } from "./game/vehicle";
export type Phase =
  "MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "FINISHED" | "GAME_OVER";
type Settings = {
  theme: "light" | "dark";
  sound: boolean;
  music: boolean;
  effects: boolean;
  quality: "low" | "medium" | "high";
  color: string;
  best: number;
  set: (v: Partial<Omit<Settings, "set" | "reset">>) => void;
  reset: () => void;
};
const defaults = {
  theme: "light" as const,
  sound: true,
  music: false,
  effects: true,
  quality: "high" as const,
  color: "#e84836",
  best: 0,
};
export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      ...defaults,
      set,
      reset: () => set((s) => ({ ...defaults, best: s.best })),
    }),
    { name: "toowix-settings-v1" },
  ),
);
export const runtime = newVehicle();
export const useGame = create<{
  phase: Phase;
  run: number;
  debug: boolean;
  setPhase: (p: Phase) => void;
  restart: () => void;
  toggleDebug: () => void;
}>((set) => ({
  phase: "MENU",
  run: 0,
  debug: false,
  setPhase: (phase) => set({ phase }),
  restart: () => {
    Object.assign(runtime, newVehicle());
    set((s) => ({ phase: "COUNTDOWN", run: s.run + 1 }));
  },
  toggleDebug: () => set((s) => ({ debug: !s.debug })),
}));
export const useTelemetry = create(() => ({ ...newVehicle(), fps: 60 }));
