import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";

import {
  Spinner,
  ToggleControl,
  SelectControl,
  TextControl,
  Button,
} from "@wordpress/components";

import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";

import { ICONS } from "@th-storeone-global/icons";

const MODULE_ID = "th-productcompare";

const DEFAULT_SETTINGS = {
  "compare-btn-type": "icon",
  "compare-btn-text": "Compare",
  "compare-appear-type": "popup",
  "popup-appear-type": "bar",

  "compare-limit-tooltip":
    "Use {limit} to display the max product number. Leave empty for default.",
  "compare-product-limit": 8,
  "compare-at-shop-hook": "after",
  "close-popup-on-addtocart": "0",
  "compare-visibility": "both",
};

export default function ProductCompareSettings({
  onSettingsChange,
  onRegisterSave,
  onModuleReady,
  licenseActive,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [hideToast, setHideToast] = useState(false);

  const [importing, setImporting] = useState(false);
  const [hasOldData, setHasOldData] = useState(false);

  const [hasActiveOldSearchPlugin, setHasActiveOldSearchPlugin] =
    useState(false);

  const [deactivating, setDeactivating] = useState(false);

  /**
   * Update setting
   */
  const update = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Load Settings
   */
  useEffect(() => {
    apiFetch.use(apiFetch.createNonceMiddleware(th_StoreOneAdmin.nonce));

    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}`,
      method: "GET",
    })
      .then((res) => {
        const s = res?.settings || {};

        setSettings({
          ...DEFAULT_SETTINGS,
          ...s,
        });
      })
      .catch(() => {
        setError(__("Failed to load settings.", "th-store-one"));
      })
      .finally(() => {
        setLoading(false);
      });

    onModuleReady?.();
  }, []);

  /**
   * Notify Parent
   */
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings]);

  /**
   * Register Save
   */
  useEffect(() => {
    onRegisterSave?.(() => handleSave);
  }, [settings, saving]);

  /**
   * Save Settings
   */
  const handleSave = () => {
    if (saving) {
      return;
    }

    setSaving(true);
    setSuccess("");
    setError("");

    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}`,
      method: "POST",
      data: {
        settings,
      },
    })
      .then(() => {
        setSuccess(__("Saved successfully!", "th-store-one"));
      })
      .catch(() => {
        setError(__("Failed to save.", "th-store-one"));
      })
      .finally(() => {
        setSaving(false);
      });
  };

  /**
   * Toast
   */
  useEffect(() => {
    if (success || error) {
      setHideToast(false);

      const t1 = setTimeout(() => {
        setHideToast(true);
      }, 2500);

      const t2 = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [success, error]);

  /**
   * Check Old Data
   */
  useEffect(() => {
    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}check-old-option?option=thaps`,
    })
      .then((res) => {
        setHasOldData(Boolean(res?.has_data));
        setHasActiveOldSearchPlugin(Boolean(res?.has_active_old_plugin));
      })
      .catch(() => {
        setHasOldData(false);
        setHasActiveOldSearchPlugin(false);
      });
  }, []);

  /**
   * Import Old Data
   */
  const importOldData = async () => {
    setImporting(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch({
        path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}/import-old`,
        method: "POST",
        data: {
          option_name: "thaps",
        },
      });

      if (res.success) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...res.settings,
        });

        setHasOldData(false);

        setSuccess(__("Settings imported successfully.", "th-store-one"));
      } else {
        setError(res.message || __("Import failed.", "th-store-one"));
      }
    } catch (e) {
      setError(__("Failed to import old settings.", "th-store-one"));
    } finally {
      setImporting(false);
    }
  };

  /**
   * Deactivate Old Plugin
   */
  const deactivateOldPlugins = async () => {
    setDeactivating(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch({
        path: `${th_StoreOneAdmin.restUrl}deactivate-old-plugins`,
        method: "POST",
        data: {
          type: "search",
        },
      });

      if (res.success) {
        setHasActiveOldSearchPlugin(false);

        setSuccess(
          __(
            "Old Product Compare plugin deactivated successfully.",
            "th-store-one",
          ),
        );
      } else {
        setError(
          res.message ||
            __(
              "Failed to deactivate old Product Compare plugin.",
              "th-store-one",
            ),
        );
      }
    } catch (e) {
      setError(
        __("Failed to deactivate old Product Compare plugin.", "th-store-one"),
      );
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="storeone-module-settings s1-no-rule">
      {loading && (
        <div className="store-one-loader">
          <Spinner />
          {__("Loading Product Compare Settings…", "th-store-one")}
        </div>
      )}

      {!loading && (
        <>
          {error && (
            <div
              className={`s1-toast s1-toast--error ${hideToast ? "hide" : ""}`}
            >
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className={`s1-toast s1-toast--success ${
                hideToast ? "hide" : ""
              }`}
            >
              <span>{success}</span>
            </div>
          )}

          <h3 className="store-one-section-title">TH Product Compare</h3>

          <div className="store-one-rule-item">
            <TabSwitcher
              defaultTab="settings"
              tabs={[
                /**
                 * GENERAL
                 */
                {
                  id: "settings",
                  label: __("General", "th-store-one"),
                  icon: ICONS.SETTINGS,

                  content: (
                    <>
                      {hasOldData && (
                        <div className="th-import-card">
                          <div className="th-import-card__content">
                            <h3>
                              {__(
                                "Import Existing Product Compare Settings",
                                "th-store-one",
                              )}
                            </h3>

                            <p>
                              {__(
                                "We found an existing TH Product Compare configuration on your site. Import your current settings into Store One to continue using the same configuration.",
                                "th-store-one",
                              )}
                            </p>

                            <Button
                              variant="primary"
                              isBusy={importing}
                              onClick={importOldData}
                            >
                              {importing
                                ? __("Importing Settings...", "th-store-one")
                                : __("Import Settings", "th-store-one")}
                            </Button>
                          </div>
                        </div>
                      )}

                      {hasActiveOldSearchPlugin && (
                        <div className="th-import-card">
                          <div className="th-import-card__content">
                            <h3>
                              {__(
                                "Deactivate Existing Product Compare Plugin",
                                "th-store-one",
                              )}
                            </h3>

                            <p>
                              {__(
                                "We found an active old Product Compare plugin on your site. Deactivate it to avoid conflicts and continue using Store One.",
                                "th-store-one",
                              )}
                            </p>

                            <Button
                              variant="secondary"
                              isBusy={deactivating}
                              onClick={deactivateOldPlugins}
                              disabled={deactivating}
                            >
                              {deactivating
                                ? __("Deactivating Plugin...", "th-store-one")
                                : __(
                                    "Deactivate Old Product Compare Plugin",
                                    "th-store-one",
                                  )}
                            </Button>
                          </div>
                        </div>
                      )}

                      <S1FieldGroup>
                        <div className="s1-field-group-row">
                          <S1Field
                            label={__("Compare Button Type", "th-store-one")}
                            description={__(
                              "Choose how the compare trigger is displayed to users.",
                              "th-store-one",
                            )}
                          >
                            <SelectControl
                              value={settings["compare-btn-type"]}
                              options={[
                                {
                                  label: __("Icon", "th-store-one"),
                                  value: "icon",
                                },
                                {
                                  label: __("Checkbox", "th-store-one"),
                                  value: "checkbox",
                                },
                              ]}
                              onChange={(value) =>
                                update("compare-btn-type", value)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label={__("Compare Button Text", "th-store-one")}
                            description={__(
                              "Text displayed on the compare trigger.",
                              "th-store-one",
                            )}
                          >
                            <TextControl
                              value={settings["compare-btn-text"]}
                              placeholder={__("Compare", "th-store-one")}
                              onChange={(value) =>
                                update("compare-btn-text", value)
                              }
                            />
                          </S1Field>
                        </div>
                        <div className="s1-field-group-row">
                          <S1Field
                            label={__(
                              "Product Compare Button Redirection",
                              "th-store-one",
                            )}
                            description={__(
                              "Select where you want to display the compare table.",
                              "th-store-one",
                            )}
                          >
                            <SelectControl
                              value={settings["compare-appear-type"]}
                              options={[
                                {
                                  label: __("Popup", "th-store-one"),
                                  value: "popup",
                                },
                                {
                                  label: __("Page", "th-store-one"),
                                  value: "page",
                                },
                              ]}
                              onChange={(value) =>
                                update("compare-appear-type", value)
                              }
                            />
                          </S1Field>

                          {settings["compare-appear-type"] === "popup" && (
                            <S1Field
                              label={__("Pricing Table Effect", "th-store-one")}
                              description={__(
                                "Select how you want to display the pricing table.",
                                "th-store-one",
                              )}
                            >
                              <SelectControl
                                value={settings["popup-appear-type"]}
                                options={[
                                  {
                                    label: __("Slide Bar", "th-store-one"),
                                    value: "bar",
                                  },
                                  {
                                    label: __("Popup", "th-store-one"),
                                    value: "without-bar",
                                  },
                                ]}
                                onChange={(value) =>
                                  update("popup-appear-type", value)
                                }
                              />
                            </S1Field>
                          )}
                        </div>
                        <S1Field
                          label={__(
                            "Close Popup After Add to Cart",
                            "th-store-one",
                          )}
                          description={__(
                            "Automatically close the compare popup when a product is added to cart.",
                            "th-store-one",
                          )}
                        >
                          <SelectControl
                            value={settings["close-popup-on-addtocart"]}
                            options={[
                              {
                                label: __("Disable", "th-store-one"),
                                value: "0",
                              },
                              {
                                label: __("Enable", "th-store-one"),
                                value: "1",
                              },
                            ]}
                            onChange={(value) =>
                              update("close-popup-on-addtocart", value)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__("Comparison Limit Tooltip", "th-store-one")}
                          description={__(
                            "Tooltip text shown when the comparison limit is reached. Use {limit} to display the maximum number.",
                            "th-store-one",
                          )}
                        >
                          <TextControl
                            value={settings["compare-limit-tooltip"]}
                            placeholder={__(
                              "You can add up to {limit} products to compare.",
                              "th-store-one",
                            )}
                            onChange={(value) =>
                              update("compare-limit-tooltip", value)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>

                      <S1FieldGroup>
                        <S1Field
                          label={__("Comparison Limit", "th-store-one")}
                          description={__(
                            "Max products allowed in the compare table.",
                            "th-store-one",
                          )}
                        >
                          <TextControl
                            type="number"
                            placeholder="8"
                            value={settings["compare-product-limit"]}
                            disabled
                          />
                        </S1Field>
                        <S1Field
                          label={__("Button Placement", "th-store-one")}
                          description={__(
                            "Position relative to the Add to Cart button.",
                            "th-store-one",
                          )}
                        >
                          <SelectControl
                            value={settings["compare-at-shop-hook"]}
                            options={[
                              {
                                label: __("Before Cart", "th-store-one"),
                                value: "before",
                              },
                              {
                                label: __("After Cart", "th-store-one"),
                                value: "after",
                              },
                              {
                                label: __("On Image Left", "th-store-one"),
                                value: "onimageleft",
                              },
                              {
                                label: __("On Image Right", "th-store-one"),
                                value: "onimageright",
                              },
                              {
                                label: __("On Cart", "th-store-one"),
                                value: "oncart",
                              },
                            ]}
                            onChange={(value) =>
                              update("compare-at-shop-hook", value)
                            }
                          />
                        </S1Field>
                        <S1Field
                          label={__("Visibility", "th-store-one")}
                          description={__(
                            "Where should the compare button appear?",
                            "th-store-one",
                          )}
                        >
                          <SelectControl
                            value={settings["compare-visibility"]}
                            options={[
                              {
                                label: __("Both", "th-store-one"),
                                value: "both",
                              },
                              {
                                label: __(
                                  "Product Single Page",
                                  "th-store-one",
                                ),
                                value: "product-single-page",
                              },
                              {
                                label: __(
                                  "Shop and Archive Pages",
                                  "th-store-one",
                                ),
                                value: "shop-archive",
                              },
                            ]}
                            onChange={(value) =>
                              update("compare-visibility", value)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                    </>
                  ),
                },

                /**
                 * ADVANCED
                 */
                {
                  id: "display",
                  label: __("Advanced", "th-store-one"),
                  icon: ICONS.DISPLAY,

                  content: <></>,
                },

                /**
                 * CONFIGURE
                 */
                {
                  id: "panel",
                  label: __("Configure", "th-store-one"),
                  icon: (
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
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <line x1="15" y1="4" x2="15" y2="20" />
                      <circle
                        cx="9"
                        cy="9"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                      />
                      <circle
                        cx="9"
                        cy="15"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                      />
                      <path d="M17 9h2" />
                      <path d="M17 12h2" />
                      <path d="M17 15h2" />
                    </svg>
                  ),

                  content: <S1FieldGroup></S1FieldGroup>,
                },

                /**
                 * STYLE
                 */
                {
                  id: "style",
                  label: __("Style", "th-store-one"),
                  icon: ICONS.DESIGN,

                  content: <></>,
                },

                /**
                 * PRO SETTINGS
                 */
                {
                  id: "premium",
                  label: __("Pro Setting", "th-store-one"),
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 7.5L7.5 11L12 4L16.5 11L21 7.5L19 19H5L3 7.5Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 19H19"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.5 15.5H16.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.6"
                      />
                    </svg>
                  ),

                  content: <></>,
                },
              ]}
            />
          </div>

          <div className="store-one-rules-footer">
            <ResetModuleButton
              moduleId={MODULE_ID}
              onReset={() =>
                setSettings({
                  ...DEFAULT_SETTINGS,
                })
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
