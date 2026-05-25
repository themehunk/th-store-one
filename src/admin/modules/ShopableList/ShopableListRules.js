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
import SliderControl from "@th-storeone-global/SliderControl";

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
import PlacementPriorityControl from "@th-storeone-global/PlacementPriorityControl";

/* Default Rule */
const newShopableListRule = () => ({
  status: "active",
  list_title: "Shopable List",
  trigger_type: "all_products",
  flexible_id: crypto.randomUUID(),
  shopable_list: [
    {
      id: crypto.randomUUID(),
      l_title: "List",
      l_products: [],
      open: true,
    },
  ],
  product_info_position: "top",
  show_prd_popup: false,
  prd_delay: "",

  open: true,
  title: "Shopable List",
  title_tag: "h2",
  hide_title: false,
  slider: {
    enabled: false,
    slides: 4,
    autoplay: false,
    navigation: true,
  },
  columns: "3",
  columns_gap: "15",
  list_style: "style1",
});

const ICON_OPTIONS = [
  { id: "check", icon: ICONS.CheckSVG },
  { id: "star", icon: ICONS.StarSVG },
  { id: "heart", icon: ICONS.HeartSVG },
  { id: "bolt", icon: ICONS.BoltSVG },
  // { id: 'rocket', icon: ICONS.RocketSVG },
];
/** menu tabs */
/* ================= STYLE DEFAULTS (ADDED) ================= */
const STYLE_DEFAULTS = {};

/* ================= HELPER (ADDED) ================= */
const applyStyleDefaults = (rule, style) => {
  const defaults = STYLE_DEFAULTS[style] || {};
  const updated = { ...rule, list_style: style };

  Object.keys(defaults).forEach((key) => {
    const autoKey = `${key}_auto`;

    // Agar user ne manually change nahi kiya
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
export default function ShopableListRules({ rules, onChange, onLivePreview }) {
  const menuItems = [
    { id: "settings", label: "Settings", icon: "SETTINGS" },
    { id: "display", label: "Display Page", icon: "DISPLAY" },
    { id: "design", label: "Design", icon: "DESIGN" },
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
    const arr = [...rules, newShopableListRule()];
    updateAll(arr);
    const newIndex = arr.length - 1;
    onLivePreview?.(arr[newIndex], newIndex);
  };

  /* ---------------- SHOPABLE LIST FUNCTIONS ---------------- */

  const updateShopableList = (ruleIndex, newList) => {
    const arr = [...rules];
    arr[ruleIndex].shopable_list = newList;
    updateAll(arr);
    onLivePreview?.(arr[ruleIndex], ruleIndex);
  };

  const addShopableItem = (ruleIndex) => {
    const list = rules[ruleIndex].shopable_list || [];
    updateShopableList(ruleIndex, [
      ...list,
      { id: crypto.randomUUID(), text: "", open: true },
    ]);
  };

  const removeShopableItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].shopable_list];
    list.splice(itemIndex, 1);
    updateShopableList(ruleIndex, list);
  };

  const duplicateShopableItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].shopable_list];
    const copy = {
      ...list[itemIndex],
      id: crypto.randomUUID(),
      open: true,
    };
    list.splice(itemIndex + 1, 0, copy);
    updateShopableList(ruleIndex, list);
  };

  const toggleShopableItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].shopable_list];
    list[itemIndex].open = !list[itemIndex].open;
    updateShopableList(ruleIndex, list);
  };

  const updateShopableItemField = (ruleIndex, itemIndex, field, value) => {
    const list = [...rules[ruleIndex].shopable_list];
    list[itemIndex][field] = value;
    updateShopableList(ruleIndex, list);
  };

  const reorderShopableList = (ruleIndex, oldIndex, newIndex) => {
    const list = [...rules[ruleIndex].shopable_list];
    const moved = list.splice(oldIndex, 1)[0];
    list.splice(newIndex, 0, moved);
    updateShopableList(ruleIndex, list);
  };

  useEffect(() => {
    if (rules.length === 0) {
      updateAll([newShopableListRule()]);
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

    window.addEventListener("storeone:changeListStyle", handler);
    return () =>
      window.removeEventListener("storeone:changeListStyle", handler);
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
        {__("Shopable List", "th-store-one")}
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

                        {/* BUY LIST GROUP */}
                        <S1FieldGroup
                          title={__("Shopable List Item", "th-store-one")}
                          description={__(
                            "Choose the products to feature in this video. You can display a single product or add multiple products to build an interactive shoppable list.",
                            "th-store-one",
                          )}
                        >
                          <SortableWrapper
                            items={rule.shopable_list}
                            onSortEnd={(oldI, newI) =>
                              reorderShopableList(index, oldI, newI)
                            }
                          >
                            {rule.shopable_list?.map((item, i) => (
                              <div
                                key={item.id}
                                className="store-one-rule-item inner"
                              >
                                <div className="store-one-rule-header">
                                  <DragHandleDots2Icon className="drag-handle s1-icon" />
                                  <strong className="s1-rule-title">
                                    {item.l_title
                                      ? item.l_title
                                      : sprintf(
                                          __("Item %d", "th-store-one"),
                                          i + 1,
                                        )}
                                  </strong>
                                  <CopyIcon
                                    className="s1-icon"
                                    onClick={() =>
                                      duplicateShopableItem(index, i)
                                    }
                                  />
                                  <TrashIcon
                                    className="s1-icon s1-icon-danger"
                                    onClick={() => removeShopableItem(index, i)}
                                  />

                                  {item.open ? (
                                    <ChevronUpIcon
                                      className="s1-icon"
                                      onClick={() =>
                                        toggleShopableItem(index, i)
                                      }
                                    />
                                  ) : (
                                    <ChevronDownIcon
                                      className="s1-icon"
                                      onClick={() =>
                                        toggleShopableItem(index, i)
                                      }
                                    />
                                  )}
                                </div>

                                {item.open && (
                                  <div className="store-one-rule-body">
                                    <S1Field
                                      label={__("Title", "th-store-one")}
                                    >
                                      <TextControl
                                        value={item.l_title}
                                        onChange={(v) =>
                                          updateShopableItemField(
                                            index,
                                            i,
                                            "l_title",
                                            v,
                                          )
                                        }
                                        placeholder="Enter list title"
                                      />
                                    </S1Field>
                                    <MultiWooSearchSelector
                                      searchType="product"
                                      label={__(
                                        "Choose Products",
                                        "th-store-one",
                                      )}
                                      value={item.l_products || []}
                                      onChange={(v) =>
                                        updateShopableItemField(
                                          index,
                                          i,
                                          "l_products ",
                                          v,
                                        )
                                      }
                                      detailedView={true}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </SortableWrapper>

                          <div
                            className="store-one-add-rule"
                            onClick={() => addShopableItem(index)}
                          >
                            + Add List Item
                          </div>
                        </S1FieldGroup>
                        <S1FieldGroup title={__("Content", "th-store-one")}>
                          <S1Field
                            label={__("Delay (ms)", "th-store-one")}
                            description={__(
                              "Leave this field empty to display the product for the entire video duration. Set a value to control how long the product remains visible.",
                              "th-store-one",
                            )}
                          >
                            <TextControl
                              value={rule.prd_delay}
                              onChange={(v) =>
                                updateField(index, "prd_delay", v)
                              }
                            />
                          </S1Field>
                          <S1Field
                            label={__(
                              "Product Info Showing in Popup",
                              "th-store-one",
                            )}
                            description={__(
                              "Enable this option to display product details in an interactive popup when a product from the list is clicked.",
                              "th-store-one",
                            )}
                          >
                            <ToggleControl
                              checked={rule.show_prd_popup}
                              onChange={(v) =>
                                updateField(index, "show_prd_popup", v)
                              }
                            />
                          </S1Field>
                          {rule.show_prd_popup === false && (
                            <S1Field
                              label={__(
                                "Product Info Position",
                                "th-store-one",
                              )}
                            >
                              <SelectControl
                                value={rule.product_info_position}
                                options={[
                                  {
                                    label: "Top",
                                    value: "top",
                                  },
                                  {
                                    label: "Bottom",
                                    value: "bottom",
                                  },
                                ]}
                                onChange={(v) =>
                                  updateField(index, "product_info_position", v)
                                }
                              />
                            </S1Field>
                          )}
                        </S1FieldGroup>
                      </div>
                    ),
                  },
                  {
                    id: menuItems[1].id,
                    label: menuItems[1].label,
                    icon: ICONS[menuItems[1].icon],
                    content: (
                      <div className="store-one-rule-body">
                        {/* TITLE */}
                        <S1FieldGroup title="Title">
                          <S1Field
                            label={__("Title", "th-store-one")}
                            classN="s1-toggle-wrpapper"
                          >
                            <TextControl
                              value={rule.title}
                              onChange={(v) => updateField(index, "title", v)}
                            />
                          </S1Field>
                          <S1Field
                            label={__("Title HTML tag", "th-store-one")}
                            classN="s1-toggle-wrpapper"
                          >
                            <SelectControl
                              value={rule.title_tag}
                              options={[
                                { label: "H1", value: "h1" },
                                { label: "H2", value: "h2" },
                                { label: "H3", value: "h3" },
                                { label: "H4", value: "h4" },
                                { label: "H5", value: "h5" },
                                { label: "H6", value: "h6" },
                                { label: "DIV", value: "div" },
                                { label: "span", value: "span" },
                              ]}
                              onChange={(v) =>
                                updateField(index, "title_tag", v)
                              }
                            />
                          </S1Field>
                          <S1Field
                            label={__("Hide title", "th-store-one")}
                            classN="s1-toggle-wrpapper"
                          >
                            <ToggleControl
                              checked={rule.hide_title}
                              onChange={(v) =>
                                updateField(index, "hide_title", v)
                              }
                            />
                          </S1Field>
                        </S1FieldGroup>
                        {/* LAYOUT */}
                        <S1FieldGroup
                          title="Layout"
                          description={__(
                            "Turn on this option to showcase products in a slider. Leave it disabled to display products in a standard grid or column layout.",
                            "th-store-one",
                          )}
                        >
                          <SliderControl
                            value={rule.slider || {}}
                            onChange={(v) => updateField(index, "slider", v)}
                            labels={{
                              enable: __("Display in Slider", "th-store-one"),
                              slides: __("Slides to Show", "th-store-one"),
                              autoplay: __("Auto Play", "th-store-one"),
                              navigation: __("Show Navigation", "th-store-one"),
                            }}
                            fields={{
                              enable: true,
                              slides: true,
                              autoplay: true,
                              navigation: true,
                            }}
                          />
                          {!rule.slider.enabled && (
                            <>
                              <UniversalRangeControl
                                label="Columns"
                                value={rule.columns}
                                min={1}
                                max={6}
                                onChange={(v) =>
                                  updateField(index, "columns", v)
                                }
                              />
                              <UniversalRangeControl
                                label="Columns gap"
                                value={rule.columns_gap}
                                min={0}
                                max={50}
                                onChange={(v) =>
                                  updateField(index, "columns_gap", v)
                                }
                              />
                            </>
                          )}
                        </S1FieldGroup>
                        <S1Field label={__("Shortcode", "th-store-one")}>
                          <p className="s1-shortcode-description">
                            {__(
                              "Use this shortcode to display this Shopable List anywhere on your site (posts, pages, widgets, or page builders).",
                              "th-store-one",
                            )}
                          </p>
                          <div className="s1-shortcode-wrapper">
                            <textarea
                              readOnly
                              value={`[th_store_one_shopable_list id="${rule.flexible_id}"]`}
                              className="s1-shortcode-textarea"
                            />

                            <button
                              type="button"
                              className="s1-shortcode-copy"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `[th_store_one_shopable_list id="${rule.flexible_id}"]`,
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
                    id: menuItems[2].id,
                    label: menuItems[2].label,
                    icon: ICONS[menuItems[2].icon],
                    content: (
                      <div className="store-one-rule-body">
                        <S1Field label={__("Choose Style", "th-store-one")}>
                          <SelectControl
                            value={rule.list_style}
                            options={[
                              { label: "Style1", value: "style1" },
                              { label: "Style2", value: "style2" },
                              { label: "Style3", value: "style3" },
                            ]}
                            onChange={(v) => {
                              const updatedRule = applyStyleDefaults(rule, v);

                              updateAll(
                                rules.map((r, i) =>
                                  i === index ? updatedRule : r,
                                ),
                              );

                              onLivePreview?.(updatedRule, index);
                            }}
                          />
                        </S1Field>
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
            const resetRules = [newShopableListRule()];
            updateAll(resetRules);
            return { rules: resetRules };
          }}
        />
      </div>
    </div>
  );
}
