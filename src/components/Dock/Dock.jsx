import "./Dock.css";

import finder from "../../assets/icons/dock/finder.webp";
import appstore from "../../assets/icons/dock/appstore.webp";
import message from "../../assets/icons/dock/message.webp";
import music from "../../assets/icons/dock/music.webp";
import photos from "../../assets/icons/dock/photos.webp";
import safari from "../../assets/icons/dock/safari.webp";
import maps from "../../assets/icons/dock/maps.webp";
import calculator from "../../assets/icons/dock/calculator.webp";
import notes from "../../assets/icons/dock/notes.webp";
import siri from "../../assets/icons/dock/siri.webp";
import terminal from "../../assets/icons/dock/terminal.webp";
import settings from "../../assets/icons/dock/settings.webp";
import trash from "../../assets/icons/dock/trash.webp";

const DOCK_ITEMS = [
  { id: "finder", label: "Finder", src: finder },
  { id: "appstore", label: "App Store", src: appstore },
  { id: "message", label: "Mensajes", src: message },
  { id: "music", label: "Musica", src: music },
  { id: "photos", label: "Fotos", src: photos },
  { id: "safari", label: "Safari", src: safari },
  { id: "maps", label: "Mapas", src: maps },
  { id: "calculator", label: "Calculadora", src: calculator },
  { id: "notes", label: "Notas", src: notes },
  { id: "siri", label: "Siri", src: siri },
  { id: "terminal", label: "Terminal", src: terminal },
  { id: "settings", label: "Configuración", src: settings },
  { id: "trash", label: "Papelera", src: trash },
];

export default function Dock({ onItemClick, appState = {} }) {
  return (
    <div className="dock" aria-label="Dock">
      {DOCK_ITEMS.map((item) => {
        const state = appState[item.id];
        const isMinimized = !!state?.open && !!state?.minimized;

        return (
          <button
            key={item.id}
            className={`icon ${isMinimized ? "icon--minimized" : ""}`}
            aria-label={item.label}
            type="button"
            onClick={() => onItemClick?.(item.id)}>
            <img src={item.src} alt={`${item.label} Logo`} draggable="false" />

            <span className="dock-dot" aria-hidden="true" />

            <span className="dock-tooltip">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
