import { useEffect, useRef, useState } from "@wordpress/element";

const ArchiveStyle2 = ({ settings = {} }) => {
  const alignment = settings?.alignmentArchive || "center";
  const bg = settings?.archive_bg_color || "#f5f6f8";
  const text = settings?.archive_text_color || "#111";
  const timerBg = settings?.archive_timer_bg_color || "#d7d3d3b8";
  const timerColor = settings?.archive_timer_color || "#111";
  const barColor = settings?.archive_sold_bar_bg_color || "#229fd8";

  const showMessage = settings?.show_message !== false; // Default true
  const showStockBar = settings?.show_stock_bar !== false; // Default true

  const sold = 32;
  const total = 50;
  const percent = (sold / total) * 100;

  //fixed end time (no reset)
  const endRef = useRef(Date.now() + 2 * 24 * 60 * 60 * 1000);

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
      className={`s1-ac-style2 s1-align-${alignment}`}
      style={{
        background: bg,
        color: text,
        padding: "20px",
        borderRadius: "6px",
      }}
    >
      {/* MESSAGE */}
      {showMessage && (
        <div className="s1-ac2-msg" style={{ color: text }}>
          {getIcon() && <span className="s1-msg-icon">{getIcon()}</span>}Hurry!
          Only few left
        </div>
      )}

      {/* TIMER */}
      <div className="s1-ac2-timer">
        <div
          className="s1-ac2-box"
          style={{ background: timerBg, color: timerColor }}
        >
          <span>{String(time.d).padStart(2, "0")}</span>
          <small>D</small>
        </div>

        <div
          className="s1-ac2-box"
          style={{ background: timerBg, color: timerColor }}
        >
          <span>{String(time.h).padStart(2, "0")}</span>
          <small>H</small>
        </div>

        <div
          className="s1-ac2-box"
          style={{ background: timerBg, color: timerColor }}
        >
          <span>{String(time.m).padStart(2, "0")}</span>
          <small>M</small>
        </div>

        <div
          className="s1-ac2-box"
          style={{ background: timerBg, color: timerColor }}
        >
          <span>{String(time.s).padStart(2, "0")}</span>
          <small>S</small>
        </div>
      </div>

      {/* STOCK */}

      {/* BAR */}
      {showStockBar && (
        <div
          className="s1-ac2-bar"
          style={{
            marginTop: "6px",
            height: "6px",
            background: "rgba(0,0,0,0.08)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            className="s1-ac2-fill"
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

export default ArchiveStyle2;
