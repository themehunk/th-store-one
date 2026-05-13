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
import UserCondition from "@th-storeone-global/UserCondition";

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
const newPreOrderRule = () => ({
  flexible_id: crypto.randomUUID(),
  open: true,
  status: "active",
  title: "Pre order Rule",

  /* BASIC */
  preorder_mode: "preorder",

  button_text: "Pre Order Now",

  preorder_message: "This product is available for pre-order.",

  enable_countdown: false,

  /* DATE */
  date_mode: "manual",

  availability_date: "",

  auto_disable: false,

  /* PRICE */
  price_type: "product_price",

  price_value: 0,

  /* USER */
  logged_in_only: false,

  user_condition: "all",
  exclude_enabled: false,
  allowed_roles: [],
  allowed_users: [],
  exclude_roles: [],
  exclude_users: [],
  exclude_users_enabled: false,

  /* LIMIT */
  preorder_limit: 0,

  /* DISPLAY */
  enable_single_page: true,

  single_placement: "woocommerce_after_add_to_cart_form",

  single_priority: 10,

  enable_shop_page: false,

  shop_position: "after_price",

  /* VISIBILITY */
  trigger_type: "all_products",

  products: [],
  categories: [],
  tags: [],

  exclude_products_enabled: false,
  exclude_products: [],

  exclude_categories_enabled: false,
  exclude_categories: [],

  hide_outofstock: false,

  devices: ["desktop", "tablet", "mobile"],

  /* STYLE */
  bg_color: "#ffffff",

  border_color: "#e5e7eb",

  text_color: "#111827",

  button_bg: "#111827",

  button_color: "#ffffff",

  font_size: 14,

  border_radius: 10,

  padding_y: 12,

  padding_x: 18,
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
export default function PreOrderRules({ rules, onChange, onLivePreview }) {
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

  const addRule = () => updateAll([...rules, newPreOrderRule()]);

  const removeRule = (i) => {
    updateAll(rules.filter((_, idx) => idx !== i));
  };

  const duplicateRule = (i) => {
    const copy = {
      ...rules[i],
      flexible_id: crypto.randomUUID(),
    };

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
    if (!rules.length) {
      updateAll([newPreOrderRule()]);
    }
  }, []);

  return (
    <div className="store-one-rules-container">
      <h3 className="store-one-section-title">Pre Order</h3>

      <SortableWrapper items={rules} onSortEnd={reorder}>
        {rules.map((rule, index) => (
          <div key={rule.flexible_id} className="store-one-rule-item">
            {/* HEADER */}
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
                        <S1FieldGroup title="Pre-order Settings">
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
                          <S1Field
                            label="Pre-order Mode"
                            description="Choose preorder behavior."
                          >
                            <SelectControl
                              value={rule.preorder_mode}
                              options={[
                                {
                                  label: "Pre Order",
                                  value: "preorder",
                                },
                                {
                                  label: "Coming Soon",
                                  value: "coming_soon",
                                },
                              ]}
                              onChange={(v) =>
                                updateField(index, "preorder_mode", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Date Mode"
                            description="Choose availability date behavior."
                          >
                            <SelectControl
                              value={rule.date_mode}
                              options={[
                                {
                                  label: "No Date - End Pre-order Manually",
                                  value: "manual",
                                },
                                {
                                  label: "Calendar Date",
                                  value: "calendar",
                                },
                              ]}
                              onChange={(v) =>
                                updateField(index, "date_mode", v)
                              }
                            />
                          </S1Field>

                          {rule.date_mode === "calendar" && (
                            <S1Field
                              label="Availability Date"
                              description="Select product launch date."
                            >
                              <TextControl
                                type="datetime-local"
                                value={rule.availability_date}
                                onChange={(v) =>
                                  updateField(index, "availability_date", v)
                                }
                              />
                            </S1Field>
                          )}

                          <S1Field
                            label="Auto Disable"
                            description="Automatically disable preorder after date."
                          >
                            <ToggleControl
                              checked={rule.auto_disable}
                              onChange={(v) =>
                                updateField(index, "auto_disable", v)
                              }
                            />
                          </S1Field>
                        </S1FieldGroup>

                        {/* PRICE */}
                        <S1FieldGroup title="Pre-order Pricing">
                          <S1Field
                            label="Pricing Method"
                            description="Choose how the pre-order price should be calculated for customers."
                          >
                            <SelectControl
                              value={rule.price_type}
                              options={[
                                {
                                  label: "Use Product Price",
                                  value: "product_price",
                                },
                                {
                                  label: "Set Fixed Pre-order Price",
                                  value: "fixed_price",
                                },
                                {
                                  label: "Discount by Percentage (%)",
                                  value: "discount_percentage",
                                },
                                {
                                  label: "Discount by Fixed Amount",
                                  value: "discount_fixed",
                                },
                                {
                                  label: "Increase by Percentage (%)",
                                  value: "increase_percentage",
                                },
                                {
                                  label: "Increase by Fixed Amount",
                                  value: "increase_fixed",
                                },
                              ]}
                              onChange={(v) =>
                                updateField(index, "price_type", v)
                              }
                            />
                          </S1Field>

                          {rule.price_type !== "product_price" && (
                            <S1Field
                              label={
                                rule.price_type === "fixed_price"
                                  ? "Fixed Price"
                                  : rule.price_type === "discount_percentage"
                                  ? "Discount Percentage"
                                  : rule.price_type === "discount_fixed"
                                  ? "Discount Amount"
                                  : rule.price_type === "increase_percentage"
                                  ? "Increase Percentage"
                                  : "Increase Amount"
                              }
                              description={
                                rule.price_type === "fixed_price"
                                  ? "Set a custom fixed price for pre-orders."
                                  : rule.price_type === "discount_percentage"
                                  ? "Reduce the product price by a percentage amount."
                                  : rule.price_type === "discount_fixed"
                                  ? "Reduce the product price by a fixed amount."
                                  : rule.price_type === "increase_percentage"
                                  ? "Increase the product price by a percentage amount."
                                  : "Increase the product price by a fixed amount."
                              }
                            >
                              <div className="store-one-price-input-wrap">
                                <input
                                  type="number"
                                  className="store-one-price-input"
                                  min="0"
                                  step="0.01"
                                  value={rule.price_value}
                                  onChange={(e) =>
                                    updateField(
                                      index,
                                      "price_value",
                                      parseFloat(e.target.value || 0),
                                    )
                                  }
                                />

                                <span className="store-one-price-suffix">
                                  {rule.price_type === "discount_percentage" ||
                                  rule.price_type === "increase_percentage"
                                    ? "%"
                                    : "$"}
                                </span>
                              </div>
                            </S1Field>
                          )}
                        </S1FieldGroup>

                        {/* CONTENT */}
                        <S1FieldGroup title="Content">
                          <S1Field
                            label="Button Text"
                            description="Preorder button label."
                          >
                            <TextControl
                              value={rule.button_text}
                              onChange={(v) =>
                                updateField(index, "button_text", v)
                              }
                            />
                          </S1Field>

                          <S1Field
                            label="Message"
                            description="Show preorder message."
                          >
                            <TextControl
                              value={rule.preorder_message}
                              onChange={(v) =>
                                updateField(index, "preorder_message", v)
                              }
                            />
                          </S1Field>

                          {/* <S1Field
                            label="Enable Countdown"
                            description="Display countdown timer."
                          >
                            <ToggleControl
                              checked={rule.enable_countdown}
                              onChange={(v) =>
                                updateField(index, "enable_countdown", v)
                              }
                            />
                          </S1Field> */}
                        </S1FieldGroup>

                        <UniversalRangeControl
                          label="Preorder Limit"
                          description="Maximum preorder quantity."
                          value={String(rule.preorder_limit)}
                          min={0}
                          max={1000}
                          onChange={(v) =>
                            updateField(index, "preorder_limit", parseInt(v))
                          }
                        />
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
                        <S1FieldGroup title="Single Product Page">
                          <S1Field
                            label="Enable Single Page"
                            description="Show preorder on single product page."
                          >
                            <ToggleControl
                              checked={rule.enable_single_page}
                              onChange={(v) =>
                                updateField(index, "enable_single_page", v)
                              }
                            />
                          </S1Field>

                          {rule.enable_single_page && (
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
                          )}
                        </S1FieldGroup>

                        <S1FieldGroup title="Archive / Shop Page">
                          <S1Field
                            label="Enable Shop Page"
                            description="Display preorder on shop/archive pages."
                          >
                            <ToggleControl
                              checked={rule.enable_shop_page}
                              onChange={(v) =>
                                updateField(index, "enable_shop_page", v)
                              }
                            />
                          </S1Field>

                          {rule.enable_shop_page && (
                            <S1Field
                              label="Shop Position"
                              description="Choose archive placement."
                            >
                              <SelectControl
                                value={rule.shop_position}
                                options={[
                                  {
                                    label: "After Title",
                                    value: "after_title",
                                  },
                                  {
                                    label: "After Price",
                                    value: "after_price",
                                  },
                                  {
                                    label: "Before Add To Cart",
                                    value: "before_add_to_cart",
                                  },
                                  {
                                    label: "After Add To Cart",
                                    value: "after_add_to_cart",
                                  },
                                ]}
                                onChange={(v) =>
                                  updateField(index, "shop_position", v)
                                }
                              />
                            </S1Field>
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
                        <S1Field
                          label="Trigger Type"
                          description="Choose where preorder should apply."
                        >
                          <SelectControl
                            value={rule.trigger_type}
                            options={[
                              {
                                label: "All Products",
                                value: "all_products",
                              },
                              {
                                label: "Specific Products",
                                value: "specific_products",
                              },
                              {
                                label: "Specific Categories",
                                value: "specific_categories",
                              },
                            ]}
                            onChange={(v) =>
                              updateField(index, "trigger_type", v)
                            }
                          />
                        </S1Field>

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

                        <ExcludeWooCondition
                          label="Exclude Products"
                          searchType="product"
                          enabled={rule.exclude_products_enabled}
                          items={rule.exclude_products || []}
                          onToggle={(v) =>
                            updateField(index, "exclude_products_enabled", v)
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
                            updateField(index, "exclude_categories_enabled", v)
                          }
                          onChangeItems={(items) =>
                            updateField(index, "exclude_categories", items)
                          }
                          detailedView={true}
                        />

                        <S1Field
                          label="Hide Out Of Stock"
                          description="Do not show preorder on out of stock products."
                        >
                          <ToggleControl
                            checked={rule.hide_outofstock}
                            onChange={(v) =>
                              updateField(index, "hide_outofstock", v)
                            }
                          />
                        </S1Field>

                        {/* <S1FieldGroup title="Devices">
                          <DeviceSelector
                            value={rule.devices}
                            onChange={(v) => updateField(index, "devices", v)}
                          />
                        </S1FieldGroup> */}
                      </div>
                    ),
                  },
                  /* ================= USERCONDITION ================= */
                  {
                    id: "user",
                    label: "User Role",
                    icon: ICONS.USER,
                    content: (
                      <div className="store-one-rule-body">
                        <UserCondition
                          rule={rule}
                          index={index}
                          updateField={updateField}
                        />
                      </div>
                    ),
                  },

                  /* ================= STYLE ================= */
                  {
                    id: "style",
                    label: "Style",
                    icon: ICONS.DESIGN,

                    content: (
                      <div className="store-one-rule-body">
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Background Color", "th-store-one")}
                            value={rule.bg_color}
                            onChange={(v) => updateField(index, "bg_color", v)}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Border Color", "th-store-one")}
                            value={rule.border_color}
                            onChange={(v) =>
                              updateField(index, "border_color", v)
                            }
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Text Color", "th-store-one")}
                            value={rule.text_color}
                            onChange={(v) =>
                              updateField(index, "text_color", v)
                            }
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Button Background", "th-store-one")}
                            value={rule.button_bg}
                            onChange={(v) => updateField(index, "button_bg", v)}
                          />
                        </S1Field>

                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Button Text Color", "th-store-one")}
                            value={rule.button_color}
                            onChange={(v) =>
                              updateField(index, "button_color", v)
                            }
                          />
                        </S1Field>

                        <UniversalRangeControl
                          label="Font Size"
                          value={String(rule.font_size)}
                          min={10}
                          max={30}
                          onChange={(v) =>
                            updateField(index, "font_size", parseInt(v))
                          }
                        />

                        <UniversalRangeControl
                          label="Border Radius"
                          value={String(rule.border_radius)}
                          min={0}
                          max={50}
                          onChange={(v) =>
                            updateField(index, "border_radius", parseInt(v))
                          }
                        />

                        <UniversalRangeControl
                          label="Vertical Padding"
                          value={String(rule.padding_y)}
                          min={0}
                          max={40}
                          onChange={(v) =>
                            updateField(index, "padding_y", parseInt(v))
                          }
                        />

                        <UniversalRangeControl
                          label="Horizontal Padding"
                          value={String(rule.padding_x)}
                          min={0}
                          max={50}
                          onChange={(v) =>
                            updateField(index, "padding_x", parseInt(v))
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

      {/* FOOTER */}
      <div className="store-one-rules-footer">
        <div className="store-one-add-rule" onClick={addRule}>
          + Add Rule
        </div>

        <ResetModuleButton
          moduleId="pre-order"
          onReset={() => onChange([newPreOrderRule()])}
        />
      </div>
    </div>
  );
}
