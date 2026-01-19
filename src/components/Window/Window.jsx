import { LuX, LuMinus, LuPlus } from "react-icons/lu";
import "./Window.css";
import { useWindowDrag } from "../../hooks/useWindowDrag";

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
            aria-label="Maximizar (visual)">
            <LuPlus className="window__dotIcon" />
          </button>
        </div>

        <div className="window__title" title={title}>
          {title}
        </div>

        <div className="window__spacer" aria-hidden="true" />
      </header>

      <div className="window__content" aria-hidden="true" />
    </section>
  );
}
