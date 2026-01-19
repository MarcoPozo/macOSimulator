import { useRef, useState } from "react";
import "./Desktop.css";

import Dock from "../Dock/Dock.jsx";
import MenuBar from "../MenuBar/MenuBar.jsx";
import Window from "../Window/Window";

export default function Desktop() {
  const stageRef = useRef(null);

  const [photos, setPhotos] = useState({
    open: false,
    minimized: false,
  });

  const handleDockClick = (appId) => {
    if (appId !== "photos") return;

    setPhotos((prev) => {
      if (!prev.open) return { open: true, minimized: false };
      if (prev.open && !prev.minimized) return { open: true, minimized: true };
      return { open: true, minimized: false };
    });
  };

  const handleClosePhotos = () => {
    setPhotos({ open: false, minimized: false });
  };

  const handleMinimizePhotos = () => {
    setPhotos((prev) => (prev.open ? { ...prev, minimized: true } : prev));
  };

  return (
    <main className="desktop">
      <MenuBar />

      <div className="desktop__stage" ref={stageRef}>
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
      </div>

      <Dock
        onItemClick={handleDockClick}
        appState={{
          photos,
        }}
      />
    </main>
  );
}
