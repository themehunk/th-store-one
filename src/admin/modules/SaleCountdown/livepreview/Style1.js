import { useEffect, useRef, useState } from "@wordpress/element";

const Style1 = ({ settings }) => {

  const sold = 32;
  const total = 50;
  const percent = (sold / total) * 100;

  const bg = settings?.single_bg_color || "#111";
  const text = settings?.single_text_color || "#facc15";
  const timerBg = settings?.single_timer_bg_color || "#222";
  const timerColor = settings?.single_timer_color || "#fff";
  const barColor = settings?.single_sold_bar_bg_color || "linear-gradient(90deg, #22c55e, #f97316)";

  // FIXED END TIME (no reset on re-render)
  const endRef = useRef(Date.now() + 5 * 60 * 60 * 1000); // 5 hours

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

  return (
    <div
      className="s1-style s1-default-pro"
      style={{
        background: bg,
        color: text,
      }}
    >

      {/* TOP MESSAGE */}
      <div className="s1-top" style={{ color: text }}>
        Hurry! Only few left in stock
      </div>

      {/* TIMER */}
      <div className="s1-timer">

        <div style={{ background: timerBg }}>
          <span style={{ color: timerColor }}>
            {String(time.h).padStart(2, "0")}
          </span>
          <small style={{ color: timerColor, opacity: 0.3 }}>HRS</small>
        </div>

        <div style={{ background: timerBg }}>
          <span style={{ color: timerColor }}>
            {String(time.m).padStart(2, "0")}
          </span>
          <small style={{ color: timerColor, opacity: 0.3 }}>MIN</small>
        </div>

        <div style={{ background: timerBg }}>
          <span style={{ color: timerColor }}>
            {String(time.s).padStart(2, "0")}
          </span>
          <small style={{ color: timerColor, opacity: 0.3 }}>SEC</small>
        </div>

      </div>

      {/* STOCK INFO */}
      <div className="s1-stock-info">
        <span>{sold} sold</span>
        <span>{total - sold} left</span>
      </div>

      {/* PROGRESS BAR */}
      <div className="s1-stock-bar">
        <div
          className="s1-progress"
          style={{
            width: `${percent}%`,
            background: barColor,
          }}
        />
      </div>

    </div>
  );
};

export default Style1;