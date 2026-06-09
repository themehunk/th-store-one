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
import AlignmentControl from "@th-storeone-control/AlignmentControl";

const MODULE_ID = "sale-countdown";

/* ---------------------------------
 * DEFAULT SETTINGS
 * --------------------------------- */
const DEFAULT_SETTINGS = {
  enable_countdown: true,
  start_datetime: "",
  end_datetime: "",
  show_on_discounted: false,
  sale_message: "Hurry! Offer ends soon",

  show_on_archive: false,
  show_on_single: true,

  archive_position: "after_price",
  single_placement: "woocommerce_before_add_to_cart_form",
  single_priority: 10,

  trigger_type: "all_products",

  countdown_expire_action: "hide",
  expire_message: "Offer expired",

  sale_countdown_style: "style2",
  sale_countdown_archive_style: "acstyle1",
  time_format: "dhms",

  show_message: true,
  show_stock_bar: true,
  show_timer_labels: true,

  border_radius: 6,
  padding: 10,

  enable_stock_bar: true,

  stock_threshold: 10,

  hide_if_expired: true,
  hide_if_no_stock: true,

  single_bg_color: "#fff",
  single_text_color: "#111",
  single_timer_bg_color: "#d7d3d3b8",
  single_timer_color: "#111",
  single_sold_bar_bg_color: "#229fd8",
  single_font_size: "14px",

  archive_bg_color: "#f5f6f8",
  archive_text_color: "#111",
  archive_timer_bg_color: "#f5f6f8",
  archive_timer_color: "#111",
  archive_sold_bar_bg_color: "#229fd8",
  archive_font_size: "11px",
  alignmentArchive: "center",
  alignmentSingle: "left",

  border: {
    width: {
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
    style: "solid",
    color: "",
    radius: {
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
  },
};

const STYLE_DEFAULTS = {
  // SINGLE STYLES
  style1: {
    single_bg_color: "#fff",
    single_text_color: "#111",
    single_timer_bg_color: "#d7d3d3b8",
    single_timer_color: "#111",
    single_sold_bar_bg_color: "#229fd8",
  },
  style2: {
    single_bg_color: "#ffffff",
    single_text_color: "#9B9B9B",
    single_timer_bg_color: "#111",
    single_timer_color: "#111",
    single_sold_bar_bg_color: "#229fd8",
  },
  style3: {
    single_bg_color: "#ffffff",
    single_text_color: "#111",
    single_timer_bg_color: "#d7d3d3b8",
    single_timer_color: "#111",
    single_sold_bar_bg_color: "#229fd8",
  },

  // ARCHIVE STYLES
  acstyle1: {
    archive_bg_color: "#fff",
    archive_text_color: "#111",
    archive_timer_bg_color: "#f5f6f8",
    archive_timer_color: "#111",
    archive_sold_bar_bg_color: "#229fd8",
  },
  acstyle2: {
    archive_bg_color: "#fff",
    archive_text_color: "#111",
    archive_timer_bg_color: "#d7d3d3b8",
    archive_timer_color: "#111",
    archive_sold_bar_bg_color: "#229fd8",
  },
  acstyle3: {
    archive_bg_color: "#fff",
    archive_text_color: "#111",
    archive_timer_bg_color: "#f5f6f8",
    archive_timer_color: "#111",
    archive_sold_bar_bg_color: "#229fd8",
  },
};
const applyStyleDefaults = (settings, style, type) => {
  const defaults = STYLE_DEFAULTS[style] || {};
  let updated = { ...settings };

  Object.keys(defaults).forEach((key) => {
    const autoKey = `${key}_auto`;

    if (settings[autoKey] !== false) {
      updated[key] = defaults[key];
      updated[autoKey] = true;
    }
  });

  return updated;
};
export default function SaleCountdownSettings({
  onSettingsChange,
  onRegisterSave,
  onModuleReady,
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      onModuleReady?.(MODULE_ID);
    }
  }, [loading]);
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

  useEffect(() => {
    const handler = (e) => {
      const { type, value } = e.detail || {};

      if (!value) return;

      let updated = { ...settings };

      if (type === "single") {
        updated.sale_countdown_style = value;

        //APPLY DEFAULTS
        updated = applyStyleDefaults(updated, value, "single");
      }

      if (type === "archive") {
        updated.sale_countdown_archive_style = value;

        //APPLY DEFAULTS
        updated = applyStyleDefaults(updated, value, "archive");
      }

      setSettings(updated);
      onSettingsChange?.(updated);
    };

    window.addEventListener("storeone:updateSaleCountdownStyle", handler);

    return () => {
      window.removeEventListener("storeone:updateSaleCountdownStyle", handler);
    };
  }, [settings]);

  useEffect(() => {
    const handler = (e) => {
      const { type } = e.detail || {};
      if (!type) return;

      const updated = {
        ...settings,
        sale_countdown_preview_type: type,
      };

      setSettings(updated);
      onSettingsChange?.(updated);
    };

    window.addEventListener("storeone:changeSaleCountdownPreviewType", handler);

    return () => {
      window.removeEventListener(
        "storeone:changeSaleCountdownPreviewType",
        handler,
      );
    };
  }, [settings]);

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
            {__("Sale Countdown", "th-store-one")}
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
                      <S1FieldGroup title={__("Set Countdown", "th-store-one")}>
                        <p className="s1-field-description">
                          Enable a sale countdown timer that will be displayed
                          on all sale products in your store. Set the start and
                          end date & time to control when the countdown is
                          shown.
                        </p>
                        <S1Field label="Start Date & Time">
                          <TextControl
                            type="datetime-local"
                            value={settings.start_datetime}
                            onChange={(v) =>
                              setSettings({ ...settings, start_datetime: v })
                            }
                          />
                        </S1Field>
                        <S1Field label="End Date & Time">
                          <TextControl
                            type="datetime-local"
                            value={settings.end_datetime}
                            onChange={(v) =>
                              setSettings({ ...settings, end_datetime: v })
                            }
                          />
                        </S1Field>
                        <S1Field
                          label={__("Sale Message", "th-store-one")}
                          description={__(
                            "This message will appear along with the countdown timer.",
                            "th-store-one",
                          )}
                        >
                          <TextControl
                            value={settings.sale_message || ""}
                            placeholder="Hurry! Offer ends soon"
                            onChange={(v) =>
                              setSettings({ ...settings, sale_message: v })
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      {/* SINGLE PAGE */}
                      <S1FieldGroup title={__("Single page", "th-store-one")}>
                        <S1Field
                          label={__("Enable on Single Page", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.show_on_single}
                            onChange={(v) =>
                              setSettings({ ...settings, show_on_single: v })
                            }
                          />
                        </S1Field>

                        {settings.show_on_single && (
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
                                setSettings({ ...settings, single_priority: v })
                              }
                            />
                          </>
                        )}
                      </S1FieldGroup>

                      {/* ARCHIVE PAGE */}
                      <S1FieldGroup title={__("Archive page", "th-store-one")}>
                        <S1Field
                          label={__("Enable on Archive Page", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.show_on_archive}
                            onChange={(v) =>
                              setSettings({ ...settings, show_on_archive: v })
                            }
                          />
                        </S1Field>

                        {settings.show_on_archive && (
                          <>
                            <S1Field
                              label={__("Archive Position", "th-store-one")}
                            >
                              <SelectControl
                                value={settings.archive_position}
                                options={[
                                  {
                                    label: "After Title",
                                    value: "after_title",
                                  },
                                  {
                                    label: "After Rating",
                                    value: "after_rating",
                                  },
                                  {
                                    label: "After Price",
                                    value: "after_price",
                                  },
                                  {
                                    label: "Before Add to Cart",
                                    value: "before_add_to_cart",
                                  },
                                  {
                                    label: "After Add to Cart",
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
                      <S1Field label="Countdown Expire Action">
                        <SelectControl
                          value={settings.countdown_expire_action}
                          options={[
                            { label: "Hide Countdown", value: "hide" },
                            { label: "Show Message", value: "show_message" },
                          ]}
                          onChange={(v) =>
                            setSettings({
                              ...settings,
                              countdown_expire_action: v,
                            })
                          }
                        />
                      </S1Field>

                      {settings.countdown_expire_action === "show_message" && (
                        <S1Field label="Expire Message">
                          <TextControl
                            value={settings.expire_message}
                            onChange={(v) =>
                              setSettings({ ...settings, expire_message: v })
                            }
                          />
                        </S1Field>
                      )}

                      <S1Field label="Hide / Show Countdown Message">
                        <ToggleControl
                          checked={settings.show_message}
                          onChange={(v) =>
                            setSettings({ ...settings, show_message: v })
                          }
                        />
                      </S1Field>

                      <S1Field label="Hide / Show Countdown Bar">
                        <ToggleControl
                          checked={settings.show_stock_bar}
                          onChange={(v) =>
                            setSettings({ ...settings, show_stock_bar: v })
                          }
                        />
                      </S1Field>
                    </>
                  ),
                },

                {
                  id: "style",
                  label: "Style",
                  icon: ICONS.DESIGN,
                  content: (
                    <>
                      <S1Field
                        label="Template Choose on Single Page"
                        visible={false}
                      >
                        <SelectControl
                          value={settings.sale_countdown_style}
                          options={[
                            { label: "style2", value: "style2" },
                            { label: "style1", value: "style1" },

                            { label: "style3", value: "style3" },
                            { label: "style4", value: "style4" },
                          ]}
                          onChange={(v) => {
                            let updated = {
                              ...settings,
                              sale_countdown_style: v,
                            };

                            updated = applyStyleDefaults(updated, v, "single");

                            setSettings(updated);
                          }}
                        />
                      </S1Field>

                      {settings.show_on_single && (
                        <S1FieldGroup title="Product Single Page Style">
                          <AlignmentControl
                            value={settings.alignmentSingle}
                            onChange={(v) =>
                              setSettings({ ...settings, alignmentSingle: v })
                            }
                          />
                          <S1Field>
                            <THBackgroundControl
                              label="Background"
                              value={settings.single_bg_color}
                              onChange={(v) =>
                                setSettings({
                                  ...settings,
                                  single_bg_color: v,
                                  single_bg_color_auto: false,
                                })
                              }
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label="Massage Color"
                              value={settings.single_text_color}
                              onChange={(v) =>
                                setSettings({
                                  ...settings,
                                  single_text_color: v,
                                  single_text_color_auto: false,
                                })
                              }
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              label="Timer Background Color"
                              value={settings.single_timer_bg_color}
                              onChange={(v) =>
                                setSettings({
                                  ...settings,
                                  single_timer_bg_color: v,
                                  single_timer_bg_color_auto: false,
                                })
                              }
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label="Timer Color"
                              value={settings.single_timer_color}
                              onChange={(v) =>
                                setSettings({
                                  ...settings,
                                  single_timer_color: v,
                                  single_timer_color_auto: false,
                                })
                              }
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              label="Bar Color"
                              value={settings.single_sold_bar_bg_color}
                              onChange={(v) =>
                                setSettings({
                                  ...settings,
                                  single_sold_bar_bg_color: v,
                                  single_sold_bar_bg_color_auto: false,
                                })
                              }
                            />
                          </S1Field>

                          <UniversalBorderControl
                            value={settings.border}
                            onChange={(v) =>
                              setSettings({ ...settings, border: v })
                            }
                          />
                        </S1FieldGroup>
                      )}
                      {settings.show_on_archive && (
                        <>
                          <S1Field
                            label="Template Choose on Archive Page"
                            visible={false}
                          >
                            <SelectControl
                              value={settings.sale_countdown_archive_style}
                              options={[
                                { label: "style1", value: "acstyle1" },
                                { label: "style2", value: "acstyle2" },
                                { label: "style3", value: "acstyle3" },
                              ]}
                              onChange={(v) => {
                                let updated = {
                                  ...settings,
                                  sale_countdown_archive_style: v,
                                };

                                updated = applyStyleDefaults(
                                  updated,
                                  v,
                                  "archive",
                                );

                                setSettings(updated);
                              }}
                            />
                          </S1Field>

                          <S1FieldGroup title="Archive Page & Shop Page Style">
                            <AlignmentControl
                              value={settings.alignmentArchive}
                              onChange={(v) =>
                                setSettings({
                                  ...settings,
                                  alignmentArchive: v,
                                })
                              }
                            />
                            <S1Field>
                              <THBackgroundControl
                                label="Background"
                                value={settings.archive_bg_color}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    archive_bg_color: v,
                                    archive_bg_color_auto: false,
                                  })
                                }
                              />
                            </S1Field>

                            <S1Field>
                              <THBackgroundControl
                                label="Massage Color"
                                value={settings.archive_text_color}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    archive_text_color: v,
                                    archive_text_color_auto: false,
                                  })
                                }
                              />
                            </S1Field>

                            <S1Field>
                              <THBackgroundControl
                                label="Timer Background Color"
                                value={settings.archive_timer_bg_color}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    archive_timer_bg_color: v,
                                    archive_timer_bg_color_auto: false,
                                  })
                                }
                              />
                            </S1Field>

                            <S1Field>
                              <THBackgroundControl
                                label="Timer Color"
                                value={settings.archive_timer_color}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    archive_timer_color: v,
                                    archive_timer_color_auto: false,
                                  })
                                }
                              />
                            </S1Field>
                            <S1Field>
                              <THBackgroundControl
                                label="Bar Color"
                                value={settings.archive_sold_bar_bg_color}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    archive_sold_bar_bg_color: v,
                                    archive_sold_bar_bg_color_auto: false,
                                  })
                                }
                              />
                            </S1Field>
                          </S1FieldGroup>
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
          onReset={(newSettings) => {
            const resetSettings = {
              ...DEFAULT_SETTINGS,
              ...newSettings,
            };
            setSettings(resetSettings);
            return resetSettings;
          }}
        />
      </div>
    </div>
  );
}
