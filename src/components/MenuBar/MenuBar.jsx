import "./MenuBar.css";
import { useEffect, useMemo, useState } from "react";

import appleIcon from "../../assets/icons/menubar/apple-icon.webp";
import controlCenter from "../../assets/icons/menubar/control-center.webp";

function formatDateTime(date) {
  const locale = "es-EC";

  const parts = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const wd = (map.weekday || "").replace(".", "");
  const mo = (map.month || "").replace(".", "");

  return `${wd} ${map.day} ${mo} ${map.hour}:${map.minute}`;
}

export default function MenuBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const label = useMemo(() => formatDateTime(now), [now]);
  const batteryPct = 100;

  return (
    <header className="menuBar" aria-label="Menu bar">
      <nav className="menuBar__inner" aria-label="Menu bar content">
        <div className="menuBar__left">
          <button
            className="menuBar__chip menuBar__chipBtn"
            aria-label="Apple"
            type="button">
            <img
              className="menuBar__apple"
              src={appleIcon}
              alt="Apple"
              draggable="false"
            />
          </button>

          <button
            className="menuBar__chip menuBar__chipBtn menuBar__chipBtn--bold"
            type="button">
            Finder
          </button>

          <button className="menuBar__chip menuBar__chipBtn" type="button">
            Archivo
          </button>
          <button className="menuBar__chip menuBar__chipBtn" type="button">
            Edición
          </button>
          <button className="menuBar__chip menuBar__chipBtn" type="button">
            Ver
          </button>
          <button className="menuBar__chip menuBar__chipBtn" type="button">
            Ir
          </button>
          <button className="menuBar__chip menuBar__chipBtn" type="button">
            Ventana
          </button>
          <button className="menuBar__chip menuBar__chipBtn" type="button">
            Ayuda
          </button>
        </div>

        <div className="menuBar__right">
          <div
            className="menuBar__chip menuBar__battery"
            title="Batería"
            aria-label={`Batería ${batteryPct}%`}>
            <span className="menuBar__batteryText">{batteryPct}%</span>

            <span className="menuBar__batteryCase" aria-hidden="true">
              <span
                className="menuBar__batteryFill"
                style={{ width: `${batteryPct}%` }}
              />
            </span>
          </div>

          <button
            className="menuBar__chip menuBar__chipBtn menuBar__iconBtn"
            type="button"
            aria-label="Wi-Fi"
            title="Wi-Fi">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="menuBar__svg">
              <path d="M12 6c3.537 0 6.837 1.353 9.293 3.809l1.414-1.414C19.874 5.561 16.071 4 12 4 7.929 4.001 4.126 5.561 1.293 8.395l1.414 1.414C5.163 7.353 8.463 6 12 6z" />
              <path d="M20.437 11.293c-4.572-4.574-12.301-4.574-16.873 0l1.414 1.414c3.807-3.807 10.238-3.807 14.045 0l1.414-1.414z" />
              <path d="M17.671 14.307c-3.074-3.074-8.268-3.074-11.342 0l1.414 1.414c2.307-2.307 6.207-2.307 8.514 0l1.414-1.414z" />
              <circle cx="12" cy="18" r="2" />
            </svg>
          </button>

          <button
            className="menuBar__chip menuBar__chipBtn menuBar__iconBtn"
            type="button"
            aria-label="Buscar"
            title="Buscar">
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="menuBar__svg">
              <path d="M10 18c1.846 0 3.543-.635 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396C17.365 13.543 18 11.846 18 10c0-4.411-3.589-8-8-8S2 5.589 2 10s3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
            </svg>
          </button>

          <button
            className="menuBar__chip menuBar__chipBtn menuBar__iconBtn"
            type="button"
            aria-label="Centro de Control"
            title="Centro de Control">
            <img
              className="menuBar__imgIcon"
              src={controlCenter}
              alt=""
              draggable="false"
            />
          </button>

          <span className="menuBar__chip menuBar__clock" title="Fecha y hora">
            {label}
          </span>
        </div>
      </nav>
    </header>
  );
}
