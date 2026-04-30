import { useEffect, useRef, useState } from "@wordpress/element";

const ArchiveStyle3 = ({ settings = {} }) => {

  const bg = settings?.archive_bg_color || "#fff";
  const text = settings?.archive_text_color || "#d63638";
  const timerBg = settings?.archive_timer_bg_color || "#f5f6f8";
  const timerColor = settings?.archive_timer_color || "#111";
  const barColor = settings?.archive_sold_bar_bg_color || "#d63638";

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

  return (
    <div
      className="s1-ac-style3"
      style={{
        background: bg,
        color: text,
        padding: "20px",
        borderRadius: "8px",
      }}
    >

      {/* MESSAGE */}
      <div className="s1-ac3-msg" style={{ marginBottom: "8px", color: text, }}>
        Hurry! Only few left
      </div>

      {/* TIMER (BOX STYLE) */}
      <div className="s1-ac3-timer">

        <div
          className="s1-ac3-box"
          style={{ background: timerBg, color: timerColor }}
        >
          <span>{String(time.d).padStart(2, "0")}</span>
          <small>D</small>
        </div>

        <div
          className="s1-ac3-box"
          style={{ background: timerBg, color: timerColor }}
        >
          <span>{String(time.h).padStart(2, "0")}</span>
          <small>H</small>
        </div>

        <div
          className="s1-ac3-box"
          style={{ background: timerBg, color: timerColor }}
        >
          <span>{String(time.m).padStart(2, "0")}</span>
          <small>M</small>
        </div>

        <div
          className="s1-ac3-box"
          style={{ background: timerBg, color: timerColor }}
        >
          <span>{String(time.s).padStart(2, "0")}</span>
          <small>S</small>
        </div>

      </div>

      {/* STOCK */}
      <div className="s1-ac3-stock" style={{ marginTop: "6px" ,color: text}}>
        {sold} sold • {total - sold} left
      </div>

      {/* BAR */}
      <div
        className="s1-ac3-bar"
        style={{
          marginTop: "6px",
          height: "6px",
          background: "rgba(0,0,0,0.08)",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <div
          className="s1-ac3-fill"
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

export default ArchiveStyle3;