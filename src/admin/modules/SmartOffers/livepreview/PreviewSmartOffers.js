import Style1 from "./Style1";
import Style2 from "./Style2";

import "./live-style.css";
import { __ } from "@wordpress/i18n";

const PreviewSmartOffers = ({ settings = {} }) => {
  const style = settings?.offer_style || "style1";

  //Tab click → Design SelectControl change
  const changeStyle = (value) => {
    window.dispatchEvent(
      new CustomEvent("storeone:changeListStyle", {
        detail: { style: value },
      }),
    );
  };

  if (!style) {
    return (
      <div className="s1-fbt-preview-loader">
        <div className="s1-spinner"></div>
      </div>
    );
  }

  return (
    <div className="s1-fbt-preview-wrap">
      {/* ================= STYLE TABS ================= */}
      <div className="s1-style-tabs">
        <button
          className={`s1-style-tab ${style === "style1" ? "active" : ""}`}
          onClick={() => changeStyle("style1")}
        >
          <span> {__("Default", "th-store-one")}</span>
        </button>

        <button
          className={`s1-style-tab ${style === "style2" ? "active" : ""}`}
          onClick={() => changeStyle("style2")}
        >
          <span> {__("Modern", "th-store-one")}</span>
        </button>
      </div>
      {/* ================= PREVIEW ================= */}
      {style === "style1" && <Style1 settings={settings} />}
      {style === "style2" && <Style2 settings={settings} />}
    </div>
  );
};

export default PreviewSmartOffers;
