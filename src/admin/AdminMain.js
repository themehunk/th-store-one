import { useState, useEffect, useRef } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import Header from "@th-storeone-header/Header";
import ModuleGrid from "@th-storeone-modulegrid/ModuleGrid";
import ModuleSettings from "@th-storeone-modulesettings/ModuleSettings";
import PreviewPane from "@th-storeone-modulepreviewpane/PreviewPane";
import GlobalSettings from "@th-storeone-global/GlobalSettings";
import PluginsPage from "@th-storeone-global/PluginsPage";
import LicensePage from "@th-storeone-global/LicensePage";
import { Spinner, Button } from "@wordpress/components";
import "@th-storeone/store/productVideoStore";
import "./admin.scss";
import { modulesList } from "./modules/modulesList";

const ADMIN_VIEW_STORAGE_KEY = "th_store_one_admin_view";
const VALID_PAGES = ["dashboard", "settings", "ourplugins", "license"];
const isValidModule = (moduleId) =>
  modulesList.some((module) => module.id === moduleId);

const getInitialAdminView = () => {
  if (typeof window === "undefined") {
    return {
      page: "dashboard",
      module: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const urlModule = params.get("store_one_module");
  const urlPage = params.get("store_one_page");

  if (urlModule && isValidModule(urlModule)) {
    return {
      page: "dashboard",
      module: urlModule,
    };
  }

  if (urlPage && VALID_PAGES.includes(urlPage)) {
    return {
      page: urlPage,
      module: null,
    };
  }

  return {
    page: "dashboard",
    module: null,
  };
};

const persistAdminView = (page, module = null) => {
  if (typeof window === "undefined") {
    return;
  }

  const nextView = {
    page: VALID_PAGES.includes(page) ? page : "dashboard",
    module: isValidModule(module) ? module : null,
  };

  if (nextView.module) {
    nextView.page = "dashboard";
  }

  try {
    window.localStorage.setItem(
      ADMIN_VIEW_STORAGE_KEY,
      JSON.stringify(nextView),
    );
  } catch (e) {}

  const url = new URL(window.location.href);
  url.searchParams.delete("store_one_page");
  url.searchParams.delete("store_one_module");

  if (nextView.module) {
    url.searchParams.set("store_one_module", nextView.module);
  } else if (nextView.page !== "dashboard") {
    url.searchParams.set("store_one_page", nextView.page);
  }

  window.history.replaceState(null, "", url.toString());
};

const AdminMain = () => {
  const [livePreviewSettings, setLivePreviewSettings] = useState({});
  const [moduleSettings, setModuleSettings] = useState({});
  const [modulesLoading, setModulesLoading] = useState(true);
  const [licensePageLoading, setLicensePageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPageState] = useState(
    () => getInitialAdminView().page,
  );
  const [proActive, setProActive] = useState(false);
  const [licenseActive, setLicenseActive] = useState(false);
  const [activeModule, setActiveModuleState] = useState(
    () => getInitialAdminView().module,
  );
  const [modulePreparing, setModulePreparing] = useState(
    () => !!getInitialAdminView().module,
  );
  const [saveHandler, setSaveHandler] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [messageSource, setMessageSource] = useState("");

  const [isFetching, setIsFetching] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [modulesState, setModulesState] = useState({
    "frequently-bought": false,
    "bundle-product": false,
    "buy-to-list": true,
    "quick-social": true,
    "product-brand": true,
    "trust-badges": false,
    "sale-notification": false,
    "sticky-cart": false,
    "buynow-button": false,
    "inactive-tab": false,
    "stock-scarcity": false,
    "product-video": false,
    "sale-countdown": false,
    "recent-view": false,
    "smart-offers": false,
    "people-view": false,
    "pre-order": false,
    "th-advanced-search": false,
    "th-advanced-cart": false,
    "th-variation-swatches": false,
    "shopable-list": false,
  });

  const tabs = [
    {
      name: "all",
      title: __("All Addons", "th-store-one"),
      modules: modulesList.map((m) => m.id),
    },
    {
      name: "active",
      title: __("Active Addons", "th-store-one"),
      modules: modulesList.filter((m) => modulesState[m.id]).map((m) => m.id),
    },
    {
      name: "extensions",
      title: __("Extensions", "th-store-one"),
      modules: modulesList
        .filter((m) => m.source?.type === "th-extension")
        .map((m) => m.id),
    },
  ];

  const originalSettings = useRef({});
  const skipFirstChange = useRef(false);
  const debounceTimer = useRef(null);

  const currentModule = activeModule
    ? modulesList.find((m) => m.id === activeModule)
    : null;

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [activeModule]);

  const setCurrentPage = (page) => {
    const nextPage = VALID_PAGES.includes(page) ? page : "dashboard";
    setCurrentPageState(nextPage);
    setActiveModuleState(null);
    setModulePreparing(false);
    setSaveHandler(null);
    setIsDirty(false);
    persistAdminView(nextPage, null);
  };

  const setActiveModule = (moduleId) => {
    if (!isValidModule(moduleId)) {
      setActiveModuleState(null);
      setModulePreparing(false);
      setSaveHandler(null);
      setIsDirty(false);
      return;
    }
    setCurrentPageState("dashboard");
    setModulePreparing(true);
    setActiveModuleState(moduleId);
    setSaveHandler(null);
    setIsDirty(false);
    persistAdminView("dashboard", moduleId);
  };

  const clearActiveModule = () => {
    setActiveModuleState(null);
    setModulePreparing(false);
    setSaveHandler(null);
    setIsDirty(false);
    persistAdminView("dashboard", null);
  };

  useEffect(() => {
    if (!currentModule) return;

    setModulePreparing(true);
    setIsFetching(true);
    skipFirstChange.current = true;
    setIsDirty(false);

    apiFetch({ path: `${th_StoreOneAdmin.restUrl}module/${currentModule.id}` })
      .then((res) => {
        const savedData = res?.settings || {};
        setModuleSettings((prev) => ({
          ...prev,
          [currentModule.id]: savedData,
        }));
        originalSettings.current[currentModule.id] = JSON.stringify(savedData);
        setIsDirty(false);
      })
      .catch((err) => {
        console.error("Failed to load saved settings from DB:", err);
      })
      .finally(() => {
        setModulePreparing(false);
        setIsFetching(false);

        setTimeout(() => {
          skipFirstChange.current = false;
        }, 50);
      });
  }, [activeModule]);

  const handleModuleReady = (moduleId) => {
    if (moduleId !== currentModule?.id) return;
    setTimeout(() => {
      setModulePreparing(false);
    }, 50);
  };

  useEffect(() => {
    const handleModuleReset = (event) => {
      const moduleId = event?.detail?.moduleId;
      const resetSettings = event?.detail?.settings || {};

      if (!isValidModule(moduleId)) return;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      setIsResetting(true);

      setLivePreviewSettings((prev) => {
        const next = { ...prev };
        delete next[moduleId];
        return next;
      });

      setModuleSettings((prev) => ({
        ...prev,
        [moduleId]: resetSettings,
      }));
      originalSettings.current[moduleId] = JSON.stringify(resetSettings);
      setIsDirty(false);
      setSaving(true);
      setMessageSource("admin");

      apiFetch({
        path: `${th_StoreOneAdmin.restUrl}module/${moduleId}`,
        method: "POST",
        data: {
          settings: resetSettings,
        },
      })
        .then(() => {
          setSuccess(
            __("Settings reset and saved successfully....", "th-store-one"),
          );
          setTimeout(() => {
            window.location.reload();
          }, 600);
        })
        .catch((err) => {
          console.error("Database reset failed:", err);
          setError(
            __("Failed to save reset settings to database.", "th-store-one"),
          );
          setSaving(false);
          setIsResetting(false);
        });
    };

    window.addEventListener("th-store-one:module-reset", handleModuleReset);
    return () => {
      window.removeEventListener(
        "th-store-one:module-reset",
        handleModuleReset,
      );
    };
  }, [currentModule]);

  useEffect(() => {
    apiFetch.use(apiFetch.createNonceMiddleware(th_StoreOneAdmin.nonce));
  }, []);

  useEffect(() => {
    setModulesLoading(true);
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
      .finally(() => setModulesLoading(false));
  }, []);

  const saveModules = (
    nextState,
    successMessage = __("Changes saved successfully.", "th-store-one"),
  ) => {
    setSaving(true);
    setError("");
    setSuccess("");

    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}modules`,
      method: "POST",
      data: { modules: nextState },
    })
      .then(() => {
        setSuccess(successMessage);
      })
      .catch(() => {
        setError(__("Failed to save settings.", "th-store-one"));
      })
      .finally(() => setSaving(false));
  };

  const handleToggleModule = (moduleId, enabled) => {
    setMessageSource("module"); // <--- YAHAN SOURCE "module" SET HOTA HAI
    setModulesState((prev) => {
      const next = { ...prev, [moduleId]: !!enabled };
      saveModules(
        next,
        enabled
          ? __("Addon activated successfully.", "th-store-one")
          : __("Addon deactivated successfully.", "th-store-one"),
      );
      return next;
    });
  };

  const handleToggleAllModules = (enableAll) => {
    setMessageSource("admin");
    setModulesState((prev) => {
      const next = {};
      modulesList.forEach((mod) => {
        if (mod.premium && !licenseActive) {
          next[mod.id] = false;
        } else {
          next[mod.id] = !!enableAll;
        }
      });
      saveModules(
        next,
        enableAll
          ? __("All addons activated successfully.", "th-store-one")
          : __("All addons deactivated successfully.", "th-store-one"),
      );
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

    updateSavebarOffset();
    window.addEventListener("resize", updateSavebarOffset);

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
    setMessageSource("admin");
    if (!currentModule || saving) return;

    try {
      setSaving(true);
      const freshSettings = moduleSettings[currentModule.id] || {};

      await apiFetch({
        path: `${th_StoreOneAdmin.restUrl}module/${currentModule.id}`,
        method: "POST",
        data: {
          settings: freshSettings,
        },
      });

      setSuccess(__("Saved successfully!", "th-store-one"));
      originalSettings.current[currentModule.id] =
        JSON.stringify(freshSettings);

      setTimeout(() => {
        setIsDirty(false);
        setSaving(false);
      }, 1000);
    } catch (e) {
      console.error("Manual save failed:", e);
      setError(__("Failed to save settings.", "th-store-one"));
      setSaving(false);
    }
  };

  useEffect(() => {
    // Pro plugin installed not
    if (!th_StoreOneAdmin.proInstalled) {
      setProActive(false);
      setLicenseActive(false);
      setLicenseLoading(false);
      return;
    }

    // Installed but not active
    if (!th_StoreOneAdmin.proActive) {
      setProActive(false);
      setLicenseActive(false);
      setLicenseLoading(false);
      return;
    }

    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}pro-status`,
    })
      .then((res) => {
        setProActive(!!res?.pro_active);
        setLicenseActive(!!res?.license_active);
      })
      .catch(() => {
        setProActive(false);
        setLicenseActive(false);
      })
      .finally(() => {
        setLicenseLoading(false);
      });
  }, []);

  useEffect(() => {
    if (currentPage !== "license" || !th_StoreOneAdmin.proActive) return;
    setLicensePageLoading(true);
    apiFetch({ path: `${th_StoreOneAdmin.restUrl}license-html` })
      .then((html) => {
        const el = document.getElementById("store-one-license-root");
        if (el) el.innerHTML = html;
      })
      .catch(() => {
        console.log("License page load failed");
      })
      .finally(() => {
        setLicensePageLoading(false);
      });
  }, [currentPage]);

  useEffect(() => {
    if (!licenseLoading && currentPage === "license" && !proActive) {
      setCurrentPage("dashboard");
    }
  }, [licenseLoading, currentPage, proActive]);

  const currentPreviewSettings = currentModule
    ? livePreviewSettings[currentModule.id] ||
      moduleSettings[currentModule.id]?.rules?.[0] ||
      moduleSettings[currentModule.id]
    : null;

  return (
    <div className="store-one-admin">
      {messageSource === "admin" && success && (
        <div
          className={`s1-toast s1-toast--success ${hideToast ? "hide" : ""}`}
        >
          <span className="s1-toast__icon"></span>
          <span>{success}</span>
        </div>
      )}

      {messageSource === "admin" && error && (
        <div className={`s1-toast s1-toast--error ${hideToast ? "hide" : ""}`}>
          <span className="s1-toast__icon"></span>
          <span>{error}</span>
        </div>
      )}
      <>
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setActiveModule={(moduleId) => {
            if (moduleId) setActiveModule(moduleId);
          }}
          proActive={proActive}
          licenseActive={licenseActive}
        />

        {/* CONDITION FIX: messageSource !== "module" lagaya taaki toggle active/deactivate par savebar strictly block ho jaye */}
        {activeModule &&
          (isDirty || (saving && messageSource !== "module")) &&
          !isFetching &&
          !isResetting && (
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
            {!activeModule && modulesLoading && (
              <div className="s1-loader s1-loader--content">
                <Spinner />
                {__("Loading modules…", "th-store-one")}
              </div>
            )}
            {!activeModule && !modulesLoading && (
              <ModuleGrid
                modulesList={modulesList}
                modulesState={modulesState}
                tabs={tabs}
                setActiveModule={setActiveModule}
                licenseActive={licenseActive}
              />
            )}
            {activeModule && currentModule && (
              <div className="store-module-wrap">
                <Button
                  isTertiary
                  className="back-btn"
                  onClick={clearActiveModule}
                >
                  ← {__("Go Back", "th-store-one")}
                </Button>
                <div className="s1-module-stage">
                  {modulePreparing && (
                    <div className="s1-loader s1-loader--content">
                      <Spinner />
                      {__("Loading module settings…", "th-store-one")}
                    </div>
                  )}
                  <div
                    className={`s1-settings-layout ${
                      modulePreparing ? "is-preparing" : ""
                    }`}
                  >
                    <ModuleSettings
                      onLivePreview={(rule) =>
                        setLivePreviewSettings((prev) => ({
                          ...prev,
                          [currentModule.id]: rule,
                        }))
                      }
                      currentModule={currentModule}
                      modulesState={modulesState}
                      onToggleModule={handleToggleModule}
                      saving={saving}
                      onSettingsChange={(settings) => {
                        if (skipFirstChange.current) {
                          setModuleSettings((prev) => ({
                            ...prev,
                            [currentModule.id]: settings,
                          }));
                          originalSettings.current[currentModule.id] =
                            JSON.stringify(settings);
                          setIsDirty(false);
                          return;
                        }

                        setModuleSettings((prev) => ({
                          ...prev,
                          [currentModule.id]: settings,
                        }));

                        const newString = JSON.stringify(settings);
                        const oldString =
                          originalSettings.current[currentModule.id];

                        if (oldString) {
                          setIsDirty(newString !== oldString);
                        }
                      }}
                      onRegisterSave={setSaveHandler}
                      onModuleReady={handleModuleReady}
                      licenseActive={licenseActive}
                      success={success}
                      error={error}
                      hideToast={hideToast}
                      isDirty={isDirty}
                      messageSource={messageSource}
                    />
                    <div className="s1-preview-pane">
                      <PreviewPane
                        currentModule={currentModule}
                        settings={currentPreviewSettings || {}}
                      />
                    </div>
                  </div>
                </div>
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
        {currentPage === "ourplugins" && (
          <PluginsPage licenseActive={licenseActive} proActive={proActive} />
        )}
        {currentPage === "license" &&
          proActive &&
          (licensePageLoading ? (
            <div className="s1-loader s1-loader--content">
              <Spinner />
              {__("Loading license details…", "th-store-one")}
            </div>
          ) : (
            <LicensePage />
          ))}
      </>
    </div>
  );
};

export default AdminMain;
