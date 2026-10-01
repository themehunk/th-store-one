import { useState } from "@wordpress/element";
import ModuleCard from "../ModuleCard/ModuleCard";
import { __ } from "@wordpress/i18n";

const ModuleGrid = ({
  modulesList,
  modulesState,
  setActiveModule,
  licenseActive,
}) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const totalBlocks = modulesList.length;

  const activeBlocks = modulesList.filter((mod) => modulesState[mod.id]).length;

  const inactiveBlocks = totalBlocks - activeBlocks;

  const filteredModules = modulesList
    .filter((mod) => {
      if (activeFilter === "active") {
        return !!modulesState[mod.id];
      }

      if (activeFilter === "inactive") {
        return !modulesState[mod.id];
      }

      return true;
    })
    .filter((mod) =>
      mod.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  return (
    <div className="s1-modules">
      <div className="s1-content-area">
        {/* Header + Search + Filters */}
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
              {/* Search */}
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

              {/* Total / Active / Inactive Filters */}
              <div className="s1-modules__stats">
                <button
                  type="button"
                  className={`s1-modules__stat s1-modules__stat--total ${
                    activeFilter === "all" ? "is-active" : ""
                  }`}
                  onClick={() => setActiveFilter("all")}
                >
                  {__("Total Blocks", "th-store-one")} {totalBlocks}
                </button>

                <button
                  type="button"
                  className={`s1-modules__stat s1-modules__stat--active ${
                    activeFilter === "active" ? "is-active" : ""
                  }`}
                  onClick={() => setActiveFilter("active")}
                >
                  {__("Active", "th-store-one")} {activeBlocks}
                </button>

                <button
                  type="button"
                  className={`s1-modules__stat s1-modules__stat--inactive ${
                    activeFilter === "inactive" ? "is-active" : ""
                  }`}
                  onClick={() => setActiveFilter("inactive")}
                >
                  {__("Inactive", "th-store-one")} {inactiveBlocks}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Module Grid */}
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
