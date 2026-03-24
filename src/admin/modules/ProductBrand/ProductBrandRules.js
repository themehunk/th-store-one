/* ------------------------ imports ------------------------ */
import { useState, useEffect, useRef } from "@wordpress/element";
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

import THBackgroundControl from "@th-storeone-control/color";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import PlacementPriorityControl from "@th-storeone-global/PlacementPriorityControl";

import {
  CopyIcon,
  TrashIcon,
  DragHandleDots2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import { ICONS } from "@th-storeone-global/icons";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";

/* Default Rule */
const newBrlistTRule = () => ({
  status: "active",
  list_title: "",
  trigger_type: "all_products",
  products: [],
  categories: [],
  tags: [],
  flexible_id: crypto.randomUUID(),
  brand_list: [
    {
      id: crypto.randomUUID(),
      text: "",
      link_enabled: false,
      link_url: "https://example.com",
      open: true,
      image_url: "",
    },
  ],
  placement: "after_summary",
  priority: 10,
  margin_top: "10",
  margin_bottom: "10",
  max_width: "100",
  image_gap: "15px",
  open: true,
  offer_products: [],
  offer_products_optional: true,
  // NEW: exclude system
  exclude_products_enabled: false,
  exclude_products: [],
  exclude_categories_enabled: false,
  exclude_categories: [],
  exclude_tags_enabled: false,
  exclude_tags: [],
  exclude_brands_enabled: false,
  exclude_brands: [],
  exclude_on_sale_enabled: false,
  user_condition: "all",
  exclude_enabled: false,
  allowed_roles: [],
  allowed_users: [],
  exclude_roles: [],
  exclude_users: [],
  exclude_users_enabled: false,
  //color
  btl_title_clr: "#111",
  btl_list_clr: "#111",
  btl_icon_bg_clr: "#fff",
  btl_icon_clr: "#2563eb",
  btl_bg_clr: "#fff",
});

/** menu tabs */
/* ================= STYLE DEFAULTS (ADDED) ================= */
const STYLE_DEFAULTS = {
  style_1: { prd_tle_clr: "#6C7280" },
  style_2: { prd_tle_clr: "#111827" },
  style_3: { prd_tle_clr: "#1f2937" },
};
/* ================= HELPER (ADDED) ================= */
const applyStyleDefaults = (rule, style) => {
  const defaults = STYLE_DEFAULTS[style] || {};
  const updated = { ...rule, brand_style: style };

  Object.keys(defaults).forEach((key) => {
    const autoKey = `${key}_auto`;
    if (rule[autoKey] !== false) {
      updated[key] = defaults[key];
      updated[autoKey] = true;
    }
  });

  return updated;
};

/* Sortable */
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

/* ------------------------ Main Component ------------------------ */
export default function BuytoListRules({ rules, onChange, onLivePreview }) {
  const menuItems = [
    { id: "settings", label: "Settings", icon: "SETTINGS" },
    { id: "design", label: "Design", icon: "DESIGN" },
    { id: "display", label: "Display Page", icon: "DISPLAY" },
  ];

  const updateAll = (arr) => onChange([...arr]);

  const reorder = (oldIndex, newIndex) => {
    const arr = [...rules];
    const moved = arr.splice(oldIndex, 1)[0];
    arr.splice(newIndex, 0, moved);
    updateAll(arr);
  };

  const toggleOpen = (i) => {
    const arr = [...rules];
    arr[i].open = !arr[i].open;
    updateAll(arr);
    if (arr[i].open) {
      onLivePreview?.(arr[i], i);
    }
  };

  const updateField = (i, field, val) => {
    const arr = [...rules];
    arr[i][field] = val;
    updateAll(arr);
    onLivePreview?.(arr[i], i);
  };

  const removeRule = (i) => {
    const arr = [...rules];
    arr.splice(i, 1);
    updateAll(arr);
  };

  const duplicateRule = (i) => {
    const arr = [...rules];
    const copy = { ...arr[i], flexible_id: crypto.randomUUID(), open: true };
    arr.splice(i + 1, 0, copy);
    updateAll(arr);
  };

  const addRule = () => {
    const arr = [...rules, newBrlistTRule()];
    updateAll(arr);
    const newIndex = arr.length - 1;
    onLivePreview?.(arr[newIndex], newIndex);
  };

  /* ---------------- BUY LIST FUNCTIONS ---------------- */

  const updateBuyList = (ruleIndex, newList) => {
    const arr = [...rules];
    arr[ruleIndex].brand_list = newList;
    updateAll(arr);
    onLivePreview?.(arr[ruleIndex], ruleIndex);
  };

  const addBuyItem = (ruleIndex) => {
    const list = rules[ruleIndex].brand_list || [];
    updateBuyList(ruleIndex, [
      ...list,
      { id: crypto.randomUUID(), text: "", open: true },
    ]);
  };

  const removeBuyItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].brand_list];
    list.splice(itemIndex, 1);
    updateBuyList(ruleIndex, list);
  };

  const duplicateBuyItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].brand_list];
    const copy = {
      ...list[itemIndex],
      id: crypto.randomUUID(),
      open: true,
    };
    list.splice(itemIndex + 1, 0, copy);
    updateBuyList(ruleIndex, list);
  };

  const toggleBuyItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].brand_list];
    list[itemIndex].open = !list[itemIndex].open;
    updateBuyList(ruleIndex, list);
  };

  const updateBuyItemField = (ruleIndex, itemIndex, field, value) => {
    const list = [...rules[ruleIndex].brand_list];
    list[itemIndex][field] = value;
    updateBuyList(ruleIndex, list);
  };

  const reorderBuyList = (ruleIndex, oldIndex, newIndex) => {
    const list = [...rules[ruleIndex].brand_list];
    const moved = list.splice(oldIndex, 1)[0];
    list.splice(newIndex, 0, moved);
    updateBuyList(ruleIndex, list);
  };

  useEffect(() => {
    if (rules.length === 0) {
      updateAll([newBrlistTRule()]);
    } else {
      const arr = [...rules];
      arr[0].open = true;
      updateAll(arr);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { style } = e.detail;
      if (!style) return;

      const index = rules.findIndex((r) => r.open);
      if (index === -1) return;

      const updatedRule = applyStyleDefaults(rules[index], style);

      updateAll(rules.map((r, i) => (i === index ? updatedRule : r)));

      onLivePreview?.(updatedRule, index);
    };

    window.addEventListener("storeone:changeBrandStyle", handler);
    return () =>
      window.removeEventListener("storeone:changeBrandStyle", handler);
  }, [rules]);

  const openMediaLibrary = (callback) => {
    const media = window.wp.media({
      title: "Select Image",
      button: { text: "Use Image" },
      multiple: false,
    });

    media.on("select", () => {
      const attachment = media.state().get("selection").first().toJSON();
      callback(attachment);
    });

    media.open();
  };

  return (
    <div className="store-one-rules-container">
      <h3 className="store-one-section-title">
        {__("Product Brand", "th-store-one")}
      </h3>
      <SortableWrapper items={rules} onSortEnd={reorder}>
        {rules.map((rule, index) => (
          <div key={rule.flexible_id} className="store-one-rule-item">
            {/* ---------------------- Header ---------------------- */}
            <div className="store-one-rule-header">
              <DragHandleDots2Icon className="drag-handle s1-icon" />
              {/* <span className="dashicons dashicons-menu drag-handle s1-icon" /> */}

              <strong className="s1-rule-title">
                {sprintf(
                  __("Rule %d: %s", "th-store-one"),
                  index + 1,
                  rule.list_title || __("Untitled", "th-store-one"),
                )}
              </strong>

              <CopyIcon
                className="s1-icon"
                onClick={() => duplicateRule(index)}
              />
              <TrashIcon
                className="s1-icon s1-icon-danger"
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

            {/* ---------------------- Body ---------------------- */}
            {rule.open && (
              <TabSwitcher
                defaultTab={menuItems[0].id}
                tabs={[
                  {
                    id: menuItems[0].id,
                    label: menuItems[0].label,
                    icon: ICONS[menuItems[0].icon],
                    content: (
                      <div className="store-one-rule-body">
                        <S1Field label={__("Status", "th-store-one")}>
                          <SelectControl
                            value={rule.status}
                            options={[
                              {
                                label: __("Active", "th-store-one"),
                                value: "active",
                              },
                              {
                                label: __("Inactive", "th-store-one"),
                                value: "inactive",
                              },
                            ]}
                            onChange={(v) => updateField(index, "status", v)}
                          />
                        </S1Field>
                        <S1Field label={__("Title", "th-store-one")}>
                          <TextControl
                            value={rule.list_title}
                            onChange={(v) =>
                              updateField(index, "list_title", v)
                            }
                          />
                        </S1Field>
                        <S1Field label={__("Trigger Type", "th-store-one")}>
                          <SelectControl
                            value={rule.trigger_type}
                            options={[
                              {
                                label: __("All Products", "th-store-one"),
                                value: "all_products",
                              },
                              {
                                label: __("Specific Products", "th-store-one"),
                                value: "specific_products",
                              },
                              {
                                label: __("Specific Categories", "th-store-one"),
                                value: "specific_categories",
                              },
                              {
                                label: __("Specific Tags", "th-store-one"),
                                value: "specific_tags",
                              },
                              {
                                label: __("Disable", "th-store-one"),
                                value: "disable",
                              },
                            ]}
                            onChange={(v) =>
                              updateField(index, "trigger_type", v)
                            }
                          />
                        </S1Field>

                        {rule.trigger_type === "specific_products" &&
                          rule.trigger_type !== "disable" && (
                            <MultiWooSearchSelector
                              searchType="product"
                              label={__("Select Products", "th-store-one")}
                              value={rule.products || []}
                              onChange={(items) =>
                                updateField(index, "products", items)
                              }
                              detailedView={true}
                            />
                          )}

                        {rule.trigger_type === "specific_categories" &&
                          rule.trigger_type !== "disable" && (
                            <MultiWooSearchSelector
                              searchType="category"
                              label={__("Select Categories", "th-store-one")}
                              value={rule.categories || []}
                              onChange={(items) =>
                                updateField(index, "categories", items)
                              }
                              detailedView={true}
                            />
                          )}

                        {rule.trigger_type === "specific_tags" &&
                          rule.trigger_type !== "disable" && (
                            <MultiWooSearchSelector
                              searchType="tag"
                              label={__("Select Tags", "th-store-one")}
                              value={rule.tags || []}
                              onChange={(items) =>
                                updateField(index, "tags", items)
                              }
                              detailedView={true}
                            />
                          )}

                        {/* ———————— EXCLUDE OPTIONS ————————— */}
                        {rule.trigger_type !== "disable" && (
                          <>
                            <ExcludeWooCondition
                              label={__("Exclude products", "th-store-one")}
                              searchType="product"
                              enabled={rule.exclude_products_enabled}
                              items={rule.exclude_products}
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
                              label={__("Exclude categories", "th-store-one")}
                              searchType="category"
                              enabled={rule.exclude_categories_enabled}
                              items={rule.exclude_categories}
                              onToggle={(v) =>
                                updateField(
                                  index,
                                  "exclude_categories_enabled",
                                  v,
                                )
                              }
                              onChangeItems={(items) =>
                                updateField(index, "exclude_categories", items)
                              }
                              detailedView={true}
                            />

                            <ExcludeWooCondition
                              label={__("Exclude product tags", "th-store-one")}
                              searchType="tag"
                              enabled={rule.exclude_tags_enabled}
                              items={rule.exclude_tags}
                              onToggle={(v) =>
                                updateField(index, "exclude_tags_enabled", v)
                              }
                              onChangeItems={(items) =>
                                updateField(index, "exclude_tags", items)
                              }
                              detailedView={true}
                            />

                            <ExcludeWooCondition
                              label={__(
                                "Exclude On-Sale products",
                                "th-store-one",
                              )}
                              searchType="on_sale"
                              enabled={rule.exclude_on_sale_enabled}
                              items={[]} // no search selector for this one
                              onToggle={(v) =>
                                updateField(index, "exclude_on_sale_enabled", v)
                              }
                              onChangeItems={() => {}}
                            />
                          </>
                        )}

                        {/* BUY LIST GROUP */}
                        <S1FieldGroup title={__("Brand Item", "th-store-one")}>
                          <SortableWrapper
                            items={rule.brand_list}
                            onSortEnd={(oldI, newI) =>
                              reorderBuyList(index, oldI, newI)
                            }
                          >
                            {rule.brand_list?.map((item, i) => (
                              <div
                                key={item.id}
                                className="store-one-rule-item inner"
                              >
                                <div className="store-one-rule-header">
                                  <DragHandleDots2Icon className="drag-handle s1-icon" />

                                  <strong className="s1-rule-title">
                                    {sprintf(
                                      __("Brand %d", "th-store-one"),
                                      i + 1,
                                    )}
                                  </strong>

                                  <CopyIcon
                                    className="s1-icon"
                                    onClick={() => duplicateBuyItem(index, i)}
                                  />
                                  <TrashIcon
                                    className="s1-icon s1-icon-danger"
                                    onClick={() => removeBuyItem(index, i)}
                                  />

                                  {item.open ? (
                                    <ChevronUpIcon
                                      className="s1-icon"
                                      onClick={() => toggleBuyItem(index, i)}
                                    />
                                  ) : (
                                    <ChevronDownIcon
                                      className="s1-icon"
                                      onClick={() => toggleBuyItem(index, i)}
                                    />
                                  )}
                                </div>

                                {item.open && (
                                  <div className="store-one-rule-body">
                                    <S1Field label="Upload Image">
                                      <div className="s1-image-upload-wrapper">
                                        {item.image_url ? (
                                          <div className="s1-image-card">
                                            <div className="s1-image-preview">
                                              <img
                                                src={item.image_url}
                                                alt=""
                                              />
                                            </div>

                                            <div className="s1-image-actions">
                                              <button
                                                type="button"
                                                className="s1-btn s1-btn-edit"
                                                onClick={() =>
                                                  openMediaLibrary((media) =>
                                                    updateBuyItemField(
                                                      index,
                                                      i,
                                                      "image_url",
                                                      media.url,
                                                    ),
                                                  )
                                                }
                                              >
                                                <span className="s1-btn-icon">
                                                  {ICONS.SETTINGS}
                                                </span>
                                                Change
                                              </button>

                                              <button
                                                type="button"
                                                className="s1-btn s1-btn-remove"
                                                onClick={() =>
                                                  updateBuyItemField(
                                                    index,
                                                    i,
                                                    "image_url",
                                                    "",
                                                  )
                                                }
                                              >
                                                <TrashIcon />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            className="s1-upload-card"
                                            onClick={() =>
                                              openMediaLibrary((media) =>
                                                updateBuyItemField(
                                                  index,
                                                  i,
                                                  "image_url",
                                                  media.url,
                                                ),
                                              )
                                            }
                                          >
                                            <span className="s1-btn-icon">
                                              {ICONS.DISPLAY}
                                            </span>
                                            <div className="s1-upload-text">
                                              <strong>Upload Image</strong>
                                              <p>
                                                Select or upload an image file
                                              </p>
                                              <small className="s1-upload-note">
                                                PNG, JPG, and SVG formats
                                                supported
                                              </small>
                                            </div>
                                          </button>
                                        )}
                                      </div>
                                    </S1Field>

                                    <S1Field
                                      label={__("Enable Link", "th-store-one")}
                                      classN="s1-toggle-wrpapper"
                                    >
                                      <ToggleControl
                                        checked={item.link_enabled}
                                        onChange={(value) =>
                                          updateBuyItemField(
                                            index,
                                            i,
                                            "link_enabled",
                                            value,
                                          )
                                        }
                                      />
                                    </S1Field>
                                    {item.link_enabled && (
                                      <S1Field
                                        label={__("Link URL", "th-store-one")}
                                      >
                                        <TextControl
                                          value={item.link_url}
                                          onChange={(v) =>
                                            updateBuyItemField(
                                              index,
                                              i,
                                              "link_url",
                                              v,
                                            )
                                          }
                                          placeholder="https://example.com"
                                        />
                                      </S1Field>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </SortableWrapper>

                          <div
                            className="store-one-add-rule"
                            onClick={() => addBuyItem(index)}
                          >
                            + Add List Item
                          </div>
                        </S1FieldGroup>
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
                              value={`[storeone_product_brand id="${rule.flexible_id}"]`}
                              className="s1-shortcode-textarea"
                            />

                            <button
                              type="button"
                              className="s1-shortcode-copy"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `[storeone_product_brand id="${rule.flexible_id}"]`,
                                );
                              }}
                            >
                              <CopyIcon />
                            </button>
                          </div>
                        </S1Field>
                      </div>
                    ),
                  },

                  {
                    id: menuItems[1].id,
                    label: menuItems[1].label,
                    icon: ICONS[menuItems[1].icon],
                    content: (
                      <div className="store-one-rule-body">
                       
                        <UniversalRangeControl
                          label="Margin Top"
                          value={rule.margin_top}
                          onChange={(v) => updateField(index, "margin_top", v)}
                          min={1}
                          max={100}
                        />

                        <UniversalRangeControl
                          label="Margin Bottom"
                          value={rule.margin_bottom}
                          onChange={(v) =>
                            updateField(index, "margin_bottom", v)
                          }
                          min={1}
                          max={250}
                        />

                        <UniversalRangeControl
                          label="Image Max Width"
                          value={rule.max_width}
                          onChange={(v) => updateField(index, "max_width", v)}
                          min={1}
                          max={250}
                        />
                        <UniversalRangeControl
                          label="Image Gap"
                          value={rule.image_gap}
                          onChange={(v) => updateField(index, "image_gap", v)}
                          min={1}
                          max={100}
                        />

                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Background", "th-store-one")}
                            value={rule.btl_bg_clr || "#ffffff"}
                            onChange={(v) => {
                              const updatedRule = { ...rule, btl_bg_clr: v };
                              updateField(index, "btl_bg_clr", v);
                              onLivePreview?.(updatedRule, index);
                            }}
                          />
                        </S1Field>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Title", "th-store-one")}
                            value={rule.btl_title_clr || "#111"}
                            onChange={(v) => {
                              const updatedRule = { ...rule, btl_title_clr: v };
                              updateField(index, "btl_title_clr", v);
                              onLivePreview?.(updatedRule, index);
                            }}
                          />
                        </S1Field>
                      </div>
                    ),
                  },
                  {
                    id: menuItems[2].id,
                    label: menuItems[2].label,
                    icon: ICONS[menuItems[2].icon],
                    content: (
                      <div className="store-one-rule-body">
                        <PlacementPriorityControl
                          placement={rule.placement}
                          priority={rule.priority}
                          onPlacementChange={(v) =>
                            updateField(index, "placement", v)
                          }
                          onPriorityChange={(v) =>
                            updateField(index, "priority", v)
                          }
                        />
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </div>
        ))}
      </SortableWrapper>
      {/* Add Rule */}
      <div className="store-one-rules-footer">
      <div className="store-one-add-rule" onClick={addRule}>
        {__("+ Add New Rule", "th-store-one")}
      </div>
      <ResetModuleButton
                moduleId="buy-to-list"
                onReset={() => {
                  updateAll([newBrlistTRule()]);
                }}
              />
      </div>
    </div>
  );
}
