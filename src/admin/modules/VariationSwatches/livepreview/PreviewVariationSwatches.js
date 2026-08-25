import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

import SingleProductPreview from "./SingleProductPreview";
import CatalogPreview from "./CatalogPreview";

import "./live-style.css";

const PreviewVariationSwatches = ({ settings = {} }) => {
  const [preview, setPreview] = useState("single");

  const changePreview = (value) => {
    setPreview(value);

    window.dispatchEvent(
      new CustomEvent("storeone:changeVariationPreview", {
        detail: {
          preview: value,
        },
      }),
    );
  };

  return (
    <div className="s1-variation-preview-wrap">
      <div className="s1-style-tabs">
        <button
          className={`s1-style-tab ${preview === "single" ? "active" : ""}`}
          onClick={() => changePreview("single")}
        >
          <span>{__("Single Product", "th-store-one")}</span>
        </button>

        <button
          className={`s1-style-tab ${preview === "catalog" ? "active" : ""}`}
          onClick={() => changePreview("catalog")}
        >
          <span>{__("Catalog", "th-store-one")}</span>
        </button>
      </div>

      {preview === "single" && <SingleProductPreview settings={settings} />}

      {preview === "catalog" && <CatalogPreview settings={settings} />}
    </div>
  );
};

export default PreviewVariationSwatches;
