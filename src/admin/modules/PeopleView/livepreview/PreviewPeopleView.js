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

      case "group":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 509.421 509.421"
            fill="none"
          >
            <path
              opacity="0.4"
              fill="currentColor"
              d="M409.421,251.348V123.073c-35.366,0-64.139,28.772-64.139,64.138
        S374.055,251.348,409.421,251.348z"
            />

            <path
              opacity="0.4"
              fill="currentColor"
              d="M473.56,187.211c0-35.366-28.772-64.138-64.139-64.138v128.275
        C444.788,251.348,473.56,222.576,473.56,187.211z"
            />

            <path
              opacity="0.4"
              fill="currentColor"
              d="M509.421,366.348c0-55.14-44.859-100-100-100
        c-28.619,0-55.206,12.071-73.879,32.602
        c26.098,21.11,43.814,52.191,47.288,87.398h126.591V366.348z"
            />

            <path
              opacity="0.4"
              fill="currentColor"
              d="M173.879,298.95c-18.673-20.53-45.26-32.602-73.879-32.602
        c-55.14,0-100,44.86-100,100v20h126.59
        C130.065,351.141,147.781,320.06,173.879,298.95z"
            />

            <path
              opacity="0.4"
              fill="currentColor"
              d="M100,251.348V123.073c-35.366,0-64.138,28.772-64.138,64.138
        S64.634,251.348,100,251.348z"
            />

            <path
              opacity="0.4"
              fill="currentColor"
              d="M164.138,187.211c0-35.366-28.772-64.138-64.138-64.138v128.275
        C135.366,251.348,164.138,222.576,164.138,187.211z"
            />

            <path
              fill="currentColor"
              d="M335.542,298.95c-22.114-17.888-50.242-28.619-80.832-28.619v148.76
        h128.75v-20c0-4.3-0.216-8.55-0.63-12.742
        C379.356,351.141,361.64,320.06,335.542,298.95z"
            />

            <path
              fill="currentColor"
              d="M334.71,170.331c0-44.11-35.89-80-80-80v160
        C298.82,250.331,334.71,214.451,334.71,170.331z"
            />

            <path
              fill="currentColor"
              d="M173.879,298.95c-26.098,21.11-43.814,52.191-47.289,87.398
        c-0.414,4.193-0.63,8.443-0.63,12.742v20h128.75v-148.76
        C224.121,270.331,195.993,281.062,173.879,298.95z"
            />

            <path
              fill="currentColor"
              d="M254.71,250.331v-160c-44.11,0-80,35.89-80,80
        C174.71,214.451,210.6,250.331,254.71,250.331z"
            />
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
    background: rule.bg_color?.gradient || rule.bg_color || "",

    border: `1px solid ${rule.border_color?.color || rule.border_color || ""}`,

    color: rule.text_color?.color || rule.text_color || "#111827",

    borderRadius: `${rule.border_radius || 0}px`,

    padding: `${rule.padding_y || 5}px ${rule.padding_x || 10}px`,
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
              color: rule.icon_color?.color || rule.icon_color || "#fff",
              background:
                rule.icon_bg_color?.color || rule.icon_bg_color || "#9e9e9e00",
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
