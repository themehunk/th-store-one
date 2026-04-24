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
const MODULE_ID = "sticky-cart";

/* ---------------------------------
 * DEFAULT SETTINGS
 * --------------------------------- */
const DEFAULT_SETTINGS = {
  general: {
    status: true,
    style: "cta", // classic | floating | cta | expandable
    position: "bottom", // bottom | left | right
    show_on: ["product"],
    scroll_trigger: 20,
    delay: 1,
    animation: "slide",
    hide_when: {
      atc_visible: true,
      footer_visible: true,
      cart_open: true,
    },
    ajax_add_to_cart: true,
    sync_variation: true,
  },

  content: {
    show_image: true,
    show_title: true,
    show_price: true,
    show_rating: false,
    show_qty: true,
    show_variation: true,
    show_stock: true,
    show_discount: false,
    button_text: "Add to Cart",
    button_action: "cart", // cart | buy_now
    offer_text: "",
    countdown: false,
    mobile: {
      enabled: false,
    },
    show_ofrbnr: false,
    ofrbnr_msg: __("Hurry! Offer will expire soon", "th-store-one"),
    show_timer: false,
    start_datetime: "",
    end_datetime: "",
  },

  visibility: {
    devices: ["desktop", "tablet", "mobile"],
    user_condition: "all",
    exclude_enabled: false,

    allowed_roles: [],
    allowed_users: [],

    exclude_roles: [],
    exclude_users: [],

    exclude_users_enabled: false,
    trigger_type: "all_products",
    productsInclude: [],
    categoriesInclude: [],
    exclude_productsInclude_enabled: false,
    exclude_productsInclude: [],
    exclude_categoriesInclude_enabled: false,
    exclude_categoriesInclude: [],
  },

  style: {
    layout: "full",
    bg_color: "#ffffff",
    text_color: "#111827",
    btn_bg_color: "#facc15",
    btn_text_color: "#111",
    price_color: "#16a34a",
    ofr_bnr_clr: "#111",
    ofr_bnr_bg: "#f3f4f6",
  },
};
export default function StickyCartSettings({
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
            {__("Sticky Cart", "th-store-one")}
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
                      <S1Field label="Position">
                        <SelectControl
                          value={settings.general.position}
                          options={[
                            { label: "Bottom Bar", value: "bottom" },
                            { label: "Top Bar", value: "top" },
                          ]}
                          onChange={(v) =>
                            setSettings({
                              ...settings,
                              general: { ...settings.general, position: v },
                            })
                          }
                        />
                      </S1Field>

                      <S1Field label="Show After Scroll (%)">
                        <SelectControl
                          value={settings.general.scroll_trigger}
                          options={[
                            { label: "10%", value: 10 },
                            { label: "20%", value: 20 },
                            { label: "50%", value: 50 },
                          ]}
                          onChange={(v) =>
                            setSettings({
                              ...settings,
                              general: {
                                ...settings.general,
                                scroll_trigger: parseInt(v),
                              },
                            })
                          }
                        />
                        <S1Field label="Animation">
                          <SelectControl
                            value={settings.general.animation}
                            options={[
                              { label: "Slide", value: "slide" },
                              { label: "Fade", value: "fade" },
                              { label: "Bounce", value: "bounce" },
                            ]}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                general: { ...settings.general, animation: v },
                              })
                            }
                          />
                        </S1Field>
                      </S1Field>

                      <S1FieldGroup title="Content">
                        <S1Field
                          label={__("Show Product Image", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.content.show_image}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                content: { ...settings.content, show_image: v },
                              })
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__("Show Price", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.content.show_price}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                content: { ...settings.content, show_price: v },
                              })
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__("Enable Quantity Selector", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.content.show_qty}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                content: { ...settings.content, show_qty: v },
                              })
                            }
                          />
                        </S1Field>
                        <S1Field
                          label={__("Enable Variation", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.content.show_variation}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                content: {
                                  ...settings.content,
                                  show_variation: v,
                                },
                              })
                            }
                          />
                        </S1Field>

                        <S1Field label={__("Button Action", "th-store-one")}>
                          <SelectControl
                            value={settings.content.button_action}
                            options={[
                              {
                                label: __("Cart", "th-store-one"),
                                value: "cart",
                              },
                              {
                                label: __("Buy Now", "th-store-one"),
                                value: "buynow",
                              },
                            ]}
                            onChange={(value) => {
                              let defaultText =
                                value === "buynow"
                                  ? __("Buy Now", "th-store-one")
                                  : __("Add to Cart", "th-store-one");

                              setSettings({
                                ...settings,
                                content: {
                                  ...settings.content,
                                  button_action: value,

                                  //auto update text only if empty OR default
                                  button_text:
                                    !settings.content.button_text ||
                                    settings.content.button_text ===
                                      "Add to Cart" ||
                                    settings.content.button_text === "Buy Now"
                                      ? defaultText
                                      : settings.content.button_text,
                                },
                              });
                            }}
                          />
                        </S1Field>

                        <S1Field
                          label={__("Button Text", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <input
                            type="text"
                            value={settings.content.button_text}
                            placeholder={
                              settings.content.button_action === "buynow"
                                ? __("Buy Now", "th-store-one")
                                : __("Add to Cart", "th-store-one")
                            }
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                content: {
                                  ...settings.content,
                                  button_text: e.target.value,
                                },
                              })
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>

                      <S1FieldGroup title={__("Offer Banner", "th-store-one")}>
                        <S1Field
                          label={__("Show Banner", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.content.show_ofrbnr}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                content: {
                                  ...settings.content,
                                  show_ofrbnr: v,
                                },
                              })
                            }
                          />
                        </S1Field>
                        {settings.content.show_ofrbnr == true && (
                          <>
                            <S1Field label={__("Massege", "th-store-one")}>
                              <TextControl
                                value={settings.content.ofrbnr_msg}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    content: {
                                      ...settings.content,
                                      ofrbnr_msg: v,
                                    },
                                  })
                                }
                                placeholder={__(
                                  "Hurry! Offer will expire soon",
                                  "th-store-one",
                                )}
                              />
                            </S1Field>
                            <S1Field
                              label={__("Show Timer", "th-store-one")}
                              classN="s1-toggle-wrpapper"
                            >
                              <ToggleControl
                                checked={settings.content.show_timer}
                                onChange={(v) =>
                                  setSettings({
                                    ...settings,
                                    content: {
                                      ...settings.content,
                                      show_timer: v,
                                    },
                                  })
                                }
                              />
                            </S1Field>
                            {settings.content.show_timer == true && (
                              <>
                                <S1DateTimePicker
                                  label="Start Date & Time"
                                  value={settings.content.start_datetime}
                                  onChange={(v) =>
                                    setSettings({
                                      ...settings,
                                      content: {
                                        ...settings.content,
                                        start_datetime: v,
                                      },
                                    })
                                  }
                                />

                                <S1DateTimePicker
                                  label="End Date & Time"
                                  value={settings.content.end_datetime}
                                  minDate={settings.content.start_datetime}
                                  onChange={(v) =>
                                    setSettings({
                                      ...settings,
                                      content: {
                                        ...settings.content,
                                        end_datetime: v,
                                      },
                                    })
                                  }
                                />
                              </>
                            )}
                          </>
                        )}
                      </S1FieldGroup>
                    </>
                  ),
                },
                {
                  id: "visibility",
                  label: "Visibility",
                  icon: ICONS.DISPLAY,
                  content: (
                    <>
                      <S1Field label="Trigger Type">
                        <SelectControl
                          value={settings.visibility.trigger_type}
                          options={[
                            { label: "All Products", value: "all_products" },
                            {
                              label: "Specific Products",
                              value: "specific_products",
                            },
                            {
                              label: "Specific Categories",
                              value: "specific_categories",
                            },
                          ]}
                          onChange={(value) =>
                            setSettings({
                              ...settings,
                              visibility: {
                                ...settings.visibility,
                                trigger_type: value,
                              },
                            })
                          }
                        />
                      </S1Field>

                      {/* Specific Products */}
                      {settings.visibility.trigger_type ===
                        "specific_products" && (
                        <MultiWooSearchSelector
                          searchType="product"
                          label="Select Products"
                          value={settings.visibility.productsInclude || []}
                          onChange={(items) =>
                            setSettings({
                              ...settings,
                              visibility: {
                                ...settings.visibility,
                                productsInclude: items,
                              },
                            })
                          }
                        />
                      )}

                      {/* Specific Categories */}
                      {settings.visibility.trigger_type ===
                        "specific_categories" && (
                        <MultiWooSearchSelector
                          searchType="category"
                          label="Select Categories"
                          value={settings.visibility.categoriesInclude || []}
                          onChange={(items) =>
                            setSettings({
                              ...settings,
                              visibility: {
                                ...settings.visibility,
                                categoriesInclude: items,
                              },
                            })
                          }
                        />
                      )}

                      {/* Exclude Products */}
                      {(settings.visibility.trigger_type ===
                        "specific_products" ||
                        settings.visibility.trigger_type ===
                          "all_products") && (
                        <ExcludeWooCondition
                          label={__("Exclude products", "th-store-one")}
                          searchType="product"
                          enabled={
                            settings.visibility.exclude_productsInclude_enabled
                          }
                          items={settings.visibility.exclude_productsInclude}
                          onToggle={(v) =>
                            setSettings({
                              ...settings,
                              visibility: {
                                ...settings.visibility,
                                exclude_productsInclude_enabled: v,
                              },
                            })
                          }
                          onChangeItems={(items) =>
                            setSettings({
                              ...settings,
                              visibility: {
                                ...settings.visibility,
                                exclude_productsInclude: items,
                              },
                            })
                          }
                          detailedView={true}
                        />
                      )}

                      {/* Exclude Categories */}
                      {settings.visibility.trigger_type ===
                        "specific_categories" && (
                        <ExcludeWooCondition
                          label={__("Exclude categories", "th-store-one")}
                          searchType="category"
                          enabled={
                            settings.visibility
                              .exclude_categoriesInclude_enabled
                          }
                          items={settings.visibility.exclude_categoriesInclude}
                          onToggle={(v) =>
                            setSettings({
                              ...settings,
                              visibility: {
                                ...settings.visibility,
                                exclude_categoriesInclude_enabled: v,
                              },
                            })
                          }
                          onChangeItems={(items) =>
                            setSettings({
                              ...settings,
                              visibility: {
                                ...settings.visibility,
                                exclude_categoriesInclude: items,
                              },
                            })
                          }
                          detailedView={true}
                        />
                      )}
                      <S1Field label={__("Device Visibility", "th-store-one")}>
                        <DeviceSelector
                          value={
                            settings.visibility.devices || [
                              "desktop",
                              "tablet",
                              "mobile",
                            ]
                          }
                          onChange={(devices) =>
                            setSettings({
                              ...settings,
                              visibility: {
                                ...settings.visibility,
                                devices: devices,
                              },
                            })
                          }
                        />
                      </S1Field>
                      {isOnlyMobile && (
                        <S1FieldGroup title="Mobile Settings">
                          <S1Field
                            label={__("Enable Mobile Settings", "th-store-one")}
                            classN="s1-toggle-wrpapper"
                          >
                            <ToggleControl
                              checked={settings.content.mobile?.enabled}
                              onChange={(v) =>
                                setSettings({
                                  ...settings,
                                  content: {
                                    ...settings.content,
                                    mobile: {
                                      ...settings.content.mobile,
                                      enabled: v,
                                    },
                                  },
                                })
                              }
                            />
                          </S1Field>

                          {settings.content.mobile?.enabled && (
                            <>
                              <S1Field
                                label={__("Show Product Image", "th-store-one")}
                                classN="s1-toggle-wrpapper"
                              >
                                <ToggleControl
                                  checked={settings.content.mobile.show_image}
                                  onChange={(v) =>
                                    setSettings({
                                      ...settings,
                                      content: {
                                        ...settings.content,
                                        mobile: {
                                          ...settings.content.mobile,
                                          show_image: v,
                                        },
                                      },
                                    })
                                  }
                                />
                              </S1Field>

                              <S1Field
                                label={__("Show Price", "th-store-one")}
                                classN="s1-toggle-wrpapper"
                              >
                                <ToggleControl
                                  checked={settings.content.mobile.show_price}
                                  onChange={(v) =>
                                    setSettings({
                                      ...settings,
                                      content: {
                                        ...settings.content,
                                        mobile: {
                                          ...settings.content.mobile,
                                          show_price: v,
                                        },
                                      },
                                    })
                                  }
                                />
                              </S1Field>
                              <S1Field
                                label={__(
                                  "Enable Quantity Selector",
                                  "th-store-one",
                                )}
                                classN="s1-toggle-wrpapper"
                              >
                                <ToggleControl
                                  checked={settings.content.mobile.show_qty}
                                  onChange={(v) =>
                                    setSettings({
                                      ...settings,
                                      content: {
                                        ...settings.content,
                                        mobile: {
                                          ...settings.content.mobile,
                                          show_qty: v,
                                        },
                                      },
                                    })
                                  }
                                />
                              </S1Field>
                              <S1Field
                                label={__("Enable Variation", "th-store-one")}
                                classN="s1-toggle-wrpapper"
                              >
                                <ToggleControl
                                  checked={
                                    settings.content.mobile.show_variation
                                  }
                                  onChange={(v) =>
                                    setSettings({
                                      ...settings,
                                      content: {
                                        ...settings.content,
                                        mobile: {
                                          ...settings.content.mobile,
                                          show_variation: v,
                                        },
                                      },
                                    })
                                  }
                                />
                              </S1Field>
                            </>
                          )}
                        </S1FieldGroup>
                      )}
                    </>
                  ),
                },
                {
                  id: "user",
                  label: "User",
                  icon: ICONS.USER,
                  content: (
                    <UserCondition
                      rule={{
                        user_condition: settings.visibility.user_condition,
                        exclude_enabled: settings.visibility.exclude_enabled,
                        allowed_roles: settings.visibility.allowed_roles,
                        allowed_users: settings.visibility.allowed_users,
                        exclude_roles: settings.visibility.exclude_roles,
                        exclude_users: settings.visibility.exclude_users,
                        exclude_users_enabled:
                          settings.visibility.exclude_users_enabled,
                      }}
                      index={0}
                      updateField={(i, key, value) =>
                        setSettings({
                          ...settings,
                          visibility: {
                            ...settings.visibility,
                            [key]: value,
                          },
                        })
                      }
                    />
                  ),
                },
                {
                  id: "style",
                  label: "Style",
                  icon: ICONS.DESIGN,
                  content: (
                    <>
                      <S1FieldGroup title={__("Bar", "th-store-one")}>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Background", "th-store-one")}
                            value={settings.style.bg_color || "#ffffff"}
                            onChange={(value) =>
                              setSettings({
                                ...settings,
                                style: {
                                  ...settings.style,
                                  bg_color: value,
                                },
                              })
                            }
                          />
                        </S1Field>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Text", "th-store-one")}
                            value={settings.style.text_color || "#111"}
                            onChange={(value) =>
                              setSettings({
                                ...settings,
                                style: {
                                  ...settings.style,
                                  text_color: value,
                                },
                              })
                            }
                          />
                        </S1Field>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Price", "th-store-one")}
                            value={settings.style.price_color || "#16a34a"}
                            onChange={(value) =>
                              setSettings({
                                ...settings,
                                style: {
                                  ...settings.style,
                                  price_color: value,
                                },
                              })
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup title={__("Button", "th-store-one")}>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Background", "th-store-one")}
                            value={settings.style.btn_bg_color || "#facc15"}
                            onChange={(value) =>
                              setSettings({
                                ...settings,
                                style: {
                                  ...settings.style,
                                  btn_bg_color: value,
                                },
                              })
                            }
                          />
                        </S1Field>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Text", "th-store-one")}
                            value={settings.style.btn_text_color || "#fff"}
                            onChange={(value) =>
                              setSettings({
                                ...settings,
                                style: {
                                  ...settings.style,
                                  btn_text_color: value,
                                },
                              })
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      {settings.content.show_ofrbnr == true && (
                        <S1FieldGroup
                          title={__("Offer Banner", "th-store-one")}
                        >
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Background", "th-store-one")}
                              value={settings.style.ofr_bnr_bg || "#f3f4f6"}
                              onChange={(value) =>
                                setSettings({
                                  ...settings,
                                  style: {
                                    ...settings.style,
                                    ofr_bnr_bg: value,
                                  },
                                })
                              }
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Text", "th-store-one")}
                              value={settings.style.ofr_bnr_clr || "#111"}
                              onChange={(value) =>
                                setSettings({
                                  ...settings,
                                  style: {
                                    ...settings.style,
                                    ofr_bnr_clr: value,
                                  },
                                })
                              }
                            />
                          </S1Field>
                        </S1FieldGroup>
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
              general: {
                ...DEFAULT_SETTINGS.general,
                ...(newSettings?.general || {}),
              },
              content: {
                ...DEFAULT_SETTINGS.content,
                ...(newSettings?.content || {}),
              },
              visibility: {
                ...DEFAULT_SETTINGS.visibility,
                ...(newSettings?.visibility || {}),
              },
              style: {
                ...DEFAULT_SETTINGS.style,
                ...(newSettings?.style || {}),
              },
            })
          }
        />
      </div>
    </div>
  );
}
