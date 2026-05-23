import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import { Spinner, Button } from "@wordpress/components";

const MODULE_ID = "th-advanced-search";
const EXTENSION_ID = "th-advanced-search";

export default function ThAdvanceSearchSettings({ onModuleReady }) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState("");

  const [notice, setNotice] = useState({
    type: "",
    message: "",
  });

  const [pluginStatus, setPluginStatus] = useState({
    name: "",
    description: "",
    icon: "",
    installed: false,
    active: false,
    version: "",
    admin_url: "",
  });

  /**
   * Load Extension Status
   */
  const loadStatus = async () => {
    try {
      const response = await apiFetch({
        path: `${th_StoreOneAdmin.restUrl}extensions`,
      });

      const extension = response?.[EXTENSION_ID] || {};

      setPluginStatus({
        name: extension.name || "TH Advanced Search",
        description: extension.description || "",
        icon: extension.icon || "",
        installed: extension.installed === true,
        active: extension.active === true, // ← Yeh important hai
        version: extension.version || "",
        admin_url: extension.admin_url || "",
      });
    } catch (error) {
      console.error("Extension status load failed:", error);
      // fallback same rakho
    } finally {
      setLoading(false);
    }
  };
  /**
   * Init
   */
  useEffect(() => {
    apiFetch.use(apiFetch.createNonceMiddleware(th_StoreOneAdmin.nonce));

    loadStatus();
  }, []);

  /**
   * Module Ready
   */
  useEffect(() => {
    if (!loading) {
      onModuleReady?.(MODULE_ID);
    }
  }, [loading]);

  /**
   * Auto hide notices
   */
  useEffect(() => {
    if (!notice.message) {
      return;
    }

    const timer = setTimeout(() => {
      setNotice({
        type: "",
        message: "",
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [notice]);

  /**
   * Install / Activate
   */
  const handleExtensionAction = async () => {
    if (actionLoading || pluginStatus.active) return;

    setActionLoading(true);

    try {
      const response = await apiFetch({
        path: `${th_StoreOneAdmin.restUrl}extensions/action`,
        method: "POST",
        data: { extension: EXTENSION_ID },
      });

      setNotice({
        type: "success",
        message:
          response?.message ||
          __("Extension installed successfully.", "th-store-one"),
      });

      // Multiple reload with delays for better reliability
      await new Promise((resolve) => setTimeout(resolve, 700));
      await loadStatus();

      await new Promise((resolve) => setTimeout(resolve, 500));
      await loadStatus(); // Second time for safety
    } catch (error) {
      console.error(error);
      setNotice({
        type: "error",
        message: error?.message || __("Something went wrong.", "th-store-one"),
      });
    } finally {
      setActionLoading(false);
    }
  };
  /**
   * Button Text
   */
  const getButtonText = () => {
    if (actionLoading)
      return pluginStatus.installed
        ? __("Activating...", "th-store-one")
        : __("Installing...", "th-store-one");

    if (!pluginStatus.installed) return __("Install Extension", "th-store-one");
    if (!pluginStatus.active) return __("Activate Extension", "th-store-one");
    return __("Activated", "th-store-one");
  };

  if (loading) {
    return (
      <div className="store-one-loader">
        <Spinner />
        <span style={{ marginLeft: "8px" }}>
          {__("Loading...", "th-store-one")}
        </span>
      </div>
    );
  }

  console.log("Plugin Status:", pluginStatus);

  return (
    <div className="storeone-module-settings">
      {notice.message && (
        <div className={`s1-toast s1-toast--${notice.type}`}>
          {notice.message}
        </div>
      )}

      <div className="store-one-content-settings" style={{ marginTop: "20px" }}>
        {!pluginStatus.installed && !pluginStatus.active ? (
          <div className="s1-extension-install-card s1-extension-card">
            <div className="s1-extension-card__icon">
              {pluginStatus.icon ? (
                <img
                  src={pluginStatus.icon}
                  alt={pluginStatus.name}
                  className="s1-extension-card__icon-image"
                />
              ) : (
                <img
                  src={
                    th_StoreOneAdmin.pluginUrl +
                    "assets/images/advanced-search.svg"
                  }
                  alt="TH Advanced Search"
                  className="s1-extension-card__icon-image"
                />
              )}
            </div>

            <div className="s1-extension-card__content">
              <div className="s1-extension-card__top">
                <div className="s1-extension-card__heading">
                  <h3 className="s1-extension-title">
                    {pluginStatus.name ||
                      __("TH Advanced Search", "th-store-one")}
                  </h3>

                  <div className="s1-extension-meta">
                    <span className="s1-extension-status is-missing">
                      {__("Not Installed", "th-store-one")}
                    </span>
                  </div>
                </div>

                <div className="s1-extension-card__action">
                  <Button
                    variant="primary"
                    onClick={handleExtensionAction}
                    disabled={actionLoading}
                    className="s1-extension-btn"
                  >
                    {actionLoading && <Spinner />}

                    {actionLoading
                      ? __("Installing Extension...", "th-store-one")
                      : __("Install Extension", "th-store-one")}
                  </Button>
                </div>
              </div>

              <p className="s1-extension-desc">
                {pluginStatus.description ||
                  __(
                    "Give your customers a fast and smart search experience with live suggestions, typo correction, and powerful filters. Install now to make product discovery easier and increase sales!",
                    "th-store-one",
                  )}
              </p>
            </div>
          </div>
        ) : (
          <div className="s1-extension-card">
            <div className="s1-extension-card__icon">
              {pluginStatus.icon ? (
                <img
                  src={pluginStatus.icon}
                  alt={pluginStatus.name}
                  className="s1-extension-card__icon-image"
                />
              ) : (
                <span className="dashicons dashicons-search"></span>
              )}
            </div>

            <div className="s1-extension-card__content">
              <div className="s1-extension-card__top">
                <div className="s1-extension-card__heading">
                  <h3 className="s1-extension-title">{pluginStatus.name}</h3>

                  <div className="s1-extension-meta">
                    <span
                      className={`s1-extension-status ${
                        pluginStatus.active
                          ? "is-active"
                          : pluginStatus.installed
                          ? "is-installed"
                          : "is-missing"
                      }`}
                    >
                      {pluginStatus.active
                        ? __("Active", "th-store-one")
                        : pluginStatus.installed
                        ? __("Installed", "th-store-one")
                        : __("Not Installed", "th-store-one")}
                    </span>

                    {!!pluginStatus.version && (
                      <span className="s1-extension-version">
                        v{pluginStatus.version}
                      </span>
                    )}
                  </div>
                </div>

                <div className="s1-extension-card__action">
                  {pluginStatus.active ? (
                    <a
                      href={pluginStatus.admin_url}
                      className="components-button th-extenstion-settings-btn"
                    >
                      {__("Open Settings", "th-store-one")}
                    </a>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleExtensionAction}
                      disabled={actionLoading}
                      className="s1-extension-btn"
                    >
                      {actionLoading && <Spinner />}
                      {getButtonText()}
                    </Button>
                  )}
                </div>
              </div>

              <p className="s1-extension-desc">{pluginStatus.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
