import type { PointerEvent } from "react";
import {
  Pause,
  Flag,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Wind,
  Zap,
} from "lucide-react";
import { useGame, useTelemetry, useSettings } from "../store";
import { mapPath, LENGTH } from "../game/track";
import { keys, isTouchDevice } from "../game/input";
import type { Input } from "../game/vehicle";
function press(key: keyof Input) {
  return {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      keys[key] = true;
    },
    onPointerUp: () => {
      keys[key] = false;
    },
    onPointerCancel: () => {
      keys[key] = false;
    },
  };
}
export function TouchControls() {
  return (
    <div className="touch-controls">
      <div className="touch-steer">
        <button
          className="touch-button"
          aria-label="Steer left"
          {...press("left")}
        >
          <ChevronLeft size={30} />
        </button>
        <button
          className="touch-button"
          aria-label="Steer right"
          {...press("right")}
        >
          <ChevronRight size={30} />
        </button>
      </div>
      <div className="touch-actions">
        <div className="touch-item">
          <button
            className="touch-button touch-small"
            aria-label="Drift"
            {...press("drift")}
          >
            <Wind size={19} />
          </button>
          <span className="touch-caption">DRIFT</span>
        </div>
        <div className="touch-item">
          <button
            className="touch-button touch-small"
            aria-label="Nitro"
            {...press("boost")}
          >
            <Zap size={19} />
          </button>
          <span className="touch-caption">NITRO</span>
        </div>
        <button
          className="touch-button touch-brake"
          aria-label="Brake"
          {...press("down")}
        >
          BRAKE
        </button>
        <button
          className="touch-button touch-gas"
          aria-label="Accelerate"
          {...press("up")}
        >
          GAS
        </button>
      </div>
    </div>
  );
}
export const formatTime = (n: number) =>
  `${Math.floor(n / 60)
    .toString()
    .padStart(2, "0")}:${(n % 60).toFixed(2).padStart(5, "0")}`;
export function MiniMap({ menu = false }: { menu?: boolean }) {
  const t = useTelemetry();
  return (
    <svg
      className={menu ? "map menu-map" : "map"}
      viewBox="0 0 170 180"
      aria-label="Alpine coast circuit map"
    >
      <path
        d={mapPath}
        fill="none"
        stroke="currentColor"
        strokeOpacity=".16"
        strokeWidth="9"
      />
      <path d={mapPath} fill="none" stroke="currentColor" strokeWidth="2" />
      <circle
        cx={(t.x + 140) * 0.6}
        cy={(t.z + 145) * 0.6}
        r="4"
        fill="#e6f7b1"
        stroke="#243938"
        strokeWidth="2"
      />
      <text x="140" y="22" fill="currentColor" fontSize="9">
        N ↑
      </text>
    </svg>
  );
}
export function Hud() {
  const t = useTelemetry(),
    g = useGame(),
    s = useSettings();
  const speed = Math.round(Math.abs(t.speed) * 3.6),
    gear =
      t.speed < -0.5
        ? "R"
        : speed < 2
          ? "N"
          : Math.min(6, Math.floor(speed / 43) + 1);
  return (
    <div className="hud">
      <div className="race-info">
        <span className="eyebrow">ALPINE COAST / TIME ATTACK</span>
        <div className="lap">
          <span>{Math.min(t.lap, 2).toString().padStart(2, "0")}</span>
          <small>/ 02 LAPS</small>
        </div>
        <div className="race-progress">
          <i style={{ width: `${((t.nextGate - 1) / 16) * 100}%` }} />
        </div>
        <span className="tiny">
          CHECKPOINT {((t.nextGate - 1) % 8) + 1} / 8
        </span>
      </div>
      <div className="timer">
        <span className="eyebrow">RACE TIME</span>
        <strong>{formatTime(t.elapsed)}</strong>
        <span className="tiny">
          BEST {s.best ? formatTime(s.best) : "— — : — —"}
        </span>
      </div>
      <div className="top-actions">
        <button
          className="icon-button"
          aria-label={s.sound ? "Mute sound" : "Enable sound"}
          onClick={() => s.set({ sound: !s.sound })}
        >
          {s.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          className="icon-button"
          aria-label="Pause race"
          onClick={() => g.setPhase("PAUSED")}
        >
          <Pause size={18} />
        </button>
      </div>
      <div className="mini-area">
        <MiniMap />
        <span className="tiny">
          {((LENGTH * 2) / 1000).toFixed(2)} KM CIRCUIT
        </span>
      </div>
      <div className={`speedometer ${t.boosting ? "boosting" : ""}`}>
        <svg viewBox="0 0 220 150" className="dial">
          <path
            d="M 25 130 A 91 91 0 1 1 195 130"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity=".24"
          />
          {Array.from({ length: 25 }, (_, i) => {
            const a = ((-205 + i * 9.58) * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={110 + Math.cos(a) * 91}
                y1={91 + Math.sin(a) * 91}
                x2={110 + Math.cos(a) * (i % 4 === 0 ? 78 : 84)}
                y2={91 + Math.sin(a) * (i % 4 === 0 ? 78 : 84)}
                stroke={i > 20 ? "#e28b67" : "currentColor"}
                strokeWidth={i % 4 === 0 ? 2 : 1}
              />
            );
          })}
          <path
            d="M 25 130 A 91 91 0 1 1 195 130"
            fill="none"
            stroke="#d8edaa"
            strokeWidth="4"
            pathLength="100"
            strokeDasharray={`${Math.min((speed / 274) * 100, 100)} 100`}
          />
        </svg>
        <div className="speed-number">{speed.toString().padStart(3, "0")}</div>
        <span className="speed-unit">KM/H</span>
        <div className="gear">
          <span>{gear}</span>
          <small>GEAR</small>
        </div>
        <div className="rpm">
          {Array.from({ length: 16 }, (_, i) => (
            <i
              key={i}
              className={i < ((speed % 43) / 43) * 12 + 4 ? "on" : ""}
            />
          ))}
        </div>
        <span className="dial-label">
          RPM × 1000 <b>274 MAX</b>
        </span>
      </div>
      <div className={`nitro ${t.boosting ? "boosting" : ""}`}>
        <div>
          <span>NITRO</span>
          <span>
            {Math.round(t.nitro)}
            <small> %</small>
          </span>
        </div>
        <div className="nitro-bars">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} className={t.nitro > (i / 12) * 100 ? "charged" : ""} />
          ))}
        </div>
        <span className="tiny">
          {t.boosting ? "BOOST ENGAGED" : "HOLD"}{" "}
          {!t.boosting && !isTouchDevice() && <kbd>SPACE</kbd>}
          {!t.boosting && isTouchDevice() && "NITRO"}
        </span>
      </div>
      <div className="driving-controls">
        <span>
          <kbd>W A S D</kbd> DRIVE
        </span>
        <span>
          <kbd>SHIFT</kbd> DRIFT
        </span>
        <span>
          <kbd>R</kbd> RESTART
        </span>
      </div>
      {isTouchDevice() &&
        (g.phase === "PLAYING" || g.phase === "COUNTDOWN") && (
          <TouchControls />
        )}
      {t.drifting && (
        <div className="drift-label">
          DRIFT <span>HOLD THE LINE</span>
        </div>
      )}
      {t.gateFlash > 0 && (
        <div className="gate-toast">
          <Flag size={15} /> CHECKPOINT CLEARED <span>+12 NITRO</span>
        </div>
      )}
      {s.effects && t.boosting && <div className="speed-lines" />}
      {t.impact > 0.6 && s.effects && <div className="impact" />}
      {g.debug && (
        <pre className="debug">{`FPS ${t.fps}\n${g.phase}\nx ${t.x.toFixed(1)} z ${t.z.toFixed(1)}\nvx ${t.vx.toFixed(1)} vz ${t.vz.toFixed(1)}\nSpeed ${speed} km/h\nNitro ${t.nitro.toFixed(1)}\nCollisions ${t.collisions}\nDistance ${t.distance.toFixed(0)} m`}</pre>
      )}
    </div>
  );
}
