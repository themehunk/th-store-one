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

  /*
   * All live preview colors.
   *
   * These CSS variables are consumed by live-style.css.
   */
  const previewVars = {
    "--s1-bar-bg": settings?.bar_bg_clr || "#ffffff",
    "--s1-bar-border": settings?.bar_brdr_clr || "#e7edf3",
    "--s1-bar-text": settings?.bar_text_clr || "#172033",
    /* Search Icon */
    "--s1-icon-color": settings?.icon_clr || "#fff",

    "--s1-button-bg": settings?.bar_button_bg_clr || "#172033",
    "--s1-button-text": settings?.bar_button_txt_clr || "#ffffff",
    "--s1-button-hover-bg":
      settings?.bar_button_hvr_clr || settings?.bar_button_bg_clr || "#172033",
    "--s1-button-hover-text":
      settings?.bar_button_txt_hvr_clr ||
      settings?.bar_button_txt_clr ||
      "#ffffff",

    "--s1-suggestion-bg": settings?.sus_bg_clr || "#ffffff",
    "--s1-highlight": settings?.sus_hglt_clr || "#2991f5",
    "--s1-selected": settings?.sus_slect_clr || "#eef2f7",
    "--s1-suggestion-border": settings?.sus_brdr_clr || "#e7edf3",

    "--s1-group-title": settings?.sus_grphd_clr || "#172033",
    "--s1-title": settings?.sus_title_clr || "#172033",
    "--s1-text": settings?.sus_text_clr || "#687386",
  };

  /*
   * Common product visibility settings.
   */
  const showImage = settings?.tapsp_enable_product_image !== false;
  const showPrice = settings?.tapsp_enable_product_price !== false;
  const showDescription = settings?.tapsp_enable_product_desc === true;
  const showSKU = settings?.tapsp_enable_product_sku !== false;
  const showCart = settings?.tapsp_enable_cart_btn === true;

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
        <div className={`s1-search-preview ${style}`} style={previewVars}>
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
                  {showImage !== false && (
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

                      {showSKU !== false && (
                        <span className="s1-search-product-sku">
                          ( SKU : Product 01 )
                        </span>
                      )}
                    </div>

                    {showDescription && (
                      <p className="s1-search-product-desc">
                        {__("Sample product description", "th-store-one")}
                      </p>
                    )}
                  </div>

                  {showPrice !== false && (
                    <span className="s1-search-product-price">$18.00</span>
                  )}
                  {showCart && (
                    <span className="s1-cart-button">
                      <svg
                        className="s1-cart-svg"
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Product 2 */}
                <div className="s1-search-product">
                  {showImage !== false && (
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

                      {showSKU !== false && (
                        <span className="s1-search-product-sku">
                          ( SKU : Product 01 )
                        </span>
                      )}
                    </div>

                    {showDescription && (
                      <p className="s1-search-product-desc">
                        {__("Sample product description", "th-store-one")}
                      </p>
                    )}
                  </div>

                  {showPrice !== false && (
                    <span className="s1-search-product-price">$18.00</span>
                  )}
                  {showCart && (
                    <span className="s1-cart-button">
                      <svg
                        className="s1-cart-svg"
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </span>
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
            <div className="s1-traditional-search-results">
              {/* Trending */}
              <div className="s1-traditional-section s1-traditional-trending">
                <h4>{__("TRENDING NOW", "th-store-one")}</h4>

                <div className="s1-traditional-trending-items">
                  <span className="s1-traditional-trending-item">Trend1</span>

                  <span className="s1-traditional-trending-item">Trend2</span>
                </div>
              </div>

              {/* Products */}
              <div className="s1-traditional-section s1-traditional-product-section">
                <h4>{__("PRODUCT", "th-store-one")}</h4>

                <div className="s1-traditional-products">
                  {[1, 2, 3].map((item) => (
                    <div className="s1-traditional-product" key={item}>
                      {/* Product Image */}
                      {showImage !== false && (
                        <div className="s1-traditional-product-image-wrap">
                          <img
                            src={
                              th_StoreOneAdmin.homeUrl +
                              `wp-content/plugins/th-store-one/assets/images/prd${item}.png`
                            }
                            className="s1-traditional-product-image"
                            alt=""
                          />
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="s1-traditional-product-content">
                        <div className="s1-traditional-product-title">
                          <strong>{__("Sample", "th-store-one")}</strong>

                          <span>{__("Product", "th-store-one")}</span>
                        </div>

                        {showSKU !== false && (
                          <div className="s1-traditional-product-sku">
                            ( SKU : Product 01 )
                          </div>
                        )}
                        <div className="s1-traditional-product-footer">
                          {showPrice !== false && (
                            <span className="s1-traditional-product-price">
                              $18.00
                            </span>
                          )}
                          {showCart && (
                            <span className="s1-cart-button">
                              <svg
                                className="s1-cart-svg"
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* See All Results */}
              <div className="s1-traditional-see-all-wrap">
                <button type="button" className="s1-traditional-see-all">
                  <span>{__("See All Results (9)", "th-store-one")}</span>

                  <span className="s1-traditional-see-all-arrow">→</span>
                </button>
              </div>
            </div>
          )}
          {/* MODERN */}
          {style === "th-modern" && (
            <div className="s1-modern-search-results">
              {/* Trending */}
              <div className="s1-modern-section s1-modern-trending">
                <h4>{__("TRENDING NOW", "th-store-one")}</h4>

                <div className="s1-modern-trending-items">
                  <span className="s1-modern-trending-item">Trend1</span>

                  <span className="s1-modern-trending-item">Trend2</span>
                </div>
              </div>

              {/* Products */}
              <div className="s1-modern-section s1-modern-product-section">
                <h4>{__("PRODUCT", "th-store-one")}</h4>

                <div className="s1-modern-products">
                  {[1, 2, 3].map((item) => (
                    <div className="s1-modern-product" key={item}>
                      {/* Product Image */}
                      {showImage !== false && (
                        <div className="s1-modern-product-image-wrap">
                          <img
                            src={
                              th_StoreOneAdmin.homeUrl +
                              `wp-content/plugins/th-store-one/assets/images/prd${item}.png`
                            }
                            className="s1-modern-product-image"
                            alt=""
                          />
                        </div>
                      )}

                      {/* Product Content */}
                      <div className="s1-modern-product-content">
                        <div className="s1-modern-product-title">
                          <strong>{__("Sample", "th-store-one")}</strong>

                          <span>{__("Product", "th-store-one")}</span>
                        </div>

                        {showSKU !== false && (
                          <div className="s1-modern-product-sku">
                            ( SKU : Product 01 )
                          </div>
                        )}
                        <div className="s1-modern-product-footer">
                          {showPrice !== false && (
                            <span className="s1-modern-product-price">
                              $18.00
                            </span>
                          )}
                          {showCart && (
                            <span className="s1-cart-button">
                              <svg
                                className="s1-cart-svg"
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* See All */}
              <div className="s1-modern-see-all-wrap">
                <button type="button" className="s1-modern-see-all">
                  <span>{__("See All Results (9)", "th-store-one")}</span>

                  <span className="s1-modern-see-all-arrow">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewAdvanceSearch;
