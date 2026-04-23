/* ------------------------ imports ------------------------ */
import { useEffect, useRef } from "@wordpress/element";
import {
  TextControl,
  SelectControl,
  ToggleControl,
} from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import Sortable from "sortablejs";

import MultiWooSearchSelector from "@th-storeone-global/MultiWooSearchSelector";
import ExcludeWooCondition from "@th-storeone-global/ExcludeWooCondition";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import DeviceSelector from "@th-storeone-global/DeviceSelector";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import PlacementPriorityControl from "@th-storeone-global/PlacementPriorityControl";
import THBackgroundControl from "@th-storeone-control/color";

import {
  CopyIcon,
  TrashIcon,
  DragHandleDots2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  TextAlignLeftIcon,
} from "@radix-ui/react-icons";

import { ICONS } from "@th-storeone-global/icons";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";

/* ---------------- RULE ---------------- */
const newStockRule = () => ({
  flexible_id: crypto.randomUUID(),
  open: true,
  status: "active",

  /* STOCK */
  stock_mode: "real",

  real_stock: {
    threshold: 10,
    hide_outofstock: true,
  },

  fake_stock: {
    min: 3,
    max: 15,
    randomize: "session",
  },

  /* SOLD */
  sold: {
    enable: true,
    source: "fake",
    timeframe: "24_hours",
    fake: { min: 10, max: 50 },
  },

  /* DISPLAY */
  message: "Limited stock available just {stock} left, {sold} sold recently",
  dynamic_message: {
    enable: false,
    low_msg: "Almost sold out! Only {stock} left",
    medium_msg: "Selling fast! {stock} left",
    high_msg: "{sold} sold — Available now",
    low_threshold: 5,
    medium_threshold: 10,
  },
  show_progress: true,
  max_stock: 20,
  enable_single_page: false,
  single_placement: "woocommerce_after_add_to_cart_form",
  single_priority: 10,
  enable_shop_page: true,
  shop_position: "after_add_to_cart",

  /* VISIBILITY */
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

  devices: ["desktop"],

  bar_strt_clr: "linear-gradient(90deg, #7c3aed 0%, #4f46e5 100%)",
  bar_end_clr: "#d1d5db",
  message_clr: "#111",
  highlight_clr: "#111",
  font_size: 16,
  bar_height: 12,

  low_stock_effect: {
    enable: true,
    threshold: 5,
  },

  color_change: {
    enable: true,
    low_color: "#ef4444",
    medium_color: "#f59e0b",
    high_color: "#4f46e5",
  },
});

/* ---------------- Sortable ---------------- */
function SortableWrapper({ items, onSortEnd, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const sortable = Sortable.create(ref.current, {
      animation: 150,
      handle: ".drag-handle",
      onEnd: (evt) => onSortEnd(evt.oldIndex, evt.newIndex),
    });
    return () => sortable.destroy();
  }, [items]);

  return <div ref={ref}>{children}</div>;
}

/* ---------------- MAIN ---------------- */
export default function StockScarcityRule({ rules, onChange, onLivePreview }) {
  const updateAll = (arr) => onChange([...arr]);

  const reorder = (oldIndex, newIndex) => {
    const arr = [...rules];
    const moved = arr.splice(oldIndex, 1)[0];
    arr.splice(newIndex, 0, moved);
    updateAll(arr);
  };

  const updateField = (i, field, val) => {
    const arr = [...rules];
    arr[i][field] = val;
    updateAll(arr);
    onLivePreview?.(arr[i], i);
  };

  const addRule = () => updateAll([...rules, newStockRule()]);
  const removeRule = (i) => updateAll(rules.filter((_, idx) => idx !== i));

  const duplicateRule = (i) => {
    const copy = { ...rules[i], flexible_id: crypto.randomUUID() };
    const arr = [...rules];
    arr.splice(i + 1, 0, copy);
    updateAll(arr);
  };

  const toggleOpen = (i) => {
    const arr = [...rules];
    arr[i].open = !arr[i].open;
    updateAll(arr);
  };

  useEffect(() => {
    if (!rules.length) updateAll([newStockRule()]);
  }, []);

  return (
    <div className="store-one-rules-container">
      <h3>Stock Scarcity</h3>

      <SortableWrapper items={rules} onSortEnd={reorder}>
        {rules.map((rule, index) => (
          <div key={rule.flexible_id} className="store-one-rule-item">
            {/* HEADER */}
            <div className="store-one-rule-header">
              <DragHandleDots2Icon className="drag-handle s1-icon" />

              <strong className="s1-rule-title">
                {sprintf("Rule %d: Stock Scarcity", index + 1)}
              </strong>

              <CopyIcon
                className="s1-icon"
                onClick={() => duplicateRule(index)}
              />
              <TrashIcon
                className="s1-icon"
                onClick={() => removeRule(index)}
              />

              {rule.open ? (
                <ChevronUpIcon
                  className="s1-icon"
                  onClick={() => toggleOpen(index)}
                />
              ) : (
                <ChevronDownIcon
                  className="s1-icon"
                  onClick={() => toggleOpen(index)}
                />
              )}
            </div>

            {/* BODY */}
            {rule.open && (
              <TabSwitcher
                defaultTab="settings"
                tabs={[
                  /* ================= SETTINGS ================= */
                  {
                    id: "settings",
                    label: "Settings",
                    icon: ICONS.SETTINGS,
                    content: (
                      <div className="store-one-rule-body">
                        <S1FieldGroup title="Stock">
                          <S1Field label="Stock Mode">
                            <SelectControl
                              value={rule.stock_mode}
                              options={[
                                { label: "Real", value: "real" },
                                { label: "Fake", value: "fake" },
                              ]}
                              onChange={(v) =>
                                updateField(index, "stock_mode", v)
                              }
                            />
                          </S1Field>

                          {rule.stock_mode === "real" && (
                            <>
                              <S1Field label="Show only below">
                                <TextControl
                                  value={rule.real_stock.threshold}
                                  onChange={(v) =>
                                    updateField(index, "real_stock", {
                                      ...rule.real_stock,
                                      threshold: parseInt(v),
                                    })
                                  }
                                />
                              </S1Field>
                              <S1Field label="Hide Out of Stock">
                                <ToggleControl
                                  checked={rule.real_stock.hide_outofstock}
                                  onChange={(v) =>
                                    updateField(index, "real_stock", {
                                      ...rule.real_stock,
                                      hide_outofstock: v,
                                    })
                                  }
                                />
                              </S1Field>
                            </>
                          )}

                          {rule.stock_mode === "fake" && (
                            <>
                              <UniversalRangeControl
                                label="Min Stock"
                                value={String(rule.fake_stock.min)}
                                min={1}
                                max={50}
                                onChange={(v) =>
                                  updateField(index, "fake_stock", {
                                    ...rule.fake_stock,
                                    min: parseInt(v),
                                  })
                                }
                              />
                              <UniversalRangeControl
                                label="Max Stock"
                                value={String(rule.fake_stock.max)}
                                min={1}
                                max={100}
                                onChange={(v) =>
                                  updateField(index, "fake_stock", {
                                    ...rule.fake_stock,
                                    max: parseInt(v),
                                  })
                                }
                              />
                            </>
                          )}
                        </S1FieldGroup>

                        <S1FieldGroup title="Sold Counter">
                          <S1Field label="Enable Sold Count">
                            <ToggleControl
                              checked={rule.sold.enable}
                              onChange={(v) =>
                                updateField(index, "sold", {
                                  ...rule.sold,
                                  enable: v,
                                })
                              }
                            />
                          </S1Field>
                          {rule.sold.enable && (
                            <>
                              <S1Field label="Source">
                                <SelectControl
                                  value={rule.sold.source}
                                  options={[
                                    { label: "Real", value: "real" },
                                    { label: "Fake", value: "fake" },
                                  ]}
                                  onChange={(v) =>
                                    updateField(index, "sold", {
                                      ...rule.sold,
                                      source: v,
                                    })
                                  }
                                />
                              </S1Field>

                              {rule.sold.source === "fake" && (
                                <>
                                  <UniversalRangeControl
                                    label="Min Sold"
                                    value={String(rule.sold.fake.min)}
                                    min={1}
                                    max={100}
                                    onChange={(v) =>
                                      updateField(index, "sold", {
                                        ...rule.sold,
                                        fake: {
                                          ...rule.sold.fake,
                                          min: parseInt(v),
                                        },
                                      })
                                    }
                                  />
                                  <UniversalRangeControl
                                    label="Max Sold"
                                    value={String(rule.sold.fake.max)}
                                    min={1}
                                    max={200}
                                    onChange={(v) =>
                                      updateField(index, "sold", {
                                        ...rule.sold,
                                        fake: {
                                          ...rule.sold.fake,
                                          max: parseInt(v),
                                        },
                                      })
                                    }
                                  />
                                </>
                              )}
                            </>
                          )}
                        </S1FieldGroup>
                      </div>
                    ),
                  },

                  /* ================= DISPLAY ================= */
                  {
                    id: "display",
                    label: "Display",
                    icon: <TextAlignLeftIcon />,
                    content: (
                      <div className="store-one-rule-body">
                        <S1Field label="Message">
                          <TextControl
                            help="Use {stock} and {sold}"
                            value={rule.message}
                            onChange={(v) => updateField(index, "message", v)}
                          />
                        </S1Field>

                        <S1FieldGroup title="Dynamic Messages">
                          {/* TOGGLE */}
                          <S1Field label="Enable Dynamic Messages">
                            <ToggleControl
                              checked={rule.dynamic_message?.enable}
                              onChange={(v) =>
                                updateField(index, "dynamic_message", {
                                  ...rule.dynamic_message,
                                  enable: v,
                                })
                              }
                            />
                          </S1Field>

                          {rule.dynamic_message?.enable && (
                            <>
                              {/* LOW */}
                              <S1Field label="Low Stock Message">
                                <TextControl
                                  value={rule.dynamic_message.low_msg}
                                  onChange={(v) =>
                                    updateField(index, "dynamic_message", {
                                      ...rule.dynamic_message,
                                      low_msg: v,
                                    })
                                  }
                                />
                              </S1Field>

                              <S1Field label="Low Threshold">
                                <TextControl
                                  value={rule.dynamic_message.low_threshold}
                                  onChange={(v) =>
                                    updateField(index, "dynamic_message", {
                                      ...rule.dynamic_message,
                                      low_threshold: parseInt(v),
                                    })
                                  }
                                />
                              </S1Field>

                              {/* MEDIUM */}
                              <S1Field label="Medium Stock Message">
                                <TextControl
                                  value={rule.dynamic_message.medium_msg}
                                  onChange={(v) =>
                                    updateField(index, "dynamic_message", {
                                      ...rule.dynamic_message,
                                      medium_msg: v,
                                    })
                                  }
                                />
                              </S1Field>

                              <S1Field label="Medium Threshold">
                                <TextControl
                                  value={rule.dynamic_message.medium_threshold}
                                  onChange={(v) =>
                                    updateField(index, "dynamic_message", {
                                      ...rule.dynamic_message,
                                      medium_threshold: parseInt(v),
                                    })
                                  }
                                />
                              </S1Field>

                              {/* HIGH */}
                              <S1Field label="High Stock Message">
                                <TextControl
                                  value={rule.dynamic_message.high_msg}
                                  onChange={(v) =>
                                    updateField(index, "dynamic_message", {
                                      ...rule.dynamic_message,
                                      high_msg: v,
                                    })
                                  }
                                />
                              </S1Field>
                            </>
                          )}
                        </S1FieldGroup>
                        <S1Field label="Show Progress Bar">
                          <ToggleControl
                            checked={rule.show_progress}
                            onChange={(v) =>
                              updateField(index, "show_progress", v)
                            }
                          />
                        </S1Field>

                        {rule.stock_mode === "fake" && rule.show_progress && (
                          <UniversalRangeControl
                            label="Max Stock (for progress)"
                            value={String(rule.max_stock)}
                            min={5}
                            max={100}
                            onChange={(v) =>
                              updateField(index, "max_stock", parseInt(v))
                            }
                          />
                        )}

                        <S1FieldGroup title={__("Single page", "th-store-one")}>
                          <S1Field
                            label={__("Enable on Single Page", "th-store-one")}
                            classN="s1-toggle-wrpapper"
                          >
                            <ToggleControl
                              checked={rule.enable_single_page}
                              onChange={(v) =>
                                updateField(index, "enable_single_page", v)
                              }
                            />
                          </S1Field>
                          {rule.enable_single_page === true && (
                            <>
                              <PlacementPriorityControl
                                placement={rule.single_placement}
                                priority={rule.single_priority}
                                onPlacementChange={(v) =>
                                  updateField(index, "single_placement", v)
                                }
                                onPriorityChange={(v) =>
                                  updateField(index, "single_priority", v)
                                }
                              />
                            </>
                          )}
                        </S1FieldGroup>
                        <S1FieldGroup
                          title={__("Archive page", "th-store-one")}
                        >
                          <S1Field
                            label={__("Enable on Archive Page", "th-store-one")}
                            classN="s1-toggle-wrpapper"
                          >
                            <ToggleControl
                              checked={rule.enable_shop_page}
                              onChange={(v) =>
                                updateField(index, "enable_shop_page", v)
                              }
                            />
                          </S1Field>
                          {rule.enable_shop_page === true && (
                            <>
                              <S1Field
                                label={__("Archive Position", "th-store-one")}
                              >
                                <SelectControl
                                  value={rule.shop_position}
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
                                    updateField(index, "shop_position", v)
                                  }
                                />
                              </S1Field>
                            </>
                          )}
                        </S1FieldGroup>
                      </div>
                    ),
                  },

                  /* ================= VISIBILITY ================= */
                  {
                    id: "visibility",
                    label: "Visibility",
                    icon: ICONS.DISPLAY,
                    content: (
                      <div className="store-one-rule-body">
                        {/* TRIGGER TYPE */}
                        <S1Field label={__("Trigger Type", "th-store-one")}>
                          <SelectControl
                            value={rule.trigger_type}
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
                              { label: "Disable", value: "disable" },
                            ]}
                            onChange={(v) =>
                              updateField(index, "trigger_type", v)
                            }
                          />
                        </S1Field>

                        {/* PRODUCTS */}
                        {rule.trigger_type === "specific_products" && (
                          <MultiWooSearchSelector
                            searchType="product"
                            label="Select Products"
                            value={rule.products || []}
                            onChange={(items) =>
                              updateField(index, "products", items)
                            }
                            detailedView={true}
                          />
                        )}

                        {/* CATEGORIES */}
                        {rule.trigger_type === "specific_categories" && (
                          <MultiWooSearchSelector
                            searchType="category"
                            label="Select Categories"
                            value={rule.categories || []}
                            onChange={(items) =>
                              updateField(index, "categories", items)
                            }
                            detailedView={true}
                          />
                        )}

                        {/* EXCLUDES */}
                        {rule.trigger_type !== "disable" && (
                          <>
                            <ExcludeWooCondition
                              label="Exclude Products"
                              searchType="product"
                              enabled={rule.exclude_products_enabled}
                              items={rule.exclude_products || []}
                              onToggle={(v) =>
                                updateField(
                                  index,
                                  "exclude_products_enabled",
                                  v,
                                )
                              }
                              onChangeItems={(items) =>
                                updateField(index, "exclude_products", items)
                              }
                              detailedView={true}
                            />

                            <ExcludeWooCondition
                              label="Exclude Categories"
                              searchType="category"
                              enabled={rule.exclude_categories_enabled}
                              items={rule.exclude_categories || []}
                              onToggle={(v) =>
                                updateField(
                                  index,
                                  "exclude_categories_enabled",
                                  v,
                                )
                              }
                              onChangeItems={(items) =>
                                updateField(
                                  index,
                                  "exclude_categoriesInclude",
                                  items,
                                )
                              }
                              detailedView={true}
                            />
                          </>
                        )}

                        {/* SHORTCODE */}
                        {rule.trigger_type === "disable" && (
                          <S1Field label="Shortcode">
                            <p className="s1-shortcode-description">
                              Use shortcode to display manually
                            </p>

                            <div className="s1-shortcode-wrapper">
                              <textarea
                                readOnly
                                value={`[th_stock_scarcity id="${rule.flexible_id}"]`}
                                className="s1-shortcode-textarea"
                              />

                              <button
                                type="button"
                                className="s1-shortcode-copy"
                                onClick={() =>
                                  navigator.clipboard.writeText(
                                    `[th_stock_scarcity id="${rule.flexible_id}"]`,
                                  )
                                }
                              >
                                <CopyIcon />
                              </button>
                            </div>
                          </S1Field>
                        )}
                      </div>
                    ),
                  },

                  {
                    id: "style",
                    label: "Style",
                    icon: ICONS.DESIGN,
                    content: (
                      <div className="store-one-rule-body">
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Bar Start", "th-store-one")}
                            value={
                              rule.bar_strt_clr ||
                              "linear-gradient(90deg, #7c3aed 0%, #4f46e5 100%)"
                            }
                            onChange={(v) =>
                              updateField(index, "bar_strt_clr", v)
                            }
                          />
                        </S1Field>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Bar End", "th-store-one")}
                            value={rule.bar_end_clr || "#d1d5db"}
                            onChange={(v) =>
                              updateField(index, "bar_end_clr", v)
                            }
                          />
                        </S1Field>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Message Color", "th-store-one")}
                            value={rule.message_clr || "#111"}
                            onChange={(v) =>
                              updateField(index, "message_clr", v)
                            }
                          />
                        </S1Field>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Highlight Color", "th-store-one")}
                            value={rule.highlight_clr || "#111"}
                            onChange={(v) =>
                              updateField(index, "highlight_clr", v)
                            }
                          />
                        </S1Field>

                        <S1Field>
                          <UniversalRangeControl
                            label="Font Size"
                            value={String(rule.font_size || 16)}
                            min={10}
                            max={30}
                            onChange={(v) =>
                              updateField(index, "font_size", parseInt(v))
                            }
                          />
                        </S1Field>

                        <S1Field>
                          <UniversalRangeControl
                            label="Bar Height"
                            value={String(rule.bar_height || 8)}
                            min={4}
                            max={20}
                            onChange={(v) =>
                              updateField(index, "bar_height", parseInt(v))
                            }
                          />
                        </S1Field>
                        <S1FieldGroup title="Stock Effects">
                          {/* BLINK */}
                          <S1Field label="Blink on Low Stock">
                            <ToggleControl
                              checked={rule.low_stock_effect?.enable}
                              onChange={(v) =>
                                updateField(index, "low_stock_effect", {
                                  ...rule.low_stock_effect,
                                  enable: v,
                                })
                              }
                            />
                          </S1Field>

                          {rule.low_stock_effect?.enable && (
                            <>
                              <UniversalRangeControl
                                label="Blink Threshold"
                                value={String(
                                  rule.low_stock_effect.threshold || 5,
                                )}
                                min={1}
                                max={20}
                                onChange={(v) =>
                                  updateField(index, "low_stock_effect", {
                                    ...rule.low_stock_effect,
                                    threshold: parseInt(v),
                                  })
                                }
                              />

                              <S1Field label="Auto Color Change">
                                <ToggleControl
                                  checked={rule.color_change?.enable}
                                  onChange={(v) =>
                                    updateField(index, "color_change", {
                                      ...rule.color_change,
                                      enable: v,
                                    })
                                  }
                                />
                              </S1Field>
                              <S1Field>
                                <THBackgroundControl
                                  allowGradient={true}
                                  label={__("Low Stock Color", "th-store-one")}
                                  value={rule.low_color || "#ef4444"}
                                  onChange={(v) =>
                                    updateField(index, "low_color", v)
                                  }
                                />
                              </S1Field>
                              <S1Field>
                                <THBackgroundControl
                                  allowGradient={true}
                                  label={__(
                                    "Medium Stock Color",
                                    "th-store-one",
                                  )}
                                  value={rule.medium_color || "#f59e0b"}
                                  onChange={(v) =>
                                    updateField(index, "medium_color", v)
                                  }
                                />
                              </S1Field>
                              <S1Field>
                                <THBackgroundControl
                                  allowGradient={true}
                                  label={__("High Stock Color", "th-store-one")}
                                  value={rule.high_color || "#4f46e5"}
                                  onChange={(v) =>
                                    updateField(index, "high_color", v)
                                  }
                                />
                              </S1Field>
                            </>
                          )}
                        </S1FieldGroup>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </div>
        ))}
      </SortableWrapper>
      <div className="store-one-rules-footer">
        <div className="store-one-add-rule" onClick={addRule}>
          + Add Rule
        </div>

        <ResetModuleButton
          moduleId="stock-scarcity"
          onReset={() => onChange([newStockRule()])}
        />
      </div>
    </div>
  );
}
