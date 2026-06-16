import { useEffect, useRef, useState } from "@wordpress/element";

const Style1 = ({ settings }) => {
  // --- Live Control Settings ---
  const showMessage = settings?.show_message !== false; // Default true
  const showStockBar = settings?.show_stock_bar !== false; // Default true
  const saleMessage = settings?.sale_message || "Hurry! Offer ends soon";
  const timeFormat = settings?.time_format || "dhms"; // 'dhms' ya 'hms'

  // --- Style Settings ---
  const alignment = settings?.alignmentSingle || "center";
  const bg = settings?.single_bg_color || "#fff0";
  const text = settings?.single_text_color || "#111";
  const timerBg = settings?.single_timer_bg_color || "#d7d3d3b8";
  const timerColor = settings?.single_timer_color || "#111";
  const barColor = settings?.single_sold_bar_bg_color || "#229fd8";
  const cntPadding = settings?.cnt_padding || {};

  const sold = 32;
  const total = 50;
  const percent = (sold / total) * 100;

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

  // FIXED END TIME (5 hours countdown)
  const endRef = useRef(Date.now() + 5 * 60 * 60 * 1000);

  const [time, setTime] = useState(getTime());

  function getTime() {
    const diff = endRef.current - Date.now();

    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / (1000 * 60)) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const i = setInterval(() => setTime(getTime()), 1000);
    return () => clearInterval(i);
  }, []);

  const getIcon = () => {
    const map = {
      fire: "🔥",
      cart: "🛍️",
      clock: "⏳",
      sad: "😢",
      heart: "❤️",
    };

    return map[settings?.selected_icon] || "🔥";
  };

  return (
    <div
      className={`s1-style s1-default-pro s1-align-${alignment}`}
      style={{
        background: bg,
        color: text,
        padding: `${cntPadding.top || "0px"} ${cntPadding.right || "0px"} ${
          cntPadding.bottom || "0px"
        } ${cntPadding.left || "0px"}`,
        ...getBorderStyle(settings.border),
      }}
    >
      {/* 1. SHOW MESSAGE CONTROL */}
      {showMessage && (
        <div className="s1-top" style={{ color: text }}>
          <span className="s1-msg-icon">{getIcon()}</span>
          {saleMessage}
        </div>
      )}

      {/* 2. TIMER CONTROL WITH TIME FORMAT (DHMS vs HMS) */}
      <div className="s1-timer">
        {/* Agar format 'dhms' hai toh hi DAYS dikhao */}
        {timeFormat === "dhms" && (
          <>
            <div className="th-time-bx" style={{ background: timerBg }}>
              <span style={{ color: timerColor }}>
                {String(time.d).padStart(2, "0")}
              </span>
              <small style={{ color: timerColor, opacity: 0.6 }}>DAYS</small>
            </div>
            <div className="dotes" style={{ background: timerBg }}>
              :
            </div>
          </>
        )}

        <div className="th-time-bx" style={{ background: timerBg }}>
          <span style={{ color: timerColor }}>
            {String(time.h).padStart(2, "0")}
          </span>
          <small style={{ color: timerColor, opacity: 0.3 }}>HRS</small>
        </div>
        <div className="dotes" style={{ background: timerBg }}>
          :
        </div>

        <div className="th-time-bx" style={{ background: timerBg }}>
          <span style={{ color: timerColor }}>
            {String(time.m).padStart(2, "0")}
          </span>
          <small style={{ color: timerColor, opacity: 0.3 }}>MIN</small>
        </div>
        <div className="dotes" style={{ background: timerBg }}>
          :
        </div>

        <div className="th-time-bx" style={{ background: timerBg }}>
          <span style={{ color: timerColor }}>
            {String(time.s).padStart(2, "0")}
          </span>
          <small style={{ color: timerColor, opacity: 0.3 }}>SEC</small>
        </div>
      </div>

      {/* 3. SHOW STOCK BAR CONTROL */}
      {showStockBar && (
        <div
          className="s1-stock-bar"
          style={{
            margin: "auto",
            height: "6px",
            background: "rgba(0,0,0,0.08)",
            borderRadius: "6px",
            overflow: "hidden",
            width: "250px",
          }}
        >
          <div
            className="s1-progress"
            style={{
              width: `${percent}%`,
              background: barColor,
            }}
          />
        </div>
      )}
    </div>
  );
};
export default Style1;
