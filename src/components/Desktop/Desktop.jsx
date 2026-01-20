import { useRef, useState } from "react";
import "./Desktop.css";

import Dock from "../Dock/Dock.jsx";
import MenuBar from "../MenuBar/MenuBar.jsx";
import Window from "../Window/Window";
import SettingsWindow from "../SettingsWindow/SettingsWindow";

export default function Desktop() {
  const stageRef = useRef(null);

  /* Wallpaper */
  const [wallpaper, setWallpaper] = useState(() => {
    return localStorage.getItem("wallpaper") || "wallpapers/0001.webp";
  });

  const handleWallpaperChange = (src) => {
    setWallpaper(src);
    localStorage.setItem("wallpaper", src);
  };

  /* Photos*/
  const [photos, setPhotos] = useState({
    open: false,
    minimized: false,
  });

  const handleClosePhotos = () => {
    setPhotos({ open: false, minimized: false });
  };

  const handleMinimizePhotos = () => {
    setPhotos((prev) => (prev.open ? { ...prev, minimized: true } : prev));
  };

  /* Settings */
  const [settings, setSettings] = useState({
    open: false,
    minimized: false,
  });

  const handleCloseSettings = () => {
    setSettings({ open: false, minimized: false });
  };

  const handleMinimizeSettings = () => {
    setSettings((prev) => (prev.open ? { ...prev, minimized: true } : prev));
  };

  /* Dock */
  const handleDockClick = (appId) => {
    if (appId === "photos") {
      setPhotos((prev) => {
        if (!prev.open) return { open: true, minimized: false };
        if (!prev.minimized) return { open: true, minimized: true };
        return { open: true, minimized: false };
      });
    }

    if (appId === "settings") {
      setSettings((prev) => {
        if (!prev.open) return { open: true, minimized: false };
        if (!prev.minimized) return { open: true, minimized: true };
        return { open: true, minimized: false };
      });
    }
  };

  return (
    <main
      className="desktop"
      style={{
        backgroundImage: `url(/src/assets/${wallpaper})`,
      }}>
      <MenuBar />

      <div className="desktop__stage" ref={stageRef}>
        {/* Photos */}
        {photos.open && (
          <Window
            title="Fotos"
            x={140}
            y={120}
            width={560}
            height={360}
            stageRef={stageRef}
            minimized={photos.minimized}
            onClose={handleClosePhotos}
            onMinimize={handleMinimizePhotos}
          />
        )}

        {/* Settings */}
        {settings.open && (
          <SettingsWindow
            title="Configuración"
            x={540}
            y={120}
            width={560}
            height={360}
            stageRef={stageRef}
            minimized={settings.minimized}
            onClose={handleCloseSettings}
            onMinimize={handleMinimizeSettings}
            onSelectWallpaper={handleWallpaperChange}
            currentWallpaper={wallpaper}
          />
        )}
      </div>

      <Dock
        onItemClick={handleDockClick}
        appState={{
          photos,
          settings,
        }}
      />
    </main>
  );
}
