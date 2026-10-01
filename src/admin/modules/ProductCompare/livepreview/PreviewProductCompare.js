import "./live-style.css";
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
const PreviewProductCompare = ({ settings = {} }) => {
  const [activeTab, setActiveTab] = useState("compare-bar");

  const previewVars = {
    "--s1-compare-bar-bg": settings?.["footer-bar-bg-color"] || "#242529",

    "--s1-compare-content": settings?.["footer-content-color"] || "#ffffff",

    "--s1-compare-button-bg":
      settings?.["footer-bar-btn-bg-color"] || "#ffffff",

    "--s1-compare-button-color":
      settings?.["footer-bar-btn-color"] || "#171717",
  };

  return (
    <div className="s1-compare-preview-wrap">
      {/* Preview Tabs */}
      <div className="s1-style-tabs">
        {[
          {
            id: "compare-bar",
            label: __("Compare Bar & Icon", "th-store-one"),
          },
          {
            id: "compare-table",
            label: __("Compare Table", "th-store-one"),
          },
        ].map((tab) => (
          <div
            key={tab.id}
            className={`s1-style-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="s1-style-preview-box">{tab.label}</div>
          </div>
        ))}
      </div>

      {/* Preview Area */}
      <div className="s1-preview-area">
        <div className="s1-compare-preview" style={previewVars}>
          {/* Compare Bar */}
          {activeTab === "compare-bar" && (
            <>
              <div className="s1-menu-preview">
                {/* Header */}

                <header className="s1-menu-header">
                  <div className="s1-menu-logo">
                    <div className="s1-logo-icon"></div>

                    <div className="s1-logo-text">
                      <strong>STOREONE</strong>
                    </div>
                  </div>

                  <nav className="s1-menu-nav">
                    <span className="s1-menu-line"></span>
                    <span className="s1-menu-line"></span>
                  </nav>
                </header>

                {/* Hero */}

                <div className="s1-skeleton hero"></div>

                {/* Text */}

                <div className="s1-skeleton title"></div>

                <div className="s1-skeleton text"></div>

                {/* Products */}

                <div className="s1-product-grid">
                  <div className="s1-product-card">
                    <div className="thumb"></div>
                    <div className="line"></div>
                    <div className="price"></div>
                  </div>

                  <div className="s1-product-card">
                    <div className="thumb"></div>
                    <div className="line"></div>
                    <div className="price"></div>
                  </div>

                  <div className="s1-product-card">
                    <div className="thumb"></div>
                    <div className="line"></div>
                    <div className="price"></div>
                  </div>
                </div>

                <div className="s1-compare-bar-preview">
                  <div className="s1-compare-bar-left">
                    <div className="s1-compare-selected-text">
                      <span>{__("Selected", "th-store-one")}</span>

                      <span>{__("Products", "th-store-one")}</span>
                    </div>

                    <div className="s1-compare-products">
                      <div className="s1-compare-product-image">
                        <span></span>
                      </div>

                      <div className="s1-compare-product-image">
                        <span></span>
                      </div>

                      <div className="s1-compare-add-product">
                        <span>+</span>
                      </div>

                      <span className="s1-compare-count">2/8</span>
                    </div>
                  </div>

                  <div className="s1-compare-bar-right">
                    <button
                      type="button"
                      className="s1-compare-remove"
                      aria-label={__("Remove", "th-store-one")}
                    >
                      {/* Trash SVG */}
                      <svg
                        width="25"
                        height="25"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>

                    <button type="button" className="s1-compare-button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path>
                        <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>
                        <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
                      </svg>

                      <span>{__("Compare", "th-store-one")}</span>
                    </button>
                  </div>
                </div>

                <div className="s1-floating-compare">
                  <button type="button" className="s1-floating-compare-btn">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path>

                      <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>

                      <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
                    </svg>

                    <span className="s1-floating-compare-count">2</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "compare-table" && (
            <div className="s1-compare-table-preview">
              {/* ==============================
        COMPARE HEADER
    ============================== */}
              <div className="s1-compare-table-header">
                <div className="s1-compare-table-header-content">
                  {/* Title */}
                  <div className="s1-compare-table-title">
                    <h3>{__("Compare Products", "th-store-one")}</h3>
                    <div className="s1-compare-table-meta">
                      <span className="s1-compare-meta-label">
                        {__("3 Items Shown", "th-store-one")}
                      </span>
                    </div>
                  </div>

                  {/* Compare Controls */}
                  <div className="s1-compare-table-controls">
                    {/* Category */}
                    <div className="s1-compare-table-meta">
                      <span className="s1-compare-meta-label">
                        {__("Category", "th-store-one")}
                      </span>

                      <strong>{__("Shoes", "th-store-one")}</strong>
                    </div>

                    {/* Hide Similarities */}
                    <button type="button" className="s1-compare-filter-btn">
                      <span className="s1-compare-filter-toggle">
                        <span></span>
                      </span>

                      {__("Hide Similarities", "th-store-one")}
                    </button>

                    {/* Hide Differences */}
                    <button type="button" className="s1-compare-filter-btn">
                      <span className="s1-compare-filter-toggle">
                        <span></span>
                      </span>

                      {__("Hide Differences", "th-store-one")}
                    </button>
                  </div>
                </div>
              </div>

              {/* ==============================
        PRODUCT CARDS
    ============================== */}
              <div className="s1-compare-products-preview">
                <div className="s1-compare-products-preview">
                  {/* Product 1 */}
                  <div className="s1-compare-preview-card">
                    <div className="s1-compare-card-top">
                      <span className="s1-compare-badge pink">
                        {__("Best Seller", "th-store-one")}
                      </span>

                      <span className="s1-compare-close">×</span>
                    </div>

                    <div className="s1-compare-product-image"></div>

                    <div className="s1-compare-title-skeleton"></div>
                    <div className="s1-compare-title-skeleton small"></div>

                    <div className="s1-compare-rating">
                      <span className="s1-stars">★★★★★</span>
                      <span>(128)</span>
                    </div>

                    <div className="s1-compare-price">
                      <strong>$120.00</strong>
                      <del>$150.00</del>
                      <span>20% OFF</span>
                    </div>

                    <button type="button" className="s1-compare-cart-btn">
                      Add to Cart
                    </button>

                    {/* Product Details */}
                    <div className="s1-compare-card-details">
                      <div className="s1-compare-detail-row">
                        <span>In Stock</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>Nike</span>
                      </div>

                      <div className="s1-compare-detail-row s1-compare-colors">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>7, 8, 9, 10, 11, 12</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>Mesh, Rubber</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>280 g</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>30 × 12 × 10 cm</span>
                      </div>

                      <div className="s1-compare-detail-features">
                        <div>✓ Lightweight Design</div>
                        <div>✓ Breathable Mesh</div>
                        <div>✓ Premium Comfort</div>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>1 Year</span>
                      </div>
                    </div>
                  </div>

                  {/* Product 2 */}
                  <div className="s1-compare-preview-card">
                    <div className="s1-compare-card-top">
                      <span className="s1-compare-badge blue">
                        {__("Popular", "th-store-one")}
                      </span>

                      <span className="s1-compare-close">×</span>
                    </div>

                    <div className="s1-compare-product-image"></div>

                    <div className="s1-compare-title-skeleton"></div>
                    <div className="s1-compare-title-skeleton small"></div>

                    <div className="s1-compare-rating">
                      <span className="s1-stars">★★★★★</span>
                      <span>(96)</span>
                    </div>

                    <div className="s1-compare-price">
                      <strong>$180.00</strong>
                      <del>$220.00</del>
                      <span>18% OFF</span>
                    </div>

                    <button type="button" className="s1-compare-cart-btn">
                      Add to Cart
                    </button>

                    <div className="s1-compare-card-details">
                      <div className="s1-compare-detail-row">
                        <span>In Stock</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>Adidas</span>
                      </div>

                      <div className="s1-compare-detail-row s1-compare-colors">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>6, 7, 8, 9, 10, 11</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>Primeknit, Boost Foam</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>310 g</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>31 × 12 × 11 cm</span>
                      </div>

                      <div className="s1-compare-detail-features">
                        <div>✓ Lightweight Design</div>
                        <div>✓ Breathable Mesh</div>
                        <div>✓ Premium Comfort</div>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>1 Year</span>
                      </div>
                    </div>
                  </div>

                  {/* Product 3 */}
                  <div className="s1-compare-preview-card">
                    <div className="s1-compare-card-top">
                      <span className="s1-compare-badge green">
                        {__("New", "th-store-one")}
                      </span>

                      <span className="s1-compare-close">×</span>
                    </div>

                    <div className="s1-compare-product-image"></div>

                    <div className="s1-compare-title-skeleton"></div>
                    <div className="s1-compare-title-skeleton small"></div>

                    <div className="s1-compare-rating">
                      <span className="s1-stars">★★★★★</span>
                      <span>(74)</span>
                    </div>

                    <div className="s1-compare-price">
                      <strong>$140.00</strong>
                      <del>$160.00</del>
                      <span>12% OFF</span>
                    </div>

                    <button type="button" className="s1-compare-cart-btn">
                      Add to Cart
                    </button>

                    <div className="s1-compare-card-details">
                      <div className="s1-compare-detail-row">
                        <span>Only 3 left</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>New Balance</span>
                      </div>

                      <div className="s1-compare-detail-row s1-compare-colors">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>7, 8, 9, 10, 11</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>Suede, Mesh</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>290 g</span>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>30 × 11 × 10 cm</span>
                      </div>

                      <div className="s1-compare-detail-features">
                        <div>✓ Lightweight Design</div>
                        <div>✓ Breathable Mesh</div>
                        <div>✓ Premium Comfort</div>
                      </div>

                      <div className="s1-compare-detail-row">
                        <span>1 Year</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewProductCompare;
