import { useEffect } from "react";
import { idleInput } from "./vehicle";
import { useGame } from "../store";
import { audio } from "./audio";
export const keys = { ...idleInput };
export const isTouchDevice = () =>
  typeof window !== "undefined" &&
  (navigator.maxTouchPoints > 0 || "ontouchstart" in window);
const map: Record<string, keyof typeof keys> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "drift",
  ShiftRight: "drift",
  Space: "boost",
};
export function useKeyboard() {
  useEffect(() => {
    const held = new Set<string>();
    const clear = () => {
      held.clear();
      Object.assign(keys, idleInput);
    };
    const on = (e: KeyboardEvent) => {
      const active = ["PLAYING", "COUNTDOWN"].includes(
        useGame.getState().phase,
      );
      if (map[e.code]) {
        if (active) e.preventDefault();
        if (e.type === "keydown") held.add(e.code);
        else held.delete(e.code);
        for (const k of Object.keys(keys) as (keyof typeof keys)[])
          keys[k] = Object.entries(map).some(
            ([code, key]) => key === k && held.has(code),
          );
      }
      if (e.type !== "keydown" || e.repeat) return;
      const g = useGame.getState();
      if (e.code === "F3") {
        e.preventDefault();
        g.toggleDebug();
      }
      if (e.code === "Escape" || e.code === "KeyP") {
        if (g.phase === "PLAYING") {
          g.setPhase("PAUSED");
          clear();
        } else if (g.phase === "PAUSED") g.setPhase("PLAYING");
      }
      if (e.code === "KeyR" && g.phase !== "MENU") {
        audio.init();
        g.restart();
        clear();
      }
    };
    const blur = () => {
      clear();
      if (useGame.getState().phase === "PLAYING")
        useGame.getState().setPhase("PAUSED");
    };
    window.addEventListener("keydown", on);
    window.addEventListener("keyup", on);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", on);
      window.removeEventListener("keyup", on);
      window.removeEventListener("blur", blur);
    };
  }, []);
}
