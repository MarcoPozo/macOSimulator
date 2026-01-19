import "./Window.css";
import { useMemo, useState } from "react";
import {
  LuX,
  LuMinus,
  LuPlus,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import { createPortal } from "react-dom";
import media from "../../assets/multimedia/media.json";
import { useWindowDrag } from "../../hooks/useWindowDrag";

const TABS = [
  { id: "all", label: "Todo" },
  { id: "photos", label: "Fotos" },
  { id: "videos", label: "Videos" },
];

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
}) {
  const [navLock, setNavLock] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewer, setViewer] = useState({ open: false, index: 0 });

  const items = useMemo(() => {
    if (activeTab === "photos") return media.photos;
    if (activeTab === "videos") return media.videos;
    return [...media.photos, ...media.videos];
  }, [activeTab]);

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
  });

  return (
    <section
      className={`window ${minimized ? "window--minimized" : ""}`}
      style={{
        width,
        height,
        transform: `translate(${drag.x}px, ${drag.y}px)`,
      }}
      aria-label={`Ventana ${title}`}>
      <header className="window__titlebar" {...drag.bindTitlebar}>
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
            aria-label="Maximizar (visual)"
            onPointerDown={(e) => e.stopPropagation()}>
            <LuPlus className="window__dotIcon" />
          </button>
        </div>

        <div className="window__title">{title}</div>
        <div className="window__spacer" />
      </header>

      {/* Body */}
      <div className="window__body">
        {/* Sidebar */}
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

        {/* Content */}
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
                      src={`/src/assets/multimedia/${item.src}`}
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      className="window__thumbMedia"
                      src={`/src/assets/multimedia/${item.src}`}
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
                      src={`/src/assets/multimedia/${current.src}`}
                      controls
                      autoPlay
                      className="viewer__mediaEl"
                    />
                  ) : (
                    <img
                      src={`/src/assets/multimedia/${current.src}`}
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
    </section>
  );
}
