/* ------------------------ imports ------------------------ */
import { useEffect, useRef } from "@wordpress/element";
import {
  TextControl,
  SelectControl,
  ToggleControl,
  __experimentalUnitControl as UnitControl,
  ColorPalette,
  RangeControl,
} from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import Sortable from "sortablejs";
import MultiWooSearchSelector from "@th-storeone-global/MultiWooSearchSelector";
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

/* ---------------- DEFAULT RULE ---------------- */
const newSmartOfferRule = () => ({
  flexible_id: crypto.randomUUID(),
  open: true,
  status: "active",
  title: "Smart Offer",

  trigger_type: "specific_products",
  products: [],
  categories: [],
  exclude_products: [],
  min_qty: 2,
  min_amount: 0,

  offer_type: "bxgy",
  x_qty: 2,
  y_qty: 1,
  apply_mode: "step",

  reward_type: "free_product",
  reward_products: [],
  discount_value: 100,
  max_qty: 1,
  apply_on: "same_product",

  auto_add: true,
  repeat: true,
  remove_if_invalid: true,
  priority: 10,
  stackable: false,
  limit_per_order: 10,

  user_role: "all",
  first_order_only: false,
  start_date: "",
  end_date: "",

  offer_heading: "Buy {x} Get {y}",
  offer_subheading: "Limited time offer",
  show_product_image: true,
  show_product_title: true,
  show_discount_badge: true,
  badge_text: "BEST DEAL",
  button_text: "Unlock Offer",

  message: "Buy {remaining} more to get FREE gift",
  success_message: "Free gift added!",
  show_progress: true,
  show_badge: true,

  devices: ["desktop"],

  single_placement: "woocommerce_after_add_to_cart_form",
  single_priority: 10,
  /* ================= STYLE ================= */

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
  price_color: "#111827",

  badge_bg: "linear-gradient(135deg, #22c55e, #16a34a);",
  badge_color: "#ffffff",

  progress_bg: "#e5e7eb",
  progress_fill: "#22c55e",

  message_color: "#6b7280",
  success_color: "#16a34a",

  card_radius: 16,
  card_padding: 18,
  image_radius: 12,
  layout_style: "detailed",
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
export default function SmartOffersRules({ rules, onChange }) {
  const updateAll = (arr) => onChange([...arr]);

  const updateField = (i, field, val) => {
    const arr = [...rules];
    arr[i][field] = val;
    updateAll(arr);
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
    updateAll([...rules, newSmartOfferRule()]);
  };

  useEffect(() => {
    if (!rules.length) {
      updateAll([newSmartOfferRule()]);
    }
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

                        <S1FieldGroup title="BOGO Logic">
                          <S1Field
                            label="Buy Quantity (X)"
                            description="Minimum number of items a customer must purchase to activate the offer"
                          >
                            <TextControl
                              type="number"
                              value={rule.x_qty}
                              onChange={(v) =>
                                updateField(index, "x_qty", parseInt(v))
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Get Quantity (Y)"
                            description="Number of items the customer will receive as free or discounted"
                          >
                            <TextControl
                              type="number"
                              value={rule.y_qty}
                              onChange={(v) =>
                                updateField(index, "y_qty", parseInt(v))
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Apply Mode"
                            description="Repeat: offer applies multiple times based on quantity. Once: offer applies only once per order"
                          >
                            <SelectControl
                              value={rule.apply_mode}
                              options={[
                                { label: "Repeat", value: "step" },
                                { label: "Once Only", value: "once" },
                              ]}
                              onChange={(v) =>
                                updateField(index, "apply_mode", v)
                              }
                            />
                          </S1Field>
                        </S1FieldGroup>

                        <S1FieldGroup title="Reward">
                          <S1Field
                            label="Reward Type"
                            description="Choose the type of reward customers will receive after qualifying for the offer"
                          >
                            <SelectControl
                              value={rule.reward_type}
                              options={[
                                {
                                  label: "Free Product",
                                  value: "free_product",
                                },
                                {
                                  label: "Percentage Discount",
                                  value: "discount_percent",
                                },
                                {
                                  label: "Fixed Discount",
                                  value: "discount_fixed",
                                },
                                {
                                  label: "Fixed Cart Discount",
                                  value: "discount_fixed_cart",
                                },
                              ]}
                              onChange={(v) => {
                                updateField(index, "reward_type", v);

                                /* AUTO FIX */

                                if (v === "free_product") {
                                  updateField(
                                    index,
                                    "apply_on",
                                    "specific_product",
                                  );
                                }
                              }}
                            />
                          </S1Field>

                          {rule.reward_type === "free_product" && (
                            <MultiWooSearchSelector
                              searchType="product"
                              label="Select Free Product"
                              value={rule.reward_products}
                              onChange={(v) =>
                                updateField(index, "reward_products", v)
                              }
                              detailedView={true}
                            />
                          )}

                          {rule.reward_type !== "free_product" && (
                            <>
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

                              <S1Field
                                label="Apply Discount On"
                                description={
                                  rule.reward_type === "discount_percent"
                                    ? "Choose which product should receive the percentage (%) discount"
                                    : rule.reward_type === "discount_fixed"
                                    ? "Choose which product should receive the fixed amount discount"
                                    : "Choose how the fixed cart discount should be triggered"
                                }
                              >
                                <SelectControl
                                  value={rule.apply_on}
                                  options={[
                                    {
                                      label: "Same Product",
                                      value: "same_product",
                                    },
                                    {
                                      label: "Specific Product",
                                      value: "specific_product",
                                    },
                                  ]}
                                  onChange={(v) =>
                                    updateField(index, "apply_on", v)
                                  }
                                />
                              </S1Field>

                              {rule.apply_on === "specific_product" && (
                                <MultiWooSearchSelector
                                  searchType="product"
                                  label="Select Reward Product"
                                  value={rule.reward_products}
                                  onChange={(v) =>
                                    updateField(index, "reward_products", v)
                                  }
                                  detailedView={true}
                                />
                              )}
                            </>
                          )}
                        </S1FieldGroup>

                        <S1FieldGroup title="Advanced">
                          <S1Field
                            label="Default Selected Offer"
                            description="Enable this to pre-select the offer automatically on the product page. If disabled, customers will need to manually select the offer before adding it to the cart."
                          >
                            <ToggleControl
                              checked={rule.auto_add}
                              onChange={(v) =>
                                updateField(index, "auto_add", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Limit Per Order"
                            description="Maximum number of times this offer can be applied in a single order"
                          >
                            <TextControl
                              type="number"
                              value={rule.limit_per_order}
                              onChange={(v) =>
                                updateField(
                                  index,
                                  "limit_per_order",
                                  parseInt(v),
                                )
                              }
                            />
                          </S1Field>
                        </S1FieldGroup>
                      </div>
                    ),
                  },

                  /* TRIGGER */
                  {
                    id: "trigger",
                    label: "Trigger",
                    icon: <TargetIcon />,
                    content: (
                      <div className="store-one-rule-body">
                        <MultiWooSearchSelector
                          searchType="product"
                          label="Trigger Products (Customer must purchase these products)"
                          value={rule.products}
                          onChange={(v) => updateField(index, "products", v)}
                          detailedView={true}
                        />

                        <MultiWooSearchSelector
                          searchType="product"
                          label="Exclude Products (Offer will not apply)"
                          value={rule.exclude_products}
                          onChange={(v) =>
                            updateField(index, "exclude_products", v)
                          }
                          detailedView={true}
                        />

                        <S1Field
                          label="Minimum Quantity"
                          description="Minimum quantity required in cart to activate the offer"
                        >
                          <TextControl
                            type="number"
                            value={rule.min_qty}
                            onChange={(v) =>
                              updateField(index, "min_qty", parseInt(v))
                            }
                          />
                        </S1Field>
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
                        <S1FieldGroup title="Offer Card Massage">
                          <S1Field
                            label="Offer Heading"
                            description="Main heading shown inside offer card"
                          >
                            <TextControl
                              value={rule.offer_heading}
                              onChange={(v) =>
                                updateField(index, "offer_heading", v)
                              }
                            />
                          </S1Field>
                          <S1Field
                            label="Offer Subheading"
                            description="Small description under heading"
                          >
                            <TextControl
                              value={rule.offer_subheading}
                              onChange={(v) =>
                                updateField(index, "offer_subheading", v)
                              }
                            />
                          </S1Field>
                          <S1Field
                            label="Show Product Image"
                            description="Display product image inside card"
                          >
                            <ToggleControl
                              checked={rule.show_product_image}
                              onChange={(v) =>
                                updateField(index, "show_product_image", v)
                              }
                            />
                          </S1Field>
                          <S1Field
                            label="Show Product Title"
                            description="Display product title"
                          >
                            <ToggleControl
                              checked={rule.show_product_title}
                              onChange={(v) =>
                                updateField(index, "show_product_title", v)
                              }
                            />
                          </S1Field>
                          <S1Field
                            label="Show Badge"
                            description="Display highlight badge"
                          >
                            <ToggleControl
                              checked={rule.show_discount_badge}
                              onChange={(v) =>
                                updateField(index, "show_discount_badge", v)
                              }
                            />
                          </S1Field>
                          {rule.show_discount_badge && (
                            <S1Field
                              label="Badge Text"
                              description="Badge label text"
                            >
                              <TextControl
                                value={rule.badge_text}
                                onChange={(v) =>
                                  updateField(index, "badge_text", v)
                                }
                              />
                            </S1Field>
                          )}
                        </S1FieldGroup>

                        <S1Field
                          label="Gift Message"
                          description="Message shown before the offer is unlocked"
                        >
                          <TextControl
                            value={rule.message}
                            onChange={(v) => updateField(index, "message", v)}
                          />
                        </S1Field>

                        <S1Field
                          label="Success Message"
                          description="Message shown after the offer has been successfully applied"
                        >
                          <TextControl
                            value={rule.success_message}
                            onChange={(v) =>
                              updateField(index, "success_message", v)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label="Show Progress Bar"
                          description="Display a progress bar indicating how close the customer is to unlocking the offer"
                        >
                          <ToggleControl
                            checked={rule.show_progress}
                            onChange={(v) =>
                              updateField(index, "show_progress", v)
                            }
                          />
                        </S1Field>

                        <DeviceSelector
                          value={rule.devices}
                          onChange={(v) => updateField(index, "devices", v)}
                        />
                      </div>
                    ),
                  },
                  {
                    id: "style",
                    label: "Style",
                    icon: ICONS.DESIGN,
                    content: (
                      <div className="store-one-rule-body">
                        {/* CARD */}

                        {/* <S1FieldGroup title="Layout Style">
                          <S1Field
                            label="Offer Layout"
                            description="Choose how the offer box should appear on the product page"
                          >
                            <SelectControl
                              value={rule.layout_style || "detailed"}
                              options={[
                                {
                                  label: "Detailed Layout",
                                  value: "detailed",
                                },
                                {
                                  label: "Minimal Layout",
                                  value: "minimal",
                                },
                              ]}
                              onChange={(v) =>
                                updateField(index, "layout_style", v)
                              }
                            />
                          </S1Field>
                        </S1FieldGroup> */}

                        <S1FieldGroup title="Card">
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Card Background", "th-store-one")}
                              value={rule.card_bg}
                              onChange={(v) => {
                                const updatedRule = { ...rule, card_bg: v };
                                updateField(index, "card_bg", v);
                                onLivePreview?.(updatedRule, index);
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
                                onLivePreview?.(updatedRule, index);
                              }}
                            />
                          </S1Field>
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
                                onLivePreview?.(updatedRule, index);
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
                                onLivePreview?.(updatedRule, index);
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
                                onLivePreview?.(updatedRule, index);
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
                                onLivePreview?.(updatedRule, index);
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
                                onLivePreview?.(updatedRule, index);
                              }}
                            />
                          </S1Field>
                        </S1FieldGroup>

                        {/* PROGRESS */}

                        <S1FieldGroup title="Progress Bar">
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Progress Fill", "th-store-one")}
                              value={rule.progress_fill}
                              onChange={(v) => {
                                const updatedRule = {
                                  ...rule,
                                  progress_fill: v,
                                };
                                updateField(index, "progress_fill", v);
                                onLivePreview?.(updatedRule, index);
                              }}
                            />
                          </S1Field>
                        </S1FieldGroup>

                        {/* MESSAGE */}

                        <S1FieldGroup title="Message">
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Message Color", "th-store-one")}
                              value={rule.message_color}
                              onChange={(v) => {
                                const updatedRule = {
                                  ...rule,
                                  message_color: v,
                                };
                                updateField(index, "message_color", v);
                                onLivePreview?.(updatedRule, index);
                              }}
                            />
                          </S1Field>

                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Success Color", "th-store-one")}
                              value={rule.success_color}
                              onChange={(v) => {
                                const updatedRule = {
                                  ...rule,
                                  success_color: v,
                                };
                                updateField(index, "success_color", v);
                                onLivePreview?.(updatedRule, index);
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
          onReset={() => updateAll([newSmartOfferRule()])}
        />
      </div>
    </div>
  );
}
