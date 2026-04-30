import { useEffect, useRef, useState } from "@wordpress/element";

const ArchiveStyle1 = ({ settings = {} }) => {

  const bg = settings?.archive_bg_color || "#f5f6f8";
  const text = settings?.archive_text_color || "#d63638";
  const timerColor = settings?.archive_timer_color || "#111";
  const barColor = settings?.archive_sold_bar_bg_color || "#d63638";

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

  return (
    <div
      className="s1-ac-style1"
      style={{
        background: bg,
        color: text,
        padding: "20px",
        borderRadius: "6px",
      }}
    >

      {/* MESSAGE */}
      <div className="s1-ac-msg" style={{ color: text }}>
        <span className="th-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={text} strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke={text} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span> Hurry! Only few left
      </div>

      {/* TIMER */}
      <div
        className="s1-ac-timer"
        style={{ color: timerColor, marginTop: "4px" }}
      >
        {String(time.d).padStart(2, "0")}d :
        {" "}
        {String(time.h).padStart(2, "0")}h :
        {" "}
        {String(time.m).padStart(2, "0")}m :
        {" "}
        {String(time.s).padStart(2, "0")}s
      </div>

      {/* STOCK */}
      <div className="s1-ac-stock" style={{ marginTop: "4px",color: text  }}>
        {sold} sold • {total - sold} left
      </div>

      {/* BAR */}
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

    </div>
  );
};

export default ArchiveStyle1;