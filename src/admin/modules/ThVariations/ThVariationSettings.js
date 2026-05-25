import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import { Spinner, Button } from "@wordpress/components";

const MODULE_ID = "th-variation-swatches";
const EXTENSION_ID = "th-variation-swatches";

export default function ThVariationSettings({ onModuleReady }) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [notice, setNotice] = useState({ type: "", message: "" });

  const [pluginStatus, setPluginStatus] = useState({
    name: "",
    description: "",
    icon: "",
    installed: false,
    active: false,
    version: "",
    admin_url: "",
    type: "lite",
    is_pro_active: false,
    has_pro: false,
    pro_installed: false,
    lite_active: false,
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
        name: extension.name || "TH Variation Swatches",
        description: extension.description || "",
        icon: extension.icon || "",
        installed: extension.installed === true,
        active: extension.active === true,
        version: extension.version || "",
        admin_url: extension.admin_url || "",
        type: extension.type || "lite",
        is_pro_active: extension.is_pro_active || false,
        has_pro: extension.has_pro || false,
        pro_installed: extension.pro_installed || false,
        lite_active: extension.lite_active || false,
      });
    } catch (error) {
      console.error("Extension status load failed:", error);
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
    if (!loading) onModuleReady?.(MODULE_ID);
  }, [loading]);

  /**
   * Auto hide notices
   */
  useEffect(() => {
    if (!notice.message) return;
    const timer = setTimeout(() => setNotice({ type: "", message: "" }), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  /**
   * Handle Install / Activate / Upgrade
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
          __("Operation completed successfully.", "th-store-one"),
      });

      await new Promise((resolve) => setTimeout(resolve, 800));
      await loadStatus();
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

  const getButtonText = () => {
    if (actionLoading) return __("Process..", "th-store-one");

    if (!pluginStatus.installed) return __("Install", "th-store-one");
    if (!pluginStatus.active) {
      return pluginStatus.type === "pro"
        ? __("Activate Pro", "th-store-one")
        : __("Activate", "th-store-one");
    }
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

  return (
    <div className="storeone-module-settings">
      {notice.message && (
        <div className={`s1-toast s1-toast--${notice.type}`}>
          {notice.message}
        </div>
      )}

      <div className="store-one-content-settings" style={{ marginTop: "20px" }}>
        {/* ==================== Not Installed Card ==================== */}
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
                    "assets/images/variation-swatches.svg"
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
                    {pluginStatus.name}
                    {pluginStatus.type === "pro" && (
                      <span className="s1-pro-badge">PRO</span>
                    )}
                  </h3>
                </div>

                <div className="s1-extension-card__action">
                  <Button
                    variant="primary"
                    onClick={handleExtensionAction}
                    disabled={actionLoading}
                    className="s1-extension-btn"
                  >
                    {actionLoading && <Spinner />}
                    {__("Install", "th-store-one")}
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
          /* ==================== Installed / Active Card ==================== */
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
                  <h3 className="s1-extension-title">
                    {pluginStatus.name}
                    {pluginStatus.type === "pro" && (
                      <span className="s1-pro-badge">PRO</span>
                    )}
                  </h3>

                  <div className="s1-extension-meta">
                    <span
                      className={`s1-extension-status ${
                        pluginStatus.active ? "is-active" : "is-installed"
                      }`}
                    >
                      {pluginStatus.active
                        ? __("Active", "th-store-one")
                        : __("Installed", "th-store-one")}
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

              {/* Upgrade Notice - Lite Active + Pro Installed but Inactive */}
              {pluginStatus.lite_active &&
                pluginStatus.pro_installed &&
                !pluginStatus.is_pro_active && (
                  <div className="s1-upgrade-notice">
                    <strong>Pro version is installed but not active.</strong>
                    <br />
                    Activate Pro to unlock premium features .
                    <Button
                      variant="secondary"
                      onClick={handleExtensionAction}
                      disabled={actionLoading}
                      style={{ marginTop: "10px" }}
                    >
                      {actionLoading
                        ? __("Activating Pro...", "th-store-one")
                        : __("Activate Pro Now", "th-store-one")}
                    </Button>
                  </div>
                )}

              {/* Pro Activated Message */}
              {pluginStatus.type === "pro" && pluginStatus.active && (
                <div className="s1-pro-activated-message">
                  <strong>Pro Version is Active!</strong> Thank you for using
                  the premium version.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
