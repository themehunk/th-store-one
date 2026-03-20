/* ------------------------ imports ------------------------ */
import { useState, useEffect, useRef } from "@wordpress/element";
import {
  TextControl,
  SelectControl,
  ToggleControl,
} from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import Sortable from "sortablejs";
import UserCondition from "@storeone-global/UserCondition";
import MultiWooSearchSelector from "@storeone-global/MultiWooSearchSelector";
import ExcludeWooCondition from "@storeone-global/ExcludeWooCondition";
import TabSwitcher from "@storeone-global/TabSwitcher";
import THBackgroundControl from "@storeone-control/color";
import UniversalRangeControl from "@storeone-global/UniversalRangeControl";
import TrustBadgeStyleControl from "./TrustBadgeStyleControl";
import {
  CopyIcon,
  TrashIcon,
  DragHandleDots2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import { S1Field, S1FieldGroup } from "@storeone-global/S1Field";
import { ICONS } from "@storeone-global/icons";
import ResetModuleButton from "@storeone-global/ResetModuleButton";
import PlacementPriorityControl from "@storeone-global/PlacementPriorityControl";
import TrustBadgeSelector from "./TrustBadgeSelector";
import UniversalBorderControl from "@storeone-control/UniversalBorderControl";
/* Default Rule */
const newBadgesTRule = () => ({
  open: true,
  status: "active",
  badge_title: "Trust Badges",
  displayBadge:"s1-amount",
  show_badges: "all_products",
  products: [],
  categories: [],
  tags: [],

  exclude_products_enabled: false,
  exclude_products: [],

  exclude_categories_enabled: false,
  exclude_categories: [],

  exclude_tags_enabled: false,
  exclude_tags: [],

  flexible_id: crypto.randomUUID(),

  badges_type: "badges_images",
  badge_library: "default",
  badge_image: "",
  badge_css_type: "",
  badge_advance_type: "",
  uploaded_badges: [],

  placement: "after_summary",
  priority: 10,
  // NEW: exclude system
  user_condition: "all",
  exclude_enabled: false,
  allowed_roles: [],
  allowed_users: [],
  exclude_roles: [],
  exclude_users: [],
  exclude_users_enabled: false,
  badgetext: "Text",
  badge_style: {
    image_width: "100px",
    bgclr: "#0a70ed",
    textclr: "#fff",
    text_size: "18px",
    transform: {
      opacity: "100",
      rotateX: "0",
      rotateY: "1",
      rotateZ: "0",
    },
    flip: {
      enabled: false,
      orientation: "horizontal",
    },
    position: {
      mode: "custom",
      unit: "px",
      anchor: "top-left",
      top: "0",
      left: "0",
      bottom: "0",
      right: "0",
      position: "top",
      align: "left",
    },
    margin: {
      top: "5px",
      right: "5px",
      bottom: "5px",
      left: "5px",
    },
    padding: {
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
    border: {
      width: {
        top: "1px",
        right: "1px",
        bottom: "1px",
        left: "1px",
      },
      style: "solid",
      color: "#111",
      radius: {
        top: "4px",
        right: "4px",
        bottom: "4px",
        left: "4px",
      },
    },
  },
});
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
export default function TrustBadgesRules({ rules, onChange, onLivePreview }) {
  const menuItems = [
    { id: "settings", label: "Settings", icon: "SETTINGS" },
    { id: "user", label: "User Condition", icon: "USER" },
    { id: "design", label: "Badges Design", icon: "DESIGN" },
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

    let updatedRule = { ...arr[i], [field]: val };

    /*ONLY CSS TYPE */
    if (
      field === "badge_css_type" &&
      updatedRule.badges_type === "badges_css"
    ) {
      updatedRule = applyCssBadgeDefaults(updatedRule, val);
    }

    /* ADVANCE DEFAULT - on type select */
    if (field === "badges_type" && val === "badges_advance") {
      updatedRule = applyAdvanceBadgeDefaults(updatedRule, "one");
    }

    /* ADVANCE DEFAULT - on design change */
    if (
      field === "badge_advance_type" &&
      updatedRule.badges_type === "badges_advance"
    ) {
      updatedRule = applyAdvanceBadgeDefaults(updatedRule, val);
    }

    arr[i] = updatedRule;

    updateAll(arr);
    onLivePreview?.(updatedRule, i);
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
    const arr = [...rules, newBadgesTRule()];
    updateAll(arr);
    const newIndex = arr.length - 1;
    onLivePreview?.(arr[newIndex], newIndex);
  };

  /* ---------------- BUY LIST FUNCTIONS ---------------- */

  useEffect(() => {
    if (rules.length === 0) {
      updateAll([newBadgesTRule()]);
    } else {
      const arr = [...rules];
      arr[0].open = true;
      updateAll(arr);
    }
  }, []);

  const TRUST_BADGES_IMAGES = [
    {
      id: "black_friday",
      type: "image",
      url: "https://plugins.yithemes.com/yith-woocommerce-badge-management/wp-content/uploads/sites/489237/yith-badge-library-live-demo/image/black-friday-01.svg",
    },
    {
      id: "new_year",
      type: "image",
      url: "https://plugins.yithemes.com/yith-woocommerce-badge-management/wp-content/uploads/sites/489237/yith-badge-library-live-demo/image/new-year-01.svg",
    },
    {
      id: "last_minitue",
      type: "image",
      url: `${StoreOneAdmin.homeUrl}wp-content/plugins/store-one/assets/images/last_miniute.svg`,
    },
    {
      id: "buy_free",
      type: "image",
      url: `${StoreOneAdmin.homeUrl}wp-content/plugins/store-one/assets/images/buy_free.svg`,
    },
    {
      id: "buy_get_blue",
      type: "image",
      url: `${StoreOneAdmin.homeUrl}wp-content/plugins/store-one/assets/images/buy_get_blue.svg`,
    },
    {
      id: "christmas",
      type: "image",
      url: `${StoreOneAdmin.homeUrl}wp-content/plugins/store-one/assets/images/christmas.svg`,
    },
    
  ];

  const TRUST_BADGES_CSS = [
    {
      id: "new",
      label: "New",
      preview:
        "https://plugins.yithemes.com/dd58b7d04f54d5afda6424614772c9d6/wp-content/plugins/yith-woocommerce-badge-management-premium/assets/images/css-badge-previews/1.svg",
    },
    {
      id: "sale",
      label: "Sale",
      preview:
        "https://plugins.yithemes.com/dd58b7d04f54d5afda6424614772c9d6/wp-content/plugins/yith-woocommerce-badge-management-premium/assets/images/css-badge-previews/4.svg",
    },
    {
      id: "newsale",
      label: "NewSale",
      preview:
        "https://plugins.yithemes.com/f08ccb2bd05b3bfbef4dbd0af305e5ef/wp-content/plugins/yith-woocommerce-badge-management-premium/assets/images/css-badge-previews/5.svg",
    },
    {
      id: "sale_badge_pink",
      label: "sale_badge_pink",
      preview:
        `${StoreOneAdmin.homeUrl}wp-content/plugins/store-one/assets/images/sale_badge_pink.svg`,
    },
    {
      id: "saletxt",
      label: "saletxt",
      preview:
        `${StoreOneAdmin.homeUrl}wp-content/plugins/store-one/assets/images/sale.svg`,
    },
    
  ];

  const TRUST_BADGES_ADV = [
    {
      id: "one",
      label: "One",
      preview:
        "https://plugins.yithemes.com/3829c3a0d57b0af0843e4135c4e81633/wp-content/plugins/yith-woocommerce-badge-management-premium/assets/images/advanced-badge-previews/2.svg",
    },
    {
      id: "two",
      label: "Two",
      preview:
        "https://plugins.yithemes.com/3829c3a0d57b0af0843e4135c4e81633/wp-content/plugins/yith-woocommerce-badge-management-premium/assets/images/advanced-badge-previews/5.svg",
    },
    {
      id: "three",
      label: "Three",
      preview:
        "https://plugins.yithemes.com/f08ccb2bd05b3bfbef4dbd0af305e5ef/wp-content/plugins/yith-woocommerce-badge-management-premium/assets/images/advanced-badge-previews/8.svg",
    },
    {
      id: "four",
      label: "Four",
      preview:
        "https://plugins.yithemes.com/f08ccb2bd05b3bfbef4dbd0af305e5ef/wp-content/plugins/yith-woocommerce-badge-management-premium/assets/images/advanced-badge-previews/4.svg",
    },
    {
      id: "five",
      label: "Five",
      preview:
        "https://plugins.yithemes.com/resources/yith-woocommerce-badge-management/badges/previews/css/9.svg",
    },
    {
      id: "daimond",
      label: "daimond",
      preview: `${StoreOneAdmin.homeUrl}wp-content/plugins/store-one/assets/images/daimond.svg`,
    },
    {
      id: "circle",
      label: "cirlce",
      preview: `${StoreOneAdmin.homeUrl}wp-content/plugins/store-one/assets/images/circle.svg`,
    },
  ];

  // for type css helper deafult
  const applyCssBadgeDefaults = (rule, type) => {
    const currentStyle = rule.badge_style || {};

    if (type === "new") {
      return {
        ...rule,
        badge_css_type: type,
        badge_style: {
          ...currentStyle,
          bgclr: "#2563eb",
          textclr: "#ffffff",
          border: {
            ...currentStyle.border,
            color: "#1d4ed8",
          },
        },
      };
    }

    if (type === "newsale") {
      return {
        ...rule,
        badge_css_type: type,
        badge_style: {
          ...currentStyle,
          bgclr: "#45d0eb",
          textclr: "#ffffff",
        },
      };
    }
    if (type === "sale") {
      return {
        ...rule,
        badge_css_type: type,
        badge_style: {
          ...currentStyle,
          bgclr: "#f97316",
          textclr: "#ffffff",
          border: {
            ...currentStyle.border,
            color: "#ea580c",
          },
        },
      };
    }
    if (type === "sale_badge_pink") {
      return {
        ...rule,
        badge_css_type: type,
        badge_style: {
          ...currentStyle,
          bgclr: "#d4547e",
          textclr: "#ffffff",
          
        },
      };
      
    }
    if (type === "saletxt") {
      return {
        ...rule,
        badge_css_type: type,
        badge_style: {
          ...currentStyle,
          bgclr: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          textclr: "#1e293b",
          
        },
      };
      
    }

    return rule;
  };
// advance color default
// for advance badge default
const applyAdvanceBadgeDefaults = (rule, type) => {
  const currentStyle = rule.badge_style || {};

  if (type === "one") {
    return {
      ...rule,
      badge_advance_type: type,
      badge_style: {
        ...currentStyle,
        bgclr: "#f97316", // orange
        textclr: "#ffffff",
      },
    };
  }

  if (type === "two") {
    return {
      ...rule,
      badge_advance_type: type,
      badge_style: {
        ...currentStyle,
        bgclr: "#d946ef",
        textclr: "#ffffff",
      },
    };
  }
  if (type === "three") {
    return {
      ...rule,
      badge_advance_type: type,
      badge_style: {
        ...currentStyle,
        bgclr: "#113d7a",
        textclr: "#ffffff",
      },
    };
  }
  if (type === "four") {
    return {
      ...rule,
      badge_advance_type: type,
      badge_style: {
        ...currentStyle,
        bgclr: "#47DCBF",
        textclr: "#ffffff",
      },
    };
  }
  if (type === "five") {
    return {
      ...rule,
      badge_advance_type: type,
      badge_style: {
        ...currentStyle,
        bgclr: "#da9005",
        textclr: "#ffffff",
      },
    };
  }
  if (type === "daimond") {
    return {
      ...rule,
      badge_advance_type: type,
      badge_style: {
        ...currentStyle,
        bgclr: "linear-gradient(135deg, #ff7a18, #ff3d00)",
        textclr: "#ffffff",
      },
    };
  }
   if (type === "circle") {
    return {
      ...rule,
      badge_advance_type: type,
      badge_style: {
        ...currentStyle,
        bgclr: "radial-gradient(circle, #ff4d6d 0%, #ff0033 100%)",
        textclr: "#ffffff",
      },
    };
  }
  return rule;
};
  return (
    <div className="store-one-rules-container">
      <h3 className="store-one-section-title">
        {__("Trust Badges", "store-one")}
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
                  __("Rule %d: %s", "store-one"),
                  index + 1,
                  rule.badge_title || __("Untitled", "store-one"),
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
                        <S1Field label={__("Status", "store-one")}>
                          <SelectControl
                            value={rule.status}
                            options={[
                              {
                                label: __("Active", "store-one"),
                                value: "active",
                              },
                              {
                                label: __("Inactive", "store-one"),
                                value: "inactive",
                              },
                            ]}
                            onChange={(v) => updateField(index, "status", v)}
                          />
                        </S1Field>
                        <S1Field label={__("Title", "store-one")}>
                          <TextControl
                            value={rule.badge_title}
                            onChange={(v) =>
                              updateField(index, "badge_title", v)
                            }
                          />
                        </S1Field>
                        <S1Field label={__("Show Badges", "store-one")}>
                          <SelectControl
                            value={rule.show_badges}
                            options={[
                              {
                                label: __("All Products", "store-one"),
                                value: "all_products",
                              },
                              {
                                label: __("Only Recent Products", "store-one"),
                                value: "recent_products",
                              },
                              {
                                label: __("Sale Products", "store-one"),
                                value: "sale_products",
                              },
                              {
                                label: __("Featured Product", "store-one"),
                                value: "featured_products",
                              },
                              {
                                label: __("In Stock Products", "store-one"),
                                value: "in_stock_products",
                              },
                              {
                                label: __("Out Of Stock Products", "store-one"),
                                value: "out_stock_products",
                              },
                              {
                                label: __("Back Order Products", "store-one"),
                                value: "back_order_products",
                              },
                              {
                                label: __("Low Stock Products", "store-one"),
                                value: "low_stock_products",
                              },
                              {
                                label: __("Best Seller", "store-one"),
                                value: "best_seller_products",
                              },
                              {
                                label: __("Specific Product", "store-one"),
                                value: "specific_products",
                              },
                              {
                                label: __("Specific Categories", "store-one"),
                                value: "specific_categories",
                              },
                              {
                                label: __("Specific Tags", "store-one"),
                                value: "specific_tags",
                              },
                            ]}
                            onChange={(v) =>
                              updateField(index, "show_badges", v)
                            }
                          />
                        </S1Field>

                        {rule.show_badges === "specific_products" && (
                          <MultiWooSearchSelector
                            searchType="product"
                            label={__("Select Products", "store-one")}
                            value={rule.products || []}
                            onChange={(items) =>
                              updateField(index, "products", items)
                            }
                            detailedView={true}
                          />
                        )}
                        {rule.show_badges === "specific_categories" && (
                          <MultiWooSearchSelector
                            searchType="category"
                            label={__("Select Categories", "store-one")}
                            value={rule.categories || []}
                            onChange={(items) =>
                              updateField(index, "categories", items)
                            }
                            detailedView={true}
                          />
                        )}
                        {rule.show_badges === "specific_tags" && (
                          <MultiWooSearchSelector
                            searchType="tag"
                            label={__("Select Tags", "store-one")}
                            value={rule.tags || []}
                            onChange={(items) =>
                              updateField(index, "tags", items)
                            }
                            detailedView={true}
                          />
                        )}
                        <ExcludeWooCondition
                          label={__("Exclude products", "store-one")}
                          searchType="product"
                          enabled={rule.exclude_products_enabled}
                          items={rule.exclude_products}
                          onToggle={(v) =>
                            updateField(index, "exclude_products_enabled", v)
                          }
                          onChangeItems={(items) =>
                            updateField(index, "exclude_products", items)
                          }
                          detailedView={true}
                        />
                        <ExcludeWooCondition
                          label={__("Exclude categories", "store-one")}
                          searchType="category"
                          enabled={rule.exclude_categories_enabled}
                          items={rule.exclude_categories}
                          onToggle={(v) =>
                            updateField(index, "exclude_categories_enabled", v)
                          }
                          onChangeItems={(items) =>
                            updateField(index, "exclude_categories", items)
                          }
                          detailedView={true}
                        />
                        <ExcludeWooCondition
                          label={__("Exclude product tags", "store-one")}
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
                      </div>
                    ),
                  },
                  {
                    id: menuItems[1].id,
                    label: menuItems[1].label,
                    icon: ICONS[menuItems[1].icon],
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

                  
                  {
                    id: menuItems[2].id,
                    label: menuItems[2].label,
                    icon: ICONS[menuItems[2].icon],
                    content: (
                      <div className="store-one-rule-body">
                        <S1Field
                          label={__("Bagdes Type", "store-one")}
                          visible={true}
                        >
                          <SelectControl
                            value={rule.badges_type}
                            options={[
                              {
                                label: __("Text", "store-one"),
                                value: "badges_text",
                              },
                              {
                                label: __("Images", "store-one"),
                                value: "badges_images",
                              },
                              {
                                label: __("CSS", "store-one"),
                                value: "badges_css",
                              },
                              {
                                label: __("Advance", "store-one"),
                                value: "badges_advance",
                              },
                            ]}
                            onChange={(v) =>
                              updateField(index, "badges_type", v)
                            }
                          />
                        </S1Field>
                        {rule.badges_type === "badges_text" && (
                          <>
                            <S1Field label={__("Badge Text", "store-one")}>
                              <TextControl
                                value={rule.badgetext || ""}
                                onChange={(v) =>
                                  updateField(index, "badgetext", v)
                                }
                              />
                            </S1Field>
                            <S1FieldGroup title={__("Style", "store-one")}>
                            <UniversalRangeControl
                              label={__("Font Size", "store-one")}
                              responsive={false}
                              value={rule.badge_style?.text_size}
                              units={["px"]}
                              min={1}
                              max={100}
                              onChange={(v) => {
                                const updatedBadgeStyle = {
                                  ...rule.badge_style,
                                  text_size: v,
                                };

                                updateField(
                                  index,
                                  "badge_style",
                                  updatedBadgeStyle,
                                );
                              }}
                              defaultValue="18px"
                            />
                            <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Background", "store-one")}
                              value={rule.badge_style?.bgclr || "#ffffff"}
                              onChange={(v) => {
                                const updatedBadgeStyle = {
                                  ...rule.badge_style,
                                  bgclr: v,
                                };

                                const updatedRule = {
                                  ...rule,
                                  badge_style: updatedBadgeStyle,
                                };

                                updateField(
                                  index,
                                  "badge_style",
                                  updatedBadgeStyle,
                                );
                                onLivePreview?.(updatedRule, index);
                              }}
                            />
                            </S1Field>
                            <S1Field>
                              <THBackgroundControl
                                allowGradient={true}
                                label={__("Text", "store-one")}
                                value={rule.badge_style?.textclr || "#111"}
                                onChange={(v) => {
                                  const updatedBadgeStyle = {
                                    ...rule.badge_style,
                                    textclr: v,
                                  };

                                  const updatedRule = {
                                    ...rule,
                                    badge_style: updatedBadgeStyle,
                                  };

                                  updateField(
                                    index,
                                    "badge_style",
                                    updatedBadgeStyle,
                                  );
                                  onLivePreview?.(updatedRule, index);
                                }}
                              />
                              </S1Field>
                            </S1FieldGroup>

                          </>
                        )}
                        {rule.badges_type === "badges_images" && (
                          <>
                              <TrustBadgeSelector
                                title={__("Images Badges", "store-one")}
                                rule={rule}
                                index={index}
                                updateField={updateField}
                                presetBadges={TRUST_BADGES_IMAGES}
                                allowUpload={true}
                                badgeType="image"
                              />
                            <UniversalRangeControl
                              label={__("Width", "store-one")}
                              responsive={false}
                              value={rule.badge_style?.image_width}
                              units={["px"]}
                              min={1}
                              max={500}
                              onChange={(v) => {
                                const updatedBadgeStyle = {
                                  ...rule.badge_style,
                                  image_width: v,
                                };

                                updateField(
                                  index,
                                  "badge_style",
                                  updatedBadgeStyle,
                                );
                              }}
                              defaultValue="100px"
                            />
                          </>
                        )}
                        {rule.badges_type === "badges_css" && (
                          <>
                           
                              <TrustBadgeSelector
                                title={__("Css Badges", "store-one")}
                                rule={rule}
                                index={index}
                                updateField={updateField}
                                presetBadges={TRUST_BADGES_CSS}
                                allowUpload={false}
                                badgeType="css"
                              />
                           
                            <S1Field label={__("Badge Text", "store-one")}>
                              <TextControl
                                value={rule.badgetext || ""}
                                onChange={(v) =>
                                  updateField(index, "badgetext", v)
                                }
                              />
                            </S1Field>
                             <UniversalRangeControl
                              label={__("Font Size", "store-one")}
                              responsive={false}
                              value={rule.badge_style?.text_size}
                              units={["px"]}
                              min={1}
                              max={100}
                              onChange={(v) => {
                                const updatedBadgeStyle = {
                                  ...rule.badge_style,
                                  text_size: v,
                                };

                                updateField(
                                  index,
                                  "badge_style",
                                  updatedBadgeStyle,
                                );
                              }}
                              defaultValue="18px"
                            />
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Background", "store-one")}
                              value={rule.badge_style?.bgclr || "#ffffff"}
                              onChange={(v) => {
                                const updatedBadgeStyle = {
                                  ...rule.badge_style,
                                  bgclr: v,
                                };

                                const updatedRule = {
                                  ...rule,
                                  badge_style: updatedBadgeStyle,
                                };

                                updateField(
                                  index,
                                  "badge_style",
                                  updatedBadgeStyle,
                                );
                                onLivePreview?.(updatedRule, index);
                              }}
                            />
                           
                              <THBackgroundControl
                                allowGradient={true}
                                label={__("Text", "store-one")}
                                value={rule.badge_style?.textclr || "#111"}
                                onChange={(v) => {
                                  const updatedBadgeStyle = {
                                    ...rule.badge_style,
                                    textclr: v,
                                  };

                                  const updatedRule = {
                                    ...rule,
                                    badge_style: updatedBadgeStyle,
                                  };

                                  updateField(
                                    index,
                                    "badge_style",
                                    updatedBadgeStyle,
                                  );
                                  onLivePreview?.(updatedRule, index);
                                }}
                              />
                            
                            
                          </>
                        )}
                        {rule.badges_type === "badges_advance" && (
                          <>
                           
                              <TrustBadgeSelector
                                 title={__("Advance Badges", "store-one")}
                                rule={rule}
                                index={index}
                                updateField={updateField}
                                presetBadges={TRUST_BADGES_ADV}
                                allowUpload={false}
                                badgeType="advance"
                              />

                              <S1Field label={__("Display", "store-one")}>
                              <SelectControl
                                value={rule.displayBadge}
                                options={[
                                  {
                                    label: __("Amount", "store-one"),
                                    value: "s1-amount",
                                  },
                                  {
                                    label: __("Percentage", "store-one"),
                                    value: "s1-percent",
                                  },
                                ]}
                                onChange={(v) => updateField(index, "displayBadge", v)}
                              />
                            </S1Field>
                               <THBackgroundControl
                              allowGradient={true}
                              label={__("Background", "store-one")}
                              value={rule.badge_style?.bgclr || "#ffffff"}
                              onChange={(v) => {
                                const updatedBadgeStyle = {
                                  ...rule.badge_style,
                                  bgclr: v,
                                };

                                const updatedRule = {
                                  ...rule,
                                  badge_style: updatedBadgeStyle,
                                };

                                updateField(
                                  index,
                                  "badge_style",
                                  updatedBadgeStyle,
                                );
                                onLivePreview?.(updatedRule, index);
                              }}
                            />
                            <THBackgroundControl
                                allowGradient={true}
                                label={__("Text", "store-one")}
                                value={rule.badge_style?.textclr || "#111"}
                                onChange={(v) => {
                                  const updatedBadgeStyle = {
                                    ...rule.badge_style,
                                    textclr: v,
                                  };

                                  const updatedRule = {
                                    ...rule,
                                    badge_style: updatedBadgeStyle,
                                  };

                                  updateField(
                                    index,
                                    "badge_style",
                                    updatedBadgeStyle,
                                  );
                                  onLivePreview?.(updatedRule, index);
                                }}
                              />

                            
                          </>
                        )}
                        <TrustBadgeStyleControl
                          value={rule.badge_style}
                          badgeType={rule.badges_type}
                          onChange={(v) => updateField(index, "badge_style", v)}
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
          {__("+ Add New Rule", "store-one")}
        </div>
        <ResetModuleButton
          moduleId="trust-badges"
          onReset={() => {
            updateAll([newBadgesTRule()]);
          }}
        />
      </div>
    </div>
  );
}
