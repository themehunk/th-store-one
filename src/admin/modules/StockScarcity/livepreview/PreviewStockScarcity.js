import { useEffect, useState } from "@wordpress/element";
import "./live-style.css";

const PreviewStockScarcity = ({ settings = {} }) => {
  const rule = settings;

  const [message, setMessage] = useState("");
  const [percentage, setPercentage] = useState(30);

  /* ---------- PREPARE DATA ---------- */
  useEffect(() => {
    if (!rule || !Object.keys(rule).length) return;

    // demo values (preview only)
    const stock = 20;
    const sold = 35;

    let text = rule.message || "Hurry! Only {stock} left";

    text = text.replace(
  "{stock}",
  `<span class="s1-stock-highlight">${stock}</span>`
);

if (rule.sold?.enable) {
  text = text.replace(
    "{sold}",
    `<span class="s1-sold-highlight">${sold}</span>`
  );
} else {
  text = text.replace("{sold}", "");
}

    if (rule.sold?.enable) {
      text = text.replace("{sold}", sold);
    } else {
      text = text.replace("{sold}", "");
    }

    setMessage(text);

    /* ---------- PROGRESS LOGIC ---------- */
    let percent = 30;

    if (rule.stock_mode === "fake") {
      percent = (stock / (rule.max_stock || 20)) * 100;
    } else {
      // real preview fallback
      percent = 40;
    }

    setPercentage(percent);

  }, [JSON.stringify(rule)]);

  /* ---------- STYLE ---------- */
  const getBarStyle = () => {
    const start = rule.bar_strt_clr;
    const end = rule.bar_end_clr;

    if (start?.gradient) {
      return {
        background: start.gradient,
      };
    }

    if (typeof start === "string") {
      return {
        background: start,
      };
    }

    return {
      background: "#f97316",
    };
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="s1-stock-preview-wrap">

      <div className="s1-stock-preview-box">

        {/* MESSAGE */}
        <div
          className="s1-stock-message"
          style={{
            color:
              rule.message_clr?.color ||
              rule.message_clr ||
              "#111",
              fontSize: `${rule.font_size || 16}px`,
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </div>

        {/* BAR */}
        {rule.show_progress && (
          <div className="s1-stock-bar-bg" style={{
                background:rule.bar_end_clr || "#d1d5db",
                height: `${rule.bar_height || 12}px`,
                
              }}>

            <div
              className="s1-stock-bar-fill"
              style={{
                width: `${percentage}%`,
                ...getBarStyle(),
              }}
            />

          </div>
        )}

      </div>
      <style>
{`
  .s1-stock-highlight {
    color: ${rule.highlight_clr || "#111"};
    font-weight: 700;
  }

  .s1-sold-highlight {
    color: ${rule.highlight_clr || "#111"};
    font-weight: 600;
  }
`}
</style>
    </div>
  );
};

export default PreviewStockScarcity;