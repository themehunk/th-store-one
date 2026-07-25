import { useState } from "@wordpress/element";
import ButtonPreview from "./button/ButtonPreview";
import TablePreview from "./table/TablePreview";
import "./live-style.css";
import { __ } from "@wordpress/i18n";

const PreviewWishlist = ({ settings = {} }) => {
  const [preview, setPreview] = useState(
    settings?.wishlist_preview || "button",
  );

  const changePreview = (value) => {
    setPreview(value);

    window.dispatchEvent(
      new CustomEvent("storeone:changeWishlistPreview", {
        detail: { preview: value },
      }),
    );
  };

  return (
    <div className="s1-fbt-preview-wrap">
      <div className="s1-style-tabs">
        <button
          className={`s1-style-tab ${preview === "button" ? "active" : ""}`}
          onClick={() => changePreview("button")}
        >
          <span>{__("Button", "th-store-one")}</span>
        </button>

        <button
          className={`s1-style-tab ${preview === "table" ? "active" : ""}`}
          onClick={() => changePreview("table")}
        >
          <span>{__("Table", "th-store-one")}</span>
        </button>
      </div>

      {preview === "button" && <ButtonPreview settings={settings} />}

      {preview === "table" && <TablePreview settings={settings} />}
    </div>
  );
};

export default PreviewWishlist;
