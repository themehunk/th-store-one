import { __ } from "@wordpress/i18n";
import VariationSwatches from "./VariationSwatches";

const CatalogPreview = ({ settings = {} }) => {
  return (
    <div className="s1-catalog-preview">
      <div className="s1-catalog-product">
        {/* Product Image Skeleton */}
        <div className="s1-catalog-image">
          <div className="static-skeleton static-catalog-img">
            <span />
          </div>
        </div>

        {/* Product Info */}
        <div className="s1-catalog-product-info">
          <div className="static-skeleton static-catalog-title" />

          <div className="static-skeleton static-catalog-price" />

          {/* Variation Swatches */}
          <VariationSwatches settings={settings} catalog />

          <div className="static-skeleton static-catalog-button" />
        </div>
      </div>
    </div>
  );
};

export default CatalogPreview;
