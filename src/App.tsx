import { Component, type ReactNode } from "react";
import { GameScene } from "./scene/GameScene";
import { Menus, Countdown } from "./ui/Menus";
import { Hud } from "./ui/Hud";
import { useGame, useSettings } from "./store";
import { useKeyboard } from "./game/input";
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="fatal">
        <h1>Let’s get you back on the road.</h1>
        <p>
          The 3D renderer could not start. Try a current desktop browser with
          hardware acceleration enabled.
        </p>
        <button onClick={() => location.reload()}>Try again</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function supportsWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}
const supported = supportsWebGL();
export default function App() {
  const phase = useGame((s) => s.phase),
    theme = useSettings((s) => s.theme);
  useKeyboard();
  return (
    <main className={`app ${theme} phase-${phase.toLowerCase()}`}>
      <Boundary>
        {supported ? (
          <GameScene />
        ) : (
          <div className="fatal">
            <h1>Your browser needs WebGL 2.</h1>
            <p>
              Enable hardware acceleration or open this game in a current
              desktop browser.
            </p>
          </div>
        )}
      </Boundary>
      {supported && (
        <>
          <div className="vignette" />
          {phase !== "MENU" && <Hud />}
          <Menus />
          <Countdown />
        </>
      )}
    </main>
  );
}
