import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

import MenuCartPreview from "./MenuCartPreview";
import SideCartPreview from "./SideCartPreview";
import FloatingCartPreview from "./FloatingCartPreview";

import "./live-style.css";

const PreviewCart = ({ settings = {} }) => {
  // By default first tab open
  const [preview, setPreview] = useState("menu-cart");

  const changePreview = (value) => {
    setPreview(value);

    window.dispatchEvent(
      new CustomEvent("storeone:changeCartPreview", {
        detail: {
          preview: value,
        },
      }),
    );
  };

  return (
    <div className="s1-cart-preview-wrap">
      <div className="s1-style-tabs">
        <button
          type="button"
          className={`s1-style-tab ${preview === "menu-cart" ? "active" : ""}`}
          onClick={() => changePreview("menu-cart")}
        >
          <span>{__("Menu Cart", "th-store-one")}</span>
        </button>
        <button
          type="button"
          className={`s1-style-tab ${
            preview === "floating-cart" ? "active" : ""
          }`}
          onClick={() => changePreview("floating-cart")}
        >
          <span>{__("Floating Cart", "th-store-one")}</span>
        </button>

        <button
          type="button"
          className={`s1-style-tab ${preview === "side-cart" ? "active" : ""}`}
          onClick={() => changePreview("side-cart")}
        >
          <span>{__("Side Cart", "th-store-one")}</span>
        </button>
      </div>

      <div className="s1-cart-preview-content">
        {preview === "menu-cart" && <MenuCartPreview settings={settings} />}

        {preview === "side-cart" && <SideCartPreview settings={settings} />}
        {preview === "floating-cart" && (
          <FloatingCartPreview settings={settings} />
        )}
      </div>
    </div>
  );
};

export default PreviewCart;
