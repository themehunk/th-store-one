import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import {
  Spinner,
  ToggleControl,
  SelectControl,
  TextControl,
} from "@wordpress/components";

import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import { ICONS } from "@th-storeone-global/icons";
import THBackgroundControl from "@th-storeone-control/color";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import AlignmentControl from "@th-storeone-control/AlignmentControl";

const MODULE_ID = "th-variationswatches";

/**
 * Default settings.
 *
 * IDs intentionally match the original TH Variation Swatches settings.
 */
const DEFAULT_SETTINGS = {
  // General Settings.
  clear_on_reselect: false,
  threshold: 30,

  // Filter Attribute Widget.
  filter_widget_style: "style-1",

  // Attribute Style.
  "th-swatches-style": "thswatche",
  style: "rounded",
  attr_title_font_size: "12",
  variation_label_separator: ":",
  attribute_behavior: "blur",
  width: 36,
  single_font_size: "14",
  attr_brdr_color: "#EBEBEB",
  attr_brdr_size: "1",
  attr_text_color: "",
  attr_bg_btn_color: "",

  // Hover & Selected Attribute Style.
  attr_brdr_hvr_color: "#111",
  attr_text_hvr_color: "#fff",
  attr_bg_btn_hvr_color: "#111",

  // Tooltip.
  tooltip: true,
  tooltip_background_color: "",
  tooltip_text_color: "",
  tooltip_border_color: "#7100e2",

  // Catalog Page Variations.
  show_swatches_shop: false,
  show_single_swatches_on_shop: false,
  show_single_swatches_on_attr_shop: false,
  show_swatches_shop_attr: "",
  show_swatches_shop_attr_slider: true,
  show_swatches_shop_clear_link: false,
  show_swatches_shop_attr_alignment: "left",
  swatches_shop_width: 36,
  swatches_shop_font_size: 14,

  // Image Tooltip.
  show_tootip_image: false,
  show_tootip_image_attr: "",
  tootip_image_width: "120",

  // Stock.
  show_stock_available: false,
  stock_display_threshold: "0",
};

/**
 * Filter widget style options.
 *
 * Original PHP:
 * style-1
 * style-2
 * style-3
 */
const FILTER_WIDGET_OPTIONS = [
  {
    label: __("Style 1", "th-store-one"),
    value: "style-1",
  },
  {
    label: __("Style 2", "th-store-one"),
    value: "style-2",
  },
  {
    label: __("Style 3", "th-store-one"),
    value: "style-3",
  },
];

/**
 * Single page swatch style options.
 *
 * Original PHP:
 * thswatche
 * theme
 */
const SWATCH_STYLE_OPTIONS = [
  {
    label: __("TH Swatches", "th-store-one"),
    value: "thswatche",
  },
  {
    label: __("Theme", "th-store-one"),
    value: "theme",
  },
];

/**
 * Attribute shape options.
 */
const ATTRIBUTE_SHAPE_OPTIONS = [
  {
    label: __("Rounded Shape", "th-store-one"),
    value: "rounded",
  },
  {
    label: __("Squared Shape", "th-store-one"),
    value: "squared",
  },
];

/**
 * Unavailable attribute behavior.
 */
const ATTRIBUTE_BEHAVIOR_OPTIONS = [
  {
    label: __("Blur with cross", "th-store-one"),
    value: "blur",
  },
  {
    label: __("Blur without cross", "th-store-one"),
    value: "blur-no-cross",
  },
  {
    label: __("Hide", "th-store-one"),
    value: "hide",
  },
];

/**
 * Catalog swatches alignment.
 */
const ALIGNMENT_OPTIONS = [
  {
    label: __("Left", "th-store-one"),
    value: "left",
  },
  {
    label: __("Center", "th-store-one"),
    value: "center",
  },
  {
    label: __("Right", "th-store-one"),
    value: "right",
  },
];

/**
 * Convert WooCommerce attribute response into SelectControl options.
 */
const normalizeAttributeOptions = (attributes) => {
  if (!Array.isArray(attributes)) {
    return [];
  }

  return attributes.map((attribute) => ({
    label: attribute.name || attribute.label || attribute.slug,
    value: attribute.slug || attribute.name || String(attribute.id || ""),
  }));
};

export default function VariationSwatchesSettings({
  onSettingsChange,
  onRegisterSave,
  onModuleReady,
  licenseActive,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [hideToast, setHideToast] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [attributeOptions, setAttributeOptions] = useState([]);

  /**
   * Load settings.
   */
  useEffect(() => {
    apiFetch.use(apiFetch.createNonceMiddleware(th_StoreOneAdmin.nonce));

    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}`,
      method: "GET",
    })
      .then((res) => {
        const savedSettings = res?.settings || {};

        setSettings({
          ...DEFAULT_SETTINGS,
          ...savedSettings,
        });
      })
      .catch(() => {
        setError(
          __("Failed to load Variation Swatches settings.", "th-store-one"),
        );
      })
      .finally(() => {
        setLoading(false);
        onModuleReady?.();
      });
  }, []);

  /**
   * Load WooCommerce product attributes.
   *
   * This replaces the original:
   *
   * thvs_get_all_attribute()
   */
  useEffect(() => {
    apiFetch({
      path: "/wc/v3/products/attributes?per_page=100",
      method: "GET",
    })
      .then((attributes) => {
        setAttributeOptions(normalizeAttributeOptions(attributes));
      })
      .catch(() => {
        setAttributeOptions([]);
      });
  }, []);

  /**
   * Notify parent whenever settings change.
   */
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings]);

  /**
   * Register save callback.
   */
  useEffect(() => {
    onRegisterSave?.(() => handleSave);
  }, [settings, saving]);

  /**
   * Update a single setting.
   */
  const update = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Save settings.
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
        setError(__("Failed to save settings.", "th-store-one"));
      })
      .finally(() => {
        setSaving(false);
      });
  };

  /**
   * Auto hide success/error toast.
   */
  useEffect(() => {
    if (!success && !error) {
      return undefined;
    }

    setHideToast(false);

    const hideTimer = setTimeout(() => {
      setHideToast(true);
    }, 2500);

    const clearTimer = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [success, error]);

  /**
   * Attribute options with default option.
   */
  const attributeSelectOptions = [
    {
      label: __("Select Attribute", "th-store-one"),
      value: "",
    },
    ...attributeOptions,
  ];

  return (
    <div className="storeone-module-settings s1-no-rule">
      {loading && (
        <div className="store-one-loader">
          <Spinner />
          {__("Loading Variation Swatches Settings…", "th-store-one")}
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

          <h3 className="store-one-section-title">
            {__("Product Variations", "th-store-one")}
          </h3>

          <div className="store-one-rule-item">
            <TabSwitcher
              defaultTab="settings"
              tabs={[
                /**
                 * =========================================================
                 * SETTINGS TAB
                 * =========================================================
                 */
                {
                  id: "settings",
                  label: __("Settings", "th-store-one"),
                  icon: ICONS.SETTINGS,
                  content: (
                    <>
                      <S1FieldGroup
                        number={1}
                        title={__("Variation", "th-store-one")}
                      >
                        <S1Field
                          label={__("Clear Attribute Setting", "th-store-one")}
                          description={__(
                            "Clear selected attribute on select again.",
                            "th-store-one",
                          )}
                        >
                          <ToggleControl
                            checked={settings.clear_on_reselect}
                            onChange={(value) =>
                              update("clear_on_reselect", value)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__("Ajax Variation Threshold", "th-store-one")}
                          description={__(
                            "Control the number of enabled AJAX variation threshold. If you set 1, all product variations will be loaded via AJAX. The recommended value is between 30 and 40.",
                            "th-store-one",
                          )}
                        >
                          <TextControl
                            type="number"
                            value={settings.threshold}
                            min={1}
                            max={80}
                            onChange={(value) =>
                              update(
                                "threshold",
                                value === "" ? "" : Number(value),
                              )
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={2}
                        title={__("Stock", "th-store-one")}
                      >
                        <div className="s1-field-group-row">
                          <S1Field
                            label={__("Enable Stock", "th-store-one")}
                            description={__(
                              "Show Stock availability in Product single page.",
                              "th-store-one",
                            )}
                          >
                            <ToggleControl
                              checked={settings.show_stock_available}
                              onChange={(value) =>
                                update("show_stock_available", value)
                              }
                            />
                          </S1Field>

                          {settings.show_stock_available && (
                            <S1Field
                              label={__("Stock Threshold", "th-store-one")}
                              description={__(
                                "When stock reaches this amount, the stock label will be shown.",
                                "th-store-one",
                              )}
                            >
                              <TextControl
                                type="number"
                                value={settings.stock_display_threshold}
                                min={0}
                                max={200}
                                onChange={(value) =>
                                  update(
                                    "stock_display_threshold",
                                    value === "" ? "" : Number(value),
                                  )
                                }
                              />
                            </S1Field>
                          )}
                        </div>
                      </S1FieldGroup>
                    </>
                  ),
                },

                /**
                 * =========================================================
                 * CATALOG TAB
                 * =========================================================
                 */
                {
                  id: "catalog",
                  label: __("Display ", "th-store-one"),
                  icon: ICONS.DISPLAY,
                  content: (
                    <>
                      <S1FieldGroup
                        number={1}
                        title={__("Product Page", "th-store-one")}
                      >
                        <S1Field
                          label={__("Enable Single Swatches", "th-store-one")}
                          description={__(
                            "Show attribute at product single pages.",
                            "th-store-one",
                          )}
                        >
                          <ToggleControl
                            checked={settings.show_single_swatches_on_shop}
                            onChange={(value) =>
                              update("show_single_swatches_on_shop", value)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={2}
                        title={__("Product Catalog", "th-store-one")}
                      >
                        <S1Field
                          label={__("Enable Swatches", "th-store-one")}
                          description={__(
                            "Show Swatches in Catalog on Shop / Archive Page.",
                            "th-store-one",
                          )}
                        >
                          <ToggleControl
                            checked={settings.show_swatches_shop}
                            onChange={(value) =>
                              update("show_swatches_shop", value)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__("Enable Single Swatches", "th-store-one")}
                          description={__(
                            "Show single attribute as catalog mode on shop / archive pages",
                            "th-store-one",
                          )}
                        >
                          <ToggleControl
                            checked={settings.show_single_swatches_on_attr_shop}
                            onChange={(value) =>
                              update("show_single_swatches_on_attr_shop", value)
                            }
                          />
                        </S1Field>

                        {settings.show_swatches_shop &&
                          settings.show_single_swatches_on_attr_shop && (
                            <S1Field
                              label={__("Select Attribute", "th-store-one")}
                              description={__(
                                "Choose an attribute to show in catalog.",
                                "th-store-one",
                              )}
                            >
                              <SelectControl
                                value={settings.show_swatches_shop_attr}
                                options={attributeSelectOptions}
                                onChange={(value) =>
                                  update("show_swatches_shop_attr", value)
                                }
                              />
                            </S1Field>
                          )}

                        <S1Field
                          label={__("Enable Variation Slider", "th-store-one")}
                        >
                          <ToggleControl
                            checked={settings.show_swatches_shop_attr_slider}
                            onChange={(value) =>
                              update("show_swatches_shop_attr_slider", value)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__("Enable Clear Link", "th-store-one")}
                        >
                          <ToggleControl
                            checked={settings.show_swatches_shop_clear_link}
                            onChange={(value) =>
                              update("show_swatches_shop_clear_link", value)
                            }
                          />
                        </S1Field>

                        {/* <SelectControl
                            value={settings.show_swatches_shop_attr_alignment}
                            options={ALIGNMENT_OPTIONS}
                            onChange={(value) =>
                              update("show_swatches_shop_attr_alignment", value)
                            }
                          /> */}
                        <AlignmentControl
                          label={__("Swatches Alignment", "th-store-one")}
                          value={settings.show_swatches_shop_attr_alignment}
                          onChange={(value) =>
                            update("show_swatches_shop_attr_alignment", value)
                          }
                        />
                      </S1FieldGroup>

                      <S1FieldGroup
                        number={3}
                        title={__("Image Tooltip", "th-store-one")}
                      >
                        <S1Field
                          label={__("Enable Image Tooltip", "th-store-one")}
                          description={__(
                            "Show Image Tooltip in Product single page.",
                            "th-store-one",
                          )}
                        >
                          <ToggleControl
                            checked={settings.show_tootip_image}
                            onChange={(value) =>
                              update("show_tootip_image", value)
                            }
                          />
                        </S1Field>

                        {settings.show_tootip_image && (
                          <>
                            <S1Field
                              label={__(
                                "Select Tooltip Attribute",
                                "th-store-one",
                              )}
                              description={__(
                                "Choose an attribute to show Tooltip in Product Single Page on hover.",
                                "th-store-one",
                              )}
                            >
                              <SelectControl
                                value={settings.show_tootip_image_attr}
                                options={attributeSelectOptions}
                                onChange={(value) =>
                                  update("show_tootip_image_attr", value)
                                }
                              />
                            </S1Field>

                            <S1Field
                              label={__("Width", "th-store-one")}
                              description={__(
                                "Tooltip Image maintains a 1:1 ratio.",
                                "th-store-one",
                              )}
                            >
                              <UniversalRangeControl
                                label={__("Width", "th-store-one")}
                                value={String(settings.tootip_image_width)}
                                onChange={(value) =>
                                  update("tootip_image_width", value)
                                }
                                units={["px"]}
                                min={10}
                                max={300}
                              />
                            </S1Field>
                          </>
                        )}
                      </S1FieldGroup>
                    </>
                  ),
                },
                /**
                 * =========================================================
                 * STYLE TAB
                 * =========================================================
                 */
                {
                  id: "style",
                  label: __("Style", "th-store-one"),
                  icon: ICONS.DESIGN,
                  content: (
                    <>
                      <S1FieldGroup
                        number={1}
                        title={__("Single Product Attribute", "th-store-one")}
                      >
                        {/* <S1Field
                          label={__(
                            "Swatches Style In Single Page",
                            "th-store-one",
                          )}
                        >
                          <SelectControl
                            value={settings["th-swatches-style"]}
                            options={SWATCH_STYLE_OPTIONS}
                            onChange={(value) =>
                              update("th-swatches-style", value)
                            }
                          />
                        </S1Field> */}

                        <S1Field
                          label={__("Attribute Shape Style", "th-store-one")}
                        >
                          <SelectControl
                            value={settings.style}
                            options={ATTRIBUTE_SHAPE_OPTIONS}
                            onChange={(value) => update("style", value)}
                          />
                        </S1Field>

                        <S1Field
                          label={__(
                            "Attribute Title Font Size",
                            "th-store-one",
                          )}
                        >
                          <UniversalRangeControl
                            label={__("Font Size", "th-store-one")}
                            value={settings.attr_title_font_size}
                            onChange={(value) =>
                              update("attr_title_font_size", value)
                            }
                            units={["px"]}
                            min={8}
                            max={50}
                          />
                        </S1Field>

                        <S1Field
                          label={__("Separator", "th-store-one")}
                          description={__(
                            "Change separator between title and name. Default: :",
                            "th-store-one",
                          )}
                        >
                          <TextControl
                            value={settings.variation_label_separator}
                            onChange={(value) =>
                              update("variation_label_separator", value)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__(
                            "Unavailable Attribute Behavior",
                            "th-store-one",
                          )}
                          description={__(
                            "Disabled attributes will be hidden or blurred. This feature does not apply when the AJAX threshold is disabled.",
                            "th-store-one",
                          )}
                        >
                          <SelectControl
                            value={settings.attribute_behavior}
                            options={ATTRIBUTE_BEHAVIOR_OPTIONS}
                            onChange={(value) =>
                              update("attribute_behavior", value)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__("Width", "th-store-one")}
                          description={__(
                            "Circular attributes are managed by width option only.",
                            "th-store-one",
                          )}
                        >
                          <UniversalRangeControl
                            label={__("Width", "th-store-one")}
                            value={String(settings.width)}
                            onChange={(value) => update("width", value)}
                            units={["px"]}
                            min={10}
                            max={200}
                          />
                        </S1Field>

                        <S1Field
                          label={__("Font Size", "th-store-one")}
                          description={__(
                            "Variation item font size.",
                            "th-store-one",
                          )}
                        >
                          <UniversalRangeControl
                            label={__("Font Size", "th-store-one")}
                            value={String(settings.single_font_size)}
                            onChange={(value) =>
                              update("single_font_size", value)
                            }
                            units={["px"]}
                            min={8}
                            max={50}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Border Color", "th-store-one")}
                            value={settings.attr_brdr_color}
                            onChange={(value) =>
                              update("attr_brdr_color", value)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <UniversalRangeControl
                            label={__("Border Size", "th-store-one")}
                            value={String(settings.attr_brdr_size)}
                            onChange={(value) =>
                              update("attr_brdr_size", value)
                            }
                            units={["px"]}
                            min={0}
                            max={10}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Text Color", "th-store-one")}
                            value={settings.attr_text_color}
                            onChange={(value) =>
                              update("attr_text_color", value)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Background Color", "th-store-one")}
                            value={settings.attr_bg_btn_color}
                            onChange={(value) =>
                              update("attr_bg_btn_color", value)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      <S1FieldGroup
                        number={2}
                        title={__("Tooltip", "th-store-one")}
                      >
                        <S1Field
                          label={__("Tooltip", "th-store-one")}
                          description={__(
                            "Enable tooltip on each product attribute.",
                            "th-store-one",
                          )}
                        >
                          <ToggleControl
                            checked={settings.tooltip}
                            onChange={(value) => update("tooltip", value)}
                          />
                        </S1Field>

                        {settings.tooltip && (
                          <>
                            <S1Field>
                              <THBackgroundControl
                                label={__("Background Color", "th-store-one")}
                                value={settings.tooltip_background_color}
                                onChange={(value) =>
                                  update("tooltip_background_color", value)
                                }
                              />
                            </S1Field>

                            <S1Field>
                              <THBackgroundControl
                                label={__("Text Color", "th-store-one")}
                                value={settings.tooltip_text_color}
                                onChange={(value) =>
                                  update("tooltip_text_color", value)
                                }
                                allowGradient={false}
                              />
                            </S1Field>

                            <S1Field
                              description={__(
                                "It is for image tooltip.",
                                "th-store-one",
                              )}
                            >
                              <THBackgroundControl
                                label={__("Border Color", "th-store-one")}
                                value={settings.tooltip_border_color}
                                onChange={(value) =>
                                  update("tooltip_border_color", value)
                                }
                                allowGradient={false}
                              />
                            </S1Field>
                          </>
                        )}
                      </S1FieldGroup>

                      <S1FieldGroup
                        number={3}
                        title={__(
                          "Hover & Selected Attribute Style",
                          "th-store-one",
                        )}
                      >
                        <S1Field>
                          <THBackgroundControl
                            label={__("Border Color", "th-store-one")}
                            value={settings.attr_brdr_hvr_color}
                            onChange={(value) =>
                              update("attr_brdr_hvr_color", value)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Text Color", "th-store-one")}
                            value={settings.attr_text_hvr_color}
                            onChange={(value) =>
                              update("attr_text_hvr_color", value)
                            }
                            allowGradient={false}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            label={__("Background Color", "th-store-one")}
                            value={settings.attr_bg_btn_hvr_color}
                            onChange={(value) =>
                              update("attr_bg_btn_hvr_color", value)
                            }
                          />
                        </S1Field>
                      </S1FieldGroup>
                      {/* <S1Field
                        label={__("Width", "th-store-one")}
                        description={__(
                          "Circular attributes are managed by width option only.",
                          "th-store-one",
                        )}
                      >
                        <UniversalRangeControl
                          label={__("Width", "th-store-one")}
                          value={String(settings.swatches_shop_width)}
                          onChange={(value) =>
                            update("swatches_shop_width", value)
                          }
                          units={["px"]}
                          min={10}
                          max={200}
                        />
                      </S1Field>

                      <S1Field
                        label={__("Font Size", "th-store-one")}
                        description={__(
                          "Variation item font size.",
                          "th-store-one",
                        )}
                      >
                        <UniversalRangeControl
                          label={__("Font Size", "th-store-one")}
                          value={String(settings.swatches_shop_font_size)}
                          onChange={(value) =>
                            update("swatches_shop_font_size", value)
                          }
                          units={["px"]}
                          min={8}
                          max={50}
                        />
                      </S1Field> */}
                    </>
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
