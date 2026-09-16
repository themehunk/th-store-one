import "./live-style.css";
import { __ } from "@wordpress/i18n";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
const PreviewAdvanceSearch = ({ settings = {} }) => {
  const style = settings?.tapsp_product_search_style || "th-normal";

  const changeStyle = (value) => {
    window.dispatchEvent(
      new CustomEvent("storeone:changeProductSearchStyle", {
        detail: { style: value },
      }),
    );
  };

  return (
    <div className="s1-ntf-preview-wrap">
      {/* Style Tabs */}
      <div className="s1-style-tabs">
        {[
          { id: "th-normal", label: "Default" },
          { id: "th-traditional", label: "Traditional" },
          { id: "th-modern", label: "Modern" },
        ].map((s) => (
          <div
            key={s.id}
            className={`s1-style-tab ${style === s.id ? "active" : ""}`}
            onClick={() => changeStyle(s.id)}
          >
            <div className="s1-style-preview-box">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Preview Area */}
      <div className="s1-preview-area">
        <div className={`s1-search-preview ${style}`}>
          {/* Search Header */}
          <div className="s1-search-header">
            <div className="s1-search-input">
              <span className="s1-search-placeholder">
                {__("Sample", "th-store-one")}
              </span>

              <button type="button" className="s1-search-button">
                <MagnifyingGlassIcon width={28} height={28} />
              </button>
            </div>
          </div>

          {/* DEFAULT STYLE */}
          {style === "th-normal" && (
            <div className="s1-normal-search-results">
              {/* Trending */}
              <div className="s1-search-section">
                <h4>{__("TRENDING NOW", "th-store-one")}</h4>

                <div className="s1-trending-items">
                  <span className="s1-trending-item">Trend1</span>
                  <span className="s1-trending-item">Trend2</span>
                </div>
              </div>

              {/* Category */}
              <div className="s1-search-section s1-category-section">
                <h4>{__("CATEGORY", "th-store-one")}</h4>

                <div className="s1-category-result">
                  <span className="s1-category-name">
                    {__("Sample", "th-store-one")}
                  </span>

                  <span className="s1-category-title">
                    {__("Category", "th-store-one")}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div className="s1-search-section s1-product-section">
                <h4>{__("PRODUCT", "th-store-one")}</h4>

                {/* Product 1 */}
                <div className="s1-search-product">
                  {settings?.tapsp_enable_product_image !== false && (
                    <img
                      src={
                        th_StoreOneAdmin.homeUrl +
                        "wp-content/plugins/th-store-one/assets/images/prd1.png"
                      }
                      className="s1-search-product-image"
                      alt=""
                    />
                  )}

                  <div className="s1-search-product-content">
                    <div className="s1-product-title-row">
                      <strong className="s1-search-product-title">
                        {__("Sample", "th-store-one")}
                      </strong>

                      <span className="s1-product-name">
                        {__("Product", "th-store-one")}
                      </span>

                      {settings?.tapsp_enable_product_sku !== false && (
                        <span className="s1-search-product-sku">
                          ( SKU : Product 01 )
                        </span>
                      )}
                    </div>

                    {settings?.tapsp_enable_product_desc && (
                      <p className="s1-search-product-desc">
                        {__("Sample product description", "th-store-one")}
                      </p>
                    )}
                  </div>

                  {settings?.tapsp_enable_product_price !== false && (
                    <span className="s1-search-product-price">$18.00</span>
                  )}
                </div>

                {/* Product 2 */}
                <div className="s1-search-product">
                  {settings?.tapsp_enable_product_image !== false && (
                    <img
                      src={
                        th_StoreOneAdmin.homeUrl +
                        "wp-content/plugins/th-store-one/assets/images/prd2.png"
                      }
                      className="s1-search-product-image"
                      alt=""
                    />
                  )}

                  <div className="s1-search-product-content">
                    <div className="s1-product-title-row">
                      <strong className="s1-search-product-title">
                        {__("Sample", "th-store-one")}
                      </strong>

                      <span className="s1-product-name">
                        {__("Product", "th-store-one")}
                      </span>

                      {settings?.tapsp_enable_product_sku !== false && (
                        <span className="s1-search-product-sku">
                          ( SKU : Product 01 )
                        </span>
                      )}
                    </div>

                    {settings?.tapsp_enable_product_desc && (
                      <p className="s1-search-product-desc">
                        {__("Sample product description", "th-store-one")}
                      </p>
                    )}
                  </div>

                  {settings?.tapsp_enable_product_price !== false && (
                    <span className="s1-search-product-price">$18.00</span>
                  )}
                </div>

                {/* See All */}
                <button type="button" className="s1-see-all-results">
                  <span>{__("See All Results (9)", "th-store-one")}</span>

                  <span className="s1-see-all-arrow">→</span>
                </button>
              </div>
            </div>
          )}

          {/* TRADITIONAL */}
          {style === "th-traditional" && (
            <div className="s1-search-results">
              {/* yahan Traditional layout */}
            </div>
          )}

          {/* MODERN */}
          {style === "th-modern" && (
            <div className="s1-search-results">{/* yahan Modern layout */}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewAdvanceSearch;
