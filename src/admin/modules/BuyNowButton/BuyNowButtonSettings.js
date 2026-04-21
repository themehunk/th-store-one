import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import {
  Spinner,
  ToggleControl,
  SelectControl,
  TextControl,
} from "@wordpress/components";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import { ICONS } from "@th-storeone-global/icons";
import DeviceSelector from "@th-storeone-global/DeviceSelector";
import MultiWooSearchSelector from "@th-storeone-global/MultiWooSearchSelector";
import ExcludeWooCondition from "@th-storeone-global/ExcludeWooCondition";
import UserCondition from "@th-storeone-global/UserCondition";
import THBackgroundControl from "@th-storeone-control/color";
import S1DateTimePicker from "@th-storeone-global/S1DateTimePicker";
import PlacementPriorityControl from "@th-storeone-global/PlacementPriorityControl";
import { CopyIcon } from "@radix-ui/react-icons";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import UniversalBorderControl from "@th-storeone-control/UniversalBorderControl";
import UniversalDimensionControl from "@th-storeone-control/UniversalDimensionControl";

const MODULE_ID = "buynow-button";

/* ---------------------------------
 * DEFAULT SETTINGS
 * --------------------------------- */
const DEFAULT_SETTINGS = {
  enable_shop_page: true,
  archive_position: "after_add_to_cart",
  archive_btn_text: __("Buy Now", "th-store-one"),
  hide_shop_add_to_cart_button: false,
  archive_default_quantity: 1,
  trigger_type: "all_products",
  products: [],
  categories: [],
  tags: [],
  exclude_products_enabled: false,
  exclude_products: [],
  exclude_categories_enabled: false,
  exclude_categories: [],
  exclude_tags_enabled: false,
  exclude_tags: [],
  exclude_brands_enabled: false,
  exclude_brands: [],
  exclude_on_sale_enabled: false,
  exclude_enabled: false,

  enable_single_page: false,
  single_placement: "woocommerce_after_add_to_cart_form",
  single_priority: 10,
  hide_single_add_to_cart_button: false,
  single_btn_text: __("Buy Now", "th-store-one"),

  single_trigger_type: "all_products",
  single_products: [],
  single_categories: [],
  single_tags: [],
  exclude_single_products_enabled: false,
  exclude_single_products: [],
  exclude_single_categories_enabled: false,
  exclude_single_categories: [],
  exclude_single_tags_enabled: false,
  exclude_single_tags: [],
  exclude_single_on_sale_enabled: false,
  exclude_single_enabled: false,

  action: "redirect_checkout",
  custom_page_url: "https://",
  reset_cart_before_buy_now: false,
  product_types: ["simple", "variable"],
  btn_style: "default_btn_style",
  btn_bg_clr: "#111",
  btn_text_clr: "#ffffff",

  btn_border: {
    width: {
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
    },
    style: "solid",
    color: "#e5e7eb",
    radius: {
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
  },
  btn_padding: {
    top: "10px",
    right: "15px",
    bottom: "10px",
    left: "15px",
  },
};

export default function BuyNowButtonSettings({
  onSettingsChange,
  onRegisterSave,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [hideToast, setHideToast] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const devices = settings.visibility?.devices || [];
  const isOnlyMobile = devices.includes("mobile");
  /* ---------------------------------
   * LOAD SETTINGS
   * --------------------------------- */
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
      .catch(() => setError(__("Failed to load settings.", "th-store-one")))
      .finally(() => setLoading(false));
  }, []);

  /* ---------------------------------
   * SAVE HANDLER
   * --------------------------------- */
  const handleSave = () => {
    if (saving) return;

    setSaving(true);
    setSuccess("");
    setError("");

    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}`,
      method: "POST",
      data: { settings },
    })
      .then(() => setSuccess(__("Saved successfully!", "th-store-one")))
      .catch(() => setError(__("Failed to save.", "th-store-one")))
      .finally(() => setSaving(false));
  };

  /* ---------------------------------
   * NOTIFY PARENT ON CHANGE
   * --------------------------------- */
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings]);

  /* ---------------------------------
   * REGISTER SAVE WITH ADMIN MAIN
   * --------------------------------- */
  useEffect(() => {
    onRegisterSave?.(() => handleSave);
  }, [settings]);

  /* ---------------------------------
   * AUTO HIDE TOAST
   * --------------------------------- */
  useEffect(() => {
    if (success || error) {
      setHideToast(false);

      const t1 = setTimeout(() => setHideToast(true), 2500);
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

  /* ---------------------------------
   * RENDER
   * --------------------------------- */
  return (
    <div className="storeone-module-settings">
      {loading && (
        <div className="store-one-loader">
          <Spinner /> {__("Loading…", "th-store-one")}
        </div>
      )}

      {!loading && (
        <>
          {/* NOTICES */}
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

          {/* ---------------------------------
           * PRODUCT PAGE SETTINGS
           * --------------------------------- */}
          <h3 className="store-one-section-title">
            {__("Buy Now Button", "th-store-one")}
          </h3>
          <div className="store-one-rule-item">
            <TabSwitcher
              defaultTab="settings"
              tabs={[
                {
                  id: "settings",
                  label: "Settings",
                  icon: ICONS.SETTINGS,
                  content: (
                    <>
                      <S1FieldGroup title={__("Archive page", "th-store-one")}>
                        <S1Field
                          label={__("Enable on Archive Page", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.enable_shop_page}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                enable_shop_page: v,
                              })
                            }
                          />
                        </S1Field>
                        {settings.enable_shop_page == true && (
                          <>
                            <S1Field
                              label={__("Archive Position", "th-store-one")}
                            >
                              <SelectControl
                                value={settings.archive_position}
                                options={[
                                  {
                                    label: "after title",
                                    value: "after_title",
                                  },
                                  {
                                    label: "after rating",
                                    value: "after_rating",
                                  },
                                  {
                                    label: "after price",
                                    value: "after_price",
                                  },
                                  {
                                    label: "before add to cart",
                                    value: "before_add_to_cart",
                                  },
                                  {
                                    label: "after add to cart",
                                    value: "after_add_to_cart",
                                  },
                                ]}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    archive_position: v,
                                  })
                                }
                              />
                            </S1Field>

                            <S1Field label={__("Button Text", "th-store-one")}>
                              <TextControl
                                value={settings.archive_btn_text}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    archive_btn_text: v,
                                  })
                                }
                              />
                            </S1Field>
                            <S1Field
                              label={__("Default Quantity Set", "th-store-one")}
                            >
                              <TextControl
                                value={settings.archive_default_quantity}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    archive_default_quantity: v,
                                  })
                                }
                              />
                            </S1Field>
                            <S1Field
                              label={__(
                                "Replace Add to Cart Button",
                                "th-store-one",
                              )}
                              classN="s1-toggle-wrpapper"
                            >
                              <ToggleControl
                                checked={settings.hide_shop_add_to_cart_button}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    hide_shop_add_to_cart_button: v,
                                  })
                                }
                              />
                            </S1Field>

                            <S1Field label={__("Trigger Type", "th-store-one")}>
                              <SelectControl
                                value={settings.trigger_type}
                                options={[
                                  {
                                    label: __("All Products", "th-store-one"),
                                    value: "all_products",
                                  },
                                  {
                                    label: __(
                                      "Specific Products",
                                      "th-store-one",
                                    ),
                                    value: "specific_products",
                                  },
                                  {
                                    label: __(
                                      "Specific Categories",
                                      "th-store-one",
                                    ),
                                    value: "specific_categories",
                                  },

                                  {
                                    label: __("Disable", "th-store-one"),
                                    value: "disable",
                                  },
                                ]}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    trigger_type: v,
                                  })
                                }
                              />
                            </S1Field>
                            {settings.trigger_type === "specific_products" &&
                              settings.trigger_type !== "disable" && (
                                <MultiWooSearchSelector
                                  searchType="product"
                                  label={__("Select Products", "th-store-one")}
                                  value={settings.products || []}
                                  onChange={(v) =>
                                    setSettings({
                                      ...settings,
                                      products: v,
                                    })
                                  }
                                  detailedView={true}
                                />
                              )}

                            {settings.trigger_type === "specific_categories" &&
                              settings.trigger_type !== "disable" && (
                                <MultiWooSearchSelector
                                  searchType="category"
                                  label={__(
                                    "Select Categories",
                                    "th-store-one",
                                  )}
                                  value={settings.categories || []}
                                  onChange={(v) =>
                                    setSettings({
                                      ...settings,
                                      categories: v,
                                    })
                                  }
                                  detailedView={true}
                                />
                              )}

                            {/* ———————— EXCLUDE OPTIONS ————————— */}
                            {settings.trigger_type !== "disable" && (
                              <>
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

                                <ExcludeWooCondition
                                  label={__(
                                    "Exclude categories",
                                    "th-store-one",
                                  )}
                                  searchType="category"
                                  enabled={settings.exclude_categories_enabled}
                                  items={settings.exclude_categories}
                                  onToggle={(v) =>
                                    setSettings({
                                      ...settings,
                                      exclude_categories_enabled: v,
                                    })
                                  }
                                  onChangeItems={(items) =>
                                    setSettings({
                                      ...settings,
                                      exclude_categories: items,
                                    })
                                  }
                                  detailedView={true}
                                />

                                <ExcludeWooCondition
                                  label={__(
                                    "Exclude On-Sale products",
                                    "th-store-one",
                                  )}
                                  searchType="on_sale"
                                  enabled={settings.exclude_on_sale_enabled}
                                  items={[]} // no search selector for this one
                                  onToggle={(v) =>
                                    setSettings({
                                      ...settings,
                                      exclude_on_sale_enabled: v,
                                    })
                                  }
                                  onChangeItems={() => {}}
                                />
                              </>
                            )}
                            {settings.trigger_type == "disable" && (
                              <S1Field label={__("Shortcode", "th-store-one")}>
                                <p className="s1-shortcode-description">
                                  {__(
                                    "Use this shortcode to display this Featured List anywhere on your site (posts, pages, widgets, or page builders).",
                                    "th-store-one",
                                  )}
                                </p>
                                <div className="s1-shortcode-wrapper">
                                  <textarea
                                    readOnly
                                    value={`[th_store_one_shop_buy_now]`}
                                    className="s1-shortcode-textarea"
                                  />

                                  <button
                                    type="button"
                                    className="s1-shortcode-copy"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `[th_store_one_shop_buy_now"]`,
                                      );
                                    }}
                                  >
                                    <CopyIcon />
                                  </button>
                                </div>
                              </S1Field>
                            )}
                          </>
                        )}
                      </S1FieldGroup>
                      <S1FieldGroup title={__("Single page", "th-store-one")}>
                        <S1Field
                          label={__("Enable on Single Page", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.enable_single_page}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                enable_single_page: v,
                              })
                            }
                          />
                        </S1Field>
                        {settings.enable_single_page == true && (
                          <>
                            <PlacementPriorityControl
                              placement={settings.single_placement}
                              priority={settings.single_priority}
                              onPlacementChange={(v) =>
                                setSettings({
                                  ...settings,
                                  single_placement: v,
                                })
                              }
                              onPriorityChange={(v) =>
                                setSettings({
                                  ...settings,
                                  single_priority: v,
                                })
                              }
                            />
                            <S1Field
                              label={__(
                                "Replace Add to Cart Button",
                                "th-store-one",
                              )}
                              classN="s1-toggle-wrpapper"
                            >
                              <ToggleControl
                                checked={
                                  settings.hide_single_add_to_cart_button
                                }
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    hide_single_add_to_cart_button: v,
                                  })
                                }
                              />
                            </S1Field>
                            <S1Field label={__("Button Text", "th-store-one")}>
                              <TextControl
                                value={settings.single_btn_text}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    single_btn_text: v,
                                  })
                                }
                              />
                            </S1Field>

                            <S1Field label={__("Trigger Type", "th-store-one")}>
                              <SelectControl
                                value={settings.single_trigger_type}
                                options={[
                                  {
                                    label: __("All Products", "th-store-one"),
                                    value: "all_products",
                                  },
                                  {
                                    label: __(
                                      "Specific Products",
                                      "th-store-one",
                                    ),
                                    value: "specific_products",
                                  },
                                  {
                                    label: __(
                                      "Specific Categories",
                                      "th-store-one",
                                    ),
                                    value: "specific_categories",
                                  },

                                  {
                                    label: __("Disable", "th-store-one"),
                                    value: "disable",
                                  },
                                ]}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    single_trigger_type: v,
                                  })
                                }
                              />
                            </S1Field>
                            {settings.single_trigger_type ===
                              "specific_products" &&
                              settings.single_trigger_type !== "disable" && (
                                <MultiWooSearchSelector
                                  searchType="product"
                                  label={__("Select Products", "th-store-one")}
                                  value={settings.single_products || []}
                                  onChange={(v) =>
                                    setSettings({
                                      ...settings,
                                      single_products: v,
                                    })
                                  }
                                  detailedView={true}
                                />
                              )}

                            {settings.single_trigger_type ===
                              "specific_categories" &&
                              settings.single_trigger_type !== "disable" && (
                                <MultiWooSearchSelector
                                  searchType="category"
                                  label={__(
                                    "Select Categories",
                                    "th-store-one",
                                  )}
                                  value={settings.single_categories || []}
                                  onChange={(v) =>
                                    setSettings({
                                      ...settings,
                                      categories: v,
                                    })
                                  }
                                  detailedView={true}
                                />
                              )}

                            {/* ———————— EXCLUDE OPTIONS ————————— */}
                            {settings.single_trigger_type !== "disable" && (
                              <>
                                <ExcludeWooCondition
                                  label="Exclude Products"
                                  searchType="product"
                                  enabled={
                                    settings.exclude_single_products_enabled
                                  }
                                  items={settings.exclude_single_products || []}
                                  onToggle={(v) =>
                                    setSettings({
                                      ...settings,
                                      exclude_single_products_enabled: v,
                                    })
                                  }
                                  onChangeItems={(items) =>
                                    setSettings({
                                      ...settings,
                                      exclude_single_products: items,
                                    })
                                  }
                                  detailedView={true}
                                />

                                <ExcludeWooCondition
                                  label={__(
                                    "Exclude categories",
                                    "th-store-one",
                                  )}
                                  searchType="category"
                                  enabled={
                                    settings.exclude_single_categories_enabled
                                  }
                                  items={settings.exclude_categories}
                                  onToggle={(v) =>
                                    setSettings({
                                      ...settings,
                                      exclude_single_categories_enabled: v,
                                    })
                                  }
                                  onChangeItems={(items) =>
                                    setSettings({
                                      ...settings,
                                      exclude_single_categories: items,
                                    })
                                  }
                                  detailedView={true}
                                />

                                <ExcludeWooCondition
                                  label={__(
                                    "Exclude On-Sale products",
                                    "th-store-one",
                                  )}
                                  searchType="on_sale"
                                  enabled={
                                    settings.exclude_single_on_sale_enabled
                                  }
                                  items={[]} // no search selector for this one
                                  onToggle={(v) =>
                                    setSettings({
                                      ...settings,
                                      exclude_single_on_sale_enabled: v,
                                    })
                                  }
                                  onChangeItems={() => {}}
                                />
                              </>
                            )}
                            {settings.single_trigger_type == "disable" && (
                              <S1Field label={__("Shortcode", "th-store-one")}>
                                <p className="s1-shortcode-description">
                                  {__(
                                    "Use this shortcode to display this Featured List anywhere on your site (posts, pages, widgets, or page builders).",
                                    "th-store-one",
                                  )}
                                </p>
                                <div className="s1-shortcode-wrapper">
                                  <textarea
                                    readOnly
                                    value={`[th_store_one_single_buy_now]`}
                                    className="s1-shortcode-textarea"
                                  />

                                  <button
                                    type="button"
                                    className="s1-shortcode-copy"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `[th_store_one_single_buy_now"]`,
                                      );
                                    }}
                                  >
                                    <CopyIcon />
                                  </button>
                                </div>
                              </S1Field>
                            )}
                          </>
                        )}
                      </S1FieldGroup>
                    </>
                  ),
                },
                {
                  id: "visibility",
                  label: "Action & Behavior",
                  icon: ICONS.DISPLAY,
                  content: (
                    <>
                      <S1Field label={__("Action", "th-store-one")}>
                        <SelectControl
                          value={settings.action}
                          options={[
                            {
                              label: __(
                                "Redirect to Checkout Page",
                                "th-store-one",
                              ),
                              value: "redirect_checkout",
                            },
                            {
                              label: __(
                                "Redirect to Cart Page",
                                "th-store-one",
                              ),
                              value: "redirect_cart",
                            },
                            {
                              label: __(
                                "Redirect to Custom Page",
                                "th-store-one",
                              ),
                              value: "redirect_custom",
                            },
                          ]}
                          onChange={(v) =>
                            setSettings({
                              ...settings,
                              action: v,
                            })
                          }
                        />
                      </S1Field>
                      {settings.action === "redirect_custom" && (
                        <S1Field label={__("Custom Page URL", "th-store-one")}>
                          <TextControl
                            value={settings.custom_page_url}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                custom_page_url: v,
                              })
                            }
                          />
                        </S1Field>
                      )}

                      <S1Field
                        label={__(
                          "Reset the cart before doing buy now.",
                          "th-store-one",
                        )}
                        classN="s1-toggle-wrpapper"
                      >
                        <ToggleControl
                          checked={settings.reset_cart_before_buy_now}
                          onChange={(v) =>
                            setSettings({
                              ...settings,
                              reset_cart_before_buy_now: v,
                            })
                          }
                        />
                      </S1Field>

                      <MultiWooSearchSelector
                        label={__("Supported Product Types", "th-store-one")}
                        searchType="product_type"
                        value={settings.product_types || []}
                        onChange={(items) =>
                          setSettings({
                            ...settings,
                            product_types: items,
                          })
                        }
                        detailedView={true}
                      />
                    </>
                  ),
                },

                {
                  id: "style",
                  label: "Style",
                  icon: ICONS.DESIGN,
                  content: (<>
                  <S1Field label={__("Button Style", "th-store-one")}>
                        <SelectControl
                          value={settings.btn_style}
                          options={[
                            {
                              label: __(
                                "Theme Style (Default)",
                                "th-store-one",
                              ),
                              value: "default_btn_style",
                            },
                            {
                              label: __(
                                "Custom Style",
                                "th-store-one",
                              ),
                              value: "custom_btn_style",
                            },
                            
                          ]}
                          onChange={(v) =>
                            setSettings({
                              ...settings,
                              btn_style: v,
                            })
                          }
                        />
                      </S1Field>

{settings.btn_style === "custom_btn_style" && (
  <>
                      <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Background", "th-store-one")}
                            value={settings.btn_bg_clr || "#111"}
                            onChange={(v) =>
                            setSettings({
                              ...settings,
                              btn_bg_clr: v,
                            })
                          }
                          />
                        </S1Field>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Text Color", "th-store-one")}
                            value={settings.btn_text_clr || "#fff"}
                            onChange={(v) =>
                            setSettings({
                              ...settings,
                              btn_text_clr: v,
                            })
                          }
                          />
                        </S1Field>
                        <UniversalDimensionControl
                          label="Padding"
                          value={settings.btn_padding}
                          responsive={false}
                          onChange={(v) =>
                            setSettings({
                              ...settings,
                              btn_padding: v,
                            })
                          }
                        />
                        <UniversalBorderControl
                          value={settings.btn_border}
                          onChange={(v) =>
                            setSettings({
                              ...settings,
                              btn_border: v,
                            })
                          }
                        />
                          
                       
  </>
)}
                  </>
                  ),
                },
              ]}
            ></TabSwitcher>
          </div>
        </>
      )}
      <div className="store-one-rules-footer bundle-footer">
        <ResetModuleButton
          moduleId={MODULE_ID}
          label="Reset"
          onReset={(newSettings) =>
            setSettings({
              ...DEFAULT_SETTINGS,
              ...newSettings,
            })
          }
        />
      </div>
    </div>
  );
}
