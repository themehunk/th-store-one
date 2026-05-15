import { useEffect, useState } from "@wordpress/element";
import "./live-style.css";

const PreviewPeopleView = ({ settings = {} }) => {
  const rule = settings;

  const [message, setMessage] = useState("");
  const [count, setCount] = useState(12);

  /* ---------------- ICONS ---------------- */

  const renderIcon = () => {
    if (!rule.icon_enable) return null;

    switch (rule.icon_type) {
      case "users":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
            <circle
              cx="17"
              cy="10"
              r="2.5"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M4 19C4.8 16.8 6.8 15.5 9 15.5C11.2 15.5 13.2 16.8 14 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );

      case "fire":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C13.5 6 17 8 17 13C17 16.3 14.8 19 12 19C9.2 19 7 16.3 7 13C7 10 8.5 8 10 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        );

      case "live":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        );

      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M2 12C3.8 7.5 7.5 5 12 5C16.5 5 20.2 7.5 22 12C20.2 16.5 16.5 19 12 19C7.5 19 3.8 16.5 2 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
    }
  };

  /* ---------------- PREVIEW DATA ---------------- */

  useEffect(() => {
    if (!rule || !Object.keys(rule).length) return;

    let previewCount = 12;

    if (rule.view_mode === "fake") {
      previewCount = rule.fake_view?.default_count || 12;
    }

    if (rule.view_mode === "real") {
      previewCount = 7;
    }

    let text = rule.message || "{count} people are viewing this product";

    /* Dynamic messages */

    if (rule.dynamic_message_enable) {
      if (previewCount <= rule.dynamic_message?.low_threshold) {
        text = rule.dynamic_message?.low_msg;
      } else if (previewCount <= rule.dynamic_message?.medium_threshold) {
        text = rule.dynamic_message?.medium_msg;
      } else {
        text = rule.dynamic_message?.high_msg;
      }
    }

    text = text.replace(
      "{count}",
      `<span class="s1-view-highlight">${previewCount}</span>`,
    );

    setMessage(text);

    setCount(previewCount);
  }, [JSON.stringify(rule)]);

  /* ---------------- STYLE ---------------- */

  const wrapperStyle = {
    background: rule.bg_color?.gradient || rule.bg_color || "#FFF7D6",

    border: `1px solid ${
      rule.border_color?.color || rule.border_color || "#FACC15"
    }`,

    color: rule.text_color?.color || rule.text_color || "#111827",

    borderRadius: `${rule.border_radius || 30}px`,

    padding: `${rule.padding_y || 10}px ${rule.padding_x || 14}px`,
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="s1-people-preview-wrap">
      <div
        className={`s1-people-preview-box layout-${rule.layout_style}`}
        style={wrapperStyle}
      >
        {/* ICON */}
        {rule.icon_enable && (
          <div
            className="s1-people-icon"
            style={{
              color: rule.icon_color?.color || rule.icon_color || "#D97706",
            }}
          >
            {renderIcon()}
          </div>
        )}

        {/* MESSAGE */}
        <div
          className="s1-people-message"
          style={{
            fontSize: `${rule.font_size || 14}px`,
            color: rule.text_color || "#111827",
          }}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: message,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPeopleView;
