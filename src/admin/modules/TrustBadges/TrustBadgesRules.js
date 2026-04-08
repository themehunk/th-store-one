/* ------------------------ imports ------------------------ */
import { useState, useEffect, useRef } from "@wordpress/element";
import {
  TextControl,
  SelectControl,
  ToggleControl,
} from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import Sortable from "sortablejs";
import UserCondition from "@th-storeone-global/UserCondition";
import MultiWooSearchSelector from "@th-storeone-global/MultiWooSearchSelector";
import ExcludeWooCondition from "@th-storeone-global/ExcludeWooCondition";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import THBackgroundControl from "@th-storeone-control/color";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import TrustBadgeStyleControl from "./TrustBadgeStyleControl";
import UniversalDimensionControl from "@th-storeone-control/UniversalDimensionControl";
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
import TrustBadgeSelector from "./TrustBadgeSelector";

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

  badges_type: "badges_text",
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
  badgetext: "Sale!",
  badge_style: {
    image_width: "100px",
    bgclr: "#0a70ed",
    textclr: "#fff",
    text_size: "12px",
    transform: {
      opacity: "100",
      rotateX: "0",
      rotateY: "0",
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
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
    padding: {
      top: "6px",
      right: "8px",
      bottom: "6px",
      left: "8px",
    },
    border: {
      width: {
        top: "1px",
        right: "1px",
        bottom: "1px",
        left: "1px",
      },
      style: "solid",
      color: "#0a70ed",
      radius: {
        top: "4px",
        right: "4px",
        bottom: "4px",
        left: "4px",
      },
    },
  },
  enableLoop: true,
  enableSingle: true,
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

    /*APPLY ONLY WHEN TYPE CHANGES */
      if (field === "badges_type" && val === "badges_text") {
        updatedRule = applyTextBadgeDefaults(updatedRule, val);
      }
     

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
      id: "last_minitue",
      type: "image",
      url: `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/last_miniute.svg`,
    },
    {
      id: "buy_free",
      type: "image",
      url: `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/buy_free.svg`,
    },
    {
      id: "buy_get_blue",
      type: "image",
      url: `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/buy_get_blue.svg`,
    },
    {
      id: "christmas",
      type: "image",
      url: `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/christmas.svg`,
    },
    
  ];

  const TRUST_BADGES_CSS = [
    {
      id: "new",
      label: "New",
      preview:
        `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/new.svg`,
    },
    {
      id: "sale",
      label: "Sale",
      preview:
        `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/sale1.svg`,
    },
    {
      id: "newsale",
      label: "NewSale",
      preview:
        `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/newsale.svg`,
    },
    {
      id: "sale_badge_pink",
      label: "sale_badge_pink",
      preview:
        `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/sale_badge_pink.svg`,
    },
    {
      id: "saletxt",
      label: "saletxt",
      preview:
        `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/sale.svg`,
    },
    
  ];

  const TRUST_BADGES_ADV = [
    {
      id: "one",
      label: "One",
      preview:
        `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/circle1.svg`,
    },
    {
      id: "two",
      label: "Two",
      preview:
        `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/circle2.svg`,
    },
    {
      id: "four",
      label: "Four",
      preview:
        `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/cornerribbon.svg`,
    },
    {
      id: "five",
      label: "Five",
      preview:
        `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/lastmint.svg`,
    },
    {
      id: "daimond",
      label: "daimond",
      preview: `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/daimond.svg`,
    },
    {
      id: "circle",
      label: "cirlce",
      preview: `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/circle.svg`,
    },
    {
      id: "simplecircle",
      label: "simplecircle",
      preview: `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/simplecircle.svg`,
    },
    {
      id: "simplenew",
      label: "simplenew",
      preview: `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/simplenew.svg`,
    },
    {
      id: "simpleaval",
      label: "simpleaval",
      preview: `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/badgesM/simpleavl.svg`,
    },
  ];

  const applyTextBadgeDefaults = (rule, type) => {
    const currentStyle = rule.badge_style || {}; 
    return {
        ...rule,
        badge_css_type: type,
        badgetext: "Sale!",
        badge_style: {
          ...currentStyle,
          bgclr: "#0a70ed",
          textclr: "#ffffff",
          text_size: "12px",
          border: {
            ...currentStyle.border,
            color: "#0a70ed",
          },
        
        padding: {
          top: "6px",
          right: "8px",
          bottom: "6px",
          left: "8px",
        },
         margin: {
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
          },
          position: {
          mode: "custom",
          unit: "px",
          anchor: "top-left",
          top: "0",
          left: "0",
        },
        },
      }; 
  }

  // for type css helper deafult
  const applyCssBadgeDefaults = (rule, type) => {
    const currentStyle = rule.badge_style || {};

    if (type === "new") {
      return {
        ...rule,
        badge_css_type: type,
        badge_style: {
          ...currentStyle,
          bgclr: "#8BC34A",
          textclr: "#ffffff",
          text_size: "12px",
          border: {
            ...currentStyle.border,
            color: "#8BC34A",
          },
        
        padding: {
          top: "6px",
          right: "12px",
          bottom: "6px",
          left: "12px",
        },
         margin: {
            top: "2px",
            right: "2px",
            bottom: "2px",
            left: "2px",
          },
          position: {
          mode: "custom",
          unit: "px",
          anchor: "top-left",
          top: "0",
          left: "0",
        },
        },
      };
    }

    if (type === "newsale") {
      return {
        ...rule,
        badge_css_type: type,
       badgetext: "SALE!",
        badge_style: {
          ...currentStyle,
          bgclr: "#45d0eb",
          textclr: "#ffffff",
          padding: {
          top: "6px",
          right: "12px",
          bottom: "6px",
          left: "6px",
        },
          margin: {
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
          },
          position: {
            mode: "custom",
            unit: "px",
            anchor: "top-right",
            top: "0",
            right: "0",
          },
         },
         
       };
    }
    if (type === "sale") {
      return {
        ...rule,
        badge_css_type: type,
         badgetext: "NEW!",
        badge_style: {
          ...currentStyle,
          bgclr: "#FF5722",
          textclr: "#ffffff",
          text_size: "12px",
          border: {
            ...currentStyle.border,
            color: "#FF5722",
            radius: {
            top: "4px",
            right: "4px",
            bottom: "4px",
            left: "4px",
             },
          },
          padding: {
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
          },
          margin: {
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
          },
          position: {
            mode: "custom",
            unit: "px",
            anchor: "top-left",
            top: "12",
            left: "12",
          },
        },
      };
    }
    if (type === "sale_badge_pink") {
      return {
        ...rule,
        badge_css_type: type,
        badgetext: "SALE!",
        badge_style: {
          ...currentStyle,
          bgclr: "#d4547e",
          textclr: "#ffffff",
          padding: {
          top: "5px",
          right: "5px",
          bottom: "5px",
          left: "5px",
        },
          margin: {
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
          },
          position: {
            mode: "custom",
            unit: "px",
            anchor: "top-left",
            top: "12",
            left: "12",
          },
         
          
        },
      };
      
    }
    if (type === "saletxt") {
      return {
        ...rule,
        badge_css_type: type,
        badgetext: "SALE!",
        badge_style: {
          ...currentStyle,
          bgclr: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          textclr: "#1e293b",
          padding: {
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
          },
          margin: {
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
          },
          position: {
            mode: "custom",
            unit: "px",
            anchor: "top-left",
           top: "5",
            left: "5",
          },
          text_size:"12px",
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
        bgclr: "#673AB7",
        textclr: "#ffffff",
        
        margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      position: {
        mode: "custom",
        unit: "px",
        anchor: "top-left",
        top: "3",
        left: "3",
      },
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
        text_size:"14px",
        margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      position: {
        mode: "custom",
        unit: "px",
        anchor: "top-left",
         top: "3",
        left: "3",
      },
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
        margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      position: {
        mode: "custom",
        unit: "px",
        anchor: "top-left",
        top: "12",
        left: "12",
      },
        
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
        margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
       },
        position: {
        mode: "custom",
        unit: "px",
        anchor: "top-right",
        top: "0",
        right: "0",
       },
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
        margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
       },
        position: {
        mode: "custom",
        unit: "px",
        anchor: "top-left",
        top: "4",
        left: "14",
       },
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
        
        margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      position: {
        mode: "custom",
        unit: "px",
        anchor: "top-left",
        top: "12",
        left: "12",
      },
        
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
        
         margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
        position: {
        mode: "custom",
        unit: "px",
        anchor: "top-left",
        top: "4",
        left: "4",
      },
      },
    };
  }
  if (type === "simplecircle") {
    return {
      ...rule,
      badge_advance_type: type,
      badge_style: {
        ...currentStyle,
        bgclr: "#8BC34A",
        textclr: "#ffffff",
        
        margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      position: {
        mode: "custom",
        unit: "px",
        anchor: "top-left",
        top: "3",
        left: "3",
      },
      },
    };
  }
  if (type === "simplenew") {
    return {
      ...rule,
      badge_advance_type: type,
      badge_style: {
        ...currentStyle,
        bgclr:"linear-gradient(90deg, #f59e0b, #f97316)",
        textclr: "#ffffff",
        
        margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      position: {
        mode: "custom",
        unit: "px",
        anchor: "top-left",
        top: "3",
        left: "3",
      },
      border: {
            radius: {
            top: "4px",
            right: "4px",
            bottom: "4px",
            left: "4px",
             },
          },
      },
    };
  }
  if (type === "simpleaval") {
    return {
      ...rule,
      badge_advance_type: type,
      badge_style: {
        ...currentStyle,
        bgclr:"#00cfb0",
        textclr: "#ffffff",
        
        margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      position: {
        mode: "custom",
        unit: "px",
        anchor: "top-left",
        top: "3",
        left: "3",
      },
      border: {
            radius: {
            top: "4px",
            right: "4px",
            bottom: "4px",
            left: "4px",
             },
          },
      },
    };
  }
  return rule;
};

  return (
    <div className="store-one-rules-container">
      <h3 className="store-one-section-title">
        {__("Trust Badges", "th-store-one")}
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
                  rule.badge_title || __("Untitled", "th-store-one"),
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
                            value={rule.badge_title}
                            onChange={(v) =>
                              updateField(index, "badge_title", v)
                            }
                          />
                        </S1Field>
                        <S1Field label={__("Show Badges", "th-store-one")}>
                          <SelectControl
                            value={rule.show_badges}
                            options={[
                              {
                                label: __("All Products", "th-store-one"),
                                value: "all_products",
                              },
                              {
                                label: __("Only Recent Products", "th-store-one"),
                                value: "recent_products",
                              },
                              {
                                label: __("Sale Products", "th-store-one"),
                                value: "sale_products",
                              },
                              {
                                label: __("Featured Product", "th-store-one"),
                                value: "featured_products",
                              },
                              {
                                label: __("In Stock Products", "th-store-one"),
                                value: "in_stock_products",
                              },
                              {
                                label: __("Out Of Stock Products", "th-store-one"),
                                value: "out_stock_products",
                              },
                              {
                                label: __("Back Order Products", "th-store-one"),
                                value: "back_order_products",
                              },
                              {
                                label: __("Low Stock Products", "th-store-one"),
                                value: "low_stock_products",
                              },
                              {
                                label: __("Best Seller", "th-store-one"),
                                value: "best_seller_products",
                              },
                              {
                                label: __("Specific Product", "th-store-one"),
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
                            ]}
                            onChange={(v) =>
                              updateField(index, "show_badges", v)
                            }
                          />
                        </S1Field>

                        
                            <S1Field
                                      label={__("Show in Loop", "th-store-one")}
                                      classN="s1-toggle-wrpapper"
                                    >
                                      <ToggleControl
                                        checked={rule.enableLoop}
                                        onChange={(value) =>
                                            updateField(index, "enableLoop", value)
                                          }
                                      />
                                    </S1Field>
                        
                        
                            <S1Field
                                      label={__("Show in Single Page", "th-store-one")}
                                      classN="s1-toggle-wrpapper"
                                    >
                                      <ToggleControl
                                        checked={rule.enableSingle}
                                         onChange={(value) =>
                                          updateField(index, "enableSingle", value)
                                        }
                                      />
                                    </S1Field>
                        

                        {rule.show_badges === "specific_products" && (
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
                        {rule.show_badges === "specific_categories" && (
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
                        {rule.show_badges === "specific_tags" && (
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
                        <ExcludeWooCondition
                          label={__("Exclude products", "th-store-one")}
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
                          label={__("Exclude categories", "th-store-one")}
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
                          label={__("Bagdes Type", "th-store-one")}
                          visible={true}
                        >
                          <SelectControl
                            value={rule.badges_type}
                            options={[
                              {
                                label: __("Text", "th-store-one"),
                                value: "badges_text",
                              },
                              {
                                label: __("Images", "th-store-one"),
                                value: "badges_images",
                              },
                              {
                                label: __("CSS", "th-store-one"),
                                value: "badges_css",
                              },
                              {
                                label: __("Advance", "th-store-one"),
                                value: "badges_advance",
                              },
                            ]}
                            onChange={(v) =>
                              updateField(index, "badges_type", v)
                            }
                          />
                        </S1Field>
            {(rule.badges_type === "badges_text" || rule.badges_type === "badges_css") &&(
                                    <S1Field label={__("Badge Text", "th-store-one")}>
                                          <TextControl
                                            value={rule.badgetext || "Sale!"}
                                            onChange={(v) =>
                                              updateField(index, "badgetext", v)
                                            }
                                          />
                                        </S1Field>
            )}
                        {rule.badges_type === "badges_text" && (
                          <>
                           
                            <S1FieldGroup title={__("Style", "th-store-one")}>
                            <UniversalRangeControl
                              label={__("Font Size", "th-store-one")}
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
                              label={__("Background", "th-store-one")}
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
                                label={__("Text", "th-store-one")}
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
                                title={__("Images Badges", "th-store-one")}
                                rule={rule}
                                index={index}
                                updateField={updateField}
                                presetBadges={TRUST_BADGES_IMAGES}
                                allowUpload={true}
                                badgeType="image"
                              />
                            <UniversalRangeControl
                              label={__("Width", "th-store-one")}
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
                                title={__("Css Badges", "th-store-one")}
                                rule={rule}
                                index={index}
                                updateField={updateField}
                                presetBadges={TRUST_BADGES_CSS}
                                allowUpload={false}
                                badgeType="css"
                              />
                           
                            {/* <S1Field label={__("Badge Text", "th-store-one")}>
                              <TextControl
                                value={rule.badgetext || "Sale!"}
                                onChange={(v) =>
                                  updateField(index, "badgetext", v)
                                }
                              />
                            </S1Field> */}
                             <UniversalRangeControl
                              label={__("Font Size", "th-store-one")}
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
                              label={__("Background", "th-store-one")}
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
                                label={__("Text", "th-store-one")}
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
                                 title={__("Advance Badges", "th-store-one")}
                                rule={rule}
                                index={index}
                                updateField={updateField}
                                presetBadges={TRUST_BADGES_ADV}
                                allowUpload={false}
                                badgeType="advance"
                              />
                              <S1Field label={__("Display", "th-store-one")}>
                              <SelectControl
                                value={rule.displayBadge}
                                options={[
                                  {
                                    label: __("Amount", "th-store-one"),
                                    value: "s1-amount",
                                  },
                                  {
                                    label: __("Percentage", "th-store-one"),
                                    value: "s1-percent",
                                  },
                                ]}
                                onChange={(v) => updateField(index, "displayBadge", v)}
                              />
                            </S1Field>
                              <THBackgroundControl
                              allowGradient={true}
                              label={__("Background", "th-store-one")}
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
                                label={__("Text", "th-store-one")}
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
                          badgeCssType={rule.badge_css_type} 
                          onChange={(v) => updateField(index, "badge_style", v)}
                        />
                      {rule.badges_type === "badges_advance" &&
                        rule?.badge_advance_type === "simplenew" && ( 
                        <UniversalDimensionControl
                          label={__("Border Radius", "th-store-one")}
                          value={rule.badge_style?.border?.radius}
                          responsive={false}
                          onChange={(v) => {
                            const updatedBadgeStyle = {
                              ...rule.badge_style,
                              border: {
                                ...rule.badge_style?.border,
                                radius: v,
                              },
                            };

                            updateField(index, "badge_style", updatedBadgeStyle);
                          }}
                        />
                    )}
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
          moduleId="trust-badges"
          onReset={() => {
            updateAll([newBadgesTRule()]);
          }}
        />
      </div>
    </div>
  );
}