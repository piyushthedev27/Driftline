import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Settings2,
  Volume2,
  Flag,
  Mountain,
  Check,
  X,
  Play,
  RotateCcw,
  Github,
} from "lucide-react";
import { useGame, useSettings, runtime } from "../store";
import { audio } from "../game/audio";
import { MiniMap, formatTime } from "./Hud";
import { LENGTH } from "../game/track";
export function Menus() {
  const g = useGame(),
    s = useSettings();
  const [panel, setPanel] = useState<"main" | "settings" | "help">("main");
  const root = useRef<HTMLDivElement>(null);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    setPanel("main");
  }, [g.phase]);
  useEffect(() => {
    if (root.current && !reduced) {
      const a = animate(root.current.querySelectorAll(".enter"), {
        opacity: [0, 1],
        translateY: [14, 0],
        delay: stagger(55),
        duration: 450,
        ease: "outCubic",
      });
      return () => {
        a.revert();
      };
    }
  }, [g.phase, panel, reduced]);
  const start = () => {
    audio.init();
    if (s.sound) audio.beep(330);
    g.restart();
  };
  if (g.phase === "COUNTDOWN" || g.phase === "PLAYING") return null;
  return (
    <div
      ref={root}
      className={`menu-layer ${g.phase === "MENU" ? "home" : "overlay"}`}
    >
      {g.phase === "MENU" && (
        <>
          <header className="brand-bar">
            <a
              href="#"
              aria-label="DRIFT LINE home"
              onClick={(e) => {
                e.preventDefault();
                setPanel("main");
              }}
            >
              <span className="brand-mark">//</span> DRIFT LINE
            </a>
            <span className="edition">VOLUME 01 — THE ALPINE COLLECTION</span>
            <div>
              <button
                className="icon-button"
                aria-label="Toggle day and night"
                onClick={() =>
                  s.set({ theme: s.theme === "light" ? "dark" : "light" })
                }
              >
                {s.theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                className="icon-button"
                aria-label="Open settings"
                onClick={() => setPanel("settings")}
              >
                <Settings2 size={18} />
              </button>
            </div>
          </header>
          <div className="scene-label">
            <span className="live-dot" /> LIVE ENVIRONMENT{" "}
            <span>47°16′ N / 08°32′ E</span>
          </div>
        </>
      )}
      <section className={`menu-content ${panel !== "main" ? "subpanel" : ""}`}>
        {panel === "main" && g.phase === "MENU" && (
          <>
            <div className="eyebrow enter">
              <span className="short-line" /> LEAVE THE EVERYDAY BEHIND
            </div>
            <h1 className="enter">
              TAKE THE
              <br />
              <em>SCENIC ROUTE.</em>
            </h1>
            <p className="menu-description enter">
              Open roads. Sharp corners. No limits.
              <br />
              Find your rhythm on the Alpine Coast.
            </p>
            <div className="route-meta enter">
              <span>
                <Mountain size={16} /> ALPINE COAST
              </span>
              <span>{((LENGTH * 2) / 1000).toFixed(2)} KM</span>
              <span>02 LAPS</span>
            </div>
            <button className="primary enter" onClick={start}>
              LET’S DRIVE <ArrowUpRight size={25} />
            </button>
            <div className="secondary-row enter">
              <button onClick={() => setPanel("help")}>
                HOW TO PLAY <ArrowRight size={15} />
              </button>
              <button onClick={() => setPanel("settings")}>
                SETTINGS <Settings2 size={15} />
              </button>
            </div>
            <div className="car-choice enter">
              <span className="tiny">YOUR RIDE</span>
              <div>
                <strong>VORTEX GT</strong>
                <span>RWD / 6-SPEED / 274 KM/H</span>
              </div>
              <div className="swatches">
                {["#e84836", "#3b9abe", "#eee9d9", "#e6ac31", "#80a745"].map(
                  (c, i) => (
                    <button
                      key={c}
                      aria-label={`Select ${["red", "blue", "white", "yellow", "green"][i]} car`}
                      aria-pressed={s.color === c}
                      style={{ background: c }}
                      className={s.color === c ? "selected" : ""}
                      onClick={() => s.set({ color: c })}
                    >
                      {s.color === c && <Check size={12} />}
                    </button>
                  ),
                )}
              </div>
            </div>
          </>
        )}
        {panel === "main" && g.phase === "PAUSED" && (
          <>
            <span className="eyebrow enter">TAKE A BREATHER</span>
            <h2 className="enter">PIT STOP.</h2>
            <p className="enter">The coast will be right here.</p>
            <button
              className="primary enter"
              onClick={() => {
                audio.init();
                g.setPhase("PLAYING");
              }}
            >
              RESUME DRIVE <Play size={20} />
            </button>
            <button className="menu-button enter" onClick={start}>
              RESTART RACE <RotateCcw size={18} />
            </button>
            <button
              className="menu-button enter"
              onClick={() => setPanel("settings")}
            >
              SETTINGS <Settings2 size={18} />
            </button>
            <button
              className="text-button enter"
              onClick={() => g.setPhase("MENU")}
            >
              MAIN MENU <ArrowLeft size={16} />
            </button>
          </>
        )}
        {panel === "main" &&
          (g.phase === "FINISHED" || g.phase === "GAME_OVER") && (
            <>
              <span className="eyebrow enter">
                {g.phase === "FINISHED"
                  ? "THE COAST IS YOURS"
                  : "TIME LIMIT REACHED"}
              </span>
              <h2 className="enter">
                {g.phase === "FINISHED" ? "NICE DRIVE." : "ONE MORE RUN?"}
              </h2>
              <p className="enter">
                {g.phase === "FINISHED"
                  ? "Two laps. A thousand reasons to come back."
                  : "Keep your speed through the bends and follow the gates."}
              </p>
              <div className="results enter">
                <div>
                  <span>RACE TIME</span>
                  <strong>{formatTime(runtime.elapsed)}</strong>
                </div>
                <div>
                  <span>TOP SPEED</span>
                  <strong>
                    {Math.round(runtime.topSpeed)} <small>KM/H</small>
                  </strong>
                </div>
                <div>
                  <span>DISTANCE</span>
                  <strong>
                    {(runtime.distance / 1000).toFixed(2)} <small>KM</small>
                  </strong>
                </div>
                <div>
                  <span>NITRO USED</span>
                  <strong>
                    {Math.round(runtime.nitroUsed)} <small>%</small>
                  </strong>
                </div>
              </div>
              <button className="primary enter" onClick={start}>
                DRIVE AGAIN <ArrowUpRight size={22} />
              </button>
              <button
                className="text-button enter"
                onClick={() => g.setPhase("MENU")}
              >
                MAIN MENU <ArrowLeft size={16} />
              </button>
            </>
          )}
        {panel === "help" && (
          <>
            <button className="back enter" onClick={() => setPanel("main")}>
              <ArrowLeft size={16} /> BACK
            </button>
            <span className="eyebrow enter">A LITTLE KNOW-HOW</span>
            <h2 className="enter">FIND YOUR LINE.</h2>
            <p className="enter">
              Clear eight gates in order, twice. Finish within six minutes. Stay
              on the asphalt and brake before corners.
            </p>
            <div className="control-list enter">
              {[
                ["W / ↑", "ACCELERATE"],
                ["S / ↓", "BRAKE / REVERSE"],
                ["A D / ← →", "STEER"],
                ["SHIFT", "DRIFT / HANDBRAKE"],
                ["SPACE", "NITRO BOOST"],
                ["P / ESC", "PAUSE"],
                ["R", "RESTART"],
              ].map(([k, v]) => (
                <div key={k}>
                  <kbd>{k}</kbd>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <p className="hint enter">
              Nitro recharges as you drive. Each checkpoint adds 12%. The pale
              green gate marks your next target.
            </p>
            <button className="primary enter" onClick={start}>
              GOT IT. LET’S DRIVE <ArrowUpRight size={21} />
            </button>
          </>
        )}
        {panel === "settings" && (
          <>
            <button className="back enter" onClick={() => setPanel("main")}>
              <ArrowLeft size={16} /> BACK
            </button>
            <span className="eyebrow enter">MAKE IT YOURS</span>
            <h2 className="enter">TUNE YOUR DRIVE.</h2>
            <div className="settings-list enter">
              <div>
                <span>Time of day</span>
                <div className="segmented">
                  {(["light", "dark"] as const).map((t) => (
                    <button
                      key={t}
                      className={s.theme === t ? "active" : ""}
                      onClick={() => s.set({ theme: t })}
                    >
                      {t === "light" ? <Sun size={14} /> : <Moon size={14} />}{" "}
                      {t === "light" ? "DAY" : "NIGHT"}
                    </button>
                  ))}
                </div>
              </div>
              {(["sound", "music", "effects"] as const).map((key) => (
                <div key={key}>
                  <span>
                    {key === "sound"
                      ? "Engine & sound"
                      : key === "music"
                        ? "Ambient music"
                        : "Visual effects"}
                  </span>
                  <button
                    className={`toggle ${s[key] ? "active" : ""}`}
                    role="switch"
                    aria-checked={s[key]}
                    aria-label={key}
                    onClick={() => {
                      audio.init();
                      s.set({ [key]: !s[key] });
                    }}
                  >
                    <span />
                    {s[key] ? "ON" : "OFF"}
                  </button>
                </div>
              ))}
              <div>
                <span>Graphics quality</span>
                <div className="segmented">
                  {(["low", "medium", "high"] as const).map((q) => (
                    <button
                      key={q}
                      className={s.quality === q ? "active" : ""}
                      onClick={() => s.set({ quality: q })}
                    >
                      {q.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="hint enter">
              Quality adjusts resolution, scenery density, shadows and bloom.
              Preferences are saved on this device.
            </p>
            <button className="text-button enter" onClick={s.reset}>
              RESET SETTINGS <RotateCcw size={15} />
            </button>
          </>
        )}
      </section>
      {g.phase === "MENU" && (
        <>
          <aside className="route-card">
            <div>
              <span className="eyebrow">THE ROAD AHEAD</span>
              <span>01 / 01</span>
            </div>
            <MiniMap menu />
            <h3>Alpine Coast</h3>
            <p>COASTAL ROADS · MOUNTAIN PASSES</p>
            <div className="route-card-footer">
              <span>
                <Flag size={13} /> TIME ATTACK
              </span>
              <span>8 CHECKPOINTS</span>
            </div>
          </aside>
          <footer className="menu-footer">
            <span>
              <kbd>W A S D</kbd> DRIVE <i /> <kbd>SHIFT</kbd> DRIFT <i />{" "}
              <kbd>SPACE</kbd> NITRO
            </span>
            <span className="keyboard-note">
              BEST EXPERIENCED WITH A KEYBOARD
            </span>
            <span className="version">
              BUILT FOR THE OPEN ROAD. <b>v1.0</b>
              <a
                className="dev-credit"
                href="https://github.com/piyushthedev27"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={16} /> PIYUSHTHEDEV27
              </a>
            </span>
          </footer>
        </>
      )}
    </div>
  );
}
export function Countdown() {
  const phase = useGame((s) => s.phase),
    run = useGame((s) => s.run),
    [count, setCount] = useState(3),
    ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase !== "COUNTDOWN") return;
    setCount(3);
    let value = 3;
    if (useSettings.getState().sound) audio.beep(380, 0.15);
    const timer = setInterval(() => {
      value--;
      setCount(value);
      if (useSettings.getState().sound)
        audio.beep(value === 0 ? 760 : 380, 0.15);
      if (value === 0) {
        clearInterval(timer);
        useGame.getState().setPhase("PLAYING");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, run]);
  useEffect(() => {
    if (
      ref.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const a = animate(ref.current, {
        scale: [1.15, 1],
        opacity: [0.3, 1],
        duration: 450,
        ease: "outExpo",
      });
      return () => {
        a.revert();
      };
    }
  }, [count, phase]);
  useEffect(() => {
    if (phase === "PLAYING" && count === 0) {
      const t = setTimeout(() => setCount(-1), 900);
      return () => clearTimeout(t);
    }
  }, [phase, count]);
  if (phase !== "COUNTDOWN" && !(phase === "PLAYING" && count === 0))
    return null;
  return (
    <div className="countdown" aria-live="assertive">
      <span>ALPINE COAST</span>
      <div ref={ref}>{count === 0 ? "GO" : count}</div>
      <p>FIND YOUR LINE.</p>
    </div>
  );
}
