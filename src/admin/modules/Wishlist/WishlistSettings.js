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
import MultiWooSearchSelector from "@th-storeone-global/MultiWooSearchSelector";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import { ICONS } from "@th-storeone-global/icons";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";
import THBackgroundControl from "@th-storeone-control/color";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import PlacementPriorityControl from "@th-storeone-global/PlacementPriorityControl";
import { CopyIcon } from "@radix-ui/react-icons";

const MODULE_ID = "th-wishlist";

const DEFAULT_SETTINGS = {
  thwl_page_id: "",
  thw_require_login: false,
  thw_button_display_style: "icon_text",
  thw_add_to_wishlist_text: "Add to Wishlist",
  thw_browse_wishlist_text: "Browse Wishlist",
  thw_btn_style_theme: false,
  thw_show_in_loop: true,
  thw_in_loop_position: "after_crt_btn",
  thw_show_in_product: true,
  thw_in_single_position: "after_crt_btn",
  thw_in_single_priority: "10",
  thw_redirect_to_cart: false,
  thw_show_social_share: false,
  thw_redirect_wishlist_page: false,
  thw_wishlist_add_icon: "heart-outline",
  th_wishlist_brws_icon: "heart-filled",
  use_shortcode: true,
  use_shortcode_btn: true,
  use_shortcode_redirect: true,

  // Style
  thw_wishlist_add_icon_color: "#111",
  thw_wishlist_btn_bg_color: "#6a4df5",
  thw_wishlist_btn_txt_color: "#fff",
  thw_redirect_wishlist_page_icon_size: "24",
  thw_wishlist_table_bg_color: "#fff",
  thw_wishlist_table_brd_color: "#eee",
  thw_wishlist_table_txt_color: "#111",
  wishlist_table_style: "classic",
};
const WISHLIST_ICON_OPTIONS = [
  {
    id: "heart-outline",
    svg: `<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>`,
  },
  {
    id: "heart-filled",
    svg: `<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>`,
  },
  {
    id: "star-outline",
    svg: `<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21L12 17.77L5.82 21L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>`,
  },
  {
    id: "star-filled",
    svg: `<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21L12 17.77L5.82 21L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>`,
  },
  {
    id: "bookmark-outline",
    svg: `<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M6.32 2.577c2.83-.33 5.66-.33 8.49 0 1.497.174 2.57 1.46 2.57 2.93V21l-6.165-3.583-7.165 3.583V5.507c0-1.47 1.073-2.756 2.57-2.93Z"/></svg>`,
  },
  {
    id: "bookmark-filled",
    svg: `<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"/></svg>`,
  },
];
export default function WishlistSettings({
  onSettingsChange,
  onRegisterSave,
  onModuleReady,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [hideToast, setHideToast] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [importing, setImporting] = useState(false);
  const [hasOldData, setHasOldData] = useState(false);

  // Check Old Data
  useEffect(() => {
    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}check-old-option?option=thwl_settings`,
    })
      .then((res) => setHasOldData(res.has_data))
      .catch(() => setHasOldData(false));
  }, []);

  // Import Old Data
  const importOldData = async () => {
    setImporting(true);
    try {
      const res = await apiFetch({
        path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}/import-old`,
        method: "POST",
        data: { option_name: "thwl_settings" },
      });

      if (res.success) {
        setSettings(res.settings);
        setSuccess("Old TH Wishlist settings imported successfully!");
        setHasOldData(false);
      } else {
        setError(res.message || "Import failed");
      }
    } catch (e) {
      setError("Failed to import old data");
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
        setSettings({ ...DEFAULT_SETTINGS, ...s });
      })
      .catch(() => setError(__("Failed to load settings.", "th-store-one")))
      .finally(() => setLoading(false));
  }, []);

  /* Notify Parent */
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings]);

  /* Register Save */
  useEffect(() => {
    onRegisterSave?.(() => handleSave);
  }, [settings]);

  /* Save Handler */
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

  /* Auto Hide Toast */
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

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const applyStyleDefaults = (settings, style, type) => {
    const defaults = {};
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

  useEffect(() => {
    const handler = (e) => {
      const { style } = e.detail || {};

      if (!style) return;

      const updated = {
        ...settings,
        wishlist_table_style: style,
      };

      setSettings(updated);

      onSettingsChange?.(updated);
    };

    window.addEventListener("storeone:updateWishlistTableStyle", handler);

    return () => {
      window.removeEventListener("storeone:updateWishlistTableStyle", handler);
    };
  }, [settings]);

  useEffect(() => {
    const handler = (e) => {
      const { preview } = e.detail;

      const updated = {
        ...settings,
        wishlist_preview: preview,
      };

      setSettings(updated);

      onSettingsChange?.(updated);
    };

    window.addEventListener("storeone:changeWishlistPreview", handler);

    return () => {
      window.removeEventListener("storeone:changeWishlistPreview", handler);
    };
  }, [settings]);

  return (
    <div className="storeone-module-settings s1-no-rule">
      {loading && (
        <div className="store-one-loader">
          <Spinner /> {__("Loading Wishlist Settings…", "th-store-one")}
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

          <h3 className="store-one-section-title">TH Wishlist</h3>

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
                      {hasOldData && (
                        <div className="th-import-card">
                          <div className="th-import-card__content">
                            <h3>Import Existing Wishlist Settings</h3>
                            <p>
                              We found an existing <strong>TH Wishlist</strong>{" "}
                              configuration on your site. Import your current
                              settings into <strong>Store One</strong> to
                              continue using the same configuration without
                              setting everything up again.
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
                      <S1FieldGroup
                        number={1}
                        title="Basic"
                        shortdescription=""
                      >
                        <MultiWooSearchSelector
                          label="Select Wishlist Page"
                          searchType="page"
                          value={
                            settings.thwl_page_id ? [settings.thwl_page_id] : []
                          }
                          onChange={(selectedIds) =>
                            update("thwl_page_id", selectedIds[0] || "")
                          }
                          isSingle={true}
                          detailedView={true}
                        />

                        <S1Field
                          label="Require Login"
                          description={__(
                            "Only logged-in users can add products to the wishlist.",
                            "th-store-one",
                          )}
                        >
                          <ToggleControl
                            checked={settings.thw_require_login}
                            onChange={(v) => update("thw_require_login", v)}
                          />
                        </S1Field>
                      </S1FieldGroup>

                      <S1FieldGroup number={2} title="Wishlist Button">
                        <S1Field label="Button Style">
                          <SelectControl
                            value={settings.thw_button_display_style}
                            options={[
                              { label: "Icon + Text", value: "icon_text" },
                              { label: "Icon Only", value: "icon" },
                              {
                                label: "Icon Only (No Style)",
                                value: "icon_only_no_style",
                              },
                              { label: "Text Only", value: "text" },
                            ]}
                            onChange={(v) =>
                              update("thw_button_display_style", v)
                            }
                          />
                        </S1Field>

                        <S1Field label="Add to Wishlist Text">
                          <TextControl
                            value={settings.thw_add_to_wishlist_text}
                            onChange={(v) =>
                              update("thw_add_to_wishlist_text", v)
                            }
                          />
                        </S1Field>

                        <S1Field label="Browse Wishlist Text">
                          <TextControl
                            value={settings.thw_browse_wishlist_text}
                            onChange={(v) =>
                              update("thw_browse_wishlist_text", v)
                            }
                          />
                        </S1Field>
                        <S1Field
                          label="Theme Default Style"
                          description={__(
                            "Choose to Wishlist button style as theme",
                            "th-store-one",
                          )}
                        >
                          <ToggleControl
                            checked={settings.thw_btn_style_theme}
                            onChange={(v) => update("thw_btn_style_theme", v)}
                          />
                        </S1Field>
                      </S1FieldGroup>
                      {/* SHORTCODE */}
                      <S1FieldGroup number={3} title="Shortcode">
                        <S1Field
                          label={__("Use Shortcode For Button", "th-store-one")}
                        >
                          <ToggleControl
                            checked={settings.use_shortcode_btn}
                            onChange={(v) =>
                              setSettings({ ...settings, use_shortcode_btn: v })
                            }
                          />
                          <p className="s1-shortcode-description">
                            {__(
                              "Use this shortcode to display Wishlist Buttton.",
                              "th-store-one",
                            )}
                          </p>
                        </S1Field>
                        {settings.use_shortcode_btn && (
                          <S1Field>
                            <div className="s1-shortcode-wrapper">
                              <textarea
                                readOnly
                                value={`[th_store_one_wishlist_button]`}
                                className="s1-shortcode-textarea"
                              />

                              <button
                                type="button"
                                className="s1-shortcode-copy"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `[th_store_one_wishlist_button"]`,
                                  );
                                }}
                              >
                                <CopyIcon />
                              </button>
                            </div>
                          </S1Field>
                        )}

                        <S1Field
                          label={__("Use Shortcode For Pages", "th-store-one")}
                        >
                          <ToggleControl
                            checked={settings.use_shortcode}
                            onChange={(v) =>
                              setSettings({ ...settings, use_shortcode: v })
                            }
                          />
                          <p className="s1-shortcode-description">
                            {__(
                              "Use this shortcode anywhere on your site to create a Icon that redirects users to the Wishlist page",
                              "th-store-one",
                            )}
                          </p>
                        </S1Field>
                        {settings.use_shortcode && (
                          <S1Field>
                            <div className="s1-shortcode-wrapper">
                              <textarea
                                readOnly
                                value={`[th_store_one_wishlist_page]`}
                                className="s1-shortcode-textarea"
                              />

                              <button
                                type="button"
                                className="s1-shortcode-copy"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `[th_store_one_wishlist_page"]`,
                                  );
                                }}
                              >
                                <CopyIcon />
                              </button>
                            </div>
                          </S1Field>
                        )}

                        <S1Field
                          label={__(
                            "Use Shortcode For Redirect",
                            "th-store-one",
                          )}
                        >
                          <ToggleControl
                            checked={settings.use_shortcode_redirect}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                use_shortcode_redirect: v,
                              })
                            }
                          />
                          <p className="s1-shortcode-description">
                            {__(
                              "Use this shortcode anywhere on your site to create a Icon that redirects users to the Wishlist page.",
                              "th-store-one",
                            )}
                          </p>
                        </S1Field>
                        {settings.use_shortcode_redirect && (
                          <S1Field>
                            <div className="s1-shortcode-wrapper">
                              <textarea
                                readOnly
                                value={`[th_store_one_wishlist_redirect]`}
                                className="s1-shortcode-textarea"
                              />

                              <button
                                type="button"
                                className="s1-shortcode-copy"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `[th_store_one_wishlist_redirect"]`,
                                  );
                                }}
                              >
                                <CopyIcon />
                              </button>
                            </div>
                          </S1Field>
                        )}
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
                      <S1FieldGroup number={1} title="Loop (Shop) Page">
                        <S1Field label="Show in Loop">
                          <ToggleControl
                            checked={settings.thw_show_in_loop}
                            onChange={(v) => update("thw_show_in_loop", v)}
                          />
                        </S1Field>

                        {settings.thw_show_in_loop && (
                          <S1Field label="Position">
                            <SelectControl
                              value={settings.thw_in_loop_position}
                              options={[
                                {
                                  label: "After Add to Cart",
                                  value: "after_crt_btn",
                                },
                                {
                                  label: "Before Add to Cart",
                                  value: "before_crt_btn",
                                },
                                { label: "On Top", value: "on_top" },
                              ]}
                              onChange={(v) =>
                                update("thw_in_loop_position", v)
                              }
                            />
                          </S1Field>
                        )}
                      </S1FieldGroup>

                      <S1FieldGroup number={2} title="Single Product Page">
                        <S1Field label="Show on Product Page">
                          <ToggleControl
                            checked={settings.thw_show_in_product}
                            onChange={(v) => update("thw_show_in_product", v)}
                          />
                        </S1Field>

                        {settings.thw_show_in_product && (
                          <PlacementPriorityControl
                            placement={settings.thw_in_single_position}
                            priority={settings.thw_in_single_priority || 10}
                            onPlacementChange={(v) =>
                              update("thw_in_single_position", v)
                            }
                            onPriorityChange={(v) =>
                              update("thw_in_single_priority", v)
                            }
                          />
                        )}
                      </S1FieldGroup>

                      <S1FieldGroup number={3} title="Wishlist Page">
                        <S1Field
                          label="Redirect to Cart after Add"
                          description="Remove Product in Wishlist table and Redirect to the cart page after adding item(s) from the wishlist."
                        >
                          <ToggleControl
                            checked={settings.thw_redirect_to_cart}
                            onChange={(v) => update("thw_redirect_to_cart", v)}
                          />
                        </S1Field>

                        <S1Field label="Show Social Share Buttons">
                          <ToggleControl
                            checked={settings.thw_show_social_share}
                            onChange={(v) => update("thw_show_social_share", v)}
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
                      <S1FieldGroup number={1} title="Choose Icon">
                        <S1Field label="Wishlist Icon" classN="list-icon">
                          {WISHLIST_ICON_OPTIONS.map(({ id, svg }) => (
                            <div
                              key={id}
                              className={`s1-icon-option ${
                                settings.thw_wishlist_add_icon === id
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                update("thw_wishlist_add_icon", id)
                              }
                              dangerouslySetInnerHTML={{ __html: svg }}
                            />
                          ))}
                        </S1Field>
                        <S1Field
                          label="Browse Wishlist Icon"
                          classN="list-icon"
                        >
                          {WISHLIST_ICON_OPTIONS.map(({ id, svg }) => (
                            <div
                              key={id}
                              className={`s1-icon-option ${
                                settings.th_wishlist_brws_icon === id
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                update("th_wishlist_brws_icon", id)
                              }
                              dangerouslySetInnerHTML={{ __html: svg }}
                            />
                          ))}
                        </S1Field>
                      </S1FieldGroup>

                      <S1FieldGroup number={2} title="Button & Icon">
                        <S1Field>
                          <THBackgroundControl
                            label={__("Color", "th-store-one")}
                            value={settings.thw_wishlist_add_icon_color}
                            onChange={(v) =>
                              update("thw_wishlist_add_icon_color", v)
                            }
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Background", "th-store-one")}
                            allowGradient={true}
                            value={settings.thw_wishlist_btn_bg_color}
                            onChange={(v) =>
                              update("thw_wishlist_btn_bg_color", v)
                            }
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Text", "th-store-one")}
                            value={settings.thw_wishlist_btn_txt_color}
                            onChange={(v) =>
                              update("thw_wishlist_btn_txt_color", v)
                            }
                          />
                        </S1Field>

                        <UniversalRangeControl
                          label="Icon Size"
                          value={
                            settings.thw_redirect_wishlist_page_icon_size ||
                            "24"
                          }
                          onChange={(v) =>
                            update("thw_redirect_wishlist_page_icon_size", v)
                          }
                          units={["px"]}
                        />
                      </S1FieldGroup>

                      <S1FieldGroup number={3} title="Wishlist Table">
                        <S1Field label="Wishlist Table Style" visible={false}>
                          <SelectControl
                            value={settings.wishlist_table_style || "style1"}
                            options={[
                              { label: "Style 1", value: "classic" },
                              { label: "Style 2", value: "modern" },
                              { label: "Style 3", value: "minimal" },
                            ]}
                            onChange={(v) => {
                              const updated = applyStyleDefaults(
                                {
                                  ...settings,
                                  wishlist_table_style: v,
                                },
                                v,
                              );

                              setSettings(updated);
                              onSettingsChange?.(updated);
                            }}
                          />
                        </S1Field>
                        <S1Field>
                          <THBackgroundControl
                            label={__("Background", "th-store-one")}
                            value={settings.thw_wishlist_table_bg_color}
                            onChange={(v) =>
                              update("thw_wishlist_table_bg_color", v)
                            }
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Border", "th-store-one")}
                            value={settings.thw_wishlist_table_brd_color}
                            onChange={(v) =>
                              update("thw_wishlist_table_brd_color", v)
                            }
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Text", "th-store-one")}
                            value={settings.thw_wishlist_table_txt_color}
                            onChange={(v) =>
                              update("thw_wishlist_table_txt_color", v)
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
