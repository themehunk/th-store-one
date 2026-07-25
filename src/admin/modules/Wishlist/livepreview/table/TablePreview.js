import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

import Normal from "./Normal";
import Modern from "./Modern";
import Traditional from "./Traditional";

const TablePreview = ({ settings = {} }) => {
  const [style, setStyle] = useState("classic");

  return (
    <div className="s1-table-preview">
      <div className="s1-preview-header">
        <h3>{__("Wishlist Table Preview", "th-store-one")}</h3>

        <p>
          {__("Choose a preview style for the wishlist page.", "th-store-one")}
        </p>
      </div>

      {/* Preview Tabs */}

      <div className="s1-table-style-tabs">
        <button
          className={`s1-table-style-tab ${
            style === "classic" ? "active" : ""
          }`}
          onClick={() => setStyle("classic")}
        >
          {__("Classic", "th-store-one")}
        </button>

        <button
          className={`s1-table-style-tab ${style === "modern" ? "active" : ""}`}
          onClick={() => setStyle("modern")}
        >
          {__("Modern", "th-store-one")}
        </button>

        <button
          className={`s1-table-style-tab ${
            style === "minimal" ? "active" : ""
          }`}
          onClick={() => setStyle("minimal")}
        >
          {__("Minimal", "th-store-one")}
        </button>
      </div>

      {/* Preview */}

      <div className="s1-table-preview-box">
        {style === "classic" && <Normal settings={settings} />}

        {style === "modern" && <Modern settings={settings} />}

        {style === "minimal" && <Traditional settings={settings} />}
      </div>
    </div>
  );
};

export default TablePreview;
