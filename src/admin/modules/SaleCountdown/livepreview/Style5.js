import { useEffect, useRef, useState } from "@wordpress/element";
import { getCountdownIcon } from "./countdownHelpers";
const Style5 = ({ settings = {} }) => {
  const alignment = settings?.alignmentSingle || "center";
  const bg = settings?.single_bg_color || "#faeceb";
  const text = settings?.single_text_color || "#333";
  const timerColor = settings?.single_timer_color || "#ef4444";
  const cntPadding = settings?.cnt_padding || {};

  const getBorderStyle = (border = {}) => ({
    borderStyle: border.style || "dashed",
    borderColor: border.color || "#f3c6c6",

    borderTopWidth: border?.width?.top || "1px",
    borderRightWidth: border?.width?.right || "1px",
    borderBottomWidth: border?.width?.bottom || "1px",
    borderLeftWidth: border?.width?.left || "1px",

    borderTopLeftRadius: border?.radius?.top || "10px",
    borderTopRightRadius: border?.radius?.right || "10px",
    borderBottomRightRadius: border?.radius?.bottom || "10px",
    borderBottomLeftRadius: border?.radius?.left || "10px",
  });

  const endRef = useRef(
    Date.now() + 4 * 24 * 60 * 60 * 1000 + 21 * 60 * 60 * 1000,
  );

  const [time, setTime] = useState(getTime());

  function getTime() {
    const diff = Math.max(0, endRef.current - Date.now());

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

  const icon = getCountdownIcon(settings?.selected_icon);

  return (
    <div
      className="s1-scarcity-style-5"
      style={{
        background: bg,
        color: text,
        padding: `${cntPadding.top || "20px"} ${cntPadding.right || "20px"} ${
          cntPadding.bottom || "20px"
        } ${cntPadding.left || "20px"}`,
        ...getBorderStyle(settings.border),
        textAlign: alignment,
      }}
    >
      <div
        className="s1-style5-title"
        style={{
          color: text,
        }}
      >
        {icon && <span className="s1-msg-icon">{icon}</span>}{" "}
        {settings?.sale_message || "Hurry Up! Sale ends in:"}
      </div>

      <div
        className="s1-style5-timer"
        style={{
          color: timerColor,
          justifyContent: alignment,
        }}
      >
        <span className="num">{String(time.d).padStart(2, "0")}</span>
        <span className="label">days</span>

        <span
          className="colon"
          style={{
            color: timerColor,
          }}
        >
          :
        </span>

        <span className="num">{String(time.h).padStart(2, "0")}</span>
        <span className="label">hours</span>

        <span
          className="colon"
          style={{
            color: timerColor,
          }}
        >
          :
        </span>

        <span className="num">{String(time.m).padStart(2, "0")}</span>
        <span className="label">mins</span>

        <span
          className="colon"
          style={{
            color: timerColor,
          }}
        >
          :
        </span>

        <span className="num">{String(time.s).padStart(2, "0")}</span>
        <span className="label">secs</span>
      </div>
    </div>
  );
};

export default Style5;
