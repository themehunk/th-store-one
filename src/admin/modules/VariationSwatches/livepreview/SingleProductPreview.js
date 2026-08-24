import { __ } from "@wordpress/i18n";
import VariationSwatches from "./VariationSwatches";

const SingleProductPreview = ({ settings = {} }) => {
  return (
    <div className="s1-product-preview">
      <div className="s1-main-product">
        {/* Product Image Skeleton */}
        <div className="s1-main-thumb">
          <div className="static-skeleton static-main-img">
            <span />
          </div>
        </div>

        {/* Product Information */}
        <div className="s1-main-info">
          <div className="static-skeleton static-title" />

          <div className="static-skeleton static-price" />

          {/* Variation Swatches */}
          <VariationSwatches settings={settings} />

          <div className="static-skeleton static-cart" />
        </div>
      </div>
    </div>
  );
};

export default SingleProductPreview;
