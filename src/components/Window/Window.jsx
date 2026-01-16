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
        <div className="window__traffic">
          <span className="window__dot window__dot--red" aria-hidden="true" />
          <span
            className="window__dot window__dot--yellow"
            aria-hidden="true"
          />
          <span className="window__dot window__dot--green" aria-hidden="true" />
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
