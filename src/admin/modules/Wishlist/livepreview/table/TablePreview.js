import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

import Normal from "./Normal";
import Modern from "./Modern";
import Traditional from "./Traditional";

const TablePreview = ({ settings = {} }) => {
  const style = settings?.wishlist_table_style || "classic";
  const changeStyle = (value) => {
    window.dispatchEvent(
      new CustomEvent("storeone:updateWishlistTableStyle", {
        detail: {
          style: value,
        },
      }),
    );
  };

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
          onClick={() => changeStyle("classic")}
        >
          {__("Classic", "th-store-one")}
        </button>

        <button
          className={`s1-table-style-tab ${style === "modern" ? "active" : ""}`}
          onClick={() => changeStyle("modern")}
        >
          {__("Modern", "th-store-one")}
        </button>

        <button
          className={`s1-table-style-tab ${
            style === "minimal" ? "active" : ""
          }`}
          onClick={() => changeStyle("minimal")}
        >
          {__("Traditional", "th-store-one")}
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
