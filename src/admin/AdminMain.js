import { useState, useEffect, useRef } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";

import Header from "@th-storeone-header/Header";
import ModuleGrid from "@th-storeone-modulegrid/ModuleGrid";
import ModuleSettings from "@th-storeone-modulesettings/ModuleSettings";
import PreviewPane from "@th-storeone-modulepreviewpane/PreviewPane";
import GlobalSettings from "@th-storeone-global/GlobalSettings";
import LicensePage from "@th-storeone-global/LicensePage";

import { Notice, Spinner, Button } from "@wordpress/components";
import "@th-storeone/store/productVideoStore";
import "./admin.scss";

const modulesList = [
  {
    id: "frequently-bought",
    label: __("Frequently Bought Together", "th-store-one"),
    description: __(
      "Displays related products often purchased together, allowing customers to add multiple complementary items to their cart with one click.",
      "th-store-one",
    ),
    icon: (
      <svg
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M14 14.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          fill="currentColor"
          fill-opacity="0.2"
          stroke="currentColor"
          stroke-width="1.5"
        ></path>
        <circle
          cx="18"
          cy="18"
          r="4"
          fill="white"
          stroke="currentColor"
          stroke-width="2"
        ></circle>
        <path
          d="M18 16v4M16 18h4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        ></path>
      </svg>
    ),
    premium: true,
  },
  {
    id: "bundle-product",
    label: __("Bundle Product", "th-store-one"),
    description: __(
      "Create customizable product bundles that combine multiple items into one offer, increasing average order value and improving the shopping experience.",
      "th-store-one",
    ),
    icon: (
      <svg
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 7.5L12 3L3 7.5V16.5L12 21L21 16.5V7.5Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M12 21V12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M12 12L21 7.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M12 12L3 7.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M7.5 5.25L16.5 9.75"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    ),
    premium: true,
  },
  {
    id: "buy-to-list",
    label: __("Featured List", "th-store-one"),
    description: __(
      "Showcase selected products in a dedicated list to highlight promotions, bestsellers, or priority items and drive more customer attention and sales.",
      "th-store-one",
    ),
    icon: (
      <svg
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    ),
    premium: false,
  },
  {
    id: "quick-social",
    label: __("Quick Social Link", "th-store-one"),
    description: __(
      "Adds social media profile links to your store and lets customers share products instantly, increasing brand visibility and engagement across platforms.",
      "th-store-one",
    ),
    icon: (
      <svg
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 2H6C3.79086 2 2 3.79086 2 6V18C2 20.2091 3.79086 22 6 22H18C20.2091 22 22 20.2091 22 18V6C22 3.79086 20.2091 2 18 2Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M17.5 6.5H17.51"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    ),
    premium: false,
  },
  {
    id: "product-brand",
    label: __("Trust Badges", "th-store-one"),
    description: __(
      "Display trust badges on your store to build customer confidence and increase conversions.",
      "th-store-one",
    ),
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path
          d="M21 16L16 11L5 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    premium: false,
  },
  {
    id: "trust-badges",
    label: __("Badge Management", "th-store-one"),
    description: __(
      "Easily create, customize, and manage badges across your store with full control.",
      "th-store-one",
    ),
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3L20 6V11C20 16 16.5 20.5 12 22C7.5 20.5 4 16 4 11V6L12 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 12L11 14L15 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    premium: false,
  },
  {
    id: "product-video",
    label: __("Product Video", "th-store-one"),
    description: __(
      "Display Badge Management like secure checkout, money-back guarantee, and verified payment icons to increase customer confidence and improve conversions.",
      "th-store-one",
    ),
    icon: (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Screen */}
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />

    {/* Play Button */}
    <path
      d="M10 9L15 12L10 15V9Z"
      fill="currentColor"
    />
  </svg>
),
    premium: false,
  },
];
const AdminMain = () => {
  const [livePreviewSettings, setLivePreviewSettings] = useState({});

  const [moduleSettings, setModuleSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [proActive, setProActive] = useState(false);
  const [licenseActive, setLicenseActive] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [saveHandler, setSaveHandler] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [licenseLoading, setLicenseLoading] = useState(true);

  const [modulesState, setModulesState] = useState({
    "frequently-bought": false,
    "bundle-product": false,
    "buy-to-list": true,
    "quick-social": true,
    "product-brand": true,
    "trust-badges": false,
  });
  const tabs = [
    {
      name: "all",
      title: __("All Modules", "th-store-one"),
      modules: modulesList.map((m) => m.id),
    },
    {
      name: "active",
      title: __("Active Modules", "th-store-one"),
      modules: modulesList.filter((m) => modulesState[m.id]).map((m) => m.id),
    },
  ];
  const originalSettings = useRef({});
  const skipFirstChange = useRef(false);
  const currentModule = activeModule
    ? modulesList.find((m) => m.id === activeModule)
    : null;
  useEffect(() => {
    if (!currentModule) return;

    skipFirstChange.current = true; //ignore next change

    const currentData = moduleSettings[currentModule.id];

    if (currentData) {
      originalSettings.current[currentModule.id] = JSON.stringify(currentData);
    }

    setIsDirty(false);
  }, [currentModule]);

  // Attach nonce middleware.
  useEffect(() => {
    apiFetch.use(apiFetch.createNonceMiddleware(th_StoreOneAdmin.nonce));
  }, []);

  /**
   * Load modules state from REST.
   */
  useEffect(() => {
    setLoading(true);

    apiFetch({ path: `${th_StoreOneAdmin.restUrl}modules` })
      .then((res) => {
        if (res?.modules) {
          const newState = { ...modulesState };

          modulesList.forEach((mod) => {
            newState[mod.id] =
              res.modules[mod.id] !== undefined ? !!res.modules[mod.id] : true;
          });

          setModulesState(newState);
        }
      })
      .catch(() => {
        setError(__("Failed to load settings.", "th-store-one"));
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Save whole modulesState to REST.
   */
  const saveModules = (nextState) => {
    setSaving(true);
    setError("");
    setSuccess("");

    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}modules`,
      method: "POST",
      data: { modules: nextState },
    })
      .then(() => {
        setSuccess(__("Saved successfully!", "th-store-one"));
      })
      .catch(() => {
        setError(__("Failed to save settings.", "th-store-one"));
      })
      .finally(() => setSaving(false));
  };

  /**
   * Toggle single module (auto-saves).
   */
  const handleToggleModule = (moduleId, enabled) => {
    setModulesState((prev) => {
      const next = {
        ...prev,
        [moduleId]: !!enabled,
      };
      saveModules(next);
      return next;
    });
  };

  /**
   * Master switch (Enable all / Disable all).
   */
  const handleToggleAllModules = (enableAll) => {
    setModulesState((prev) => {
      const next = {};

      modulesList.forEach((mod) => {
        // premium module + license inactive → force disable
        if (mod.premium && !licenseActive) {
          next[mod.id] = false;
        } else {
          next[mod.id] = !!enableAll;
        }
      });

      saveModules(next);
      return next;
    });
  };

  const [hideToast, setHideToast] = useState(false);

  useEffect(() => {
    if (success || error) {
      setHideToast(false);
      const timer = setTimeout(() => setHideToast(true), 2500);
      const removeTimer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(removeTimer);
      };
    }
  }, [success, error]);

  useEffect(() => {
    function updateSavebarOffset() {
      const header = document.querySelector(".s1-header");
      if (!header) return;

      const adminBarHeight = document.body.classList.contains("admin-bar")
        ? document.getElementById("wpadminbar")?.offsetHeight || 32
        : 0;

      const headerHeight = header.offsetHeight;

      document.documentElement.style.setProperty(
        "--s1-header-offset",
        `${headerHeight + adminBarHeight}px`,
      );
    }

    // initial
    updateSavebarOffset();

    // responsive
    window.addEventListener("resize", updateSavebarOffset);

    // header height dynamic ho to (best)
    const headerEl = document.querySelector(".s1-header");
    let observer;
    if (headerEl && window.ResizeObserver) {
      observer = new ResizeObserver(updateSavebarOffset);
      observer.observe(headerEl);
    }

    return () => {
      window.removeEventListener("resize", updateSavebarOffset);
      if (observer) observer.disconnect();
    };
  }, []);

  const handleTopSave = async () => {
    if (!saveHandler || saving) return;

    try {
      setSaving(true);

      await saveHandler();

      setSuccess(__("Saved successfully!", "th-store-one"));

      // UX delay
      setTimeout(() => {
        setIsDirty(false);
        setSaving(false);
      }, 1200); // 1.2 sec
    } catch (e) {
      setError(__("Failed to save settings.", "th-store-one"));
      setSaving(false);
    }
  };
  //************************/
  // for licence pro
  //*********************/
  useEffect(() => {
    apiFetch({ path: `${th_StoreOneAdmin.restUrl}pro-status` })
      .then((res) => {
        if (res?.pro_active) {
          setProActive(true);
        }
        if (res?.license_active) {
          setLicenseActive(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLicenseLoading(false);
      });
  }, []);

  // licence page load
  useEffect(() => {
    if (currentPage !== "license") {
      return;
    }
    setLoading(true);
    apiFetch({ path: `${th_StoreOneAdmin.restUrl}license-html` })
      .then((html) => {
        const el = document.getElementById("store-one-license-root");

        if (el) {
          el.innerHTML = html;
        }
      })
      .catch(() => {
        console.log("License page load failed");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage]);

  return (
    <div className="store-one-admin">
      {success && (
        <div
          className={`s1-toast s1-toast--success ${hideToast ? "hide" : ""}`}
        >
          <span className="s1-toast__icon"></span>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className={`s1-toast s1-toast--error ${hideToast ? "hide" : ""}`}>
          <span className="s1-toast__icon"></span>
          <span>{error}</span>
        </div>
      )}
      {licenseLoading && (
        <div className="store-one-admin">
          <div className="s1-loader">
            <Spinner />
            {__("Loading…", "th-store-one")}
          </div>
        </div>
      )}
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setActiveModule={setActiveModule}
        proActive={proActive}
        licenseActive={licenseActive}
      />
      {/* SAVE BUTTON */}
      {isDirty && saveHandler && (
        <div className="s1-top-savebar">
          <span>
            {__("Your settings have been modified. Save?", "th-store-one")}
          </span>
          <Button disabled={saving} onClick={handleTopSave}>
            {saving ? (
              <>
                {__("Saving", "th-store-one")}
                <Spinner style={{ marginLeft: 8 }} />
              </>
            ) : (
              __("Save", "th-store-one")
            )}
          </Button>
        </div>
      )}
      {currentPage === "dashboard" && (
        <>
          {!loading && !activeModule && (
            <ModuleGrid
              modulesList={modulesList}
              modulesState={modulesState}
              tabs={tabs}
              setActiveModule={setActiveModule}
              licenseActive={licenseActive}
            />
          )}

          {!loading && activeModule && currentModule && (
            <div className="store-module-wrap">
              <Button
                isTertiary
                className="back-btn"
                onClick={() => setActiveModule(null)}
              >
                ← {__("Go Back", "th-store-one")}
              </Button>
              {/*FIXED CLASS HERE */}
              <div className="s1-settings-layout">
                <ModuleSettings
                  onLivePreview={(rule) =>
                    setLivePreviewSettings(prev => ({
                      ...prev,
                      [currentModule.id]: rule
                    }))
                  }
                  currentModule={currentModule}
                  modulesState={modulesState}
                  onToggleModule={handleToggleModule}
                  saving={saving}
                  onSettingsChange={(settings) => {
                    //Skip first automatic call
                    if (skipFirstChange.current) {
                      originalSettings.current[currentModule.id] =
                        JSON.stringify(settings);

                      setModuleSettings((prev) => ({
                        ...prev,
                        [currentModule.id]: settings,
                      }));

                      setIsDirty(false);

                      skipFirstChange.current = false;
                      return;
                    }

                    setModuleSettings((prev) => ({
                      ...prev,
                      [currentModule.id]: settings,
                    }));

                    const newString = JSON.stringify(settings);
                    const oldString =
                      originalSettings.current[currentModule.id];

                    setIsDirty(newString !== oldString);
                  }}
                  onRegisterSave={setSaveHandler}
                  licenseActive={licenseActive}
                />
                <div className="s1-preview-pane">
                  {/* <PreviewPane currentModule={currentModule} settings={livePreviewSettings || moduleSettings[currentModule.id]?.rules?.[0]}/> */}
                  {currentModule?.id === "frequently-bought" && (
                    <PreviewPane
                      currentModule={currentModule}
                      settings={
                        livePreviewSettings[currentModule.id] ||
                        moduleSettings[currentModule.id]?.rules?.[0] ||
                        moduleSettings[currentModule.id]
                      }
                    />
                  )}

                  {currentModule?.id === "bundle-product" && (
                    <PreviewPane
                      currentModule={currentModule}
                      settings={
                        livePreviewSettings[currentModule.id] ||
                        moduleSettings[currentModule.id]?.rules?.[0] ||
                        moduleSettings[currentModule.id]
                      }
                    />
                  )}

                  {currentModule?.id === "buy-to-list" && (
                    <PreviewPane
                      currentModule={currentModule}
                      settings={
                        livePreviewSettings[currentModule.id] ||
                        moduleSettings[currentModule.id]?.rules?.[0] ||
                        moduleSettings[currentModule.id]
                      }
                    />
                  )}
                  {currentModule?.id === "quick-social" && (
                    <PreviewPane
                      currentModule={currentModule}
                      settings={
                        livePreviewSettings[currentModule.id] ||
                        moduleSettings[currentModule.id]?.rules?.[0] ||
                        moduleSettings[currentModule.id]
                      }
                    />
                  )}
                  {currentModule?.id === "product-brand" && (
                    <PreviewPane
                      currentModule={currentModule}
                      settings={
                        livePreviewSettings[currentModule.id] ||
                        moduleSettings[currentModule.id]?.rules?.[0] ||
                        moduleSettings[currentModule.id]
                      }
                    />
                  )}
                  {currentModule?.id === "trust-badges" && (
                    <PreviewPane
                      currentModule={currentModule}
                      settings={
                        livePreviewSettings[currentModule.id] ||
                        moduleSettings[currentModule.id]?.rules?.[0] ||
                        moduleSettings[currentModule.id]
                      }
                    />
                  )}
                  {currentModule?.id === "product-video" && (
                    <PreviewPane
                      currentModule={currentModule}
                      settings={
                        livePreviewSettings[currentModule.id] ||
                        moduleSettings[currentModule.id]?.rules?.[0] ||
                        moduleSettings[currentModule.id]
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="s1-loader">
              <Spinner />
              {__("Loading…", "th-store-one")}
            </div>
          )}
        </>
      )}

      {currentPage === "settings" && (
        <GlobalSettings
          modulesList={modulesList}
          modulesState={modulesState}
          onToggleAllModules={handleToggleAllModules}
          licenseActive={licenseActive}
        />
      )}
      {currentPage === "license" &&
        proActive &&
        (loading ? (
          <div className="s1-loader">
            <Spinner />
            {__("Loading…", "th-store-one")}
          </div>
        ) : (
          <LicensePage />
        ))}
    </div>
  );
};

export default AdminMain;