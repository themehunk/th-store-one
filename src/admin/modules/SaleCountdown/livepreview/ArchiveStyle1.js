import { useEffect, useRef, useState } from "@wordpress/element";

const ArchiveStyle1 = ({ settings = {} }) => {
  const alignment = settings?.alignmentArchive || "center";

  const bg = settings?.archive_bg_color || "#f5f6f8";
  const text = settings?.archive_text_color || "#d63638";
  const timerColor = settings?.archive_timer_color || "#111";
  const barColor = settings?.archive_sold_bar_bg_color || "#d63638";

  const showMessage = settings?.show_message !== false; // Default true
  const showStockBar = settings?.show_stock_bar !== false; // Default true

  const sold = 32;
  const total = 50;
  const percent = (sold / total) * 100;

  // fixed end time (no reset)
  const endRef = useRef(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

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
      gift: "🎁",
      fire: "🔥",
      flash: "⚡",
      save: "💰",
      discount: "🏷️",
      bogo: "🎉",
      rocket: "🚀",
      star: "⭐",
      trophy: "🏆",
      gem: "💎",
      crown: "👑",
      cart: "🛍️",
      ribbon: "🎀",
      star2: "🌟",
      magic: "🪄",
      money: "💸",
      package: "📦",
      clover: "🍀",
      party: "🥳",
      dart: "🎯",
      clock: "⏳",
      sad: "😢",
      heart: "❤️",
    };

    return map[settings?.selected_icon] || null;
  };
  return (
    <div
      className={`s1-ac-style1 s1-align-${alignment}`}
      style={{
        background: bg,
        color: text,
        padding: "20px",
        borderRadius: "6px",
      }}
    >
      {/* MESSAGE */}
      {showMessage && (
        <div className="s1-ac-msg" style={{ color: text }}>
          {getIcon() && <span className="s1-msg-icon">{getIcon()}</span>}Hurry!
          Only few left
        </div>
      )}

      {/* TIMER */}
      <div
        className="s1-ac-timer"
        style={{ color: timerColor, marginTop: "4px" }}
      >
        {String(time.d).padStart(2, "0")}d : {String(time.h).padStart(2, "0")}h
        : {String(time.m).padStart(2, "0")}m : {String(time.s).padStart(2, "0")}
        s
      </div>

      {/* STOCK */}

      {/* BAR */}
      {showStockBar && (
        <div
          className="s1-ac-bar"
          style={{
            marginTop: "6px",
            height: "6px",
            background: "rgba(0,0,0,0.08)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            className="s1-ac-fill"
            style={{
              width: `${percent}%`,
              background: barColor,
              height: "100%",
              borderRadius: "6px",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ArchiveStyle1;
