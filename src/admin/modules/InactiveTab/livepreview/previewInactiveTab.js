import { useEffect, useState } from "@wordpress/element";
import "./live-style.css";

const PreviewInactiveTab = ({ settings = {} }) => {
  const rule = settings;

  const [messages, setMessages] = useState([]);
  const [icons, setIcons] = useState([]);
  const [index, setIndex] = useState(0);

  /* ---------- ICON HELPER ---------- */
  const getIcon = (item) => {
    if (!item?.icon_enabled) return null;

    if (item.icontype === "image" && item.image_url) {
      return <img src={item.image_url} alt="" width="16" height="16" />;
    }

    if (item.icontype === "custom_svg" && item.custom_svg) {
      return (
        <span
          dangerouslySetInnerHTML={{ __html: item.custom_svg }}
        />
      );
    }

    const map = {
      alert: "⚡",
      cart: "🛍️",
      fire: "🔥",
      clock: "⏳",
      sad: "😢",
      heart: "❤️",
    };

    return <span>{map[item.selected_icon] || "⚡"}</span>;
  };

  /* ---------- PREPARE DATA ---------- */
  useEffect(() => {
    if (!rule || !Object.keys(rule).length) return;

    let msgs = [];
    let icns = [];

    // dynamic / custom
    const baseText =
      rule.message_type === "dynamic"
        ? rule.dynamic_template
        : rule.custom_message;

    if (baseText) {
      msgs.push(baseText.replace("{cart_count}", "3"));
      icns.push(getIcon(rule));
    }

    // rotation
    if (rule.rotation_enabled && rule.rotation_messages?.length) {
      rule.rotation_messages.forEach((item) => {
        msgs.push(item.text || "");
        icns.push(getIcon(item));
      });
    }

    // fallback
    if (!msgs.length) {
      msgs = ["Preview message"];
      icns = [<span>⚡</span>];
    }

    setMessages(msgs);
    setIcons(icns);
    setIndex(0);

  }, [JSON.stringify(rule)]); // 🔥 LIVE FIX

  /* ---------- ROTATION ---------- */
  useEffect(() => {
    if (!messages.length) return;

    let timeout;
    let interval;

    timeout = setTimeout(() => {
      let i = 0;

      setIndex(i);
      i++;

      if (messages.length > 1) {
        interval = setInterval(() => {
          setIndex((prev) => (prev + 1) % messages.length);
        }, rule?.interval || 2000);
      }

    }, rule?.delay || 0);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };

  }, [messages, JSON.stringify(rule)]); // 🔥 LIVE FIX

  /* ---------- RENDER ---------- */
  return (
    <div className="s1-inactive-preview-wrap">
      <div className="s1-browser-tab">

        <div className="s1-browser-msg">
          <div className="s1-tab-favicon">
            {icons[index] ?? "⚡"}
          </div>

          <div className="s1-tab-title">
            {messages[index] ?? "Preview message"}
          </div>
        </div>

        <div className="s1-tab-close">✕</div>

      </div>
    </div>
  );
};

export default PreviewInactiveTab;