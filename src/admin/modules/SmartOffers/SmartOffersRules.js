/* ------------------------ imports ------------------------ */
import { useEffect, useRef } from "@wordpress/element";
import {
  TextControl,
  SelectControl,
  ToggleControl,
  __experimentalUnitControl as UnitControl,
  ColorPalette,
  RangeControl,
  TabPanel,
} from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import Sortable from "sortablejs";
import QuantityTiersControl from "./QuantityTiersControl";
import MultiWooSearchSelector from "@th-storeone-global/MultiWooSearchSelector";
import ExcludeWooCondition from "@th-storeone-global/ExcludeWooCondition";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import DeviceSelector from "@th-storeone-global/DeviceSelector";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import {
  CopyIcon,
  TrashIcon,
  DragHandleDots2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  TargetIcon,
} from "@radix-ui/react-icons";
import { ICONS } from "@th-storeone-global/icons";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";
import PlacementPriorityControl from "@th-storeone-global/PlacementPriorityControl";

import THBackgroundControl from "@th-storeone-control/color";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";

import SliderControl from "@th-storeone-global/SliderControl";
import UniversalBorderControl from "@th-storeone-control/UniversalBorderControl";
import UniversalDimensionControl from "@th-storeone-control/UniversalDimensionControl";

/* ---------------- DEFAULT RULE ---------------- */
const newSmartOfferRule = () => ({
  flexible_id: crypto.randomUUID(),
  open: true,
  status: "active",
  title: "Smart Offer",
  // bogo
  rule_type: "bogo",
  bogo_trigger: "bogo_allproduct",
  exclude_bogo_products_enabled: false,
  exclude_bogo_products: [],
  bogo_product: [],
  bogo_categories: [],
  bogo_tags: [],
  //x
  x_trigger: "x_allproduct",
  x_exclude_products_enabled: false,
  x_exclude_products: [],
  x_product: [],
  x_categories: [],
  x_tags: [],
  x_quantity: "1",
  //y
  y_trigger: "y_specificproduct",
  y_exclude_products_enabled: false,
  y_exclude_products: [],
  y_product: [],
  y_categories: [],
  y_tags: [],
  y_quantity: "4",

  //dynamic
  d_trigger: "d_allproduct",
  d_exclude_products_enabled: false,
  d_exclude_products: [],
  d_product: [],
  d_categories: [],
  d_tags: [],
  tier_create_quantity: "interval_price",
  quantity_tiers: [
    {
      id: crypto.randomUUID(),
      from_qty: 1,
      to_qty: "",
      offer: "percent",
      value: 10,
    },
  ],
  reward_type: "free_product",
  offer_mode: "repeat",
  discount_value: 100,
  apply_on: "sale_price",
  priority: 10,
  single_placement: "woocommerce_after_add_to_cart_form",
  single_priority: 10,
  // BOGO
  bogo_offer_title: "Buy One, Get One",
  bogo_badge_text: "BEST DEAL",
  bogo_price_text: "",

  // BXGY
  bxgy_offer_title: "Buy {XQTY} Products & Get This Gift FREE",
  bxgy_badge_text: "FREE GIFT",
  bxgy_price_text: "{DELPRICE} Worth {PRICE}",
  bxgy_short_description: "Included with Your Purchase",

  // Dynamic Offer
  dynamic_offer_title:
    "Buy from {XQTY} to {YQTY} items for {DISCOUNT} OFF per item",
  dynamic_badge_text: "Save {DISCOUNT}",
  dynamic_price_text: "Price {DELPRICE} {PRICE}",
  dynamic_short_description: "{DISCOUNT} / each item",

  use_shortcode: false,
  devices: ["desktop"],

  crt_page_bogo_text: "{BOGO} SMART OFFER",
  crt_page_xy_text: "Special BXGY Offer",
  crt_page_dyn_text: "Dynamic Discount",
  /* ================ STYLE ================= */
  card_bg: "linear-gradient(180deg, #f7fff9 0%, #ffffff 100%);",
  card_border: {
    width: {
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
    },
    style: "solid",
    color: "#e7e7e7",
    radius: {
      top: "16px",
      right: "16px",
      bottom: "16px",
      left: "16px",
    },
  },
  card_active_bg: "linear-gradient(180deg, #f7fff9 0%, #ffffff 100%);",

  heading_color: "#111827",
  text_color: "#6b7280",
  price_color: "#6b7280",

  badge_bg: "#111827",
  badge_color: "#ffffff",

  layout_style: "detailed",
  highlight_color: "#111",
  padding: {
    top: "14px",
    right: "14px",
    bottom: "14px",
    left: "14px",
  },
});

/* ---------------- SORTABLE ---------------- */
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
export default function SmartOffersRules({ rules, onChange, onLivePreview }) {
  const updateAll = (arr) => onChange([...arr]);

  const updateField = (i, field, val) => {
    const arr = [...rules];
    arr[i][field] = val;

    updateAll(arr);

    onLivePreview?.(arr[i], i);
  };

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
    const arr = [...rules, newSmartOfferRule()];

    updateAll(arr);

    const newIndex = arr.length - 1;

    onLivePreview?.(arr[newIndex], newIndex);
  };

  useEffect(() => {
    if (!rules.length) {
      updateAll([newSmartOfferRule()]);
    }
  }, []);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    if (rules.length > 0) {
      onLivePreview?.(rules[0], 0);
    }

    hasInitialized.current = true;
  }, []);

  return (
    <div className="store-one-rules-container">
      <h3 className="store-one-section-title">
        {__("Smart Offers", "th-store-one")}
      </h3>

      <SortableWrapper items={rules} onSortEnd={reorder}>
        {rules.map((rule, index) => (
          <div key={rule.flexible_id} className="store-one-rule-item">
            <div className="store-one-rule-header">
              <DragHandleDots2Icon className="drag-handle s1-icon" />

              <strong className="s1-rule-title">
                {sprintf("Rule %d: %s", index + 1, rule.title)}
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

            {rule.open && (
              <TabSwitcher
                defaultTab="settings"
                tabs={[
                  /* SETTINGS */
                  {
                    id: "settings",
                    label: "Settings",
                    icon: ICONS.SETTINGS,
                    content: (
                      <div className="store-one-rule-body">
                        <S1FieldGroup title="Basic">
                          <S1Field
                            label="Status"
                            description="Enable or disable this offer rule"
                          >
                            <SelectControl
                              value={rule.status}
                              options={[
                                { label: "Active", value: "active" },
                                { label: "Inactive", value: "inactive" },
                              ]}
                              onChange={(v) => updateField(index, "status", v)}
                            />
                          </S1Field>

                          <S1Field
                            label="Title"
                            description="Internal name used to identify this rule"
                          >
                            <TextControl
                              value={rule.title}
                              onChange={(v) => updateField(index, "title", v)}
                            />
                          </S1Field>
                        </S1FieldGroup>

                        <S1FieldGroup title="Choose Rule">
                          <S1Field>
                            <div className="th-rule-tabs-wrapper">
                              <TabPanel
                                className="th-smart-offers-tab-panel"
                                activeClass="is-active"
                                initialTabName={rule.rule_type || "bogo"}
                                onSelect={(tabName) => {
                                  updateField(index, "rule_type", tabName);
                                }}
                                tabs={[
                                  {
                                    name: "bogo",
                                    title: "Buy X Get X",
                                    className: "th-tab-item bogo-tab",
                                  },
                                  {
                                    name: "buyxgety",
                                    title: "Buy X Get Y",
                                    className: "th-tab-item buyxgety-tab",
                                  },
                                  {
                                    name: "dynamicoffer",
                                    title: "Dynamic Offer",
                                    className: "th-tab-item dynamic-tab",
                                  },
                                ]}
                              >
                                {/* TabPanel require karta hai ki ek function child pass ho jo content return kare */}
                                {(activeTab) => {
                                  // Hum yahan content render nahi kar rahe kyunki niche ke fields auto-change hote hain
                                  return null;
                                }}
                              </TabPanel>
                            </div>
                          </S1Field>
                        </S1FieldGroup>
                        {rule.rule_type == "bogo" && (
                          <S1FieldGroup title="BOGO Setup">
                            <S1Field label="Offer Applies To">
                              <SelectControl
                                help="Pick the products that trigger the buy-one-get-one offer."
                                value={rule.bogo_trigger}
                                options={[
                                  {
                                    label: "All Products",
                                    value: "bogo_allproduct",
                                  },
                                  {
                                    label: "Specific Products",
                                    value: "bogo_specificproduct",
                                  },
                                  {
                                    label: "Specific Category",
                                    value: "bogo_category",
                                  },
                                  {
                                    label: "Specific Tag",
                                    value: "bogo_tag",
                                  },
                                ]}
                                onChange={(v) => {
                                  updateField(index, "bogo_trigger", v);
                                }}
                              />
                            </S1Field>

                            {rule.bogo_trigger == "bogo_allproduct" && (
                              <ExcludeWooCondition
                                label={__("Exclude products", "th-store-one")}
                                searchType="product"
                                enabled={rule.exclude_bogo_products_enabled}
                                items={rule.exclude_bogo_products}
                                onToggle={(v) =>
                                  updateField(
                                    index,
                                    "exclude_bogo_products_enabled",
                                    v,
                                  )
                                }
                                onChangeItems={(items) =>
                                  updateField(
                                    index,
                                    "exclude_bogo_products",
                                    items,
                                  )
                                }
                                detailedView={true}
                              />
                            )}
                            {rule.bogo_trigger === "bogo_specificproduct" && (
                              <MultiWooSearchSelector
                                searchType="product"
                                label={__("Select Product", "th-store-one")}
                                value={rule.bogo_product || []}
                                onChange={(items) =>
                                  updateField(index, "bogo_product", items)
                                }
                                detailedView={true}
                              />
                            )}
                            {rule.bogo_trigger === "bogo_category" && (
                              <MultiWooSearchSelector
                                searchType="category"
                                label={__("Select Categories", "th-store-one")}
                                value={rule.bogo_categories || []}
                                onChange={(items) =>
                                  updateField(index, "bogo_categories", items)
                                }
                                detailedView={true}
                              />
                            )}

                            {rule.bogo_trigger === "bogo_tag" && (
                              <MultiWooSearchSelector
                                searchType="tag"
                                label={__("Select Tags", "th-store-one")}
                                value={rule.bogo_tags || []}
                                onChange={(items) =>
                                  updateField(index, "bogo_tags", items)
                                }
                                detailedView={true}
                              />
                            )}
                          </S1FieldGroup>
                        )}
                        {rule.rule_type == "buyxgety" && (
                          <>
                            <S1FieldGroup title="Customer Buys (X)">
                              <S1Field label="Offer Applies To">
                                <SelectControl
                                  value={rule.x_trigger}
                                  options={[
                                    {
                                      label: "All Products",
                                      value: "x_allproduct",
                                    },
                                    {
                                      label: "Specific Products",
                                      value: "x_specificproduct",
                                    },
                                    {
                                      label: "Specific Category",
                                      value: "x_category",
                                    },
                                    {
                                      label: "Specific Tag",
                                      value: "x_tag",
                                    },
                                  ]}
                                  onChange={(v) => {
                                    updateField(index, "x_trigger", v);
                                  }}
                                />
                              </S1Field>
                              {rule.x_trigger == "x_allproduct" && (
                                <ExcludeWooCondition
                                  label={__("Exclude products", "th-store-one")}
                                  searchType="product"
                                  enabled={rule.x_exclude_products_enabled}
                                  items={rule.x_exclude_products}
                                  onToggle={(v) =>
                                    updateField(
                                      index,
                                      "x_exclude_products_enabled",
                                      v,
                                    )
                                  }
                                  onChangeItems={(items) =>
                                    updateField(
                                      index,
                                      "x_exclude_products",
                                      items,
                                    )
                                  }
                                  detailedView={true}
                                />
                              )}
                              {rule.x_trigger === "x_specificproduct" && (
                                <MultiWooSearchSelector
                                  searchType="product"
                                  label={__("Select Product", "th-store-one")}
                                  value={rule.x_product || []}
                                  onChange={(items) =>
                                    updateField(index, "x_product", items)
                                  }
                                  detailedView={true}
                                />
                              )}
                              {rule.x_trigger === "x_category" && (
                                <MultiWooSearchSelector
                                  searchType="category"
                                  label={__(
                                    "Select Categories",
                                    "th-store-one",
                                  )}
                                  value={rule.x_categories || []}
                                  onChange={(items) =>
                                    updateField(index, "x_categories", items)
                                  }
                                  detailedView={true}
                                />
                              )}

                              {rule.x_trigger === "x_tag" && (
                                <MultiWooSearchSelector
                                  searchType="tag"
                                  label={__("Select Tags", "th-store-one")}
                                  value={rule.x_tags || []}
                                  onChange={(items) =>
                                    updateField(index, "x_tags", items)
                                  }
                                  detailedView={true}
                                />
                              )}
                              <S1Field label="Quantity">
                                <TextControl
                                  type="number"
                                  value={rule.x_quantity}
                                  onChange={(v) =>
                                    updateField(
                                      index,
                                      "x_quantity",
                                      parseInt(v),
                                    )
                                  }
                                />
                              </S1Field>
                            </S1FieldGroup>
                            <S1FieldGroup title="Customer Gets (Y)">
                              <S1Field label="Reward Products">
                                <SelectControl
                                  value={rule.y_trigger}
                                  options={[
                                    {
                                      label: "Specific Products",
                                      value: "y_specificproduct",
                                    },

                                    {
                                      label: "Same Product",
                                      value: "y_same",
                                    },
                                  ]}
                                  onChange={(v) => {
                                    updateField(index, "y_trigger", v);
                                  }}
                                />
                              </S1Field>

                              {rule.y_trigger === "y_specificproduct" && (
                                <MultiWooSearchSelector
                                  searchType="product"
                                  label={__("Select Product", "th-store-one")}
                                  value={rule.y_product || []}
                                  onChange={(items) =>
                                    updateField(index, "y_product", items)
                                  }
                                  detailedView={true}
                                />
                              )}
                              {rule.y_trigger === "y_category" && (
                                <MultiWooSearchSelector
                                  searchType="category"
                                  label={__(
                                    "Select Categories",
                                    "th-store-one",
                                  )}
                                  value={rule.y_categories || []}
                                  onChange={(items) =>
                                    updateField(index, "y_categories", items)
                                  }
                                  detailedView={true}
                                />
                              )}

                              {rule.y_trigger === "y_tag" && (
                                <MultiWooSearchSelector
                                  searchType="tag"
                                  label={__("Select Tags", "th-store-one")}
                                  value={rule.y_tags || []}
                                  onChange={(items) =>
                                    updateField(index, "y_tags", items)
                                  }
                                  detailedView={true}
                                />
                              )}
                              <S1Field label="Quantity">
                                <TextControl
                                  type="number"
                                  value={rule.y_quantity}
                                  onChange={(v) =>
                                    updateField(
                                      index,
                                      "y_quantity",
                                      parseInt(v),
                                    )
                                  }
                                />
                              </S1Field>

                              <S1Field label="Discount on Y Product">
                                <SelectControl
                                  value={rule.reward_type}
                                  options={[
                                    {
                                      label: "Free Product (100% Discount)",
                                      value: "free_product",
                                    },
                                    {
                                      label: "Percent Discount (%)",
                                      value: "discount_percent",
                                    },
                                    {
                                      label: "Price Discount ($)",
                                      value: "discount_fixed",
                                    },
                                    {
                                      label: "Fixed Price",
                                      value: "discount_fixed_price",
                                    },
                                  ]}
                                  onChange={(v) => {
                                    updateField(index, "reward_type", v);
                                  }}
                                />
                              </S1Field>
                              {rule.reward_type !== "free_product" && (
                                <S1Field
                                  label="Discount Value"
                                  description={
                                    rule.reward_type === "discount_percent"
                                      ? "Enter the discount percentage customers will receive (example: 10 = 10% OFF)"
                                      : rule.reward_type === "discount_fixed"
                                      ? "Enter the fixed discount amount applied to each rewarded product"
                                      : "Enter the fixed cart discount amount applied to the entire cart total"
                                  }
                                >
                                  <TextControl
                                    type="number"
                                    value={rule.discount_value}
                                    onChange={(v) =>
                                      updateField(
                                        index,
                                        "discount_value",
                                        parseFloat(v),
                                      )
                                    }
                                  />
                                </S1Field>
                              )}
                            </S1FieldGroup>
                          </>
                        )}
                        {rule.rule_type == "dynamicoffer" && (
                          <>
                            <S1FieldGroup title="Dynamic Offer">
                              <S1Field label="Offer Applies To">
                                <SelectControl
                                  value={rule.d_trigger}
                                  options={[
                                    {
                                      label: "All Products",
                                      value: "d_allproduct",
                                    },
                                    {
                                      label: "Specific Products",
                                      value: "d_specificproduct",
                                    },
                                    {
                                      label: "Specific Category",
                                      value: "d_category",
                                    },
                                    {
                                      label: "Specific Tag",
                                      value: "d_tag",
                                    },
                                  ]}
                                  onChange={(v) => {
                                    updateField(index, "d_trigger", v);
                                  }}
                                />
                              </S1Field>
                              {rule.d_trigger == "d_allproduct" && (
                                <ExcludeWooCondition
                                  label={__("Exclude products", "th-store-one")}
                                  searchType="product"
                                  enabled={rule.d_exclude_products_enabled}
                                  items={rule.d_exclude_products}
                                  onToggle={(v) =>
                                    updateField(
                                      index,
                                      "d_exclude_products_enabled",
                                      v,
                                    )
                                  }
                                  onChangeItems={(items) =>
                                    updateField(
                                      index,
                                      "d_exclude_products",
                                      items,
                                    )
                                  }
                                  detailedView={true}
                                />
                              )}
                              {rule.d_trigger === "d_specificproduct" && (
                                <MultiWooSearchSelector
                                  searchType="product"
                                  label={__("Select Product", "th-store-one")}
                                  value={rule.d_product || []}
                                  onChange={(items) =>
                                    updateField(index, "d_product", items)
                                  }
                                  detailedView={true}
                                />
                              )}
                              {rule.d_trigger === "d_category" && (
                                <MultiWooSearchSelector
                                  searchType="category"
                                  label={__(
                                    "Select Categories",
                                    "th-store-one",
                                  )}
                                  value={rule.d_categories || []}
                                  onChange={(items) =>
                                    updateField(index, "d_categories", items)
                                  }
                                  detailedView={true}
                                />
                              )}

                              {rule.d_trigger === "d_tag" && (
                                <MultiWooSearchSelector
                                  searchType="tag"
                                  label={__("Select Tags", "th-store-one")}
                                  value={rule.x_tags || []}
                                  onChange={(items) =>
                                    updateField(index, "d_tags", items)
                                  }
                                  detailedView={true}
                                />
                              )}
                            </S1FieldGroup>

                            <S1FieldGroup title="Discount Rules">
                              <S1Field label="Create Qty/Price table with">
                                <SelectControl
                                  value={rule.price_fixed_trigger}
                                  options={[
                                    {
                                      label:
                                        "Interval Pricing (e.g. 5–10 items = $10/item)",
                                      value: "interval_price",
                                    },
                                    {
                                      label:
                                        "Fixed Unit Pricing (e.g. 5 items = $10/item, 20 items = $30/item)",
                                      value: "fixed_unit_price",
                                    },
                                  ]}
                                  onChange={(v) => {
                                    updateField(
                                      index,
                                      "price_fixed_trigger",
                                      v,
                                    );
                                  }}
                                />
                              </S1Field>
                              <QuantityTiersControl
                                trigger={rule.price_fixed_trigger}
                                value={rule.quantity_tiers || []}
                                onChange={(tiers) =>
                                  updateField(index, "quantity_tiers", tiers)
                                }
                              />
                            </S1FieldGroup>
                          </>
                        )}
                        {rule.rule_type !== "bogo" && (
                          <S1Field label="Calculate Discount On">
                            <SelectControl
                              help="Which price the discount is calculated from. Applies to every rule type."
                              value={rule.apply_on}
                              options={[
                                {
                                  label: "Regular Price",
                                  value: "regular_price",
                                },
                                {
                                  label: "Sale Price",
                                  value: "sale_price",
                                },
                              ]}
                              onChange={(v) =>
                                updateField(index, "apply_on", v)
                              }
                            />
                          </S1Field>
                        )}
                        {rule.rule_type !== "dynamicoffer" && (
                          <S1Field label="Apply Mode">
                            <SelectControl
                              help="Repeat: Offer applies Multiple times based on qauntity. Once Only: Offer apply only once per order."
                              value={rule.apply_mode || "repeat"}
                              options={[
                                {
                                  label: "Reapeat",
                                  value: "repeat",
                                },
                                {
                                  label: "Once Only",
                                  value: "once",
                                },
                              ]}
                              onChange={(v) =>
                                updateField(index, "apply_mode", v)
                              }
                            />
                          </S1Field>
                        )}
                      </div>
                    ),
                  },

                  /* DISPLAY */
                  {
                    id: "display",
                    label: "Display",
                    icon: ICONS.DISPLAY,
                    content: (
                      <div className="store-one-rule-body">
                        <PlacementPriorityControl
                          placement={rule.single_placement}
                          priority={rule.single_priority}
                          onPlacementChange={(v) =>
                            updateField({
                              ...rule,
                              single_placement: v,
                            })
                          }
                          onPriorityChange={(v) =>
                            updateField({ ...rule, single_priority: v })
                          }
                        />

                        {/* BOGO */}
                        {rule.rule_type === "bogo" && (
                          <S1FieldGroup title="BOGO Text Settings">
                            <S1Field
                              label="Offer Title"
                              description="Main offer heading displayed on the offer card."
                            >
                              <TextControl
                                value={rule.bogo_offer_title}
                                onChange={(v) =>
                                  updateField(index, "bogo_offer_title", v)
                                }
                              />
                            </S1Field>

                            <S1Field
                              label="Badge Text"
                              description="Badge label shown on the offer card."
                            >
                              <TextControl
                                value={rule.bogo_badge_text}
                                onChange={(v) =>
                                  updateField(index, "bogo_badge_text", v)
                                }
                              />
                            </S1Field>
                            <S1Field
                              label="Price Text"
                              description="Price information displayed with the offer."
                            >
                              <TextControl
                                value={rule.bogo_price_text}
                                onChange={(v) =>
                                  updateField(index, "bogo_price_text", v)
                                }
                              />
                            </S1Field>
                          </S1FieldGroup>
                        )}

                        {/* Buy X Get Y */}
                        {rule.rule_type === "buyxgety" && (
                          <S1FieldGroup title="Buy X Get Y Text Settings">
                            <S1Field
                              label="Offer Title"
                              description="Main heading displayed for the free gift offer."
                            >
                              <TextControl
                                value={rule.bxgy_offer_title}
                                onChange={(v) =>
                                  updateField(index, "bxgy_offer_title", v)
                                }
                              />
                            </S1Field>

                            <S1Field
                              label="Badge Text"
                              description="Badge label displayed on the gift card."
                            >
                              <TextControl
                                value={rule.bxgy_badge_text}
                                onChange={(v) =>
                                  updateField(index, "bxgy_badge_text", v)
                                }
                              />
                            </S1Field>

                            <S1Field
                              label="Price Text"
                              description="Gift value text displayed below the badge."
                            >
                              <TextControl
                                value={rule.bxgy_price_text}
                                onChange={(v) =>
                                  updateField(index, "bxgy_price_text", v)
                                }
                              />
                            </S1Field>

                            <S1Field
                              label="Short Description"
                              description="Additional text displayed below the price."
                            >
                              <TextControl
                                value={rule.bxgy_short_description}
                                onChange={(v) =>
                                  updateField(
                                    index,
                                    "bxgy_short_description",
                                    v,
                                  )
                                }
                              />
                            </S1Field>
                          </S1FieldGroup>
                        )}

                        {/* Buy X Get Y */}
                        {rule.rule_type === "dynamicoffer" && (
                          <S1FieldGroup title="Dynamic Offer Text Settings">
                            <S1Field label="Offer Title">
                              <TextControl
                                value={rule.dynamic_offer_title}
                                onChange={(v) =>
                                  updateField(index, "dynamic_offer_title", v)
                                }
                              />
                            </S1Field>

                            <S1Field label="Badge Text">
                              <TextControl
                                value={rule.dynamic_badge_text}
                                onChange={(v) =>
                                  updateField(index, "dynamic_badge_text", v)
                                }
                              />
                            </S1Field>

                            <S1Field label="Price Text">
                              <TextControl
                                value={rule.dynamic_price_text}
                                onChange={(v) =>
                                  updateField(index, "dynamic_price_text", v)
                                }
                              />
                            </S1Field>

                            <S1Field label="Short Description">
                              <TextControl
                                value={rule.dynamic_short_description}
                                onChange={(v) =>
                                  updateField(
                                    index,
                                    "dynamic_short_description",
                                    v,
                                  )
                                }
                              />
                            </S1Field>
                          </S1FieldGroup>
                        )}

                        <S1FieldGroup title="Cart & Checkout Page">
                          {rule.rule_type === "bogo" && (
                            <S1Field label="Bogo">
                              <TextControl
                                value={rule.crt_page_bogo_text}
                                onChange={(v) =>
                                  updateField(index, "crt_page_bogo_text", v)
                                }
                              />
                            </S1Field>
                          )}
                          {rule.rule_type === "buyxgety" && (
                            <S1Field label="XY">
                              <TextControl
                                value={rule.crt_page_xy_text}
                                onChange={(v) =>
                                  updateField(index, "crt_page_xy_text", v)
                                }
                              />
                            </S1Field>
                          )}
                          {rule.rule_type === "dynamicoffer" && (
                            <S1Field label="Dyanamic">
                              <TextControl
                                value={rule.crt_page_dyn_text}
                                onChange={(v) =>
                                  updateField(index, "crt_page_dyn_text", v)
                                }
                              />
                            </S1Field>
                          )}
                        </S1FieldGroup>

                        <S1Field label={__("Use Shortcode", "th-store-one")}>
                          <p>
                            {`{DELPRICE}`} = Original Price, {`{PRICE}`} = Offer
                            Price,
                            {`{XQTY}`} = Required Quantity, {`{YQTY}`} =
                            Reward/Maximum Quantity,
                            {`{DISCOUNT}`} = Discount Value, {`{REMAINING}`} =
                            Remaining Quantity to Unlock the Offer.
                          </p>
                        </S1Field>
                      </div>
                    ),
                  },
                  {
                    id: "style",
                    label: "Style",
                    icon: ICONS.DESIGN,
                    content: (
                      <div className="store-one-rule-body">
                        <S1FieldGroup title="Card">
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Card Background", "th-store-one")}
                              value={rule.card_bg}
                              onChange={(v) => {
                                const updatedRule = { ...rule, card_bg: v };
                                updateField(index, "card_bg", v);
                              }}
                            />
                          </S1Field>

                          <UniversalBorderControl
                            value={rule.card_border}
                            onChange={(v) =>
                              updateField(index, "card_border", v)
                            }
                          />

                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__(
                                "Active Card Background",
                                "th-store-one",
                              )}
                              value={rule.card_active_bg}
                              onChange={(v) => {
                                const updatedRule = {
                                  ...rule,
                                  card_active_bg: v,
                                };
                                updateField(index, "card_active_bg", v);
                              }}
                            />
                          </S1Field>
                          <UniversalDimensionControl
                            label="Padding"
                            value={rule.padding}
                            responsive={false}
                            onChange={(v) => updateField(index, "padding", v)}
                          />
                        </S1FieldGroup>

                        {/* TEXT */}

                        <S1FieldGroup title="Typography">
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Heading", "th-store-one")}
                              value={rule.heading_color}
                              onChange={(v) => {
                                const updatedRule = {
                                  ...rule,
                                  heading_color: v,
                                };
                                updateField(index, "heading_color", v);
                              }}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Text Color", "th-store-one")}
                              value={rule.text_color}
                              onChange={(v) => {
                                const updatedRule = { ...rule, text_color: v };
                                updateField(index, "text_color", v);
                              }}
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Price Color", "th-store-one")}
                              value={rule.price_color}
                              onChange={(v) => {
                                const updatedRule = { ...rule, price_color: v };
                                updateField(index, "price_color", v);
                              }}
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Radio Button Color", "th-store-one")}
                              value={rule.highlight_color}
                              onChange={(v) => {
                                const updatedRule = {
                                  ...rule,
                                  highlight_color: v,
                                };
                                updateField(index, "highlight_color", v);
                              }}
                            />
                          </S1Field>
                        </S1FieldGroup>

                        {/* BADGE */}

                        <S1FieldGroup title="Badge">
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Badge Background", "th-store-one")}
                              value={rule.badge_bg}
                              onChange={(v) => {
                                const updatedRule = { ...rule, badge_bg: v };
                                updateField(index, "badge_bg", v);
                              }}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Badge Text Color", "th-store-one")}
                              value={rule.badge_color}
                              onChange={(v) => {
                                const updatedRule = { ...rule, badge_color: v };
                                updateField(index, "badge_color", v);
                              }}
                            />
                          </S1Field>
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
          + Add Smart Offer Rule
        </div>

        <ResetModuleButton
          moduleId="smart-offers"
          onReset={() => {
            const resetRules = [newSmartOfferRule()];
            updateAll(resetRules);
            return { rules: resetRules };
          }}
        />
      </div>
    </div>
  );
}
