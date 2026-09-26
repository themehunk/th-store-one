import { useState } from "@wordpress/element";
import ModuleCard from "../ModuleCard/ModuleCard";
import { __ } from "@wordpress/i18n";
const ModuleGrid = ({
  modulesList,
  modulesState,
  tabs,
  setActiveModule,
  licenseActive,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  const currentTab = tabs.find((tab) => tab.name === activeTab);

  const [searchTerm, setSearchTerm] = useState("");

  const totalBlocks = modulesList.length;

  const activeBlocks = modulesList.filter((mod) => modulesState[mod.id]).length;

  const inactiveBlocks = totalBlocks - activeBlocks;

  const filteredModules = modulesList
    .filter((m) => currentTab.modules.includes(m.id))
    .filter((m) => m.label.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="s1-modules">
      <div className="s1-content-area">
        {/* Header + Tab List Wrapper */}
        <div className="s1-top-section">
          <div className="s1-modules__header">
            <h2>
              {__("Grow Faster with", "th-store-one")}{" "}
              <span>{__("Store One", "th-store-one")}</span>
            </h2>
            <p>
              {__(
                "Activate premium quality WooCommerce Addons to create a faster, smarter, and more engaging shopping experience",
                "th-store-one",
              )}
            </p>
          </div>

          <div className="s1-tabs">
            <div className="s1-addon-filter-wrap">
              <div className="s1-addon-search">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={__("Search Addon..", "th-store-one")}
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="s1-addon-search__clear"
                    onClick={() => setSearchTerm("")}
                    aria-label={__("Clear search", "th-store-one")}
                  >
                    ×
                  </button>
                )}

                <span className="s1-addon-search__icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" />
                  </svg>
                </span>
              </div>
              <div className="s1-modules__stats">
                <span className="s1-modules__stat s1-modules__stat--total">
                  {__("Total Blocks", "th-store-one")} {totalBlocks}
                </span>

                <span className="s1-modules__stat s1-modules__stat--active">
                  {__("Active", "th-store-one")} {activeBlocks}
                </span>

                <span className="s1-modules__stat s1-modules__stat--inactive">
                  {__("Inactive", "th-store-one")} {inactiveBlocks}
                </span>
              </div>
            </div>
            <div className="s1-tabs-list components-tab-panel__tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`s1-tab-btn components-tab-panel__tabs-item ${
                    activeTab === tab.name ? "is-active" : ""
                  }`}
                  onClick={() => setActiveTab(tab.name)}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="s1-modules__grid">
          {filteredModules.length > 0 ? (
            filteredModules.map((mod) => (
              <ModuleCard
                key={mod.id}
                mod={mod}
                modulesState={modulesState}
                setActiveModule={setActiveModule}
                licenseActive={licenseActive}
              />
            ))
          ) : (
            <div className="s1-no-results">
              <p>{__("No addons found.", "th-store-one")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleGrid;
