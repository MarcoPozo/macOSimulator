import "./Dock.css";

import finder from "../../assets/icons/dock/finder.webp";
import launchpad from "../../assets/icons/dock/launchpad.webp";
import appstore from "../../assets/icons/dock/appstore.webp";
import message from "../../assets/icons/dock/message.webp";
import music from "../../assets/icons/dock/music.webp";
import vscode from "../../assets/icons/dock/vscode.svg";
import mail from "../../assets/icons/dock/mail.webp";
import photos from "../../assets/icons/dock/photos.webp";
import maps from "../../assets/icons/dock/maps.webp";
import calculator from "../../assets/icons/dock/calculator.webp";
import notes from "../../assets/icons/dock/notes.webp";
import terminal from "../../assets/icons/dock/terminal.webp";
import settings from "../../assets/icons/dock/settings.webp";
import trash from "../../assets/icons/dock/trash.webp";

const DOCK_ITEMS = [
  { id: "finder", label: "Finder", src: finder },
  { id: "launchpad", label: "Launchpad", src: launchpad },
  { id: "appstore", label: "App Store", src: appstore },
  { id: "message", label: "Mensajes", src: message },
  { id: "music", label: "Musica", src: music },
  { id: "vscode", label: "VS Code", src: vscode },
  { id: "mail", label: "Mail", src: mail },
  { id: "photos", label: "Fotos", src: photos },
  { id: "maps", label: "Mapas", src: maps },
  { id: "calculator", label: "Calculadora", src: calculator },
  { id: "notes", label: "Notas", src: notes },
  { id: "terminal", label: "Terminal", src: terminal },
  { id: "settings", label: "Configuración", src: settings },
  { id: "trash", label: "Papelera", src: trash },
];

export default function Dock() {
  return (
    <div className="dock" aria-label="Dock">
      {DOCK_ITEMS.map((item) => (
        <button
          key={item.id}
          className="icon"
          aria-label={item.label}
          type="button">
          <img src={item.src} alt={`${item.label} Logo`} draggable="false" />

          <span className="dock-tooltip">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
