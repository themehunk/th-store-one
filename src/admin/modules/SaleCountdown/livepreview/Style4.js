import { useEffect, useRef, useState } from "@wordpress/element";

const CircleTimer = ({
  value,
  max,
  label,
  progressColor = "#4c6fff",
  textColor = "#111",
}) => {
  const radius = 36;
  const stroke = 2.5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const safeValue = Math.min(value, max);
  const progress = safeValue / max;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="s4-circle-item">
      <div className="s4-svg-wrapper">
        <svg width="84" height="84" className="s4-countdown-svg">
          {/* Background Circle - Isme progressColor ko 10% opacity ke sath lagaya hai taaki back-ring matching dikhe */}
          <circle
            cx="42"
            cy="42"
            r={normalizedRadius}
            stroke={progressColor}
            strokeWidth={stroke}
            opacity="0.12"
            fill="none"
          />

          {/* Active Progress Circle - Isme aapka stroke color dynamically badlega */}
          <circle
            cx="42"
            cy="42"
            r={normalizedRadius}
            stroke={progressColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 42 42)"
            className="s4-circle-progress"
          />

          {/* Number */}
          <text
            x="50%"
            y="43%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="18"
            fontWeight="600"
            fill={textColor}
            className="s4-timer-number"
          >
            {String(value).padStart(2, "0")}
          </text>

          {/* Label */}
          <text
            x="50%"
            y="63%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8.5"
            fontWeight="500"
            fill={textColor}
            className="s4-timer-label-inside"
          >
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
};

const Style4 = ({ settings }) => {
  const alignment = settings?.alignmentSingle || "center";
  const bg = settings?.single_bg_color;
  const text = settings?.single_text_color || "#111";

  // Dynamic stroke/progress color settings se aa raha hai
  const progressColor = settings?.single_sold_bar_bg_color || "#4c6fff";
  const single_timer_color = settings?.single_timer_color || "#111";
  const single_timer_bg_color = settings?.single_timer_bg_color || "#fff";

  const showMessage = settings?.show_message !== false;
  const saleMessage = settings?.sale_message || "Sale ending in";
  const timeFormat = settings?.time_format || "dhms";

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

  // Dummy Time: 5 Days complete countdown
  const dummyDays = 5;
  const endRef = useRef(Date.now() + dummyDays * 24 * 60 * 60 * 1000);

  const getTime = () => {
    const diff = Math.max(0, endRef.current - Date.now());
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / (1000 * 60)) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  };

  const [time, setTime] = useState(getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTime());
    }, 1000);
    return () => clearInterval(interval);
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
      className={`s4-style s4-align-${alignment}`}
      style={{
        background: bg,
        color: text,
        padding: `${cntPadding.top || "0px"} ${cntPadding.right || "0px"} ${
          cntPadding.bottom || "0px"
        } ${cntPadding.left || "0px"}`,
        textAlign: alignment,
        ...getBorderStyle(settings?.border),
      }}
    >
      {showMessage && (
        <div
          className="s4-message"
          style={{
            marginBottom: "18px",
            fontSize: "15px",
            fontWeight: "500",
            color: text,
          }}
        >
          <span className="s1-msg-icon">{getIcon()}</span>
          {saleMessage}
        </div>
      )}

      <div className="s4-timer-wrap">
        {timeFormat === "dhms" && (
          <CircleTimer
            value={time.d}
            max={30}
            label="DAYS"
            progressColor={progressColor}
            textColor={single_timer_color}
          />
        )}

        <CircleTimer
          value={time.h}
          max={24}
          label="HOURS"
          progressColor={progressColor}
          textColor={single_timer_color}
        />

        <CircleTimer
          value={time.m}
          max={60}
          label="MINUTES"
          progressColor={progressColor}
          textColor={single_timer_color}
        />

        <CircleTimer
          value={time.s}
          max={60}
          label="SECONDS"
          progressColor={progressColor}
          textColor={single_timer_color}
        />
      </div>
    </div>
  );
};

export default Style4;
