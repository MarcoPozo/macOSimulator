import "./Desktop.css";
import Dock from "../Dock/Dock.jsx";
import MenuBar from "../MenuBar/MenuBar.jsx";
import Window from "../Window/Window";

export default function Desktop() {
  return (
    <main className="desktop">
      <MenuBar />
      <div className="desktop__stage">
        <Window title="Finder" x={140} y={120} />
      </div>
      <Dock />
    </main>
  );
}
