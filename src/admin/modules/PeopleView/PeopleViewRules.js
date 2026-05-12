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
const newPeopleViewRule = () => ({
  flexible_id: crypto.randomUUID(),
  open: true,
  status: "active",

  /* VIEW MODE */
  view_mode: "real",

  /* REAL VIEW */
  real_view: {
    enable_guest: true,
    enable_loggedin: true,
    session_timeout: 3,
    bot_filter: true,
    refresh_rate: 15,
  },

  /* FAKE VIEW */
  fake_view: {
    min: 3,
    max: 18,
    default_count: 8,
    randomize: "session",
    update_interval: 20,
    smooth_fluctuation: true,
    spike_enable: true,
    spike_chance: 20,
  },

  /* HYBRID */
  hybrid_view: {
    min_boost: 2,
    max_boost: 8,
  },

  /* DISPLAY */
  message: "{count} People are viewing this right now",

  icon_enable: true,
  icon_type: "eye",

  dynamic_message_enable: false,

  dynamic_message: {
    low_msg: "{count} shoppers viewing now",
    medium_msg: "Popular product • {count} viewers",
    high_msg: "High demand • {count} people viewing",
    low_threshold: 5,
    medium_threshold: 15,
  },

  /* LOCATIONS */
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

  hide_outofstock: true,

  devices: ["desktop", "tablet", "mobile"],

  /* STYLE */
  layout_style: "pill",

  bg_color: "#9e9e9e00",
  border_color: "#9e9e9e00",
  text_color: "#111827",
  icon_color: "#D97706",

  font_size: 14,
  border_radius: 0,

  padding_y: 0,
  padding_x: 0,
});
/* ================= ICON SELECT ================= */
const ICON_OPTIONS = [
  {
    id: "eye",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M2 12C3.8 7.5 7.5 5 12 5C16.5 5 20.2 7.5 22 12C20.2 16.5 16.5 19 12 19C7.5 19 3.8 16.5 2 12Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "users",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M4 19C4.8 16.8 6.8 15.5 9 15.5C11.2 15.5 13.2 16.8 14 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14.5 18C15 16.7 16.2 16 17.5 16C18.8 16 20 16.7 20.5 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "fire",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3C13.5 6 17 8 17 13C17 16.3 14.8 19 12 19C9.2 19 7 16.3 7 13C7 10 8.5 8 10 6C10.5 8 11.5 9 13 10C13.2 7.5 12.8 5.5 12 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "live",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />

        <circle cx="12" cy="12" r="2" fill="currentColor" />

        <path
          d="M5 5L8 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M19 5L16 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];
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
export default function PeopleViewRules({ rules, onChange, onLivePreview }) {
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

  const addRule = () => updateAll([...rules, newPeopleViewRule()]);

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
      updateAll([newPeopleViewRule()]);
    }
  }, []);

  return (
    <div className="store-one-rules-container">
      <h3 className="store-one-section-title">Visitor Count</h3>
      <SortableWrapper items={rules} onSortEnd={reorder}>
        {rules.map((rule, index) => (
          <div key={rule.flexible_id} className="store-one-rule-item">
            {/* HEADER */}
            <div className="store-one-rule-header">
              <DragHandleDots2Icon className="drag-handle s1-icon" />

              <strong className="s1-rule-title">
                {sprintf("Rule %d: Vistor View", index + 1)}
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
                        {/* VIEWER SOURCE */}
                        <S1FieldGroup title="Viewer Source">
                          <S1Field
                            label="Viewer Mode"
                            description="Choose how viewer count should work."
                          >
                            <SelectControl
                              value={rule.view_mode}
                              options={[
                                {
                                  label: "Real Viewers",
                                  value: "real",
                                },
                                {
                                  label: "Fake Viewers",
                                  value: "fake",
                                },
                              ]}
                              onChange={(v) =>
                                updateField(index, "view_mode", v)
                              }
                            />
                          </S1Field>
                        </S1FieldGroup>
                        {/* REAL VIEWERS */}
                        {rule.view_mode === "real" && (
                          <S1FieldGroup title="Real Viewer Settings">
                            <S1Field
                              label="Count Guest Users"
                              description="Track visitors that are not logged in."
                            >
                              <ToggleControl
                                checked={rule.real_view.enable_guest}
                                onChange={(v) =>
                                  updateField(index, "real_view", {
                                    ...rule.real_view,
                                    enable_guest: v,
                                  })
                                }
                              />
                            </S1Field>

                            <S1Field
                              label="Count Logged Users"
                              description="Track logged-in customers."
                            >
                              <ToggleControl
                                checked={rule.real_view.enable_loggedin}
                                onChange={(v) =>
                                  updateField(index, "real_view", {
                                    ...rule.real_view,
                                    enable_loggedin: v,
                                  })
                                }
                              />
                            </S1Field>

                            <S1Field
                              label="Ignore Bots"
                              description="Prevent bots from increasing counts."
                            >
                              <ToggleControl
                                checked={rule.real_view.bot_filter}
                                onChange={(v) =>
                                  updateField(index, "real_view", {
                                    ...rule.real_view,
                                    bot_filter: v,
                                  })
                                }
                              />
                            </S1Field>

                            <UniversalRangeControl
                              label="Session Timeout (Minutes) "
                              description="Viewer will be removed from live count after being inactive for selected minutes."
                              value={String(rule.real_view.session_timeout)}
                              min={1}
                              max={10}
                              onChange={(v) =>
                                updateField(index, "real_view", {
                                  ...rule.real_view,
                                  session_timeout: parseInt(v),
                                })
                              }
                            />

                            <UniversalRangeControl
                              label="Refresh Rate (Seconds)"
                              description="Controls how often real viewer count updates automatically in seconds using AJAX. Lower values provide faster updates but may increase server requests."
                              value={String(rule.real_view.refresh_rate)}
                              min={5}
                              max={60}
                              onChange={(v) =>
                                updateField(index, "real_view", {
                                  ...rule.real_view,
                                  refresh_rate: parseInt(v),
                                })
                              }
                            />
                          </S1FieldGroup>
                        )}

                        {/* FAKE VIEWERS */}
                        {rule.view_mode === "fake" && (
                          <S1FieldGroup title="Fake Viewer Settings">
                            <UniversalRangeControl
                              label="Minimum Viewers"
                              description="Minimum fake viewers count that can appear."
                              value={String(rule.fake_view.min)}
                              min={1}
                              max={50}
                              onChange={(v) =>
                                updateField(index, "fake_view", {
                                  ...rule.fake_view,
                                  min: parseInt(v),
                                })
                              }
                            />

                            <UniversalRangeControl
                              label="Maximum Viewers"
                              description="Maximum fake viewers count that can appear."
                              value={String(rule.fake_view.max)}
                              min={1}
                              max={100}
                              onChange={(v) =>
                                updateField(index, "fake_view", {
                                  ...rule.fake_view,
                                  max: parseInt(v),
                                })
                              }
                            />

                            <UniversalRangeControl
                              label="Default Count"
                              description="Initial viewer count shown before automatic fluctuations start."
                              value={String(rule.fake_view.default_count)}
                              min={1}
                              max={50}
                              onChange={(v) =>
                                updateField(index, "fake_view", {
                                  ...rule.fake_view,
                                  default_count: parseInt(v),
                                })
                              }
                            />

                            <UniversalRangeControl
                              label="Update Interval"
                              description="Update fake viewer count every selected seconds."
                              value={String(rule.fake_view.update_interval)}
                              min={5}
                              max={60}
                              onChange={(v) =>
                                updateField(index, "fake_view", {
                                  ...rule.fake_view,
                                  update_interval: parseInt(v),
                                })
                              }
                            />

                            <S1Field
                              label="Smooth Fluctuation"
                              description="Gradually increase or decrease viewers naturally instead of sudden jumps."
                            >
                              <ToggleControl
                                checked={rule.fake_view.smooth_fluctuation}
                                onChange={(v) =>
                                  updateField(index, "fake_view", {
                                    ...rule.fake_view,
                                    smooth_fluctuation: v,
                                  })
                                }
                              />
                            </S1Field>

                            <S1Field
                              label="Enable Spike Effect"
                              description="Occasionally create sudden viewer increases to build urgency."
                            >
                              <ToggleControl
                                checked={rule.fake_view.spike_enable}
                                onChange={(v) =>
                                  updateField(index, "fake_view", {
                                    ...rule.fake_view,
                                    spike_enable: v,
                                  })
                                }
                              />
                            </S1Field>

                            {rule.fake_view.spike_enable && (
                              <UniversalRangeControl
                                label="Spike Chance"
                                description="Percentage chance of triggering a sudden viewer spike."
                                value={String(rule.fake_view.spike_chance)}
                                min={1}
                                max={100}
                                onChange={(v) =>
                                  updateField(index, "fake_view", {
                                    ...rule.fake_view,
                                    spike_chance: parseInt(v),
                                  })
                                }
                              />
                            )}
                          </S1FieldGroup>
                        )}
                      </div>
                    ),
                  } /* ================= DISPLAY ================= */,
                  {
                    id: "display",
                    label: "Display",
                    icon: <TextAlignLeftIcon />,

                    content: (
                      <div className="store-one-rule-body">
                        <S1Field
                          label="Message"
                          description="Use {count} placeholder to dynamically display live viewer count."
                        >
                          <TextControl
                            value={rule.message}
                            onChange={(v) => updateField(index, "message", v)}
                          />
                        </S1Field>

                        <S1Field
                          label="Enable Icon"
                          description="Display icon before message."
                        >
                          <ToggleControl
                            checked={rule.icon_enable}
                            onChange={(v) =>
                              updateField(index, "icon_enable", v)
                            }
                          />
                        </S1Field>

                        {rule.icon_enable && (
                          <S1Field
                            label="Choose Icon"
                            description="Select icon for viewer notification."
                            classN="s1-view list-icon"
                          >
                            {ICON_OPTIONS.map(({ id, icon }) => (
                              <div
                                key={id}
                                data-tooltip={
                                  id.charAt(0).toUpperCase() + id.slice(1)
                                }
                                className={`s1-icon-option ${
                                  rule.icon_type === id ? "active" : ""
                                }`}
                                onClick={() =>
                                  updateField(index, "icon_type", id)
                                }
                              >
                                {icon}
                              </div>
                            ))}
                          </S1Field>
                        )}

                        {/* DYNAMIC MESSAGES */}
                        <S1FieldGroup title="Dynamic Messages">
                          <S1Field
                            label="Enable Dynamic Messages"
                            description="Automatically switch messages based on current viewer count."
                          >
                            <ToggleControl
                              checked={rule.dynamic_message_enable}
                              onChange={(v) =>
                                updateField(index, "dynamic_message_enable", v)
                              }
                            />
                          </S1Field>

                          {rule.dynamic_message_enable && (
                            <>
                              <S1Field label="Low Viewer Message">
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

                              <S1Field
                                label="Low Threshold"
                                description="Apply low viewer message when count is below this value."
                              >
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

                              <S1Field
                                label="Medium Viewer Message"
                                description="Apply medium viewer message when count reaches this value."
                              >
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

                              <S1Field label="High Viewer Message">
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

                        {/* SINGLE PAGE */}
                        <S1FieldGroup title="Single Product Page">
                          <S1Field
                            label="Enable Single Page"
                            description="Show on individual product page."
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

                        {/* SHOP PAGE */}
                        <S1FieldGroup title="Archive / Shop Page">
                          <S1Field
                            label="Enable Shop Page"
                            description="Display viewer count on shop and archive pages."
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
                              description="Choose placement on archive products."
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
                  } /* ================= VISIBILITY ================= */,
                  {
                    id: "visibility",
                    label: "Visibility",
                    icon: ICONS.DISPLAY,

                    content: (
                      <div className="store-one-rule-body">
                        {/* TRIGGER TYPE */}
                        <S1Field
                          label="Trigger Type"
                          description="Choose where this rule should apply."
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

                        {/* EXCLUDE PRODUCTS */}
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

                        {/* EXCLUDE CATEGORIES */}
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

                        {/* OUT OF STOCK */}
                        <S1Field
                          label="Hide Out Of Stock Products"
                          description="Do not show viewer count for out of stock items."
                        >
                          <ToggleControl
                            checked={rule.hide_outofstock}
                            onChange={(v) =>
                              updateField(index, "hide_outofstock", v)
                            }
                          />
                        </S1Field>

                        {/* DEVICE SELECTOR */}
                        <S1FieldGroup title="Devices">
                          <DeviceSelector
                            value={rule.devices}
                            onChange={(v) => updateField(index, "devices", v)}
                          />
                        </S1FieldGroup>
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
                        {/* LAYOUT */}
                        {/* <S1Field
                          label="Layout Style"
                          description="Choose viewer notification style."
                        >
                          <SelectControl
                            value={rule.layout_style}
                            options={[
                              {
                                label: "Pill",
                                value: "pill",
                              },
                              {
                                label: "Minimal",
                                value: "minimal",
                              },
                              {
                                label: "Card",
                                value: "card",
                              },
                            ]}
                            onChange={(v) =>
                              updateField(index, "layout_style", v)
                            }
                          />
                        </S1Field> */}

                        {/* BACKGROUND */}
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Background Color", "th-store-one")}
                            value={rule.bg_color}
                            onChange={(v) => updateField(index, "bg_color", v)}
                          />
                        </S1Field>

                        {/* BORDER */}
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

                        {/* TEXT */}
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

                        {/* ICON */}
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Icon Color", "th-store-one")}
                            value={rule.icon_color}
                            onChange={(v) =>
                              updateField(index, "icon_color", v)
                            }
                          />
                        </S1Field>

                        {/* FONT SIZE */}
                        <UniversalRangeControl
                          label="Font Size"
                          description="Adjust viewer message text size in pixels."
                          value={String(rule.font_size)}
                          min={10}
                          max={30}
                          onChange={(v) =>
                            updateField(index, "font_size", parseInt(v))
                          }
                        />

                        {/* BORDER RADIUS */}
                        <UniversalRangeControl
                          label="Border Radius"
                          value={String(rule.border_radius)}
                          min={0}
                          max={50}
                          onChange={(v) =>
                            updateField(index, "border_radius", parseInt(v))
                          }
                        />

                        {/* PADDING Y */}
                        <UniversalRangeControl
                          label="Vertical Padding"
                          value={String(rule.padding_y)}
                          min={0}
                          max={40}
                          onChange={(v) =>
                            updateField(index, "padding_y", parseInt(v))
                          }
                        />

                        {/* PADDING X */}
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
          moduleId="people-view"
          onReset={() => onChange([newPeopleViewRule()])}
        />
      </div>
    </div>
  );
}
