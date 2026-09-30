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
            label: __("Compare Bar", "th-store-one"),
          },
          {
            id: "compare-table",
            label: __("Compare Table", "th-store-one"),
          },
          {
            id: "responsive-table",
            label: __("Responsive Table", "th-store-one"),
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
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                    <path d="M7 4l-3 3 3 3" />
                    <path d="M17 14l3 3-3 3" />
                  </svg>

                  <span>{__("Compare", "th-store-one")}</span>
                </button>
              </div>
            </div>
          )}

          {/* Compare Table */}
          {activeTab === "compare-table" && (
            <div className="s1-compare-table-preview">{/* Next */}</div>
          )}

          {/* Responsive Table */}
          {activeTab === "responsive-table" && (
            <div className="s1-responsive-table-preview">{/* Next */}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewProductCompare;
