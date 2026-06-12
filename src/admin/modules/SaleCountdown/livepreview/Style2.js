import { useEffect, useRef, useState } from "@wordpress/element";

const Style2 = ({ settings = {} }) => {
  const alignment = settings?.alignmentSingle || "center";
  const bg = settings?.single_bg_color || "#ffffff";
  const text = settings?.single_text_color || "#111";

  const timerColor = settings?.single_timer_color || "#111";
  const barColor = settings?.single_sold_bar_bg_color || "#ef4444";

  const showMessage = settings?.show_message !== false; // Default true
  const showStockBar = settings?.show_stock_bar !== false; // Default true
  const saleMessage = settings?.sale_message || "Hurry! Offer ends soon";
  const timeFormat = settings?.time_format || "dhms"; // 'dhms' ya 'hms'
  const cntPadding = settings?.cnt_padding || {};

  const getBorderStyle = (border = {}) => ({
    borderStyle: border.style || "",
    borderColor: border.color || "",

    borderTopWidth: border?.width?.top || "",
    borderRightWidth: border?.width?.right || "",
    borderBottomWidth: border?.width?.bottom || "",
    borderLeftWidth: border?.width?.left || "",

    borderTopLeftRadius: border?.radius?.top || "",
    borderTopRightRadius: border?.radius?.right || "",
    borderBottomRightRadius: border?.radius?.bottom || "",
    borderBottomLeftRadius: border?.radius?.left || "",
  });

  // FIXED END TIME (won't reset on re-render)
  const endRef = useRef(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  const [time, setTime] = useState(getTime());

  function getTime() {
    const diff = endRef.current - Date.now();

    return {
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / (1000 * 60)) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const i = setInterval(() => setTime(getTime()), 1000);
    return () => clearInterval(i);
  }, []);

  //dummy stock
  const sold = 32;
  const total = 50;
  const percent = (sold / total) * 100;

  return (
    <div
      className={`s1-style s1-minimal s1-align-${alignment}`}
      style={{
        color: text,
        background: bg,
        padding: `${cntPadding.top || "0px"} ${cntPadding.right || "0px"} ${
          cntPadding.bottom || "0px"
        } ${cntPadding.left || "0px"}`,
        ...getBorderStyle(settings.border),
      }}
    >
      {/* INLINE ROW */}
      <div className="th-inline-wrap">
        {/* MESSAGE + ICON */}
        {showMessage && (
          <span className="th-msg" style={{ color: text }}>
            <span className="th-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke={text} strokeWidth="2" />
                <path
                  d="M12 6v6l4 2"
                  stroke={text}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Hurry! Only few left in stock
          </span>
        )}

        {/* TIMER */}
        <span className="th-timer-inline" style={{ color: timerColor }}>
          {timeFormat === "dhms" && (
            <>
              <span className="d">1 Days</span>

              <div className="dotes">:</div>
            </>
          )}
          <span className="h">{String(time.h).padStart(2, "0")}</span>
          <span className="sep">:</span>
          <span className="m">{String(time.m).padStart(2, "0")}</span>
          <span className="sep">:</span>
          <span className="s">{String(time.s).padStart(2, "0")}</span>
        </span>
      </div>

      {/* STOCK BAR */}
      {showStockBar && (
        <div
          className="s1-stock-bar"
          style={{
            height: "6px",

            borderRadius: "6px",
            overflow: "hidden",
            width: "200px",
            margin: "auto",
          }}
        >
          <div
            className="s1-progress"
            style={{
              width: `${percent}%`,
              height: "100%",
              background: barColor,
              borderRadius: "6px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      )}

      {/* STOCK TEXT */}
    </div>
  );
};

export default Style2;
