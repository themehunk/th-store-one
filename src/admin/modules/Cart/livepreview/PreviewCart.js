import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

import MenuCartPreview from "./MenuCartPreview";
import SideCartPreview from "./SideCartPreview";
import FloatingCartPreview from "./FloatingCartPreview";
import MobileSideCartPreview from "./MobileSideCartPreview";

import "./live-style.css";

const PreviewCart = ({ settings = {} }) => {
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
    <div className="s1-cart-preview">
      <div className="s1-style-tabs">
        {/* Menu Cart */}
        <button
          type="button"
          className={`s1-style-tab ${preview === "menu-cart" ? "active" : ""}`}
          onClick={() => changePreview("menu-cart")}
        >
          {__("Menu Cart", "th-store-one")}
        </button>

        {/* Floating Cart */}
        <button
          type="button"
          className={`s1-style-tab ${
            preview === "floating-cart" ? "active" : ""
          }`}
          onClick={() => changePreview("floating-cart")}
        >
          {__("Floating Cart", "th-store-one")}
        </button>

        {/* Side Cart */}
        <button
          type="button"
          className={`s1-style-tab ${preview === "side-cart" ? "active" : ""}`}
          onClick={() => changePreview("side-cart")}
        >
          {__("Side Cart", "th-store-one")}
        </button>

        {/* Mobile */}
        <button
          type="button"
          className={`s1-style-tab ${preview === "mobile" ? "active" : ""}`}
          onClick={() => changePreview("mobile")}
        >
          {__("Mobile Cart", "th-store-one")}
        </button>
      </div>

      <div className="s1-cart-preview-content">
        {preview === "menu-cart" && <MenuCartPreview settings={settings} />}

        {preview === "floating-cart" && (
          <FloatingCartPreview settings={settings} />
        )}

        {preview === "side-cart" && (
          <SideCartPreview settings={settings} previewType={preview} />
        )}

        {preview === "mobile" && <MobileSideCartPreview settings={settings} />}
      </div>
    </div>
  );
};

export default PreviewCart;
