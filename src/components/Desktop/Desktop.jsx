import "./Desktop.css";
import Dock from "../Dock/Dock.jsx";
import MenuBar from "../MenuBar/MenuBar.jsx";

export default function Desktop() {
  return (
    <main className="desktop">
      <MenuBar />
      <div className="desktop__stage" />
      <Dock />
    </main>
  );
}
