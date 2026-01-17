import { LuX, LuMinus, LuPlus } from "react-icons/lu";
import "./Window.css";

export default function Window({
  title = "Finder",
  width = 560,
  height = 360,
  x = 120,
  y = 120,
}) {
  return (
    <section
      className="window"
      style={{
        width,
        height,
        transform: `translate(${x}px, ${y}px)`,
      }}
      aria-label={`Ventana ${title}`}>
      <header className="window__titlebar">
        <div className="window__traffic" aria-label="Controles de ventana">
          <button
            className="window__dotBtn window__dotBtn--red"
            type="button"
            aria-label="Cerrar (visual)">
            <LuX className="window__dotIcon" />
          </button>

          <button
            className="window__dotBtn window__dotBtn--yellow"
            type="button"
            aria-label="Minimizar (visual)">
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
