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

import { CopyIcon } from "@radix-ui/react-icons";

import MultiWooSearchSelector from "@th-storeone-global/MultiWooSearchSelector";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";
import THBackgroundControl from "@th-storeone-control/color";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import { ICONS } from "@th-storeone-global/icons";
import {
  ShoppingCartIcon,
  BackpackIcon,
  CubeIcon,
  HeartIcon,
} from "@radix-ui/react-icons";

import { CART_ICON_OPTIONS } from "./livepreview/cart-icons";

const MODULE_ID = "th-cart";
const DEFAULT_SETTINGS = {
  /* General */

  taiowc_show_cart: true,
  taiowc_cart_open: "simple-open",
  taiowc_cart_visibility: true,
  taiowc_show_ai_suggestion: false,
  taiowc_ai_suggestion_heading: "✨ AI Product Suggestions",

  taiowc_icon_url: "",
  /* Content */
  taiowc_show_prd_img: true,
  taiowc_show_prd_title: true,
  taiowc_show_prd_price: true,
  taiowc_show_prd_quantity: true,
  taiowc_show_prd_rating: true,
  /* Visibility */
  taiowc_hide_cart_page: true,
  taiowc_hide_checkout_page: true,
  taiowc_hide_shop_page: false,
  taiowc_hide_account_page: true,
  taiowc_hide_single_page: false,
  taiowc_hide_home_page: false,
  taiowc_hide_blog_page: false,

  taiowc_show_coupon: false,
  taiowc_show_shipping: false,
  taiowc_show_shipping_bar: false,

  /* Menu Cart */

  taiowc_show_price: true,

  taiowc_show_quantity: true,

  taiowc_price_font_size: 14,

  taiowc_icon_size: 24,

  taiowc_bg_color: "",

  taiowc_price_color: "#111",

  taiowc_quantity_bg: "#111",

  taiowc_quantity_color: "#fff",

  taiowc_icon_color: "#111",

  /* Fixed Cart */

  taiowc_cart_style: "style-1",

  taiowc_fixed_show_quantity: true,

  taiowc_fixed_position: "fxd-right",

  taiowc_fixed_right: 29,

  taiowc_fixed_left: 29,

  taiowc_fixed_bottom: 36,

  taiowc_fixed_icon_size: 24,

  taiowc_fixed_radius: 100,

  taiowc_fixed_bg: "#ffffff70",

  taiowc_fixed_icon_color: "#111",

  taiowc_fixed_price_color: "#111",

  taiowc_fixed_quantity_bg: "#111",

  taiowc_fixed_quantity_color: "#fff",

  taiowc_cart_pan_icon_shw: true,
  taiowc_cart_effect: "taiowc-slide-right",
  taiowc_cart_hd: "Your Cart",
  taiowc_cart_item_order: "prd_first",
  taiowc_empty_cart_txt: "Start Shopping",
  taiowc_empty_cart_url: "",
  taiowc_cart_pan_cart_shw: true,
  taiowc_icontype: "icon",
  taiowc_custom_svg: "",
  taiowc_image_url: "",
  taiowc_cart_icon: "icon-1",

  /* Side Cart */

  taiowc_cart_pan_hdr_bg_clr: "#ffffff",

  taiowc_cart_pan_hd_clr: "#111111",

  taiowc_cart_pan_icon_clr: "#111111",

  taiowc_cart_pan_cls_clr: "#666666",

  /* Cart Content */

  taiowc_cart_pan_bg_clr: "#fafafa",

  taiowc_cart_pan_prd_bg_clr: "#ffffff",

  taiowc_cart_pan_prd_tle_clr: "#111111",

  taiowc_cart_pan_prd_txt_clr: "#666666",

  taiowc_cart_pan_prd_brd_clr: "#e9e9e9",

  taiowc_cart_pan_prd_rat_clr: "#ffb400",

  taiowc_cart_pan_prd_dlt_clr: "#999999",

  /* Cart Order */

  taiowc_cart_pan_pay_bg_clr: "#ffffff",

  taiowc_cart_pan_pay_txt_clr: "#111111",

  taiowc_cart_pan_pay_hd_bg_clr: "#f7f7f7",

  taiowc_cart_pan_pay_hd_clr: "#111111",

  taiowc_cart_pan_pay_link_clr: "#111111",

  taiowc_cart_pan_pay_btn_bg_clr: "#111111",

  taiowc_cart_pan_pay_btn_clr: "#ffffff",

  taiowc_cart_pan_pay_cart_bg_clr: "#ffffff",

  taiowc_cart_pan_pay_cart_clr: "#111111",
  /* Free Shipping */

  taiowc_shipping_bg: "#f8f5ed", // Card Background

  taiowc_shipping_track: "#e5e5e5", // Progress Track

  taiowc_shipping_fill: "#22591f", // Filled Progress

  taiowc_shipping_icon_bg: "#ffffff", // Truck Circle Background

  taiowc_shipping_icon_border: "#38b44a", // Truck Circle Border

  taiowc_shipping_text: "#333333", // Text Color

  taiowc_shipping_amount: "#111111", // ₹258.00 Color

  /* Mobile */

  // Menu Cart / Shortcode Cart
  taiowcp_dsble_mnu_crt: false,
  taiowcp_dsble_mnu_crt_qnty: false,
  taiowcp_dsble_mnu_crt_price: false,

  // Fixed / Floating Cart
  taiowcp_dsble_fxd_crt: false,
  taiowcp_dsble_fxd_crt_qnty: false,
  taiowcp_fxd_cart_mobile_position: "",

  // Cart Panel
  taiowcp_cart_mobile_effect: "mobiletopslide",
  taiowcp_dsble_mob_rel_prd_crt: false,
  taiowcp_dsble_mob_ship: false,
  taiowcp_dsble_mob_coupan: false,
};

export default function CartSettings({
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

  const update = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }; /* Check Old Data */
  useEffect(() => {
    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}check-old-option?option=taiowc_options`,
    })
      .then((res) => setHasOldData(res.has_data))
      .catch(() => setHasOldData(false));
  }, []);

  /* Import Old Data */
  const importOldData = async () => {
    setImporting(true);

    try {
      const res = await apiFetch({
        path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}/import-old`,
        method: "POST",
        data: {
          option_name: "taiowc_options",
        },
      });

      if (res.success) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...res.settings,
        });

        setHasOldData(false);
      } else {
        setError(res.message || "Import failed");
      }
    } catch (e) {
      setError("Failed to import old settings");
    } finally {
      setImporting(false);
    }
  };

  /* Load Settings */
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
      .finally(() => setLoading(false));

    onModuleReady?.();
  }, []);

  /* Notify Parent */
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings]);

  /* Register Save */
  useEffect(() => {
    onRegisterSave?.(() => handleSave);
  }, [settings]);

  /* Save */
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
      .finally(() => setSaving(false));
  };

  /* Toast */
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
  const openMediaLibrary = (callback) => {
    const frame = wp.media({
      title: "Select Image",
      button: {
        text: "Use Image",
      },
      multiple: false,
    });

    frame.on("select", () => {
      const media = frame.state().get("selection").first().toJSON();
      callback(media);
    });

    frame.open();
  };

  const [previewType, setPreviewType] = useState("menu-cart");
  useEffect(() => {
    const handler = (e) => {
      setPreviewType(e.detail.preview);
    };

    window.addEventListener("storeone:changeCartPreview", handler);

    return () => {
      window.removeEventListener("storeone:changeCartPreview", handler);
    };
  }, []);

  return (
    <div className="storeone-module-settings s1-no-rule">
      {loading && (
        <div className="store-one-loader">
          <Spinner />
          {__("Loading Cart Settings…", "th-store-one")}
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

          <h3 className="store-one-section-title">TH Cart</h3>

          <div className="store-one-rule-item">
            <TabSwitcher
              key={previewType}
              defaultTab={
                previewType === "side-cart" ? "cartpanel" : "settings"
              }
              tabs={[
                {
                  id: "settings",
                  label: "Settings",
                  icon: ICONS.SETTINGS,

                  content: (
                    <>
                      {hasOldData && (
                        <div className="th-import-card">
                          <div className="th-import-card__content">
                            <h3>Import Existing Cart Settings</h3>

                            <p>
                              We found an existing
                              <strong> TH All In One Woo Cart </strong>
                              configuration on your site. Import your current
                              settings into
                              <strong> Store One</strong>
                              to continue using the same configuration.
                            </p>

                            <Button
                              variant="primary"
                              isBusy={importing}
                              onClick={importOldData}
                            >
                              {importing
                                ? "Importing Settings..."
                                : "Import Settings"}
                            </Button>
                          </div>
                        </div>
                      )}

                      <S1FieldGroup number={1} title="Basic">
                        <S1Field
                          label="Enable Cart"
                          description="Enable Floating Cart"
                        >
                          <ToggleControl
                            checked={settings.taiowc_show_cart}
                            onChange={(v) => update("taiowc_show_cart", v)}
                          />
                        </S1Field>

                        <S1Field label="Cart Open With">
                          <SelectControl
                            value={settings.taiowc_cart_open}
                            options={[
                              {
                                label: "Auto Open with Ajax",

                                value: "simple-open",
                              },

                              {
                                label: "Image Fly Effect",

                                value: "fly-image-open",
                              },
                            ]}
                            onChange={(v) => update("taiowc_cart_open", v)}
                          />
                        </S1Field>
                        <S1Field
                          label="Enable floating cart Visibility"
                          description="Check when you want to enable floating cart when no product is in cart"
                        >
                          <ToggleControl
                            checked={settings.taiowc_cart_visibility}
                            onChange={(v) =>
                              update("taiowc_cart_visibility", v)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                    </>
                  ),
                },
                {
                  id: "display",
                  label: "Display",
                  icon: ICONS.DISPLAY,

                  content: (
                    <>
                      {previewType === "menu-cart" && (
                        <S1FieldGroup number={1} title="Menu Cart">
                          <S1Field
                            classN="s1-exclude-header"
                            label="Show Price"
                          >
                            <ToggleControl
                              checked={settings.taiowc_show_price}
                              onChange={(v) => update("taiowc_show_price", v)}
                            />
                          </S1Field>

                          <S1Field
                            classN="s1-exclude-header"
                            label="Show Quantity"
                          >
                            <ToggleControl
                              checked={settings.taiowc_show_quantity}
                              onChange={(v) =>
                                update("taiowc_show_quantity", v)
                              }
                            />
                          </S1Field>
                        </S1FieldGroup>
                      )}
                      {previewType === "floating-cart" && (
                        <S1FieldGroup
                          number={1}
                          title="Float cart Visibility Rules"
                        >
                          <S1Field
                            classN="s1-exclude-header"
                            label="Hide on Cart Page"
                          >
                            <ToggleControl
                              checked={settings.taiowc_hide_cart_page}
                              onChange={(v) =>
                                update("taiowc_hide_cart_page", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Hide on Checkout Page"
                            classN="s1-exclude-header"
                          >
                            <ToggleControl
                              checked={settings.taiowc_hide_checkout_page}
                              onChange={(v) =>
                                update("taiowc_hide_checkout_page", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Hide on Shop Page"
                            classN="s1-exclude-header"
                          >
                            <ToggleControl
                              checked={settings.taiowc_hide_shop_page}
                              onChange={(v) =>
                                update("taiowc_hide_shop_page", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Hide on Account Page"
                            classN="s1-exclude-header"
                          >
                            <ToggleControl
                              checked={settings.taiowc_hide_account_page}
                              onChange={(v) =>
                                update("taiowc_hide_account_page", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Hide on Single Product"
                            classN="s1-exclude-header"
                          >
                            <ToggleControl
                              checked={settings.taiowc_hide_single_page}
                              onChange={(v) =>
                                update("taiowc_hide_single_page", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Hide on Home Page"
                            classN="s1-exclude-header"
                          >
                            <ToggleControl
                              checked={settings.taiowc_hide_home_page}
                              onChange={(v) =>
                                update("taiowc_hide_home_page", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Hide on Blog Page"
                            classN="s1-exclude-header"
                          >
                            <ToggleControl
                              checked={settings.taiowc_hide_blog_page}
                              onChange={(v) =>
                                update("taiowc_hide_blog_page", v)
                              }
                            />
                          </S1Field>
                        </S1FieldGroup>
                      )}
                    </>
                  ),
                },

                {
                  id: "cartpanel",
                  label: "Cart Panel",
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
                    <>
                      <S1FieldGroup number={1} title="Cart Panel Settings">
                        <S1Field label="Show Header Icon">
                          <ToggleControl
                            checked={settings.taiowc_cart_pan_icon_shw}
                            onChange={(v) =>
                              update("taiowc_cart_pan_icon_shw", v)
                            }
                          />
                        </S1Field>

                        <S1Field label="Open Style">
                          <SelectControl
                            value={settings.taiowc_cart_effect}
                            options={[
                              {
                                label: "Slide Right",
                                value: "taiowc-slide-right",
                              },
                              {
                                label: "Slide Left",
                                value: "taiowc-slide-left",
                              },

                              {
                                label: "Cart Page",
                                value: "taiowc-click-cart",
                              },
                            ]}
                            onChange={(v) => update("taiowc_cart_effect", v)}
                          />
                        </S1Field>

                        <S1Field label="Heading">
                          <TextControl
                            value={settings.taiowc_cart_hd}
                            onChange={(v) => update("taiowc_cart_hd", v)}
                          />
                        </S1Field>

                        <S1Field label="Product Order">
                          <SelectControl
                            value={settings.taiowc_cart_item_order}
                            options={[
                              {
                                label: "Newest First",
                                value: "prd_first",
                              },
                              {
                                label: "Newest Last",
                                value: "prd_last",
                              },
                            ]}
                            onChange={(v) =>
                              update("taiowc_cart_item_order", v)
                            }
                          />
                        </S1Field>

                        <S1Field label="Empty Cart Button Text">
                          <TextControl
                            value={settings.taiowc_empty_cart_txt}
                            onChange={(v) => update("taiowc_empty_cart_txt", v)}
                          />
                        </S1Field>

                        <S1Field label="Empty Cart Button URL">
                          <TextControl
                            value={settings.taiowc_empty_cart_url}
                            onChange={(v) => update("taiowc_empty_cart_url", v)}
                          />
                        </S1Field>

                        <S1Field label="Show Cart Button">
                          <ToggleControl
                            checked={settings.taiowc_cart_pan_cart_shw}
                            onChange={(v) =>
                              update("taiowc_cart_pan_cart_shw", v)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={2}
                        title="Floating Cart Content Visibility"
                      >
                        <S1Field
                          classN="s1-exclude-header"
                          label="Show Product Image"
                        >
                          <ToggleControl
                            checked={settings.taiowc_show_prd_img}
                            onChange={(v) => update("taiowc_show_prd_img", v)}
                          />
                        </S1Field>

                        <S1Field
                          classN="s1-exclude-header"
                          label="Show Product Title"
                        >
                          <ToggleControl
                            checked={settings.taiowc_show_prd_title}
                            onChange={(v) => update("taiowc_show_prd_title", v)}
                          />
                        </S1Field>

                        <S1Field
                          classN="s1-exclude-header"
                          label="Show Product Price"
                        >
                          <ToggleControl
                            checked={settings.taiowc_show_prd_price}
                            onChange={(v) => update("taiowc_show_prd_price", v)}
                          />
                        </S1Field>

                        <S1Field
                          classN="s1-exclude-header"
                          label="Show Product Quantity"
                        >
                          <ToggleControl
                            checked={settings.taiowc_show_prd_quantity}
                            onChange={(v) =>
                              update("taiowc_show_prd_quantity", v)
                            }
                          />
                        </S1Field>

                        <S1Field
                          classN="s1-exclude-header"
                          label="Show Product Rating"
                        >
                          <ToggleControl
                            checked={settings.taiowc_show_prd_rating}
                            onChange={(v) =>
                              update("taiowc_show_prd_rating", v)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>

                      <S1FieldGroup number={3} title="AI Suggestion Products">
                        <S1Field
                          label="Enable AI Suggestion Products"
                          description="Check to show product recommendation with AI"
                        >
                          <ToggleControl
                            checked={settings.taiowc_show_ai_suggestion}
                            onChange={(v) =>
                              update("taiowc_show_ai_suggestion", v)
                            }
                          />
                        </S1Field>
                        <S1Field label="Heading">
                          <TextControl
                            value={settings.taiowc_ai_suggestion_heading}
                            onChange={(v) =>
                              update("taiowc_ai_suggestion_heading", v)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={3}
                        title="Coupons & Shipping"
                        shortdescription="Coupon Visible in side cart panel"
                      >
                        <S1Field classN="s1-exclude-header" label="Show Coupon">
                          <ToggleControl
                            checked={settings.taiowc_show_coupon}
                            onChange={(v) => update("taiowc_show_coupon", v)}
                          />
                        </S1Field>

                        <S1Field
                          classN="s1-exclude-header"
                          label="Show Shipping"
                        >
                          <ToggleControl
                            checked={settings.taiowc_show_shipping}
                            onChange={(v) => update("taiowc_show_shipping", v)}
                          />
                        </S1Field>
                        <S1Field
                          classN="s1-exclude-header"
                          label="Show Shipping Bar"
                        >
                          <ToggleControl
                            checked={settings.taiowc_show_shipping_bar}
                            onChange={(v) =>
                              update("taiowc_show_shipping_bar", v)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                    </>
                  ),
                },
                {
                  id: "style",
                  label: "Style",
                  icon: ICONS.DESIGN,
                  content: (
                    <>
                      <S1FieldGroup
                        number={1}
                        title="Cart Icon"
                        shortdescription="Choose the cart icon type and customize it"
                      >
                        <S1Field label="Icon Type">
                          <SelectControl
                            value={settings.taiowc_icontype}
                            options={[
                              {
                                label: "Icon",
                                value: "icon",
                              },
                              {
                                label: "Image",
                                value: "image",
                              },
                              {
                                label: "SVG",
                                value: "custom_svg",
                              },
                            ]}
                            onChange={(v) => update("taiowc_icontype", v)}
                          />
                        </S1Field>
                        {(settings.taiowc_icontype || "icon") === "icon" && (
                          <S1Field label="Choose Cart Icon" classN="list-icon">
                            {CART_ICON_OPTIONS.map(({ id, icon }) => (
                              <div
                                key={id}
                                className={`s1-icon-option ${
                                  settings.taiowc_cart_icon === id
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() => update("taiowc_cart_icon", id)}
                              >
                                {icon}
                              </div>
                            ))}
                          </S1Field>
                        )}
                        {settings.taiowc_icontype === "custom_svg" && (
                          <S1Field label="SVG Code">
                            <TextControl
                              value={settings.taiowc_custom_svg}
                              onChange={(v) => update("taiowc_custom_svg", v)}
                            />
                          </S1Field>
                        )}
                        {settings.taiowc_icontype === "image" && (
                          <S1Field label="Upload Image">
                            <div className="s1-image-upload-wrapper">
                              {settings.taiowc_image_url ? (
                                <div className="s1-image-card">
                                  <div className="s1-image-preview">
                                    <img
                                      src={settings.taiowc_image_url}
                                      alt=""
                                    />
                                  </div>

                                  <div className="s1-image-actions">
                                    <button
                                      type="button"
                                      className="s1-btn s1-btn-edit"
                                      onClick={() =>
                                        openMediaLibrary((media) =>
                                          update("taiowc_image_url", media.url),
                                        )
                                      }
                                    >
                                      Change
                                    </button>

                                    <button
                                      type="button"
                                      className="s1-btn s1-btn-remove"
                                      onClick={() =>
                                        update("taiowc_image_url", "")
                                      }
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="s1-upload-card"
                                  onClick={() =>
                                    openMediaLibrary((media) =>
                                      update("taiowc_image_url", media.url),
                                    )
                                  }
                                >
                                  Upload Image
                                </button>
                              )}
                            </div>
                          </S1Field>
                        )}
                      </S1FieldGroup>
                      {previewType === "menu-cart" && (
                        <S1FieldGroup number={2} title="Menu Cart Style">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Background", "th-store-one")}
                              value={settings.taiowc_bg_color}
                              onChange={(v) => update("taiowc_bg_color", v)}
                              allowGradient={true}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Price Color", "th-store-one")}
                              value={settings.taiowc_price_color}
                              onChange={(v) => update("taiowc_price_color", v)}
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Quantity Background", "th-store-one")}
                              value={settings.taiowc_quantity_bg}
                              onChange={(v) => update("taiowc_quantity_bg", v)}
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Quantity Text Color", "th-store-one")}
                              value={settings.taiowc_quantity_color}
                              onChange={(v) =>
                                update("taiowc_quantity_color", v)
                              }
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Cart Icon Color", "th-store-one")}
                              value={settings.taiowc_icon_color}
                              onChange={(v) => update("taiowc_icon_color", v)}
                              allowGradient={false}
                            />
                          </S1Field>
                        </S1FieldGroup>
                      )}
                      {previewType === "floating-cart" && (
                        <S1FieldGroup number={2} title="Cart">
                          {/* <S1Field label="Cart Style">
                          <SelectControl
                            value={settings.taiowc_cart_style}
                            options={[
                              {
                                label: "Floating",
                                value: "style-1",
                              },
                              {
                                label: "Fixed",
                                value: "style-2",
                              },
                            ]}
                            onChange={(v) => update("taiowc_cart_style", v)}
                          />
                        </S1Field> */}

                          <S1Field label="Show Quantity">
                            <ToggleControl
                              checked={settings.taiowc_fixed_show_quantity}
                              onChange={(v) =>
                                update("taiowc_fixed_show_quantity", v)
                              }
                            />
                          </S1Field>

                          <S1Field label="Position">
                            <SelectControl
                              value={settings.taiowc_fixed_position}
                              options={[
                                {
                                  label: "Right",
                                  value: "fxd-right",
                                },
                                {
                                  label: "Left",
                                  value: "fxd-left",
                                },
                              ]}
                              onChange={(v) =>
                                update("taiowc_fixed_position", v)
                              }
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Background", "th-store-one")}
                              value={settings.taiowc_fixed_bg}
                              onChange={(v) => update("taiowc_fixed_bg", v)}
                              allowGradient={true}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Icon Color", "th-store-one")}
                              value={settings.taiowc_fixed_icon_color}
                              onChange={(v) =>
                                update("taiowc_fixed_icon_color", v)
                              }
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Price Color", "th-store-one")}
                              value={settings.taiowc_fixed_price_color}
                              onChange={(v) =>
                                update("taiowc_fixed_price_color", v)
                              }
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Quantity Background", "th-store-one")}
                              value={settings.taiowc_fixed_quantity_bg}
                              onChange={(v) =>
                                update("taiowc_fixed_quantity_bg", v)
                              }
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Quantity Text", "th-store-one")}
                              value={settings.taiowc_fixed_quantity_color}
                              onChange={(v) =>
                                update("taiowc_fixed_quantity_color", v)
                              }
                              allowGradient={false}
                            />
                          </S1Field>
                        </S1FieldGroup>
                      )}

                      <S1FieldGroup
                        number={3}
                        title="Cart Header Area"
                        shortdescription="Side cart Panel Style"
                      >
                        <S1Field>
                          <THBackgroundControl
                            label={__("Header Background", "th-store-one")}
                            value={settings.taiowc_cart_pan_hdr_bg_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_hdr_bg_clr", v)
                            }
                            allowGradient={true}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Heading Color", "th-store-one")}
                            value={settings.taiowc_cart_pan_hd_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_hd_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Icon Color", "th-store-one")}
                            value={settings.taiowc_cart_pan_icon_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_icon_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Close Icon Color", "th-store-one")}
                            value={settings.taiowc_cart_pan_cls_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_cls_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={4}
                        title="Cart Content Area"
                        shortdescription="Side cart Panel Style"
                      >
                        <S1Field>
                          <THBackgroundControl
                            label={__("Background", "th-store-one")}
                            value={settings.taiowc_cart_pan_bg_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_bg_clr", v)
                            }
                            allowGradient={true}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Product Background", "th-store-one")}
                            value={settings.taiowc_cart_pan_prd_bg_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_prd_bg_clr", v)
                            }
                            allowGradient={true}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Product Title Color", "th-store-one")}
                            value={settings.taiowc_cart_pan_prd_tle_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_prd_tle_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Product Text Color", "th-store-one")}
                            value={settings.taiowc_cart_pan_prd_txt_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_prd_txt_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Product Border Color", "th-store-one")}
                            value={settings.taiowc_cart_pan_prd_brd_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_prd_brd_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Rating Color", "th-store-one")}
                            value={settings.taiowc_cart_pan_prd_rat_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_prd_rat_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Delete Icon Color", "th-store-one")}
                            value={settings.taiowc_cart_pan_prd_dlt_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_prd_dlt_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={5}
                        title="Cart Order Area"
                        shortdescription="Side cart Panel Style"
                      >
                        <S1Field>
                          <THBackgroundControl
                            label={__("Background", "th-store-one")}
                            value={settings.taiowc_cart_pan_pay_bg_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_pay_bg_clr", v)
                            }
                            allowGradient={true}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Text Color", "th-store-one")}
                            value={settings.taiowc_cart_pan_pay_txt_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_pay_txt_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Heading Color", "th-store-one")}
                            value={settings.taiowc_cart_pan_pay_hd_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_pay_hd_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Link Color", "th-store-one")}
                            value={settings.taiowc_cart_pan_pay_link_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_pay_link_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__(
                              "Checkout Button Background",
                              "th-store-one",
                            )}
                            value={settings.taiowc_cart_pan_pay_btn_bg_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_pay_btn_bg_clr", v)
                            }
                            allowGradient={true}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Checkout Button Text", "th-store-one")}
                            value={settings.taiowc_cart_pan_pay_btn_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_pay_btn_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Cart Button Background", "th-store-one")}
                            value={settings.taiowc_cart_pan_pay_cart_bg_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_pay_cart_bg_clr", v)
                            }
                            allowGradient={true}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Cart Button Text", "th-store-one")}
                            value={settings.taiowc_cart_pan_pay_cart_clr}
                            onChange={(v) =>
                              update("taiowc_cart_pan_pay_cart_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={6}
                        title="Free Shipping Bar"
                        shortdescription="Side cart Panel Style"
                      >
                        <S1Field>
                          <THBackgroundControl
                            label={__("Background", "th-store-one")}
                            value={settings.taiowc_shipping_bg}
                            onChange={(v) => update("taiowc_shipping_bg", v)}
                            allowGradient={true}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Track Color", "th-store-one")}
                            value={settings.taiowc_shipping_track}
                            onChange={(v) => update("taiowc_shipping_track", v)}
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Progress Color", "th-store-one")}
                            value={settings.taiowc_shipping_fill}
                            onChange={(v) => update("taiowc_shipping_fill", v)}
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Icon Background", "th-store-one")}
                            value={settings.taiowc_shipping_icon_bg}
                            onChange={(v) =>
                              update("taiowc_shipping_icon_bg", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Icon Border", "th-store-one")}
                            value={settings.taiowc_shipping_icon_border}
                            onChange={(v) =>
                              update("taiowc_shipping_icon_border", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Text Color", "th-store-one")}
                            value={settings.taiowc_shipping_text}
                            onChange={(v) => update("taiowc_shipping_text", v)}
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Amount Color", "th-store-one")}
                            value={settings.taiowc_shipping_amount}
                            onChange={(v) =>
                              update("taiowc_shipping_amount", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>
                      </S1FieldGroup>
                    </>
                  ),
                },
                {
                  id: "mobile",
                  label: "Mobile",

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
                      <rect x="6" y="2" width="12" height="20" rx="2" />
                      <line x1="10" y1="18" x2="14" y2="18" />
                    </svg>
                  ),
                  content: (
                    <>
                      {/* Menu Cart / Shortcode Cart */}
                      <S1FieldGroup
                        pro={licenseActive ? false : true}
                        number={1}
                        title="Menu Cart"
                        shortdescription="Control cart visibility and content on mobile devices"
                      >
                        <S1Field
                          label="Disable"
                          description="Disable Menu Cart / Shortcode Cart on mobile"
                        >
                          <ToggleControl
                            checked={settings.taiowcp_dsble_mnu_crt}
                            onChange={(v) => update("taiowcp_dsble_mnu_crt", v)}
                          />
                        </S1Field>

                        <S1Field label="Disable Cart Quantity">
                          <ToggleControl
                            checked={settings.taiowcp_dsble_mnu_crt_qnty}
                            onChange={(v) =>
                              update("taiowcp_dsble_mnu_crt_qnty", v)
                            }
                          />
                        </S1Field>

                        <S1Field label="Disable Cart Price">
                          <ToggleControl
                            checked={settings.taiowcp_dsble_mnu_crt_price}
                            onChange={(v) =>
                              update("taiowcp_dsble_mnu_crt_price", v)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>

                      {/* Fixed / Floating Cart */}
                      <S1FieldGroup
                        pro={licenseActive ? false : true}
                        number={2}
                        title="Fixed & Floating Cart"
                        shortdescription="Control fixed cart behavior on mobile devices"
                      >
                        <S1Field
                          label="Disable"
                          description="Disable Fixed Cart on mobile"
                        >
                          <ToggleControl
                            checked={settings.taiowcp_dsble_fxd_crt}
                            onChange={(v) => update("taiowcp_dsble_fxd_crt", v)}
                          />
                        </S1Field>

                        <S1Field label="Disable Quantity">
                          <ToggleControl
                            checked={settings.taiowcp_dsble_fxd_crt_qnty}
                            onChange={(v) =>
                              update("taiowcp_dsble_fxd_crt_qnty", v)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label="Position"
                          description="This will override the Global Position Setting"
                        >
                          <SelectControl
                            value={settings.taiowcp_fxd_cart_mobile_position}
                            options={[
                              {
                                label: "Default",
                                value: "",
                              },
                              {
                                label: "Right",
                                value: "fxd-right",
                              },
                              {
                                label: "Left",
                                value: "fxd-left",
                              },
                            ]}
                            onChange={(v) =>
                              update("taiowcp_fxd_cart_mobile_position", v)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>

                      {/* Cart Panel */}
                      <S1FieldGroup
                        pro={licenseActive ? false : true}
                        number={3}
                        title="Cart Panel"
                        shortdescription="Control cart panel behavior on mobile devices"
                      >
                        <S1Field label="Open Style">
                          <SelectControl
                            value={settings.taiowcp_cart_mobile_effect}
                            options={[
                              {
                                label: "Default",
                                value: "global",
                              },
                              {
                                label: "Mobile Bottom",
                                value: "mobiletopslide",
                              },
                            ]}
                            onChange={(v) =>
                              update("taiowcp_cart_mobile_effect", v)
                            }
                          />
                        </S1Field>

                        <S1Field label="Disable Product You May Like">
                          <ToggleControl
                            checked={settings.taiowcp_dsble_mob_rel_prd_crt}
                            onChange={(v) =>
                              update("taiowcp_dsble_mob_rel_prd_crt", v)
                            }
                          />
                        </S1Field>

                        <S1Field label="Disable Shipping">
                          <ToggleControl
                            checked={settings.taiowcp_dsble_mob_ship}
                            onChange={(v) =>
                              update("taiowcp_dsble_mob_ship", v)
                            }
                          />
                        </S1Field>

                        <S1Field label="Disable Coupon">
                          <ToggleControl
                            checked={settings.taiowcp_dsble_mob_coupan}
                            onChange={(v) =>
                              update("taiowcp_dsble_mob_coupan", v)
                            }
                          />
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
              onReset={() => setSettings(DEFAULT_SETTINGS)}
            />
          </div>
        </>
      )}
    </div>
  );
}
