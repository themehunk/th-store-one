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
import ExcludeWooCondition from "@th-storeone-global/ExcludeWooCondition";

import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";
import THBackgroundControl from "@th-storeone-control/color";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import ComparisonFieldsSortable from "@th-storeone-global/ComparisonFieldsSortable";

import MultiWooSearchSelector from "@th-storeone-global/MultiWooSearchSelector";

import { ICONS } from "@th-storeone-global/icons";
import { CopyIcon } from "@radix-ui/react-icons";

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

  // Single Product
  "field-auto-single-page": true,
  "automatic-page-limit": 6,
  "auto-single-page-by": "cat",
  exclude_products_enabled: false,
  exclude_products: [],

  "compare-atleast-text": "{Selected} {Products}",
  "footer-bar-bg-color": "",
  "footer-content-color": "",
  "footer-bar-btn-color": "",
  "footer-bar-btn-bg-color": "",

  "compare-heading-text": "Compare",
  "compare-count-text": "{count} {Text to be shown.}",
  "compare-popup-animation": "1",
  "compare-popup-position": "bottom",

  "global-background": "",
  "heading-style": "",
  "heading-style-bg": "",

  "table-content-color": "",
  "product-img-bg-color": "",
  "dummy-border-color": "",
  "rating-color": "",
  "remove-btn-color": "",

  "img-remove-icon-color": "",
  "img-remove-btn-size": 18,

  "add-to-cart": "",
  "close-btn-style": "",

  "field-show-by-category": true,
  "field-highlight-btn": false,
  "field-dynamic-attribute": false,
  "field-repeat-price": false,
  "field-repeat-add-to-cart": false,

  "product-image-width": 168,
  "product-image-height": 168,

  comparetableattributes: {
    image: { active: 1, label: "Image" },
    title: { active: 1, label: "Title" },
    rating: { active: 1, label: "Rating" },
    price: { active: 1, label: "Price" },
    "add-to-cart": { active: 1, label: "Add To Cart" },
    description: { active: 1, label: "Description" },
    availability: { active: 1, label: "Availability" },
    SKU: { active: 1, label: "SKU" },
  },

  shortcode_products: [],
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

  const getProductId = (product) => {
    if (!product) return "";

    if (typeof product === "number" || typeof product === "string") {
      return product;
    }

    return product.id || product.product_id || product.value || "";
  };

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

                      <S1FieldGroup number={1} title="Basic">
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
                      </S1FieldGroup>
                    </>
                  ),
                },

                /**
                 * ADVANCED
                 */
                {
                  id: "display",
                  label: __("Single Product", "th-store-one"),
                  icon: ICONS.DISPLAY,
                  content: (
                    <>
                      <S1FieldGroup number={1} title="Product Page">
                        <S1Field
                          label="Automated Comparison Table"
                          description="Enable the comparison table automatically on single product pages."
                        >
                          <ToggleControl
                            checked={settings["field-auto-single-page"]}
                            onChange={(value) =>
                              update("field-auto-single-page", value)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__("Product Compare By", "th-store-one")}
                          description={__(
                            "Select the filter to compare the products by.",
                            "th-store-one",
                          )}
                        >
                          <SelectControl
                            value={settings["auto-single-page-by"]}
                            options={[
                              {
                                label: __("Category", "th-store-one"),
                                value: "cat",
                              },
                              {
                                label: __("Tag", "th-store-one"),
                                value: "tag",
                              },
                              {
                                label: __("Related Product", "th-store-one"),
                                value: "related",
                              },
                            ]}
                            onChange={(value) =>
                              update("auto-single-page-by", value)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__("Number Of Product", "th-store-one")}
                          description={__(
                            "Maximum products allowed on a single product comparison page.",
                            "th-store-one",
                          )}
                        >
                          <TextControl
                            type="number"
                            min={1}
                            value={settings["automatic-page-limit"]}
                            onChange={(value) =>
                              update("automatic-page-limit", value)
                            }
                          />
                        </S1Field>

                        <ExcludeWooCondition
                          label="Exclude Products"
                          searchType="product"
                          enabled={settings.exclude_products_enabled}
                          items={settings.exclude_products || []}
                          onToggle={(v) =>
                            setSettings({
                              ...settings,
                              exclude_products_enabled: v,
                            })
                          }
                          onChangeItems={(items) =>
                            setSettings({
                              ...settings,
                              exclude_products: items,
                            })
                          }
                          detailedView={true}
                        />
                        <S1Field
                          label={__("Manual Comparison Table", "th-store-one")}
                          description={__(
                            "Add the Comparison Table manually for individual products.",
                            "th-store-one",
                          )}
                        >
                          <a
                            href="https://themehunk.com/docs/th-product-compare-pro/#single-page"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="s1-docs-link"
                          >
                            {__("View Documentation", "th-store-one")}
                          </a>
                        </S1Field>
                      </S1FieldGroup>
                    </>
                  ),
                },

                /**
                 * CONFIGURE
                 */
                {
                  id: "panel",
                  label: __("Custom Hook", "th-store-one"),
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

                  content: (
                    <S1FieldGroup
                      number={5}
                      title={__("Custom Field Hook", "th-store-one")}
                    >
                      <S1Field
                        label={__("Custom Field Hook Filter", "th-store-one")}
                        description={
                          <>
                            {__(
                              "Add custom fields to the Product Compare field map.",
                              "th-store-one",
                            )}
                            <br />
                            {__("Filter:", "th-store-one")}{" "}
                            <code>store-one-product-compare-field</code>
                            <br />
                            {__("Expected shape:", "th-store-one")}
                          </>
                        }
                      >
                        <div className="s1-custom-hook-code">
                          <pre>
                            <code>{`function my_callback() {
    return array(
        'key1' => array(
            'title'     => 'Title 1',
            'field_key' => 'key1',
        ),
        'key2' => array(
            'title'     => 'Title 2',
            'field_key' => 'key2',
        ),
    );
}
add_filter( 'store-one-product-compare-field', 'my_callback' );

return array(
    'key1' => array( // WordPress post meta key (custom field key).
        'title'     => 'Label',   // Shown in the compare table header/UI.
        'field_key' => 'meta_key' // Post meta key to fetch from the product.
    ),
);`}</code>
                          </pre>
                        </div>
                      </S1Field>
                    </S1FieldGroup>
                  ),
                },

                /**
                 * STYLE
                 */
                {
                  id: "style",
                  label: __("Style", "th-store-one"),
                  icon: ICONS.DESIGN,
                  content: (
                    <>
                      <S1FieldGroup
                        number={1}
                        title={__("Compare Bar", "th-store-one")}
                      >
                        <S1Field
                          label={__("Compare Bar Text", "th-store-one")}
                          description={
                            <>
                              {__("Use format:", "th-store-one")}{" "}
                              <code>{"{selected} {products}"}</code>
                            </>
                          }
                        >
                          <TextControl
                            value={settings["compare-atleast-text"]}
                            placeholder={__("Compare", "th-store-one")}
                            onChange={(value) =>
                              update("compare-atleast-text", value)
                            }
                          />
                        </S1Field>
                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Background Color", "th-store-one")}
                              value={settings["footer-bar-bg-color"]}
                              onChange={(v) => update("footer-bar-bg-color", v)}
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Content Color", "th-store-one")}
                              value={settings["footer-content-color"]}
                              onChange={(v) =>
                                update("footer-content-color", v)
                              }
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>

                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Button Color", "th-store-one")}
                              value={settings["footer-bar-btn-color"]}
                              onChange={(v) =>
                                update("footer-bar-btn-color", v)
                              }
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__(
                                "Button Background Color",
                                "th-store-one",
                              )}
                              value={settings["footer-bar-btn-bg-color"]}
                              onChange={(v) =>
                                update("footer-bar-btn-bg-color", v)
                              }
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>
                      </S1FieldGroup>
                      {/* Popup */}
                      <S1FieldGroup
                        number={1}
                        title={__("Popup", "th-store-one")}
                      >
                        <S1Field
                          label={__("Popup Heading Text", "th-store-one")}
                        >
                          <TextControl
                            value={settings["compare-heading-text"]}
                            onChange={(value) =>
                              update("compare-heading-text", value)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__("Popup Count Text", "th-store-one")}
                          description={
                            <>
                              {__(
                                "Use format. You can change count position:",
                                "th-store-one",
                              )}{" "}
                              <code>{"{count} {Text to be shown.}"}</code>
                            </>
                          }
                        >
                          <TextControl
                            value={settings["compare-count-text"]}
                            onChange={(value) =>
                              update("compare-count-text", value)
                            }
                          />
                        </S1Field>

                        <div className="s1-field-group-row">
                          <S1Field
                            label={__("Popup Animation", "th-store-one")}
                          >
                            <SelectControl
                              value={settings["compare-popup-animation"]}
                              options={[
                                {
                                  label: __("Top Slide", "th-store-one"),
                                  value: "1",
                                },
                                {
                                  label: __("Left Slide", "th-store-one"),
                                  value: "2",
                                },
                                {
                                  label: __("Right Slide", "th-store-one"),
                                  value: "3",
                                },
                                {
                                  label: __("ZoomIn", "th-store-one"),
                                  value: "4",
                                },
                              ]}
                              onChange={(value) =>
                                update("compare-popup-animation", value)
                              }
                            />
                          </S1Field>

                          <S1Field label={__("Popup Position", "th-store-one")}>
                            <SelectControl
                              value={settings["compare-popup-position"]}
                              options={[
                                {
                                  label: __("Bottom", "th-store-one"),
                                  value: "bottom",
                                },
                                {
                                  label: __("Left", "th-store-one"),
                                  value: "left",
                                },
                                {
                                  label: __("Right", "th-store-one"),
                                  value: "right",
                                },
                                {
                                  label: __("Top", "th-store-one"),
                                  value: "top",
                                },
                              ]}
                              onChange={(value) =>
                                update("compare-popup-position", value)
                              }
                            />
                          </S1Field>
                        </div>
                      </S1FieldGroup>

                      {/* Global Colors */}
                      <S1FieldGroup
                        number={2}
                        title={__("Global Colors", "th-store-one")}
                      >
                        <S1Field>
                          <THBackgroundControl
                            label={__(
                              "Global Background Color",
                              "th-store-one",
                            )}
                            value={settings["global-background"]}
                            onChange={(value) =>
                              update("global-background", value)
                            }
                            allowGradient={false}
                          />
                        </S1Field>
                      </S1FieldGroup>

                      {/* Header */}
                      <S1FieldGroup
                        number={3}
                        title={__("Header", "th-store-one")}
                      >
                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Color", "th-store-one")}
                              value={settings["heading-style"]}
                              onChange={(value) =>
                                update("heading-style", value)
                              }
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Background Color", "th-store-one")}
                              value={settings["heading-style-bg"]}
                              onChange={(value) =>
                                update("heading-style-bg", value)
                              }
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>
                      </S1FieldGroup>

                      {/* Table */}
                      <S1FieldGroup
                        number={4}
                        title={__("Table", "th-store-one")}
                      >
                        <S1Field>
                          <THBackgroundControl
                            label={__("Table Content Color", "th-store-one")}
                            value={settings["table-content-color"]}
                            onChange={(value) =>
                              update("table-content-color", value)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__(
                                "Table Background Color",
                                "th-store-one",
                              )}
                              value={settings["product-img-bg-color"]}
                              onChange={(value) =>
                                update("product-img-bg-color", value)
                              }
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Border Color", "th-store-one")}
                              value={settings["dummy-border-color"]}
                              onChange={(value) =>
                                update("dummy-border-color", value)
                              }
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>

                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Rating Color", "th-store-one")}
                              value={settings["rating-color"]}
                              onChange={(value) =>
                                update("rating-color", value)
                              }
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__(
                                "Remove Button Text Color",
                                "th-store-one",
                              )}
                              value={settings["remove-btn-color"]}
                              onChange={(value) =>
                                update("remove-btn-color", value)
                              }
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>
                      </S1FieldGroup>

                      {/* Image Remove Icon */}
                      <S1FieldGroup
                        number={5}
                        title={__("Image Remove Icon", "th-store-one")}
                      >
                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Icon Color", "th-store-one")}
                              value={settings["img-remove-icon-color"]}
                              onChange={(value) =>
                                update("img-remove-icon-color", value)
                              }
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Background Color", "th-store-one")}
                              value={settings["img-remove-icon-color"]}
                              onChange={(value) =>
                                update("img-remove-icon-color", value)
                              }
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>

                        <S1Field label={__("Button Size (px)", "th-store-one")}>
                          <UniversalRangeControl
                            label=""
                            value={String(
                              settings["img-remove-btn-size"] ?? 18,
                            )}
                            onChange={(value) =>
                              update("img-remove-btn-size", value)
                            }
                            min={16}
                            max={48}
                          />
                        </S1Field>
                      </S1FieldGroup>

                      {/* Add To Cart */}
                      <S1FieldGroup
                        number={6}
                        title={__("Add To Cart", "th-store-one")}
                      >
                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Color", "th-store-one")}
                              value={settings["add-to-cart"]}
                              onChange={(value) => update("add-to-cart", value)}
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Background Color", "th-store-one")}
                              value={settings["add-to-cart"]}
                              onChange={(value) => update("add-to-cart", value)}
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>
                      </S1FieldGroup>

                      {/* Close Button */}
                      <S1FieldGroup
                        number={7}
                        title={__("Close Button", "th-store-one")}
                      >
                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Color", "th-store-one")}
                              value={settings["close-btn-style"]}
                              onChange={(value) =>
                                update("close-btn-style", value)
                              }
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Background Color", "th-store-one")}
                              value={settings["close-btn-style"]}
                              onChange={(value) =>
                                update("close-btn-style", value)
                              }
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>
                      </S1FieldGroup>
                    </>
                  ),
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

                  content: (
                    <>
                      <S1FieldGroup
                        number={1}
                        title="Basic"
                        pro={licenseActive ? false : true}
                      >
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
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={2}
                        pro={licenseActive ? false : true}
                        title={__("Advanced Settings", "th-store-one")}
                      >
                        {/* Compare Same Category Product */}
                        <div className="s1-field-group-row">
                          <S1Field
                            label={__(
                              "Compare Same Category Product",
                              "th-store-one",
                            )}
                            description={__(
                              "Enable Category Tab in the Comparison Table.",
                              "th-store-one",
                            )}
                          >
                            <ToggleControl
                              __nextHasNoMarginBottom
                              checked={!!settings["field-show-by-category"]}
                              onChange={(value) =>
                                update("field-show-by-category", value)
                              }
                            />
                          </S1Field>

                          {/* Similarities & Differences */}
                          <S1Field
                            label={__(
                              "Similarities & Differences",
                              "th-store-one",
                            )}
                            description={__(
                              "Enable to show differences.",
                              "th-store-one",
                            )}
                          >
                            <ToggleControl
                              __nextHasNoMarginBottom
                              checked={!!settings["field-highlight-btn"]}
                              onChange={(value) =>
                                update("field-highlight-btn", value)
                              }
                            />
                          </S1Field>
                        </div>

                        {/* Fields */}
                        <S1Field
                          label={__(
                            "Fields to Show in Comparison Table",
                            "th-store-one",
                          )}
                          description={__(
                            "Enable fields and drag to reorder them.",
                            "th-store-one",
                          )}
                        >
                          <ComparisonFieldsSortable
                            value={settings.comparetableattributes || {}}
                            onChange={(value) =>
                              update("comparetableattributes", value)
                            }
                          />
                        </S1Field>

                        {/* Dynamic Attributes */}
                        <div className="s1-field-group-row">
                          <S1Field
                            label={__("Dynamic Attributes", "th-store-one")}
                            description={__(
                              "Enable to show all custom product attributes automatically.",
                              "th-store-one",
                            )}
                          >
                            <ToggleControl
                              __nextHasNoMarginBottom
                              checked={!!settings["field-dynamic-attribute"]}
                              onChange={(value) =>
                                update("field-dynamic-attribute", value)
                              }
                            />
                          </S1Field>

                          {/* Repeat Fields */}
                          <S1Field
                            label={__("Repeat Price Field", "th-store-one")}
                            description={__(
                              'Repeat the "Price" field at the end of the table.',
                              "th-store-one",
                            )}
                          >
                            <ToggleControl
                              __nextHasNoMarginBottom
                              checked={!!settings["field-repeat-price"]}
                              onChange={(value) =>
                                update("field-repeat-price", value)
                              }
                            />
                          </S1Field>
                        </div>
                        <S1Field
                          label={__("Repeat Add to Cart Field", "th-store-one")}
                          description={__(
                            'Repeat the "Add to cart" field at the end of the table.',
                            "th-store-one",
                          )}
                        >
                          <ToggleControl
                            __nextHasNoMarginBottom
                            checked={!!settings["field-repeat-add-to-cart"]}
                            onChange={(value) =>
                              update("field-repeat-add-to-cart", value)
                            }
                          />
                        </S1Field>

                        {/* Product Image Size */}
                        <S1Field
                          label={__("Product Image Size", "th-store-one")}
                          description={__(
                            "Dimensions of product images in the comparison table.",
                            "th-store-one",
                          )}
                        >
                          <UniversalRangeControl
                            label={__("Width (px)", "th-store-one")}
                            value={String(
                              settings["product-image-width"] ?? 168,
                            )}
                            onChange={(value) =>
                              update("product-image-width", value)
                            }
                            min={50}
                            max={500}
                          />

                          <UniversalRangeControl
                            label={__("Height (px)", "th-store-one")}
                            value={String(
                              settings["product-image-height"] ?? 168,
                            )}
                            onChange={(value) =>
                              update("product-image-height", value)
                            }
                            min={50}
                            max={500}
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={3}
                        pro={licenseActive ? false : true}
                        title={__("Generate Shortcode", "th-store-one")}
                      >
                        <S1Field
                          label={__("Choose Products", "th-store-one")}
                          description={__(
                            "Use the generated shortcode to display the selected product or product comparison list anywhere on your website.",
                            "th-store-one",
                          )}
                        >
                          <MultiWooSearchSelector
                            searchType="product"
                            label={__("Select Products", "th-store-one")}
                            value={settings.shortcode_products || []}
                            onChange={(items) =>
                              update("shortcode_products", items)
                            }
                            detailedView={true}
                          />
                        </S1Field>

                        <S1Field
                          label={__("Copy Shortcode", "th-store-one")}
                          description={
                            <>
                              {__(
                                "Use the generated shortcode to display the selected product or product comparison list anywhere on your website.",
                                "th-store-one",
                              )}
                              <br />
                              <span className="s1-shortcode-note">
                                {__(
                                  "* Replace the Product ID(s) with the specific Product ID or IDs you want to compare.",
                                  "th-store-one",
                                )}
                              </span>
                            </>
                          }
                        >
                          <div className="s1-shortcode-wrapper">
                            <textarea
                              readOnly
                              value={(() => {
                                const products =
                                  settings.shortcode_products || [];

                                const ids = products
                                  .map(getProductId)
                                  .filter(Boolean);

                                if (ids.length === 1) {
                                  return `[store_one_compare pid="${ids[0]}"]`;
                                }

                                if (ids.length > 1) {
                                  return `[store_one_compare_product_list pid="${ids.join(
                                    ",",
                                  )}"]`;
                                }

                                return `[store_one_compare pid=""]`;
                              })()}
                              className="s1-shortcode-textarea"
                            />

                            <button
                              type="button"
                              className="s1-shortcode-copy"
                              onClick={() => {
                                const products =
                                  settings.shortcode_products || [];

                                const ids = products
                                  .map(getProductId)
                                  .filter(Boolean);

                                let shortcode = "";

                                if (ids.length === 1) {
                                  shortcode = `[store_one_compare pid="${ids[0]}"]`;
                                } else if (ids.length > 1) {
                                  shortcode = `[store_one_compare_product_list pid="${ids.join(
                                    ",",
                                  )}"]`;
                                }

                                if (shortcode) {
                                  navigator.clipboard.writeText(shortcode);
                                }
                              }}
                              title={__("Copy Shortcode", "th-store-one")}
                            >
                              <span className="s1-copy-icon">
                                <CopyIcon />
                              </span>
                            </button>
                          </div>
                        </S1Field>
                      </S1FieldGroup>
                    </>
                  ),
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
