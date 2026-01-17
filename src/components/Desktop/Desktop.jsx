import "./Desktop.css";
import { useRef } from "react";
import Dock from "../Dock/Dock.jsx";
import MenuBar from "../MenuBar/MenuBar.jsx";
import Window from "../Window/Window";

export default function Desktop() {
  const stageRef = useRef(null);

  return (
    <main className="desktop">
      <MenuBar />
      <div className="desktop__stage" ref={stageRef}>
        <Window title="Finder" x={140} y={120} stageRef={stageRef} />
      </div>
      <Dock />
    </main>
  );
}
