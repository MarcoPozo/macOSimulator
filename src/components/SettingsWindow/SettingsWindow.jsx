import "../Window/Window.css";
import "./SettingsWindow.css";
import { useEffect, useMemo, useState } from "react";

import { LuX, LuMinus, LuPlus } from "react-icons/lu";
import { useWindowDrag } from "../../hooks/useWindowDrag";

function useMediaQuery(query) {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;

  const [matches, setMatches] = useState(get);

  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);

    onChange();
    if (m.addEventListener) m.addEventListener("change", onChange);
    else m.addListener(onChange);

    return () => {
      if (m.removeEventListener) m.removeEventListener("change", onChange);
      else m.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

export default function SettingsWindow({
  title = "Configuración",
  width = 560,
  height = 360,
  x = 140,
  y = 120,
  stageRef,
  minimized = false,
  onClose,
  onMinimize,
  onSelectWallpaper,
  currentWallpaper,
  isActive = false,
  zIndex = 1,
  onFocus,
}) {
  const isResponsive = useMediaQuery("(max-width: 600px)");

  const [wallpapers, setWallpapers] = useState([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [restore, setRestore] = useState({ x, y, width, height });

  const drag = useWindowDrag({
    initialX: x,
    initialY: y,
    width,
    edgePadding: 120,
    overflow: 30,
    containerRef: stageRef,
    disabled: isResponsive,
    onStart: (e) => {
      if (!isMaximized) return;
      setIsMaximized(false);
      const nextX = Math.max(0, e.clientX - restore.width / 2);
      const nextY = Math.max(0, e.clientY - 18);
      drag.setPos({ x: nextX, y: nextY });
    },
  });

  const toggleMaximize = () => {
    if (isResponsive) return;

    setIsMaximized((v) => {
      const next = !v;

      if (!v) {
        setRestore({
          x: drag.x,
          y: drag.y,
          width,
          height,
        });
      } else {
        drag.setPos({ x: restore.x, y: restore.y });
      }

      return next;
    });
  };

  const onTitlebarPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (isResponsive) return;

    if (isMaximized) {
      const rect = e.currentTarget.getBoundingClientRect();
      const grabX = e.clientX - rect.left;
      const grabY = e.clientY - rect.top;
      setIsMaximized(false);
      const nextX = Math.max(0, e.clientX - grabX);
      const nextY = Math.max(0, e.clientY - grabY);
      drag.setPos({ x: nextX, y: nextY });
      drag.bindTitlebar.onPointerDown(e);
      return;
    }

    drag.bindTitlebar.onPointerDown(e);
  };

  useEffect(() => {
    let alive = true;

    fetch("/wallpapers/wallpapers.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (alive) setWallpapers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (alive) setWallpapers([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => wallpapers ?? [], [wallpapers]);

  const windowStyle = isResponsive
    ? { zIndex }
    : isMaximized
      ? { zIndex }
      : {
          width,
          height,
          zIndex,
          transform: `translate(${drag.x}px, ${drag.y}px)`,
        };

  return (
    <section
      className={`window ${isResponsive ? "window--responsive" : ""} ${
        minimized ? "window--minimized" : ""
      } ${isMaximized ? "window--maximized" : ""} ${
        isActive ? "window--active" : "window--inactive"
      }`}
      style={windowStyle}
      aria-label={`Ventana ${title}`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onFocus?.();
      }}>
      <div className="window__frame">
        <header
          className="window__titlebar"
          onPointerDown={onTitlebarPointerDown}>
          <div className="window__traffic">
            <button
              className="window__dotBtn window__dotBtn--red"
              type="button"
              aria-label="Cerrar"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}>
              <LuX className="window__dotIcon" />
            </button>

            <button
              className="window__dotBtn window__dotBtn--yellow"
              type="button"
              aria-label="Minimizar"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onMinimize?.();
              }}>
              <LuMinus className="window__dotIcon" />
            </button>

            <button
              className="window__dotBtn window__dotBtn--green"
              type="button"
              aria-label={isMaximized ? "Restaurar" : "Maximizar"}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                toggleMaximize();
              }}>
              <LuPlus className="window__dotIcon" />
            </button>
          </div>

          <div className="window__title">{title}</div>
          <div className="window__spacer" />
        </header>

        <div className="window__body">
          <aside className="window__sidebar" aria-label="Secciones">
            <button
              type="button"
              className="window__sideItem window__sideItem--active">
              Fondos
            </button>
          </aside>

          <section className="window__content">
            <div className="settings__grid">
              {items.map((wp) => {
                const active = wp.src === currentWallpaper;

                return (
                  <button
                    key={wp.id}
                    type="button"
                    className={`settings__thumb ${
                      active ? "settings__thumb--active" : ""
                    }`}
                    onClick={() => onSelectWallpaper?.(wp.src)}
                    aria-label={`Seleccionar ${wp.id}`}>
                    <img src={`/${wp.src}`} alt="" draggable="false" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
