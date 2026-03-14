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
/* Default Rule */
const newBadgesTRule = () => ({
  open:true,
  status: "active",
  badge_title: "Trust Badges",
  show_badges: "all_products",
  products: [],
  flexible_id: crypto.randomUUID(),

  badges_type: "badges_images",
  badge_library: "default",
  badge_image: "",
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
  background: "#2470FF",
  transform: {
    opacity: "55",
    rotateX: "0",
    rotateY: "1",
    rotateZ: "0",
  },
  flip: {
   enabled: false,
   orientation: "horizontal"
  }, 
  position:{
    mode:"custom",
    unit:"px",
    anchor:"top-left",
    top:"0",
    left:"0",
    bottom:"",
    right:"",
    position:"top",
    align:"left"
  },
  margin: {
  top: "0px",
  right: "0px",
  bottom: "0px",
  left: "0px"
},
padding: {
  top: "0px",
  right: "0px",
  bottom: "0px",
  left: "0px"
}
  
}
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
    { id: "single", label: "Display Page", icon: "DISPLAY" },
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
  "https://plugins.yithemes.com/yith-woocommerce-badge-management/wp-content/uploads/sites/489237/yith-badge-library-live-demo/image/black-friday-01.svg",
  "https://plugins.yithemes.com/yith-woocommerce-badge-management/wp-content/uploads/sites/489237/yith-badge-library-live-demo/image/new-year-01.svg",
  "https://plugins.yithemes.com/yith-woocommerce-badge-management/wp-content/uploads/sites/489237/yith-badge-library-live-demo/image/BOGO-02.svg",
];
const TRUST_BADGES_CSS = [
  "https://plugins.yithemes.com/dd58b7d04f54d5afda6424614772c9d6/wp-content/plugins/yith-woocommerce-badge-management-premium/assets/images/css-badge-previews/1.svg",
  "https://plugins.yithemes.com/dd58b7d04f54d5afda6424614772c9d6/wp-content/plugins/yith-woocommerce-badge-management-premium/assets/images/css-badge-previews/4.svg",
];


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
                            ]}
                            onChange={(v) =>
                              updateField(index, "show_badges", v)
                            }
                          />
                        </S1Field>

                         
                            <ExcludeWooCondition
                              label={__("Exclude products", "store-one")}
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
                       
                        <S1Field label={__("Shortcode", "store-one")}>
                          <p className="s1-shortcode-description">
                            {__(
                              "Use this shortcode to display this Featured List anywhere on your site (posts, pages, widgets, or page builders).",
                              "store-one",
                            )}
                          </p>
                          <div className="s1-shortcode-wrapper">
                            <textarea
                              readOnly
                              value={`[storeone_trust_badges id="${rule.flexible_id}"]`}
                              className="s1-shortcode-textarea"
                            />

                            <button
                              type="button"
                              className="s1-shortcode-copy"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `[storeone_trust_badges id="${rule.flexible_id}"]`,
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
                    {
                    id: menuItems[3].id,
                    label: menuItems[3].label,
                    icon: ICONS[menuItems[3].icon],
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
                              }
                            ]}
                            onChange={(v) =>
                              updateField(index, "badges_type", v)
                            }
                          />
                        </S1Field>
                        {rule.badges_type === "badges_text" && (
                         <S1Field label={__("Badge Text", "store-one")}>
                          <TextControl
                            value={rule.badgetext || ""}
                            onChange={(v) => updateField(index, "badgetext", v)}
                          />
                         </S1Field>
                         )}
                        {rule.badges_type === "badges_images" && (
                         <S1Field label={__("Badge Images", "store-one")}>
                         <TrustBadgeSelector
                              rule={rule}
                              index={index}
                              updateField={updateField}
                              presetBadges={TRUST_BADGES_IMAGES}
                              allowUpload={true}
                              />
                         </S1Field>
                         )}
                         {rule.badges_type === "badges_css" && (
                         <S1Field label={__("Badge CSS", "store-one")}>
                         <TrustBadgeSelector
                              rule={rule}
                              index={index}
                              updateField={updateField}
                              presetBadges={TRUST_BADGES_CSS}
                              allowUpload={false}
                              />
                         </S1Field>
                         )}
                         {rule.badges_type === "badges_advance" && (
                              <S1Field label={__("Badge Advance", "store-one")}>
                              <TrustBadgeSelector
                              rule={rule}
                              index={index}
                              updateField={updateField}
                              presetBadges={TRUST_BADGES_IMAGES}
                              allowUpload={false}
                              />
                              </S1Field>
                         )}
                         <TrustBadgeStyleControl
                         value={rule.badge_style}
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
