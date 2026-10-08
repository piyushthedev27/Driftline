import { create } from "zustand";
import { persist } from "zustand/middleware";
import { newVehicle } from "./game/vehicle";
import { setActiveTrack } from "./game/track";
import {
  getMap,
  getVehicle,
  getTheme,
  validRecords,
  recordKey,
  type MapId,
  type VehicleId,
  type ThemeId,
} from "./game/catalog";
export type Phase =
  "MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "FINISHED" | "GAME_OVER";
type Preferences = {
  theme: ThemeId;
  mapId: MapId;
  vehicleId: VehicleId;
  sound: boolean;
  music: boolean;
  effects: boolean;
  quality: "low" | "medium" | "high";
  color: string;
  best: number;
  records: Record<string, number>;
};
type Settings = Preferences & {
  set: (p: Partial<Preferences>) => void;
  reset: () => void;
  saveRecord: (time: number) => void;
};
const defaults: Preferences = {
  theme: "light",
  mapId: "alpine",
  vehicleId: "gt",
  sound: true,
  music: false,
  effects: true,
  quality: "high",
  color: "#e84836",
  best: 0,
  records: {},
};
export function sanitizeSettings(raw: unknown): Preferences {
  const s = (raw && typeof raw === "object" ? raw : {}) as Partial<Preferences>;
  const records = validRecords(s.records);
  if (
    typeof s.best === "number" &&
    Number.isFinite(s.best) &&
    s.best > 0 &&
    !records["alpine:gt"]
  )
    records["alpine:gt"] = s.best;
  return {
    ...defaults,
    theme: getTheme(s.theme || "").id,
    mapId: getMap(s.mapId || "").id,
    vehicleId: getVehicle(s.vehicleId || "").id,
    records,
    best: records["alpine:gt"] || 0,
    sound: typeof s.sound === "boolean" ? s.sound : true,
    music: typeof s.music === "boolean" ? s.music : false,
    effects: typeof s.effects === "boolean" ? s.effects : true,
    quality: ["low", "medium", "high"].includes(s.quality || "")
      ? s.quality!
      : "high",
    color:
      typeof s.color === "string" && /^#[0-9a-f]{6}$/i.test(s.color)
        ? s.color
        : defaults.color,
  };
}
export const useSettings = create<Settings>()(
  persist(
    (set, get) => ({
      ...defaults,
      set: (p) => {
        const patch = { ...p };
        if (useGame.getState().phase !== "MENU") {
          delete patch.mapId;
          delete patch.vehicleId;
        }
        if (patch.mapId) patch.mapId = getMap(patch.mapId).id;
        if (patch.vehicleId) patch.vehicleId = getVehicle(patch.vehicleId).id;
        if (patch.theme) patch.theme = getTheme(patch.theme).id;
        const selection =
          (patch.mapId && patch.mapId !== get().mapId) ||
          (patch.vehicleId && patch.vehicleId !== get().vehicleId);
        const next = { ...get(), ...patch };
        if (selection) {
          setActiveTrack(next.mapId);
          Object.assign(runtime, newVehicle(next.vehicleId));
          useTelemetry.setState({ ...runtime });
          useGame.setState((g) => ({ run: g.run + 1 }));
        }
        set(patch);
      },
      reset: () => {
        const s = get();
        get().set({
          ...defaults,
          mapId: s.mapId,
          vehicleId: s.vehicleId,
          records: s.records,
          best: s.best,
        });
      },
      saveRecord: (time) => {
        if (!Number.isFinite(time) || time <= 0) return;
        const s = get(),
          key = recordKey(s.mapId, s.vehicleId),
          prev = s.records[key];
        if (!prev || time < prev)
          set({
            records: { ...s.records, [key]: time },
            ...(key === "alpine:gt" ? { best: time } : {}),
          });
      },
    }),
    {
      name: "toowix-settings-v1",
      version: 2,
      migrate: (raw) => sanitizeSettings(raw),
      merge: (raw, current) => ({ ...current, ...sanitizeSettings(raw) }),
    },
  ),
);
setActiveTrack(useSettings.getState().mapId);
export const runtime = newVehicle(useSettings.getState().vehicleId);
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
  setPhase: (phase) => {
    if (phase === "MENU") {
      Object.assign(runtime, newVehicle(useSettings.getState().vehicleId));
      set((s) => ({ phase, run: s.run + 1 }));
    } else set({ phase });
  },
  restart: () => {
    setActiveTrack(useSettings.getState().mapId);
    Object.assign(runtime, newVehicle(useSettings.getState().vehicleId));
    set((s) => ({ phase: "COUNTDOWN", run: s.run + 1 }));
  },
  toggleDebug: () => set((s) => ({ debug: !s.debug })),
}));
export const useTelemetry = create(() => ({ ...runtime, fps: 60 }));
