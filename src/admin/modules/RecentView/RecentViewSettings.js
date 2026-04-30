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
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import THBackgroundControl from "@th-storeone-control/color";
import { CopyIcon } from "@radix-ui/react-icons";
import SliderControl from "@th-storeone-global/SliderControl";

const MODULE_ID = "recent-view";

/* ---------------------------------
 * DEFAULT SETTINGS
 * --------------------------------- */
const DEFAULT_SETTINGS = {
  enable: true,

  title: "Recently Viewed",
  title_tag: "h3",
  hide_title: false,

  slider: {
  enabled: false,
  slides: 4,
  autoplay: false,
  navigation: true,
  },

  products: "6",
  columns: "3",
  columns_gap: "15",

  order_by: "recent",

  priority: "20",

  title_color: "#212121",

  show_pages: {
    single: true,
    cart: false,
    checkout: false,
  },
};

export default function RecentViewSettings({
  onSettingsChange,
  onRegisterSave,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  /* ---------------------------------
   * LOAD
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
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  /* ---------------------------------
   * SAVE
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
      .then(() => setSuccess("Saved"))
      .catch(() => setError("Error"))
      .finally(() => setSaving(false));
  };

  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings]);

  useEffect(() => {
    onRegisterSave?.(() => handleSave);
  }, [settings]);

  /* ---------------------------------
   * RENDER
   * --------------------------------- */
  return (
    <div className="storeone-module-settings">
      {loading && (
        <div className="store-one-loader">
          <Spinner /> Loading...
        </div>
      )}

      {!loading && (
        <>
          {error && <div className="s1-toast s1-toast--error">{error}</div>}
          {success && (
            <div className="s1-toast s1-toast--success">{success}</div>
          )}
          <h3 className="store-one-section-title">Recently Viewed Products</h3>
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
                      {/* TITLE */}
                      <S1FieldGroup title="Title">
                        <S1Field
                          label={__("Title", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <TextControl
                            value={settings.title}
                            onChange={(v) =>
                              setSettings({ ...settings, title: v })
                            }
                          />
                        </S1Field>
                        <S1Field
                          label={__("Title HTML tag", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <SelectControl
                            value={settings.title_tag}
                            options={[
                              { label: "H1", value: "h1" },
                              { label: "H2", value: "h2" },
                              { label: "H3", value: "h3" },
                              { label: "H4", value: "h4" },
                              { label: "H5", value: "h5" },
                              { label: "H6", value: "h6" },
                              { label: "DIV", value: "div" },
                              { label: "span", value: "span" },
                            ]}
                            onChange={(v) =>
                              setSettings({ ...settings, title_tag: v })
                            }
                          />
                        </S1Field>
                        <S1Field
                          label={__("Hide title", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.hide_title}
                            onChange={(v) =>
                              setSettings({ ...settings, hide_title: v })
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      {/* LAYOUT */}
                      <S1FieldGroup title="Layout">
                        <UniversalRangeControl
                          label="Products"
                          value={settings.products}
                          min={1}
                          max={20}
                          onChange={(v) =>
                            setSettings({ ...settings, products: v })
                          }
                        />
                        <UniversalRangeControl
                          label="Columns"
                          value={settings.columns}
                          min={1}
                          max={6}
                          onChange={(v) =>
                            setSettings({ ...settings, columns: v })
                          }
                        />
                        <UniversalRangeControl
                          label="Columns gap"
                          value={settings.columns_gap}
                          min={0}
                          max={50}
                          onChange={(v) =>
                            setSettings({ ...settings, columns_gap: v })
                          }
                        />
                      </S1FieldGroup>
                      {/* LOGIC */}
                      <S1FieldGroup title="Logic">
                          <S1Field
                          label={__("Order by", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                          >
                          <SelectControl
                            value={settings.order_by}
                            options={[
                              { label: "Last viewed", value: "recent" },
                              { label: "Random", value: "random" },
                              { label: "Title", value: "title" },
                              {
                                label: "Modified Date",
                                value: "modified-date",
                              },
                            ]}
                            onChange={(v) =>
                              setSettings({ ...settings, order_by: v })
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
                  content:(
                    <>
                      {/* PAGES */}
                      <S1FieldGroup title="Show on pages">
                        <S1Field
                          label={__("Product Single", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.show_pages.single}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                show_pages: {
                                  ...settings.show_pages,
                                  single: v,
                                },
                              })
                            }
                          />
                        </S1Field>
                        <S1Field
                          label={__("Cart", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.show_pages.cart}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                show_pages: {
                                  ...settings.show_pages,
                                  cart: v,
                                },
                              })
                            }
                          />
                        </S1Field>
                        <S1Field
                          label={__("Checkout", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={settings.show_pages.checkout}
                            onChange={(v) =>
                              setSettings({
                                ...settings,
                                show_pages: {
                                  ...settings.show_pages,
                                  checkout: v,
                                },
                              })
                            }
                          />
                        </S1Field>
                        {/* PRIORITY */}
                      <S1FieldGroup title="Placement">
                        <UniversalRangeControl
                          label="Loading priority"
                          value={settings.priority}
                          min={1}
                          max={50}
                          onChange={(v) =>
                            setSettings({ ...settings, priority: v })
                          }
                        />

                        <p className="s1-note">
                          Lower number = higher priority (shows higher on page)
                        </p>
                      </S1FieldGroup>
                      </S1FieldGroup>
                      {/* SHORTCODE */}
                      <S1FieldGroup title="Shortcode">
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
                              value={`[th_store_one_recent_view]`}
                              className="s1-shortcode-textarea"
                            />

                            <button
                              type="button"
                              className="s1-shortcode-copy"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `[th_store_one_recent_view"]`,
                                );
                              }}
                            >
                              <CopyIcon />
                            </button>
                          </div>
                        </S1Field>
                      </S1FieldGroup>
                    </>
                  ),
                },

                 {
                  id: "style",
                  label: "Design",
                  icon: ICONS.DESIGN,
                  content: (
                    <>
                   
                        <SliderControl
                            value={settings.slider || {}}
                             onChange={(v) =>
                            setSettings({ ...settings, slider: v })
                          }

                            labels={{
                                enable: __("Display in Slider", "th-store-one"),
                                slides: __("Slides to Show", "th-store-one"),
                                autoplay: __("Auto Play", "th-store-one"),
                                navigation: __("Show Navigation", "th-store-one"),
                            }}

                            fields={{
                                enable: true,
                                slides: true,
                                autoplay: true,
                                navigation: true,
                            }}
                        />
                    <S1Field label={__("Title color", "th-store-one")}>
                         <THBackgroundControl
                              label=""
                              value={settings.title_color}
                              onChange={(v) =>
                              setSettings({ ...settings, title_color: v })
                              }
                         />
                        </S1Field>
                    </>
                  )}
              ]}
            />
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
