import "../Window/Window.css";
import "./SettingsWindow.css";
import { useMemo } from "react";
import { LuX, LuMinus, LuPlus } from "react-icons/lu";
import wallpapers from "../../assets/wallpapers/wallpapers.json";
import { useWindowDrag } from "../../hooks/useWindowDrag";

export default function SettingsWindow({
  title = "Configuración",
  width = 560,
  height = 360,
  x = 180,
  y = 140,
  stageRef,
  minimized = false,
  onClose,
  onMinimize,
  onSelectWallpaper,
  currentWallpaper,
}) {
  const drag = useWindowDrag({
    initialX: x,
    initialY: y,
    width,
    edgePadding: 120,
    overflow: 30,
    containerRef: stageRef,
  });

  const items = useMemo(() => wallpapers, []);

  return (
    <section
      className={`window ${minimized ? "window--minimized" : ""}`}
      style={{
        width,
        height,
        transform: `translate(${drag.x}px, ${drag.y}px)`,
      }}>
      <header className="window__titlebar" {...drag.bindTitlebar}>
        <div className="window__traffic">
          <button
            className="window__dotBtn window__dotBtn--red"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClose}>
            <LuX className="window__dotIcon" />
          </button>

          <button
            className="window__dotBtn window__dotBtn--yellow"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onMinimize}>
            <LuMinus className="window__dotIcon" />
          </button>

          <button
            className="window__dotBtn window__dotBtn--green"
            onPointerDown={(e) => e.stopPropagation()}>
            <LuPlus className="window__dotIcon" />
          </button>
        </div>

        <div className="window__title">{title}</div>
        <div className="window__spacer" />
      </header>

      <div className="window__body">
        <aside className="window__sidebar">
          <button className="window__sideItem window__sideItem--active">
            Fondos
          </button>
        </aside>

        <section className="window__content">
          <div className="settings__grid">
            {items.map((wp) => {
              const isActive = wp.src === currentWallpaper;

              return (
                <button
                  key={wp.id}
                  className={`settings__thumb ${
                    isActive ? "settings__thumb--active" : ""
                  }`}
                  onClick={() => onSelectWallpaper(wp.src)}>
                  <img src={`/src/assets/${wp.src}`} alt="" draggable="false" />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}
