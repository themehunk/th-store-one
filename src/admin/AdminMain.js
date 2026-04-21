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
import { modulesList } from "./modules/modulesList";
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
    "sale-notification": false,
    "sticky-cart": false,
    "buynow-button":false,
    "inactive-tab": false
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
    if (!th_StoreOneAdmin.proActive) {
    setProActive(false);
    setLicenseActive(false);
    setLicenseLoading(false);
    return;
  }
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
    if (currentPage !== "license" || !th_StoreOneAdmin.proActive) {
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
                  {currentModule?.id === "sale-notification" && (
                    <PreviewPane
                      currentModule={currentModule}
                      settings={
                        livePreviewSettings[currentModule.id] ||
                        moduleSettings[currentModule.id]?.rules?.[0] ||
                        moduleSettings[currentModule.id]
                      }
                    />
                  )}
                  {currentModule?.id === "sticky-cart" && (
                    <PreviewPane
                      currentModule={currentModule}
                      settings={
                        livePreviewSettings[currentModule.id] ||
                        moduleSettings[currentModule.id]?.rules?.[0] ||
                        moduleSettings[currentModule.id]
                      }
                    />
                  )}
                  {currentModule?.id === "buynow-button" && (
                    <PreviewPane
                      currentModule={currentModule}
                      settings={
                        livePreviewSettings[currentModule.id] ||
                        moduleSettings[currentModule.id]?.rules?.[0] ||
                        moduleSettings[currentModule.id]
                      }
                    />
                  )}
                  
                  {currentModule?.id === "inactive-tab" && (
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