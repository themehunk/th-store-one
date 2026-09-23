import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";

import {
  Spinner,
  ToggleControl,
  SelectControl,
  TextControl,
  TextareaControl,
  Button,
} from "@wordpress/components";

import { CopyIcon } from "@radix-ui/react-icons";

import MultiWooSearchSelector from "@th-storeone-global/MultiWooSearchSelector";
import ExcludeWooCondition from "@th-storeone-global/ExcludeWooCondition";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";
import THBackgroundControl from "@th-storeone-control/color";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";

import { ICONS } from "@th-storeone-global/icons";

const MODULE_ID = "th-advancedsearch";
const DEFAULT_SETTINGS = {
  /* General */

  set_autocomplete_length: 1,
  set_form_width: 550,
  show_submit: true,
  level_submit: "Search",
  placeholder_text: "Search for products...",
  show_loader: false,
  tapsp_show_body_overlay: true,

  /* Autocomplete */

  select_srch_type: "product_srch",
  result_length: 5,
  no_reult_label: "No Result Found",
  more_reult_label: "See All Results ",
  enable_group_heading: true,
  desc_excpt_length: 90,
  tapsp_enable_voice_search: false,

  /* Categories */

  show_category_in: false,
  enable_cat_image: true,

  /* Products */

  enable_product_image: true,
  enable_product_price: true,
  enable_product_desc: false,
  enable_product_sku: false,
  exclude_products_enabled: false,
  exclude_products: [],

  tapsp_highlight_sale: true,
  tapsp_highlight_featured: true,
  tapsp_stock_availability: true,

  /* Post & Pages */

  enable_post_image: true,
  enable_post_desc: false,
  enable_page_image: true,
  enable_page_desc: false,

  /* Search Bar Style */

  bar_bg_clr: "",
  bar_brdr_clr: "",
  bar_text_clr: "",
  icon_clr: "#fff",
  bar_button_bg_clr: "#000000",
  bar_button_txt_clr: "#FFF",
  bar_button_hvr_clr: "#000000",
  bar_button_txt_hvr_clr: "#FFF",

  /* Suggestion Box Style */

  sus_bg_clr: "",
  sus_hglt_clr: "#2991f5",
  sus_slect_clr: "",
  sus_brdr_clr: "",
  sus_grphd_clr: "",
  sus_title_clr: "",
  sus_text_clr: "",

  /* Search Configure */
  tapsp_search_in_category: false,
  tapsp_search_in_tag: false,
  tapsp_search_in_brand: false,
  tapsp_search_in_attributes: false,
  tapsp_search_in_description: false,
  tapsp_search_in_short_description: false,
  tapsp_search_in_product_sku: false,
  /*******************/
  // Premiun option
  /*****************/
  tapsp_show_category_filter: false,
  tapsp_show_category_filter_label: "All",
  tapsp_exclude_category_enabled: false,
  tapsp_exclude_category: [],
  /* Trending Search */
  tapsp_trending_enable: false,
  tapsp_specific_key_search: "specific",
  tapsp_trending_search: "Vintage dress, Black dress, Black boots, Red dress",
  tapsp_trending_limit: 3,
  tapsp_trending_label: "Trending Searches",
  /* No Results Experience */
  tapsp_no_result_enable_fallback: false,
  tapsp_no_result_show_popular_products: false,
  tapsp_no_result_popular_limit: 4,
  tapsp_no_result_show_categories: false,
  tapsp_no_result_categories_limit: 5,
  tapsp_no_result_show_suggested: false,
  tapsp_no_result_suggested_limit: 5,
  tapsp_no_result_show_recently_viewed: false,
  tapsp_no_result_recently_viewed_limit: 4,
  // ranking
  tapsp_enable_custom_ranking: true,
  tapsp_rank_weight_title: 100,
  tapsp_rank_weight_sku: 80,
  tapsp_rank_weight_category: 60,
  tapsp_rank_weight_tags: 50,
  tapsp_rank_weight_attributes: 50,
  tapsp_rank_weight_brand: 60,
  tapsp_rank_weight_popularity: 30,
  tapsp_rank_weight_rating: 20,
  tapsp_rank_weight_stock: 10,
  // scope
  tapsp_search_in_custom_fld: [],
  tapsp_search_in_custom_post_type: "",
  /* Boost Search */
  tapsp_build_search_index: false,
  tapsp_index_batch_limit: 100,
  /* Fuzzy Search */
  tapsp_enable_fuzzy: false,
  tapsp_fuzzy_level: 50,
  tapsp_synonym_list: "",
  // style
  tapsp_product_search_style: "th-normal",
  tapsp_enable_product_image: true,
  tapsp_enable_product_price: true,
  tapsp_enable_product_desc: false,
  tapsp_enable_product_sku: true,
  tapsp_enable_cart_btn: false,
};

export default function AdvanceSearchSettings({
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

  const [indexing, setIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [indexMessage, setIndexMessage] = useState("");

  const [indexBuilt, setIndexBuilt] = useState(false);

  const update = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const handler = (e) => {
      const { style } = e.detail;

      if (!style) return;

      update("tapsp_product_search_style", style);
    };

    window.addEventListener("storeone:changeProductSearchStyle", handler);

    return () => {
      window.removeEventListener("storeone:changeProductSearchStyle", handler);
    };
  }, []);

  /* Check Old Data */
  useEffect(() => {
    Promise.all([
      apiFetch({
        path: `${th_StoreOneAdmin.restUrl}check-old-option?option=thaps`,
      }),
      apiFetch({
        path: `${th_StoreOneAdmin.restUrl}check-old-option?option=thaps`,
      }),
    ])
      .then(([pro, lite]) => {
        setHasOldData(Boolean(pro?.has_data || lite?.has_data));

        setHasActiveOldCartPlugin(
          Boolean(pro?.has_active_old_plugin || lite?.has_active_old_plugin),
        );
      })
      .catch(() => {
        setHasOldData(false);
        setHasActiveOldSearchPlugin(false);
      });
  }, []);

  /* Import Old Data */
  const importOldData = async () => {
    setImporting(true);

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

  const buildSearchIndex = async () => {
    if (!licenseActive || indexing) {
      return;
    }

    setIndexing(true);
    setIndexProgress(0);
    setIndexMessage(__("Starting search index...", "th-store-one"));
    setError("");
    setSuccess("");

    const batchSize = Math.max(
      10,
      Math.min(500, Number(settings.tapsp_index_batch_limit) || 100),
    );

    let offset = 0;

    try {
      while (true) {
        const response = await apiFetch({
          path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}/build-index`,
          method: "POST",
          data: {
            offset,
            batch_size: batchSize,
          },
        });

        console.log("INDEX RESPONSE:", response);

        if (!response?.success) {
          throw new Error(
            response?.message || __("Index build failed.", "th-store-one"),
          );
        }

        const progress = Number(response.progress || 0);

        setIndexProgress(progress);
        setIndexMessage(
          response.message ||
            `${response.processed || 0} / ${
              response.total || 0
            } products indexed`,
        );

        if (response.completed) {
          setIndexProgress(100);
          setIndexBuilt(true);

          setIndexMessage(
            __("Search index built successfully.", "th-store-one"),
          );

          setSuccess(__("Search index built successfully!", "th-store-one"));

          break;
        }

        offset = Number(response.next_offset || 0);

        // Small delay between batches.
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } catch (e) {
      setError(
        e?.message || __("Failed to build search index.", "th-store-one"),
      );
      setIndexMessage("");
    } finally {
      setIndexing(false);
    }
  };

  const disableSearchIndex = async () => {
    if (!licenseActive || indexing) {
      return;
    }

    setIndexing(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch({
        path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}/disable-index`,
        method: "POST",
      });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            __("Failed to disable search index.", "th-store-one"),
        );
      }

      setIndexBuilt(false);
      setIndexProgress(0);
      setIndexMessage("");

      setSuccess(__("Search index disabled successfully!", "th-store-one"));
    } catch (e) {
      setError(
        e?.message || __("Failed to disable search index.", "th-store-one"),
      );
    } finally {
      setIndexing(false);
    }
  };

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

  // deactivate plugin
  const [hasActiveOldSearchPlugin, setHasActiveOldSearchPlugin] =
    useState(false);
  const [deactivating, setDeactivating] = useState(false);

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
          __("Old Search plugins deactivated successfully.", "th-store-one"),
        );
      } else {
        setError(
          res.message ||
            __("Failed to deactivate old search plugins.", "th-store-one"),
        );
      }
    } catch (e) {
      setError(__("Failed to deactivate old search plugins.", "th-store-one"));
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="storeone-module-settings s1-no-rule">
      {loading && (
        <div className="store-one-loader">
          <Spinner />
          {__("Loading Advance Search Settings…", "th-store-one")}
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

          <h3 className="store-one-section-title">TH Advance Search</h3>

          <div className="store-one-rule-item">
            <TabSwitcher
              defaultTab="settings"
              tabs={[
                {
                  id: "settings",
                  label: "General",
                  icon: ICONS.SETTINGS,

                  content: (
                    <>
                      {hasOldData && (
                        <div className="th-import-card">
                          <div className="th-import-card__content">
                            <h3>Import Existing Advance Search Settings</h3>

                            <p>
                              We found an existing
                              <strong> TH Advance Search </strong>
                              configuration on your site. Import your current
                              settings into
                              <strong> Store One </strong>
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

                      {hasActiveOldSearchPlugin && (
                        <div className="th-import-card">
                          <div className="th-import-card__content">
                            <h3>Deactivate Existing Advance Search Plugins</h3>

                            <p>
                              We found an active
                              <strong> TH Advance Search </strong>
                              plugin on your site. Deactivate the old advance
                              search plugin to avoid conflicts and continue
                              using
                              <strong> Store One </strong>
                              for your advance search configuration.
                            </p>

                            <Button
                              variant="secondary"
                              isBusy={deactivating}
                              onClick={deactivateOldPlugins}
                              disabled={deactivating}
                            >
                              {deactivating
                                ? __("Deactivating Plugins...", "th-store-one")
                                : __(
                                    "Deactivate Old Advance Search Plugins",
                                    "th-store-one",
                                  )}
                            </Button>
                          </div>
                        </div>
                      )}

                      <S1FieldGroup number={1} title="General Search Settings">
                        <div className="s1-field-group-row">
                          <S1Field
                            label="Minimum Character"
                            description="Search results will start appearing after the user types."
                          >
                            <UniversalRangeControl
                              label=""
                              value={String(
                                settings.set_autocomplete_length ?? 1,
                              )}
                              onChange={(v) =>
                                update("set_autocomplete_length", v)
                              }
                              min={1}
                              max={10}
                            />
                          </S1Field>
                          <S1Field
                            label="Search Bar Width"
                            description="Set a specific width or leave empty for 100% fluid width."
                          >
                            <UniversalRangeControl
                              label=""
                              value={String(settings.set_form_width ?? 550)}
                              onChange={(v) => update("set_form_width", v)}
                              min={1}
                              max={2400}
                            />
                          </S1Field>
                        </div>

                        <S1Field label="Placeholder Text">
                          <TextControl
                            value={settings.placeholder_text ?? ""}
                            onChange={(v) => update("placeholder_text", v)}
                          />
                        </S1Field>

                        <S1Field
                          label="Submit Button"
                          classN="s1-exclude-header"
                        >
                          <ToggleControl
                            checked={settings.show_submit}
                            onChange={(v) => update("show_submit", v)}
                          />
                        </S1Field>
                        {settings.show_submit && (
                          <S1Field label="Button Label">
                            <TextControl
                              value={settings.level_submit ?? ""}
                              onChange={(v) => update("level_submit", v)}
                            />
                          </S1Field>
                        )}
                      </S1FieldGroup>
                      <S1FieldGroup number={2} title="Loader">
                        <S1Field
                          label="Visual Loader"
                          classN="s1-exclude-header"
                        >
                          <ToggleControl
                            checked={settings.show_loader}
                            onChange={(v) => update("show_loader", v)}
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup number={3} title="Interface Overlay">
                        <S1Field
                          label="Focus Overlay"
                          description="Dim the background when search suggestions are active."
                        >
                          <ToggleControl
                            checked={settings.tapsp_show_body_overlay}
                            onChange={(v) =>
                              update("tapsp_show_body_overlay", v)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup number={4} title="Integration Methods">
                        <S1Field
                          label="Default Search Bar"
                          description="Use the standard shortcode to display the default product search bar anywhere in your theme."
                        >
                          <div className="s1-shortcode-wrapper">
                            <textarea
                              readOnly
                              value={`[th_store_one_search"]`}
                              className="s1-shortcode-textarea"
                            />
                            <button
                              type="button"
                              className="s1-shortcode-copy"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `[th_store_one_search"]`,
                                );
                              }}
                            >
                              <CopyIcon />
                            </button>
                          </div>
                        </S1Field>
                        <S1Field
                          label="Search Bar with Icon"
                          description="Display a more modern search bar that includes a search icon inside the input field."
                        >
                          <div className="s1-shortcode-wrapper">
                            <textarea
                              readOnly
                              value={`[th_store_one_search layout="bar_style""]`}
                              className="s1-shortcode-textarea"
                            />
                            <button
                              type="button"
                              className="s1-shortcode-copy"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `[th_store_one_search layout="bar_style""]`,
                                );
                              }}
                            >
                              <CopyIcon />
                            </button>
                          </div>
                        </S1Field>
                        <S1Field
                          label="PHP Template Tag"
                          description="For developers: Insert the search bar directly into your theme’s PHP templates."
                        >
                          <div className="s1-shortcode-wrapper">
                            <textarea
                              readOnly
                              value={` <?php echo do_shortcode('[th_store_one_search]'); ?> `}
                              className="s1-shortcode-textarea"
                            />
                            <button
                              type="button"
                              className="s1-shortcode-copy"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  ` <?php echo do_shortcode('[th_store_one_search]'); ?> `,
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
                  id: "display",
                  label: "Advanced",
                  icon: ICONS.DISPLAY,

                  content: (
                    <>
                      <S1FieldGroup
                        number={1}
                        title="Search Autocomplete Settings"
                      >
                        <S1Field
                          label="Select Search Type"
                          description="This setting define what you want to search, For example if you select Product then search will display olny products in search result."
                        >
                          <SelectControl
                            value={settings.select_srch_type ?? "product_srch"}
                            options={[
                              { label: "Product", value: "product_srch" },
                              { label: "Post", value: "post_srch" },
                              { label: "Page", value: "page_srch" },
                            ]}
                            onChange={(v) => update("select_srch_type", v)}
                          />
                        </S1Field>
                        <S1Field
                          label="Limit"
                          description="Set the maximum number of search results to display in the autocomplete suggestions."
                        >
                          <UniversalRangeControl
                            label=""
                            value={String(settings.result_length ?? 5)}
                            onChange={(v) => update("result_length", v)}
                            min={1}
                            max={100}
                          />
                        </S1Field>
                        <div className="s1-field-group-row">
                          <S1Field
                            label="No Result Label"
                            description="This text will display at the search result dropdown."
                          >
                            <TextControl
                              value={settings.no_reult_label ?? ""}
                              onChange={(v) => update("no_reult_label", v)}
                            />
                          </S1Field>

                          <S1Field
                            label="More Result Label"
                            description="This text will display when there are more search results available."
                          >
                            <TextControl
                              value={settings.more_reult_label ?? ""}
                              onChange={(v) => update("more_reult_label", v)}
                            />
                          </S1Field>
                        </div>
                        <S1Field
                          label="Description Length"
                          description="Set the maximum number of characters to display in the search result descriptions."
                        >
                          <UniversalRangeControl
                            label=""
                            value={String(settings.desc_excpt_length ?? 120)}
                            onChange={(v) => update("desc_excpt_length", v)}
                            min={1}
                            max={500}
                          />
                        </S1Field>
                        <div className="s1-field-group-row">
                          <S1Field
                            label="Enable Group Heading"
                            description="This option limit searched item description length. Count value in words."
                          >
                            <ToggleControl
                              checked={settings.enable_group_heading}
                              onChange={(v) =>
                                update("enable_group_heading", v)
                              }
                            />
                          </S1Field>
                          <S1Field
                            label="Enable Voice Search"
                            description="Allow users to perform search queries using their voice."
                          >
                            <ToggleControl
                              checked={settings.tapsp_enable_voice_search}
                              onChange={(v) =>
                                update("tapsp_enable_voice_search", v)
                              }
                            />
                          </S1Field>
                        </div>
                      </S1FieldGroup>
                      <S1FieldGroup number={2} title="Search Category">
                        <div className="s1-field-group-row">
                          <S1Field
                            label="Show Category"
                            description="Display the category of the search result in the autocomplete suggestions."
                          >
                            <ToggleControl
                              checked={settings.show_category_in}
                              onChange={(v) => update("show_category_in", v)}
                            />
                          </S1Field>

                          <S1Field
                            label="Enable Category Image"
                            description="Display an image for each category in the search results."
                          >
                            <ToggleControl
                              checked={settings.enable_cat_image}
                              onChange={(v) => update("enable_cat_image", v)}
                            />
                          </S1Field>
                        </div>
                      </S1FieldGroup>

                      <S1FieldGroup number={3} title="Visuals in Product">
                        <div className="s1-field-group-row">
                          <S1Field
                            label="Sale"
                            description="Highlight products that are on sale in the search results."
                          >
                            <ToggleControl
                              checked={settings.tapsp_highlight_sale}
                              onChange={(v) =>
                                update("tapsp_highlight_sale", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Featured"
                            description="Highlight products that are featured in the search results."
                          >
                            <ToggleControl
                              checked={settings.tapsp_highlight_featured}
                              onChange={(v) =>
                                update("tapsp_highlight_featured", v)
                              }
                            />
                          </S1Field>
                        </div>

                        <S1Field
                          label="Stock Availability"
                          description="Show stock availability information for products in the search results."
                        >
                          <ToggleControl
                            checked={settings.tapsp_stock_availability}
                            onChange={(v) =>
                              update("tapsp_stock_availability", v)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup number={5} title="Post">
                        <div className="s1-field-group-row">
                          <S1Field
                            label="Enable Post Image"
                            description="Display an image for each post in the search results."
                          >
                            <ToggleControl
                              checked={settings.enable_post_image}
                              onChange={(v) => update("enable_post_image", v)}
                            />
                          </S1Field>

                          <S1Field
                            label="Enable Post Description"
                            description="Display a description for each post in the search results."
                          >
                            <ToggleControl
                              checked={settings.enable_post_desc}
                              onChange={(v) => update("enable_post_desc", v)}
                            />
                          </S1Field>
                        </div>
                      </S1FieldGroup>

                      <S1FieldGroup number={6} title="Pages">
                        <div className="s1-field-group-row">
                          <S1Field
                            label="Enable Page Image"
                            description="Display an image for each page in the search results."
                          >
                            <ToggleControl
                              checked={settings.enable_page_image}
                              onChange={(v) => update("enable_page_image", v)}
                            />
                          </S1Field>

                          <S1Field
                            label="Enable Page Description"
                            description="Display a description for each page in the search results."
                          >
                            <ToggleControl
                              checked={settings.enable_page_desc}
                              onChange={(v) => update("enable_page_desc", v)}
                            />
                          </S1Field>
                        </div>
                      </S1FieldGroup>
                    </>
                  ),
                },

                {
                  id: "panel",
                  label: "Configure",
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
                      <S1FieldGroup number={1} title="Search Configure">
                        <div className="s1-field-group-row">
                          <S1Field
                            label="Search in Category"
                            description="Include product categories in the search results."
                          >
                            <ToggleControl
                              checked={settings.tapsp_search_in_category}
                              onChange={(v) =>
                                update("tapsp_search_in_category", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Search in Tags"
                            description="Include product tags in the search results."
                          >
                            <ToggleControl
                              checked={settings.tapsp_search_in_tags}
                              onChange={(v) =>
                                update("tapsp_search_in_tags", v)
                              }
                            />
                          </S1Field>
                        </div>
                        <div className="s1-field-group-row">
                          <S1Field
                            label="Search in Brand"
                            description="Include product brands in the search results."
                          >
                            <ToggleControl
                              checked={settings.tapsp_search_in_brand}
                              onChange={(v) =>
                                update("tapsp_search_in_brand", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Search in Attributes"
                            description="Include product attributes in the search results."
                          >
                            <ToggleControl
                              checked={settings.tapsp_search_in_attributes}
                              onChange={(v) =>
                                update("tapsp_search_in_attributes", v)
                              }
                            />
                          </S1Field>
                        </div>
                        <div className="s1-field-group-row">
                          <S1Field
                            label="Search in Description"
                            description="Include product descriptions in the search results."
                          >
                            <ToggleControl
                              checked={settings.tapsp_search_in_description}
                              onChange={(v) =>
                                update("tapsp_search_in_description", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Search in Short Description"
                            description="Include product short descriptions in the search results."
                          >
                            <ToggleControl
                              checked={
                                settings.tapsp_search_in_short_description
                              }
                              onChange={(v) =>
                                update("tapsp_search_in_short_description", v)
                              }
                            />
                          </S1Field>
                        </div>

                        <S1Field
                          label="Search in SKU"
                          description="Include product SKUs in the search results."
                        >
                          <ToggleControl
                            checked={settings.tapsp_search_in_product_sku}
                            onChange={(v) =>
                              update("tapsp_search_in_product_sku", v)
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
                      <S1FieldGroup number={1} title="Search Bar">
                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Bar Background Color", "th-store-one")}
                              value={settings.bar_bg_clr}
                              onChange={(v) => update("bar_bg_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Border Color", "th-store-one")}
                              value={settings.bar_brdr_clr}
                              onChange={(v) => update("bar_brdr_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>
                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Text Color", "th-store-one")}
                              value={settings.bar_text_clr}
                              onChange={(v) => update("bar_text_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__(
                                "Submit Button BG Color",
                                "th-store-one",
                              )}
                              value={settings.bar_button_bg_clr}
                              onChange={(v) => update("bar_button_bg_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>
                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__(
                                "Submit Button Text / Icon Color",
                                "th-store-one",
                              )}
                              value={settings.bar_button_txt_clr}
                              onChange={(v) => update("bar_button_txt_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__(
                                "Submit Button BG Hover Color",
                                "th-store-one",
                              )}
                              value={settings.bar_button_hvr_clr}
                              onChange={(v) => update("bar_button_hvr_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>

                        <S1Field>
                          <THBackgroundControl
                            label={__(
                              "Submit Button Text Hover Color",
                              "th-store-one",
                            )}
                            value={settings.bar_button_txt_hvr_clr}
                            onChange={(v) =>
                              update("bar_button_txt_hvr_clr", v)
                            }
                            allowGradient={false}
                          />
                        </S1Field>
                      </S1FieldGroup>

                      <S1FieldGroup number={2} title="Suggestion Box">
                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Background Color", "th-store-one")}
                              value={settings.sus_bg_clr}
                              onChange={(v) => update("sus_bg_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Highlight Color", "th-store-one")}
                              value={settings.sus_hglt_clr}
                              onChange={(v) => update("sus_hglt_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>
                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Selected Color", "th-store-one")}
                              value={settings.sus_slect_clr}
                              onChange={(v) => update("sus_slect_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Border Color", "th-store-one")}
                              value={settings.sus_brdr_clr}
                              onChange={(v) => update("sus_brdr_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>
                        <div className="s1-field-group-row">
                          <S1Field>
                            <THBackgroundControl
                              label={__("Group Title Color", "th-store-one")}
                              value={settings.sus_grphd_clr}
                              onChange={(v) => update("sus_grphd_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              label={__("Title Color", "th-store-one")}
                              value={settings.sus_title_clr}
                              onChange={(v) => update("sus_title_clr", v)}
                              allowGradient={false}
                            />
                          </S1Field>
                        </div>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Text Color", "th-store-one")}
                            value={settings.sus_text_clr}
                            onChange={(v) => update("sus_text_clr", v)}
                            allowGradient={false}
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={1}
                        title="Product Style"
                        pro={licenseActive ? false : true}
                      >
                        <S1Field
                          label="Search Style"
                          description="Choose the visual style used for product search results."
                        >
                          <SelectControl
                            value={
                              settings.tapsp_product_search_style || "th-normal"
                            }
                            options={[
                              {
                                label: "Default",
                                value: "th-normal",
                              },
                              {
                                label: "Traditional",
                                value: "th-traditional",
                              },
                              {
                                label: "Modern",
                                value: "th-modern",
                              },
                            ]}
                            onChange={(value) =>
                              update("tapsp_product_search_style", value)
                            }
                          />
                        </S1Field>
                        <div className="s1-field-group-row">
                          <S1Field
                            label="Enable Product Image"
                            description="Display the product image in search results."
                          >
                            <ToggleControl
                              checked={settings.tapsp_enable_product_image}
                              onChange={(value) =>
                                update("tapsp_enable_product_image", value)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Enable Product Price"
                            description="Display the product price in search results."
                          >
                            <ToggleControl
                              checked={settings.tapsp_enable_product_price}
                              onChange={(value) =>
                                update("tapsp_enable_product_price", value)
                              }
                            />
                          </S1Field>
                        </div>
                        <div className="s1-field-group-row">
                          <S1Field
                            label="Enable Product Description"
                            description="Display the product description in search results."
                          >
                            <ToggleControl
                              checked={settings.tapsp_enable_product_desc}
                              onChange={(value) =>
                                update("tapsp_enable_product_desc", value)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Enable Product SKU"
                            description="Display the product SKU in search results."
                          >
                            <ToggleControl
                              checked={settings.tapsp_enable_product_sku}
                              onChange={(value) =>
                                update("tapsp_enable_product_sku", value)
                              }
                            />
                          </S1Field>
                        </div>

                        <S1Field
                          label="Enable Add To Cart"
                          description="Display the Add to Cart button in search results."
                        >
                          <ToggleControl
                            checked={settings.tapsp_enable_cart_btn}
                            onChange={(value) =>
                              update("tapsp_enable_cart_btn", value)
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
                      </S1FieldGroup>
                    </>
                  ),
                },
                {
                  id: "premium",
                  label: "Pro Setting",
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
                        title="Category Filter"
                        pro={licenseActive ? false : true}
                      >
                        <S1Field
                          label="Show Category Filter"
                          description="Display a category filter dropdown in the search bar for product searches."
                        >
                          <ToggleControl
                            checked={settings.tapsp_show_category_filter}
                            onChange={(v) =>
                              update("tapsp_show_category_filter", v)
                            }
                          />
                        </S1Field>

                        {settings.tapsp_show_category_filter && (
                          <>
                            <S1Field
                              label="Category Filter Label"
                              description="Set the default text displayed in the category filter dropdown."
                            >
                              <TextControl
                                value={
                                  settings.tapsp_show_category_filter_label ??
                                  "All"
                                }
                                onChange={(v) =>
                                  update("tapsp_show_category_filter_label", v)
                                }
                              />
                            </S1Field>

                            <S1Field
                              label="Exclude Categories"
                              description="Select product categories that should be excluded from the category filter."
                            >
                              <MultiWooSearchSelector
                                type="category"
                                value={settings.tapsp_exclude_category || []}
                                onChange={(items) =>
                                  update("tapsp_exclude_category", items)
                                }
                              />
                            </S1Field>
                          </>
                        )}
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={2}
                        title="No Results Experience"
                        pro={licenseActive ? false : true}
                      >
                        <S1Field
                          label="Enable Fallback Content"
                          description="Show helpful fallback content when a search returns no matches."
                        >
                          <ToggleControl
                            checked={settings.tapsp_no_result_enable_fallback}
                            onChange={(v) =>
                              update("tapsp_no_result_enable_fallback", v)
                            }
                          />
                        </S1Field>

                        {settings.tapsp_no_result_enable_fallback && (
                          <>
                            <S1Field
                              label="Show Popular Products"
                              description="Display best-selling products, falling back to featured or recent products."
                            >
                              <ToggleControl
                                checked={
                                  settings.tapsp_no_result_show_popular_products
                                }
                                onChange={(v) =>
                                  update(
                                    "tapsp_no_result_show_popular_products",
                                    v,
                                  )
                                }
                              />
                            </S1Field>
                            {settings.tapsp_no_result_show_popular_products && (
                              <S1Field
                                label="Popular Products Limit"
                                description="Set the maximum number of popular products to display."
                              >
                                <UniversalRangeControl
                                  label=""
                                  value={String(
                                    settings.tapsp_no_result_popular_limit ?? 4,
                                  )}
                                  onChange={(v) =>
                                    update("tapsp_no_result_popular_limit", v)
                                  }
                                  min={1}
                                  max={20}
                                />
                              </S1Field>
                            )}

                            <S1Field
                              label="Show Popular Categories"
                              description="Display popular product categories ordered by product count."
                            >
                              <ToggleControl
                                checked={
                                  settings.tapsp_no_result_show_categories
                                }
                                onChange={(v) =>
                                  update("tapsp_no_result_show_categories", v)
                                }
                              />
                            </S1Field>
                            {settings.tapsp_no_result_show_categories && (
                              <S1Field
                                label="Popular Categories Limit"
                                description="Set the maximum number of popular categories to display."
                              >
                                <UniversalRangeControl
                                  label=""
                                  value={String(
                                    settings.tapsp_no_result_categories_limit ??
                                      5,
                                  )}
                                  onChange={(v) =>
                                    update(
                                      "tapsp_no_result_categories_limit",
                                      v,
                                    )
                                  }
                                  min={1}
                                  max={20}
                                />
                              </S1Field>
                            )}
                            <S1Field
                              label="Show Suggested Searches"
                              description="Display trending or most-searched keywords as fallback suggestions."
                            >
                              <ToggleControl
                                checked={
                                  settings.tapsp_no_result_show_suggested
                                }
                                onChange={(v) =>
                                  update("tapsp_no_result_show_suggested", v)
                                }
                              />
                            </S1Field>
                            {settings.tapsp_no_result_show_suggested && (
                              <S1Field
                                label="Suggested Searches Limit"
                                description="Set the maximum number of suggested searches to display."
                              >
                                <UniversalRangeControl
                                  label=""
                                  value={String(
                                    settings.tapsp_no_result_suggested_limit ??
                                      5,
                                  )}
                                  onChange={(v) =>
                                    update("tapsp_no_result_suggested_limit", v)
                                  }
                                  min={1}
                                  max={20}
                                />
                              </S1Field>
                            )}

                            <S1Field
                              label="Show Recently Viewed Products"
                              description="Display products the visitor viewed earlier in this browser session."
                            >
                              <ToggleControl
                                checked={
                                  settings.tapsp_no_result_show_recently_viewed
                                }
                                onChange={(v) =>
                                  update(
                                    "tapsp_no_result_show_recently_viewed",
                                    v,
                                  )
                                }
                              />
                            </S1Field>
                            {settings.tapsp_no_result_show_recently_viewed && (
                              <S1Field
                                label="Recently Viewed Limit"
                                description="Set the maximum number of recently viewed products to display."
                              >
                                <UniversalRangeControl
                                  label=""
                                  value={String(
                                    settings.tapsp_no_result_recently_viewed_limit ??
                                      4,
                                  )}
                                  onChange={(v) =>
                                    update(
                                      "tapsp_no_result_recently_viewed_limit",
                                      v,
                                    )
                                  }
                                  min={1}
                                  max={20}
                                />
                              </S1Field>
                            )}
                          </>
                        )}
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={3}
                        title="Search Scope in Product"
                        pro={licenseActive ? false : true}
                      >
                        <S1Field
                          label="Search in Custom Field"
                          description="Select custom fields that should be included when searching products."
                        >
                          <MultiWooSearchSelector
                            searchType="custom_field"
                            value={settings.tapsp_search_in_custom_fld || []}
                            customOptions={
                              th_StoreOneAdmin?.searchable_custom_fields || []
                            }
                            onChange={(items) =>
                              update("tapsp_search_in_custom_fld", items)
                            }
                            detailedView={true}
                          />
                        </S1Field>
                        <S1Field
                          label="Search in Custom Post Type"
                          description="Include custom post types in search. Enter post type slugs separated by commas."
                        >
                          <TextControl
                            value={
                              settings.tapsp_search_in_custom_post_type ?? ""
                            }
                            onChange={(v) =>
                              update("tapsp_search_in_custom_post_type", v)
                            }
                            placeholder="e.g. book, brand, vendor"
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={4}
                        title="Suggested / Trending Searches"
                        pro={licenseActive ? false : true}
                      >
                        <S1Field
                          label="Suggested / Trending Enable"
                          description="Enable suggested or trending searches in the search interface."
                        >
                          <ToggleControl
                            checked={settings.tapsp_trending_enable}
                            onChange={(value) =>
                              update("tapsp_trending_enable", value)
                            }
                          />
                        </S1Field>

                        {settings.tapsp_trending_enable && (
                          <>
                            <S1Field
                              label="Searches to Suggest"
                              description="Choose whether to show specific keywords or popular searches."
                            >
                              <SelectControl
                                value={settings.tapsp_specific_key_search}
                                options={[
                                  {
                                    label: "Specific",
                                    value: "specific",
                                  },
                                  {
                                    label: "Popular",
                                    value: "popular",
                                  },
                                ]}
                                onChange={(value) =>
                                  update("tapsp_specific_key_search", value)
                                }
                              />
                            </S1Field>

                            {settings.tapsp_specific_key_search ===
                              "specific" && (
                              <S1Field
                                label="Search Keywords"
                                description="Enter keywords separated by commas for suggested searches."
                              >
                                <TextControl
                                  value={settings.tapsp_trending_search || ""}
                                  onChange={(value) =>
                                    update("tapsp_trending_search", value)
                                  }
                                />
                              </S1Field>
                            )}

                            <S1Field
                              label="Limit"
                              description="Set the maximum number of suggested or trending searches to display."
                            >
                              <UniversalRangeControl
                                label=""
                                value={String(
                                  settings.tapsp_trending_limit ?? 3,
                                )}
                                onChange={(value) =>
                                  update("tapsp_trending_limit", value)
                                }
                                min={1}
                                max={20}
                              />
                            </S1Field>

                            <S1Field
                              label="Trending Label"
                              description="Set the heading displayed above suggested or trending searches."
                            >
                              <TextControl
                                value={settings.tapsp_trending_label || ""}
                                onChange={(value) =>
                                  update("tapsp_trending_label", value)
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
                  id: "fuzzy-search",
                  label: "Fuzzy Search",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b7280"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-languages h-4 w-4 transition-colors text-indigo-600"
                      aria-hidden="true"
                    >
                      <path d="m5 8 6 6"></path>
                      <path d="m4 14 6-6 2-3"></path>
                      <path d="M2 5h12"></path>
                      <path d="M7 2h1"></path>
                      <path d="m22 22-5-10-5 10"></path>
                      <path d="M14 18h6"></path>
                    </svg>
                  ),
                  content: (
                    <>
                      <S1FieldGroup
                        number={1}
                        title="Fuzzy Search & Synonyms"
                        pro={licenseActive ? false : true}
                      >
                        <S1Field
                          label="Enable Fuzzy Strings Matching"
                          description='Help users find results even with typos (e.g., "skrit" → "skirt").'
                        >
                          <ToggleControl
                            checked={settings.tapsp_enable_fuzzy}
                            onChange={(value) =>
                              update("tapsp_enable_fuzzy", value)
                            }
                          />
                        </S1Field>

                        {settings.tapsp_enable_fuzzy && (
                          <>
                            <S1Field
                              label="Matching Sensitivity"
                              description="Recommended: 50%. Higher values (80%+) may return more results but can increase false positives."
                            >
                              <UniversalRangeControl
                                label=""
                                value={String(settings.tapsp_fuzzy_level ?? 50)}
                                onChange={(value) =>
                                  update("tapsp_fuzzy_level", value)
                                }
                                min={10}
                                max={100}
                                suffix="%"
                              />
                            </S1Field>

                            <S1Field
                              label="Define Synonyms"
                              description="Use commas (,) to separate synonyms within a group and pipe (|) to separate groups. Example: trousers, pants | denim, jeans | belt, waistband"
                            >
                              <TextControl
                                value={settings.tapsp_synonym_list || ""}
                                onChange={(value) =>
                                  update("tapsp_synonym_list", value)
                                }
                                placeholder="trousers, pants | denim, jeans | belt, waistband"
                              />
                            </S1Field>
                          </>
                        )}
                      </S1FieldGroup>
                    </>
                  ),
                },
                {
                  id: "boost-search",
                  label: "Boost Search",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b7280"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-rocket h-4 w-4 text-amber-600"
                      aria-hidden="true"
                    >
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                    </svg>
                  ),
                  content: (
                    <>
                      <S1FieldGroup
                        number={1}
                        title="Search Optimization"
                        pro={licenseActive ? false : true}
                      >
                        <S1Field
                          label="Product Index"
                          description="Manage and rebuild your product search index to keep your product catalog up-to-date and searchable."
                        >
                          <div className="s1-index-builder">
                            <p className="s1-index-description">
                              {__(
                                "Build or rebuild the product search index to ensure all your latest products are searchable.",
                                "th-store-one",
                              )}
                            </p>
                            <S1Field
                              label="Index Batch Limit"
                              description="Set the number of products processed in each batch while building the search index."
                            >
                              <UniversalRangeControl
                                label=""
                                value={String(
                                  settings.tapsp_index_batch_limit ?? 100,
                                )}
                                onChange={(value) =>
                                  update("tapsp_index_batch_limit", value)
                                }
                                min={10}
                                max={500}
                              />
                            </S1Field>
                            <div className="s1-index-actions">
                              {!indexBuilt ? (
                                <button
                                  type="button"
                                  className="components-button is-primary"
                                  disabled={!licenseActive || indexing}
                                  onClick={buildSearchIndex}
                                >
                                  {indexing
                                    ? __("Building Index...", "th-store-one")
                                    : __("Build Search Index", "th-store-one")}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="components-button is-secondary"
                                  disabled={!licenseActive || indexing}
                                  onClick={disableSearchIndex}
                                >
                                  {indexing
                                    ? __("Disabling Index...", "th-store-one")
                                    : __(
                                        "Disable Search Index",
                                        "th-store-one",
                                      )}
                                </button>
                              )}
                            </div>
                            {indexing && (
                              <div className="s1-index-progress">
                                <div className="s1-index-progress-header">
                                  <span>
                                    {indexMessage ||
                                      __(
                                        "Building search index...",
                                        "th-store-one",
                                      )}
                                  </span>

                                  <strong>{indexProgress}%</strong>
                                </div>

                                <div className="s1-index-progress-bar">
                                  <div
                                    className="s1-index-progress-fill"
                                    style={{ width: `${indexProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {!licenseActive && (
                              <div className="s1-pro-notice">
                                {__(
                                  "Search Index is available in Store One Pro.",
                                  "th-store-one",
                                )}
                              </div>
                            )}
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
              onReset={() => setSettings(DEFAULT_SETTINGS)}
            />
          </div>
        </>
      )}
    </div>
  );
}
