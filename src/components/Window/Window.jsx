import { useMemo, useState } from "react";
import { LuX, LuMinus, LuPlus } from "react-icons/lu";
import "./Window.css";
import { useWindowDrag } from "../../hooks/useWindowDrag";

const TABS = [
  { id: "all", label: "Todo" },
  { id: "photos", label: "Fotos" },
  { id: "videos", label: "Videos" },
];

export default function Window({
  title = "Finder",
  width = 560,
  height = 360,
  x = 120,
  y = 120,
  stageRef,

  minimized = false,
  onClose,
  onMinimize,
}) {
  const [activeTab, setActiveTab] = useState("all");

  const drag = useWindowDrag({
    initialX: x,
    initialY: y,
    width,
    edgePadding: 120,
    overflow: 30,
    containerRef: stageRef,
  });

  const ariaTitle = useMemo(
    () =>
      `Ventana ${title} - ${TABS.find((t) => t.id === activeTab)?.label ?? ""}`,
    [title, activeTab],
  );

  return (
    <section
      className={`window ${minimized ? "window--minimized" : ""}`}
      style={{
        width,
        height,
        transform: `translate(${drag.x}px, ${drag.y}px)`,
      }}
      aria-label={ariaTitle}>
      <header className="window__titlebar" {...drag.bindTitlebar}>
        <div className="window__traffic" aria-label="Controles de ventana">
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

        <div className="window__title" title={title}>
          {title}
        </div>

        <div className="window__spacer" aria-hidden="true" />
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

        <section className="window__content" aria-hidden="true" />
      </div>
    </section>
  );
}
