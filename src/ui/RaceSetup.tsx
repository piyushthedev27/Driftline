import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Settings2,
  HelpCircle,
  Mountain,
  CarFront,
  Sun,
  Github,
} from "lucide-react";
import {
  MAPS,
  VEHICLES,
  THEMES,
  getMap,
  getVehicle,
  getTheme,
  recordKey,
} from "../game/catalog";
import { tracks } from "../game/track";
import { useSettings } from "../store";
import { formatTime } from "./Hud";
type Tab = "destination" | "garage" | "atmosphere";
const tabs = [
  { id: "destination", label: "Destination", icon: Mountain },
  { id: "garage", label: "Garage", icon: CarFront },
  { id: "atmosphere", label: "Atmosphere", icon: Sun },
] as const;
function Silhouette({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 230 85" className="vehicle-sketch" aria-hidden="true">
      <path
        d={
          kind === "rally"
            ? "M20 61 L24 38 L59 34 L75 12 L148 12 L173 39 L207 45 L212 64 Z"
            : kind === "muscle"
              ? "M13 60 L17 41 L85 37 L106 19 L156 19 L179 39 L214 46 L214 64 Z"
              : "M15 60 L31 44 L80 35 L109 15 L157 18 L180 36 L214 43 L220 63 Z"
        }
        fill="currentColor"
        opacity=".7"
      />
      <path
        d={
          kind === "rally"
            ? "M68 35 L82 19 L143 19 L160 37 Z"
            : "M93 36 L112 22 L151 24 L167 38 Z"
        }
        fill="#203139"
      />
      {[55, 177].map((x) => (
        <g key={x}>
          <circle cx={x} cy="61" r="17" fill="#14252b" />
          <circle cx={x} cy="61" r="9" fill="#8d9b99" />
          <circle cx={x} cy="61" r="5" fill="#25363b" />
        </g>
      ))}
      <path
        d="M22 46 L42 44 M193 44 L212 48"
        stroke="#f4f4db"
        strokeWidth="3"
      />
    </svg>
  );
}
export function ThemeOptions() {
  const s = useSettings();
  return (
    <div className="theme-options">
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={`atmosphere-option ${s.theme === t.id ? "selected" : ""}`}
          aria-pressed={s.theme === t.id}
          onClick={() => s.set({ theme: t.id })}
        >
          <span className={`sky-swatch sky-${t.id}`}>
            <i />
            <b />
          </span>
          <span>
            <strong>{t.name}</strong>
            <small>{t.description}</small>
          </span>
          {s.theme === t.id && <Check size={16} />}
        </button>
      ))}
    </div>
  );
}
export function RaceSetup({
  onStart,
  onHelp,
  onSettings,
}: {
  onStart: () => void;
  onHelp: () => void;
  onSettings: () => void;
}) {
  const [tab, setTab] = useState<Tab>("destination"),
    s = useSettings(),
    map = getMap(s.mapId),
    car = getVehicle(s.vehicleId),
    theme = getTheme(s.theme),
    track = tracks[s.mapId],
    best = s.records[recordKey(s.mapId, s.vehicleId)];
  return (
    <div className="race-setup">
      <header className="setup-header">
        <div className="setup-brand">
          <i>//</i> DRIFT LINE <span>WORLD TOUR</span>
        </div>
        <div className="setup-header-actions">
          <span>03 DESTINATIONS / 03 MACHINES</span>
          <button
            className="icon-button"
            aria-label="How to play"
            onClick={onHelp}
          >
            <HelpCircle size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Open settings"
            onClick={onSettings}
          >
            <Settings2 size={18} />
          </button>
        </div>
      </header>
      <section className="setup-panel">
        <div className="eyebrow">
          <span className="short-line" /> THE ROAD IS YOURS
        </div>
        <h1>
          ONE MORE
          <br />
          <em>GREAT DRIVE.</em>
        </h1>
        <p className="setup-intro">
          Choose your road. Find your machine. Set the mood.
        </p>
        <div className="setup-tabs" role="tablist" aria-label="Race setup">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  e.preventDefault();
                  const next = tabs[(i + (e.key === "ArrowRight" ? 1 : 2)) % 3];
                  setTab(next.id);
                  document.getElementById(`tab-${next.id}`)?.focus();
                }
              }}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
        <div
          className="setup-options"
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
        >
          {tab === "destination" && (
            <>
              <div className="option-heading">
                <span>CHOOSE A DESTINATION</span>
                <span>ALL ROUTES OPEN</span>
              </div>
              <div className="destination-options">
                {MAPS.map((m, i) => (
                  <button
                    key={m.id}
                    className={`destination-option ${s.mapId === m.id ? "selected" : ""}`}
                    aria-pressed={s.mapId === m.id}
                    onClick={() => s.set({ mapId: m.id })}
                  >
                    <span className={`route-art route-${m.id}`}>
                      <svg viewBox="0 0 170 180" aria-hidden="true">
                        <path
                          d={tracks[m.id].mapPath}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                      </svg>
                      <small>0{i + 1}</small>
                    </span>
                    <span className="option-copy">
                      <span className="option-kicker">{m.tag}</span>
                      <strong>{m.name}</strong>
                      <small>
                        {((tracks[m.id].length * 2) / 1000).toFixed(2)} KM{" "}
                        <b>·</b> {m.difficulty} <b>·</b> 2 laps
                      </small>
                    </span>
                    <span className="selection-mark">
                      {s.mapId === m.id ? (
                        <Check size={16} />
                      ) : (
                        <ArrowRight size={16} />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          {tab === "garage" && (
            <>
              <div className="option-heading">
                <span>CHOOSE YOUR MACHINE</span>
                <span>3 HANDLING STYLES</span>
              </div>
              <div className="garage-options">
                {VEHICLES.map((v) => (
                  <button
                    key={v.id}
                    className={`garage-option ${s.vehicleId === v.id ? "selected" : ""}`}
                    aria-pressed={s.vehicleId === v.id}
                    onClick={() => s.set({ vehicleId: v.id })}
                  >
                    <Silhouette kind={v.id} />
                    <span className="option-copy">
                      <span className="option-kicker">{v.category}</span>
                      <strong>{v.name}</strong>
                      <small>
                        {v.drive} <b>·</b> {Math.round(v.boostMax * 3.6)} KM/H
                        BOOST LIMIT
                      </small>
                    </span>
                    {s.vehicleId === v.id && <Check size={16} />}
                  </button>
                ))}
              </div>
              <div className="handling-stats">
                {["Acceleration", "Cornering", "Boost"].map((label, i) => (
                  <div key={label}>
                    <span>{label}</span>
                    <div>
                      <i style={{ width: `${car.stats[i]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="setup-paint">
                <span>PAINT</span>
                <div className="swatches">
                  {["#e84836", "#3b9abe", "#eee9d9", "#e6ac31", "#80a745"].map(
                    (color, i) => (
                      <button
                        key={color}
                        style={{ background: color }}
                        aria-label={`Select ${["red", "blue", "white", "yellow", "green"][i]} paint`}
                        aria-pressed={s.color === color}
                        className={s.color === color ? "selected" : ""}
                        onClick={() => s.set({ color })}
                      >
                        {s.color === color && <Check size={12} />}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </>
          )}
          {tab === "atmosphere" && (
            <>
              <div className="option-heading">
                <span>SET THE ATMOSPHERE</span>
                <span>LIVE WORLD PREVIEW</span>
              </div>
              <ThemeOptions />
              <p className="setup-note">
                A different light. The same challenge. Atmosphere changes the
                world and instruments without changing your grip.
              </p>
            </>
          )}
        </div>
      </section>
      <aside className="preview-caption" aria-live="polite">
        <span className="eyebrow">
          <i className="live-dot" /> LIVE 3D PREVIEW
        </span>
        <h2>{tab === "garage" ? car.name : map.name}</h2>
        <p>{tab === "garage" ? car.description : map.description}</p>
        <div>
          <span>{map.region}</span>
          <span>{theme.name}</span>
        </div>
      </aside>
      <footer className="setup-footer">
        <div className="setup-summary">
          <span className="eyebrow">READY ON THE GRID</span>
          <strong>
            {map.name}
            <i>/</i>
            {car.name}
          </strong>
          <small>
            02 LAPS <b>·</b> 08 CHECKPOINTS <b>·</b> {theme.name.toUpperCase()}{" "}
            {best && (
              <>
                <b>·</b> BEST {formatTime(best)}
              </>
            )}
          </small>
        </div>
        <button className="primary" onClick={onStart}>
          START RACE <ArrowUpRight size={23} />
        </button>
        <div className="setup-bottom">
          <span>
            <kbd>WASD</kbd> DRIVE <kbd>SHIFT</kbd> DRIFT <kbd>SPACE</kbd> NITRO{" "}
            <span className="setup-touch-note">TOUCH CONTROLS AVAILABLE</span>
          </span>
          <a
            href="https://github.com/piyushthedev27"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={12} /> PIYUSHTHEDEV27
          </a>
        </div>
      </footer>
    </div>
  );
}
