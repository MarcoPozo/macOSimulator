import "./Window.css";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";

import { useWindowDrag } from "../../hooks/useWindowDrag";
import {
  LuX,
  LuMinus,
  LuPlus,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";

const TABS = [
  { id: "all", label: "Todo" },
  { id: "photos", label: "Fotos" },
  { id: "videos", label: "Videos" },
];

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

export default function Window({
  title = "Fotos",
  width = 560,
  height = 360,
  x = 120,
  y = 120,
  stageRef,
  minimized = false,
  onClose,
  onMinimize,
  isActive = false,
  zIndex = 1,
  onFocus,
}) {
  const isResponsive = useMediaQuery("(max-width: 600px)");

  const [navLock, setNavLock] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewer, setViewer] = useState({ open: false, index: 0 });
  const [media, setMedia] = useState({ photos: [], videos: [] });
  const [isMaximized, setIsMaximized] = useState(false);
  const [restore, setRestore] = useState({ x, y, width, height });

  useEffect(() => {
    let alive = true;

    fetch("/multimedia/media.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (!alive) return;

        setMedia({
          photos: Array.isArray(data?.photos) ? data.photos : [],
          videos: Array.isArray(data?.videos) ? data.videos : [],
        });
      })
      .catch(() => {
        if (alive) setMedia({ photos: [], videos: [] });
      });

    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => {
    if (activeTab === "photos") return media.photos;
    if (activeTab === "videos") return media.videos;
    return [...media.photos, ...media.videos];
  }, [activeTab, media.photos, media.videos]);

  const openViewer = (index) => setViewer({ open: true, index });
  const closeViewer = () => setViewer({ open: false, index: 0 });

  const prevItem = () => {
    if (navLock || viewer.index === 0) return;
    setNavLock(true);
    setViewer((v) => ({ ...v, index: v.index - 1 }));
    setTimeout(() => setNavLock(false), 120);
  };

  const nextItem = () => {
    if (navLock || viewer.index === items.length - 1) return;
    setNavLock(true);
    setViewer((v) => ({ ...v, index: v.index + 1 }));
    setTimeout(() => setNavLock(false), 120);
  };

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
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`window__sideItem ${
                  activeTab === tab.id ? "window__sideItem--active" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </aside>

          <section className="window__content">
            <div className="window__grid">
              {items.map((item, i) => {
                const isVideo = item.src.startsWith("videos/");

                return (
                  <button
                    key={item.id}
                    className="window__thumb"
                    type="button"
                    onClick={() => openViewer(i)}
                    aria-label={`Abrir ${item.id}`}>
                    {isVideo ? (
                      <video
                        className="window__thumbMedia"
                        src={`/multimedia/${item.src}`}
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img
                        className="window__thumbMedia"
                        src={`/multimedia/${item.src}`}
                        alt=""
                        loading="lazy"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {viewer.open &&
          createPortal(
            <div className="viewer" aria-modal="true" role="dialog">
              <div className="viewer__backdrop" onClick={closeViewer} />

              <div className="viewer__content" role="document">
                <div className="viewer__media">
                  {(() => {
                    const current = items[viewer.index];
                    const isVideo = current.src.startsWith("videos/");

                    return isVideo ? (
                      <video
                        src={`/multimedia/${current.src}`}
                        controls
                        autoPlay
                        className="viewer__mediaEl"
                      />
                    ) : (
                      <img
                        src={`/multimedia/${current.src}`}
                        alt=""
                        className="viewer__mediaEl"
                      />
                    );
                  })()}
                </div>

                <button
                  className="viewer__btn viewer__btn--left"
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    prevItem();
                  }}
                  disabled={viewer.index === 0 || navLock}
                  aria-label="Anterior">
                  <LuChevronLeft />
                </button>

                <button
                  className="viewer__btn viewer__btn--right"
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextItem();
                  }}
                  disabled={viewer.index === items.length - 1 || navLock}
                  aria-label="Siguiente">
                  <LuChevronRight />
                </button>

                <button
                  className="viewer__btn viewer__btn--close"
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeViewer();
                  }}
                  aria-label="Cerrar">
                  <LuX />
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </section>
  );
}
