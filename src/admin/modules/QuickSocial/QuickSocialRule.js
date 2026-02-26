/* ------------------------ imports ------------------------ */
import { useState, useEffect, useRef } from "@wordpress/element";
import {
  TextControl,
  SelectControl,
  ToggleControl,
} from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import Sortable from "sortablejs";
import MultiWooSearchSelector from "@storeone-global/MultiWooSearchSelector";
import ExcludeWooCondition from "@storeone-global/ExcludeWooCondition";
import TabSwitcher from "@storeone-global/TabSwitcher";
import UserCondition from "@storeone-global/UserCondition";

import THBackgroundControl from "@storeone-control/color";
import UniversalRangeControl from "@storeone-global/UniversalRangeControl";

import S1Accordion from "@storeone-global/S1Accordion";

import {
  CopyIcon,
  TrashIcon,
  DragHandleDots2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  StarIcon,
  HeartIcon,
  LightningBoltIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { S1Field, S1FieldGroup } from "@storeone-global/S1Field";
import { ICONS } from "@storeone-global/icons";
import SocialItemEditor from "./SocialItemEditor";
import MessagingItemEditor from "./MessagingItemEditor";
import ContactItemEditor from "./ContactItemEditor";
import ProfessionalItemEditor from "./ProfessionalItemEditor";
import  BusinessItemEditor from "./BusinessItemEditor";
/* Default Rule */
const newsocialTRule = () => ({
  status: "active",
  list_title: "",
  trigger_type: "all_products",
  products: [],
  pages: [],
  flexible_id: crypto.randomUUID(),
  social_list: [
    {
      id: crypto.randomUUID(),
      open: true,
      itemTab: "social",
      social: {
        selected_icon: "FACEBOOK",
        icontype: "icon",
        custom_svg: "",
        image_url: "",
        url: "",
        social_choose: "share",
      },
      messaging: {
        selected_icon: "",
        icontype: "icon",
        custom_svg: "",
        image_url: "",
        url: "",
        social_choose: "profile",
      },
      contact: {
        selected_icon: "",
        icontype: "icon",
        custom_svg: "",
        image_url: "",
        url: "",
        social_choose: "profile",
      },
      professional: {
        selected_icon: "",
        icontype: "icon",
        custom_svg: "",
        image_url: "",
        url: "",
        social_choose: "profile",
      },
      business: {
        selected_icon: "",
        icontype: "icon",
        custom_svg: "",
        image_url: "",
        url: "",
        social_choose: "profile",
        },
    },
  ],
  social_style: "style1",
  placement: "after_summary",
  priority: 10,
  open: true,
  offer_products: [],
  offer_products_optional: true,
  //color
  icon_bg_clr: "#fff",
  icon_bg_hvr_clr: "#f0f0f0",
  icon_clr: "#111",
  icon_hvr_clr: "#2563eb",
  icon_size: "18px",
  border_radius: "50%",
});

const ICON_OPTIONS = [
  { id: "FACEBOOK", icon: ICONS.FACEBOOK },
  { id: "INSTAGRAM", icon: ICONS.INSTAGRAM },
  { id: "TWITTER", icon: ICONS.TWITTER },
  { id: "LINKEDIN", icon: ICONS.LINKEDIN },
  { id: "YOUTUBE", icon: ICONS.YOUTUBE },
  { id: "PINTEREST", icon: ICONS.PINTEREST },
];
const MESSAGING_ICON_OPTIONS = [
  { id: "WHATSAPP", icon: ICONS.WHATSAPP },
  { id: "TELEGRAM", icon: ICONS.TELEGRAM },
];

const CONTACT_ICON_OPTIONS = [
  { id: "EMAIL", icon: ICONS.EMAIL },
  { id: "PHONE", icon: ICONS.PHONE },
  { id: "SMS", icon: ICONS.SMS },
];
const PROFESSIONAL_ICON_OPTIONS = [
  { id: "GITHUB", icon: ICONS.GITHUB },
  { id: "BEHANCE", icon: ICONS.BEHANCE },
];
const BUSINESS_ICON_OPTIONS = [
  { id: "GOOGLE_MAPS", icon: ICONS.GOOGLE_MAPS },
  { id: "YELP", icon: ICONS.YELP },
];
/** menu tabs */
/* ================= STYLE DEFAULTS (ADDED) ================= */
const STYLE_DEFAULTS = {
  style_1: {},
  style_2: {},
  style_3: {},
};

/* ================= HELPER (ADDED) ================= */
const applyStyleDefaults = (rule, style) => {
  const defaults = STYLE_DEFAULTS[style] || {};
  const updated = { ...rule, social_style: style };

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
export default function BuytoListRules({ rules, onChange, onLivePreview }) {
  const menuItems = [
    { id: "settings", label: "Settings", icon: "SETTINGS" },
    { id: "design", label: "Design", icon: "DESIGN" },
  ];
  const socialItems = [
    { id: "social", label: "Social Media", icon: "" },
    { id: "messaging", label: "Messaging", icon: "" },
    { id: "contact", label: "Contact", icon: "" },
    { id: "professional", label: "Professional", icon: "" },
    { id: "business", label: "Business", icon: "" },
    { id: "other", label: "Other", icon: "" },
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
    const arr = [...rules, newsocialTRule()];
    updateAll(arr);
    const newIndex = arr.length - 1;
    onLivePreview?.(arr[newIndex], newIndex);
  };

  /* ---------------- BUY LIST FUNCTIONS ---------------- */

  const updateSocialList = (ruleIndex, newList) => {
    const arr = [...rules];
    arr[ruleIndex].social_list = newList;
    updateAll(arr);
    onLivePreview?.(arr[ruleIndex], ruleIndex);
  };

  const createDefaultItem = () => ({
    id: crypto.randomUUID(),
    open: true,
    itemTab: "social",
    social: {
      selected_icon: "FACEBOOK",
      icontype: "icon",
      custom_svg: "",
      image_url: "",
      url: "",
      social_choose: "share",
    },
    messaging: {
      selected_icon: "",
      icontype: "icon",
      custom_svg: "",
      image_url: "",
      url: "",
      social_choose: "profile",
    },
  });

  const addSocialItem = (ruleIndex) => {
    const list = rules[ruleIndex].social_list || [];
    updateSocialList(ruleIndex, [...list, createDefaultItem()]);
  };

  const removeBuyItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].social_list];
    list.splice(itemIndex, 1);
    updateSocialList(ruleIndex, list);
  };

  const duplicateBuyItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].social_list];
    const copy = {
      ...list[itemIndex],
      id: crypto.randomUUID(),
      open: true,
    };
    list.splice(itemIndex + 1, 0, copy);
    updateSocialList(ruleIndex, list);
  };

  const toggleBuyItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].social_list];
    list[itemIndex].open = !list[itemIndex].open;
    updateSocialList(ruleIndex, list);
  };

  const updateBuyItemField = (ruleIndex, itemIndex, tab, field, value) => {
    const list = [...rules[ruleIndex].social_list];

    if (!list[itemIndex][tab]) {
      list[itemIndex][tab] = {};
    }

    list[itemIndex][tab] = {
      ...list[itemIndex][tab],
      [field]: value,
    };

    updateSocialList(ruleIndex, list);
  };

  const reorderSocialList = (ruleIndex, oldIndex, newIndex) => {
    const list = [...rules[ruleIndex].social_list];
    const moved = list.splice(oldIndex, 1)[0];
    list.splice(newIndex, 0, moved);
    updateSocialList(ruleIndex, list);
  };

  useEffect(() => {
    if (rules.length === 0) {
      updateAll([newsocialTRule()]);
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

      const newRules = [...rules];
      newRules[index] = updatedRule;

      updateAll(newRules);
      onLivePreview?.(updatedRule, index);
    };

    window.addEventListener("storeone:changeSocialStyle", handler);

    return () => {
      window.removeEventListener("storeone:changeSocialStyle", handler);
    };
  }, [rules]); // yaha dependency rehne do

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

  const updateItemTab = (ruleIndex, itemIndex, tabId) => {
    const list = [...rules[ruleIndex].social_list];
    list[itemIndex].itemTab = tabId;
    updateSocialList(ruleIndex, list);
  };

  return (
    <div className="store-one-rules-container">
      <h3 className="store-one-section-title">
        {__("Quick Share", "store-one")}
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
                  rule.list_title || __("Untitled", "store-one"),
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

                        <S1Field label={__("Trigger Type", "store-one")}>
                          <SelectControl
                            value={rule.trigger_type}
                            options={[
                              {
                                label: __("All Pages", "store-one"),
                                value: "all_pages",
                              },
                              {
                                label: __("Specific Pages", "store-one"),
                                value: "specific_pages",
                              },
                              {
                                label: __("All Products", "store-one"),
                                value: "all_products",
                              },
                              {
                                label: __("Specific Products", "store-one"),
                                value: "specific_products",
                              },
                              {
                                label: __("Home Page Only", "store-one"),
                                value: "home_page_only",
                              },
                              {
                                label: __("Custom Shortcode", "store-one"),
                                value: "custom_shrtcd",
                              },
                            ]}
                            onChange={(v) =>
                              updateField(index, "trigger_type", v)
                            }
                          />
                        </S1Field>

                        {rule.trigger_type === "specific_pages" &&
                          rule.trigger_type !== "custom_shrtcd" && (
                            <MultiWooSearchSelector
                              label="Select Pages"
                              value={rule.pages || []}
                              onChange={(items) =>
                                updateField(index, "pages", items)
                              }
                              searchType="page"
                              detailedView={true}
                            />
                          )}

                        {rule.trigger_type === "specific_products" &&
                          rule.trigger_type !== "custom_shrtcd" && (
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

                        {/* BUY LIST GROUP */}
                        <S1FieldGroup
                          title={__("Quick Social List", "store-one")}
                        >
                          <SortableWrapper
                            items={rule.social_list}
                            onSortEnd={(oldI, newI) =>
                              reorderSocialList(index, oldI, newI)
                            }
                          >
                            {rule.social_list?.map((item, i) => (
                              <div
                                key={item.id}
                                className="store-one-rule-item inner"
                              >
                                <div className="store-one-rule-header">
                                  <DragHandleDots2Icon className="drag-handle s1-icon" />

                                  <strong className="s1-rule-title">
                                    {sprintf(__("Item %d", "store-one"), i + 1)}
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
                                  <TabSwitcher
                                    defaultTab={item.itemTab || "social"}
                                    onChange={(tabId) =>
                                      updateItemTab(index, i, tabId)
                                    }
                                    tabs={[
                                      {
                                        id: "social",
                                        label: "Social",
                                        content: (
                                          <>
                                            <SocialItemEditor
                                              item={item}
                                              ruleIndex={index}
                                              itemIndex={i}
                                              updateBuyItemField={
                                                updateBuyItemField
                                              }
                                              openMediaLibrary={
                                                openMediaLibrary
                                              }
                                              ICON_OPTIONS={ICON_OPTIONS}
                                            />
                                          </>
                                        ),
                                      },
                                      {
                                        id: "messaging",
                                        label: "Messaging",
                                        content: (
                                          <MessagingItemEditor
                                            item={item}
                                            ruleIndex={index}
                                            itemIndex={i}
                                            updateBuyItemField={
                                              updateBuyItemField
                                            }
                                            openMediaLibrary={openMediaLibrary}
                                            ICON_OPTIONS={
                                              MESSAGING_ICON_OPTIONS
                                            }
                                          />
                                        ),
                                      },
                                      {
                                        id: "contact",
                                        label: "Contact",
                                        content: (
                                            <ContactItemEditor
                                            item={item}
                                            ruleIndex={index}
                                            itemIndex={i}
                                            updateBuyItemField={updateBuyItemField}
                                            openMediaLibrary={openMediaLibrary}
                                            ICON_OPTIONS={CONTACT_ICON_OPTIONS}
                                            />
                                        ),
                                        },
                                      {
                                    id: "professional",
                                    label: "Professional",
                                    content: (
                                        <ProfessionalItemEditor
                                        item={item}
                                        ruleIndex={index}
                                        itemIndex={i}
                                        updateBuyItemField={updateBuyItemField}
                                        openMediaLibrary={openMediaLibrary}
                                        ICON_OPTIONS={PROFESSIONAL_ICON_OPTIONS}
                                        />
                                    ),
                                    },
                                     {
                                    id: "business",
                                    label: "Business",
                                    content: (
                                        <BusinessItemEditor
                                        item={item}
                                        ruleIndex={index}
                                        itemIndex={i}
                                        updateBuyItemField={updateBuyItemField}
                                        openMediaLibrary={openMediaLibrary}
                                        ICON_OPTIONS={BUSINESS_ICON_OPTIONS}
                                        />
                                    ),
                                    },
                                    ]}
                                  />
                                )}
                              </div>
                            ))}
                          </SortableWrapper>

                          <div
                            className="store-one-add-rule"
                            onClick={() => addSocialItem(index)}
                          >
                            + Add List Item
                          </div>
                        </S1FieldGroup>
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
                              value={`[storeone_quick_social id="${rule.flexible_id}"]`}
                              className="s1-shortcode-textarea"
                            />
                            <button
                              type="button"
                              className="s1-shortcode-copy"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `[storeone_quick_social id="${rule.flexible_id}"]`,
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
                        <S1Field
                          label={__("Display Style", "store-one")}
                          visible={true}
                        >
                          <SelectControl
                            value={rule.social_style}
                            options={[
                              {
                                label: __("Style1", "store-one"),
                                value: "style1",
                              },
                              {
                                label: __("Style2", "store-one"),
                                value: "style2",
                              },
                              {
                                label: __("Style3", "store-one"),
                                value: "style3",
                              },
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
                        <S1FieldGroup title={__("Icon", "store-one")}>
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Background", "store-one")}
                              value={rule.icon_bg_clr}
                              onChange={(v) => {
                                const updatedRule = { ...rule, icon_bg_clr: v };
                                updateField(index, "icon_bg_clr", v);
                                onLivePreview?.(updatedRule, index);
                              }}
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Color", "store-one")}
                              value={rule.icon_clr}
                              onChange={(v) => {
                                const updatedRule = { ...rule, icon_clr: v };
                                updateField(index, "icon_clr", v);
                                onLivePreview?.(updatedRule, index);
                              }}
                            />
                          </S1Field>
                        </S1FieldGroup>
                        <S1FieldGroup title={__("Icon Hover", "store-one")}>
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Background", "store-one")}
                              value={rule.icon_bg_hvr_clr}
                              onChange={(v) => {
                                const updatedRule = {
                                  ...rule,
                                  icon_bg_hvr_clr: v,
                                };
                                updateField(index, "icon_bg_hvr_clr", v);
                                onLivePreview?.(updatedRule, index);
                              }}
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={true}
                              label={__("Color", "store-one")}
                              value={rule.icon_hvr_clr}
                              onChange={(v) => {
                                const updatedRule = {
                                  ...rule,
                                  icon_hvr_clr: v,
                                };
                                updateField(index, "icon_hvr_clr", v);
                                onLivePreview?.(updatedRule, index);
                              }}
                            />
                          </S1Field>
                          <UniversalRangeControl
                            label={__("Icon Size", "store-one")}
                            responsive={false}
                            units={["px"]}
                            value={rule.icon_size}
                            onChange={(v) => updateField(index, "icon_size", v)}
                            defaultValue="18px"
                          />
                          <UniversalRangeControl
                            label={__("Border Radius", "store-one")}
                            responsive={false}
                            units={["px", "%"]}
                            value={rule.border_radius}
                            onChange={(v) =>
                              updateField(index, "border_radius", v)
                            }
                            defaultValue="50%"
                          />
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
      {/* Add Rule */}
      <div className="store-one-add-rule" onClick={addRule}>
        {__("+ Add New Rule", "store-one")}
      </div>
    </div>
  );
}
