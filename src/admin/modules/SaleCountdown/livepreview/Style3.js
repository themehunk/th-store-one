import { useEffect, useRef, useState } from "@wordpress/element";

const Style3 = ({ settings = {} }) => {
 const alignment = settings?.alignmentSingle || "center";
 const bg = settings?.single_bg_color || "#ffffff";
  const text = settings?.single_text_color || "#111";
const timerBg = settings?.single_timer_bg_color || "#222";
  const timerColor = settings?.single_timer_color || "#fff";
  const barColor = settings?.single_sold_bar_bg_color || "#ef4444";

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

  //fixed end time
  const endRef = useRef(Date.now() + 3 * 60 * 60 * 1000);

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

  // dummy stock
  const sold = 32;
  const total = 50;
  const percent = (sold / total) * 100;

  return (
    <div
       className={`s1-style s1-boxed s1-align-${alignment}`}
      style={{
        color: text,
        background: bg,
        padding: "30px",
        borderRadius: "8px",
        ...getBorderStyle(settings.border),
      }}
    >

      {/*TOP MESSAGE */}
      <div style={{ marginBottom: "12px", fontWeight: 500 }}>
        Hurry! Only few left in stock
      </div>

      {/* TIMER */}
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "12px" }}>

        <div className="box" style={{background: timerBg, color: timerColor}}>
          <span>{String(time.h).padStart(2, "0")}</span>
          <small>HRS</small>
        </div>

        <div className="box" style={{background: timerBg, color: timerColor}}>
          <span>{String(time.m).padStart(2, "0")}</span>
          <small>MIN</small>
        </div>

        <div className="box" style={{background: timerBg, color: timerColor}}>
          <span>{String(time.s).padStart(2, "0")}</span>
          <small>SEC</small>
        </div>

      </div>

      {/*STOCK BAR */}
      <div
        className="s1-stock-bar"
        style={{
          margin: "auto",
          height: "6px",
          background: "rgba(0,0,0,0.08)",
          borderRadius: "6px",
          overflow: "hidden",
          width:"250px",
        }}
      >
        <div
          className="s1-progress"
          style={{
            width: `${percent}%`,
            height: "100%",
            background: barColor,
            borderRadius: "6px",
          }}
        />
      </div>

      {/* STOCK TEXT */}
      <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.7 }}>
        {sold} sold • {total - sold} left
      </div>

    </div>
  );
};

export default Style3;