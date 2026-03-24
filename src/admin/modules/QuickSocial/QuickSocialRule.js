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
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import THBackgroundControl from "@th-storeone-control/color";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import { PLATFORM_CONFIG } from "./platformConfig";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";
import {
  CopyIcon,
  TrashIcon,
  DragHandleDots2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import { ICONS } from "@th-storeone-global/icons";
import SocialItemEditor from "./SocialItemEditor";
import MessagingItemEditor from "./MessagingItemEditor";
import ContactItemEditor from "./ContactItemEditor";
import ProfessionalItemEditor from "./ProfessionalItemEditor";
import BusinessItemEditor from "./BusinessItemEditor";
import OtherItemEditor from "./OtherItemEditor";
import PlacementPriorityControl from "@th-storeone-global/PlacementPriorityControl";
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
        share_text: "{TITLE}",
        custom_label: "",
      },
      messaging: {
        selected_icon: "",
        icontype: "icon",
        custom_svg: "",
        image_url: "",
        url: "",
        social_choose: "profile",
        phone: "",
        message: "",
         custom_label: "",
      },
      contact: {
        selected_icon: "",
        icontype: "icon",
        custom_svg: "",
        image_url: "",
        url: "",
        social_choose: "profile",
        phone: "{PHONE}",
        message: "{MESSAGE}",
         custom_label: "",
      },
      professional: {
        selected_icon: "",
        icontype: "icon",
        custom_svg: "",
        image_url: "",
        url: "",
        social_choose: "profile",
         custom_label: "",
      },
      business: {
        selected_icon: "",
        icontype: "icon",
        custom_svg: "",
        image_url: "",
        url: "",
        social_choose: "profile",
         custom_label: "",
      },
      other: {
        selected_icon: "",
        icontype: "icon",
        custom_svg: "",
        image_url: "",
        url: "",
         custom_label: "",
      },
    },
  ],
  social_style: "style1",
 
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
  position_top: "50%",
  position_bottom: "20px",
  position_left: "10px",
  position_right: "10px",
  original_enabled: true,
  max_show:"4",
  onpage_enabled: false,
  placement: 'after_add_to_cart',
});

const ICON_OPTIONS = [
  { id: "FACEBOOK", icon: ICONS.FACEBOOK },
  { id: "INSTAGRAM", icon: ICONS.INSTAGRAM },
  { id: "TWITTER", icon: ICONS.TWITTER },
  { id: "LINKEDIN", icon: ICONS.LINKEDIN },
  { id: "YOUTUBE", icon: ICONS.YOUTUBE },
  { id: "PINTEREST", icon: ICONS.PINTEREST },
  { id: "TIKTOK", icon: ICONS.TIKTOK },
  { id: "SNAPCHAT", icon: ICONS.SNAPCHAT },
];
const MESSAGING_ICON_OPTIONS = [
  { id: "WHATSAPP", icon: ICONS.WHATSAPP },
  { id: "TELEGRAM", icon: ICONS.TELEGRAM },
  { id: "MESSENGER", icon: ICONS.MESSENGER },
  { id: "VIBER", icon: ICONS.VIBER },
  { id: "SKYPE", icon: ICONS.SKYPE },
  { id: "DISCORD", icon: ICONS.DISCORD },
  { id: "LINE", icon: ICONS.LINE },
];

const CONTACT_ICON_OPTIONS = [
  { id: "EMAIL", icon: ICONS.EMAIL },
  { id: "PHONE", icon: ICONS.PHONE },
  { id: "SMS", icon: ICONS.SMS },
  { id: "GMAIL", icon: ICONS.GMAIL },
  { id: "OUTLOOK", icon: ICONS.OUTLOOK },
];
const PROFESSIONAL_ICON_OPTIONS = [
  { id: "GITHUB", icon: ICONS.GITHUB },
  { id: "BEHANCE", icon: ICONS.BEHANCE },
  { id: "GITLAB", icon: ICONS.GITLAB },
  { id: "DRIBBLE", icon: ICONS.DRIBBLE },
  { id: "STACKOVERFLOW", icon: ICONS.STACKOVERFLOW },
];
const BUSINESS_ICON_OPTIONS = [
  { id: "GOOGLE_MAPS", icon: ICONS.GOOGLE_MAPS },
  { id: "YELP", icon: ICONS.YELP },
  { id: "TRUSTPILOT", icon: ICONS.TRUSTPILOT },
  { id: "GOOGLEBUSS", icon: ICONS.GOOGLEBUSS },
  { id: "TRIPADVISER", icon: ICONS.TRIPADVISER },
];
const OTHER_ICON_OPTIONS = [
  { id: "WEBSITE", icon: ICONS.WEBSITE },
  { id: "RSS", icon: ICONS.RSS },
  { id: "CUSTOM", icon: ICONS.CUSTOM },
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
    const item = { ...list[itemIndex] };

    // Ensure tab object exists
    if (!item[tab]) {
      item[tab] = {};
    }

    // Update current tab field
    item[tab] = {
      ...item[tab],
      [field]: value,
    };

    /**
     * IMPORTANT PART
     * If user selects an icon → reset all other tabs' selected_icon
     */
    if (field === "selected_icon" && value) {
      const allTabs = [
        "social",
        "messaging",
        "contact",
        "professional",
        "business",
        "other",
      ];

      allTabs.forEach((t) => {
        if (t !== tab && item[t]) {
          item[t] = {
            ...item[t],
            selected_icon: "",
          };
        }
      });

      // Also update active tab
      item.itemTab = tab;
    }

    list[itemIndex] = item;
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
  }, [rules]); //

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
    const item = { ...list[itemIndex] };

    // Update tab
    item.itemTab = tabId;

    // Reset all other tabs so only one stays active
    const tabs = [
      "social",
      "messaging",
      "contact",
      "professional",
      "business",
      "other",
    ];

    tabs.forEach((tab) => {
      if (tab !== tabId) {
        item[tab] = {
          selected_icon: "",
        };
      }
    });

    list[itemIndex] = item;

    updateSocialList(ruleIndex, list);
  };
  return (
    <div className="store-one-rules-container">
      <h3 className="store-one-section-title">
        {__("Quick Share", "th-store-one")}
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

                        <S1Field label={__("Trigger Type", "th-store-one")}>
                          <SelectControl
                            value={rule.trigger_type}
                            options={[
                              {
                                label: __("All Pages", "th-store-one"),
                                value: "all_pages",
                              },
                              {
                                label: __("Specific Pages", "th-store-one"),
                                value: "specific_pages",
                              },
                              {
                                label: __("All Products", "th-store-one"),
                                value: "all_products",
                              },
                              {
                                label: __("Specific Products", "th-store-one"),
                                value: "specific_products",
                              },
                              {
                                label: __("Home Page Only", "th-store-one"),
                                value: "home_page_only",
                              },
                               {
                                label: __("All Single", "th-store-one"),
                                value: "all_single",
                              },
                              {
                                label: __("Custom Shortcode", "th-store-one"),
                                value: "custom_shrtcd",
                              },
                            ]}
                            onChange={(v) =>
                              updateField(index, "trigger_type", v)
                            }
                          />
                        </S1Field>

                        {rule.trigger_type === "all_single" && (
                          <S1Field
                            label={__("On Page", "th-store-one")}
                            classN="s1-toggle-wrpapper"
                          >
                          <ToggleControl
                            checked={rule.onpage_enabled}
                            onChange={(v) =>
                              updateField(index, "onpage_enabled", v)
                            }
                          />
                        </S1Field>
                        )}
                        {(rule.trigger_type === "all_single" && rule.onpage_enabled === true) && (
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
                        )}
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
                              label={__("Select Products", "th-store-one")}
                              value={rule.products || []}
                              onChange={(items) =>
                                updateField(index, "products", items)
                              }
                              detailedView={true}
                            />
                          )}

                        {/* BUY LIST GROUP */}
                        <S1FieldGroup
                          title={__("Quick Social List", "th-store-one")}
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
                                className="store-one-rule-item inner quick-social-item"
                              >
                                <div className="store-one-rule-header">
                                  <DragHandleDots2Icon className="drag-handle s1-icon" />

                                  <strong className="s1-rule-title">
                                    {(() => {
                                      const activeTab =
                                        item?.itemTab || "social";
                                      const iconKey =
                                        item?.[activeTab]?.selected_icon;

                                      if (!iconKey) {
                                        return sprintf(
                                          __("Item %d", "th-store-one"),
                                          i + 1,
                                        );
                                      }

                                      const config =
                                        PLATFORM_CONFIG?.[iconKey] ||
                                        PLATFORM_CONFIG?.[
                                          iconKey?.toUpperCase()
                                        ] ||
                                        PLATFORM_CONFIG?.[
                                          iconKey?.toLowerCase()
                                        ];

                                      return (
                                        config?.label ||
                                        iconKey
                                          .toLowerCase()
                                          .replace(/_/g, " ")
                                          .replace(/\b\w/g, (l) =>
                                            l.toUpperCase(),
                                          )
                                      );
                                    })()}
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
                                            updateBuyItemField={
                                              updateBuyItemField
                                            }
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
                                            updateBuyItemField={
                                              updateBuyItemField
                                            }
                                            openMediaLibrary={openMediaLibrary}
                                            ICON_OPTIONS={
                                              PROFESSIONAL_ICON_OPTIONS
                                            }
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
                                            updateBuyItemField={
                                              updateBuyItemField
                                            }
                                            openMediaLibrary={openMediaLibrary}
                                            ICON_OPTIONS={BUSINESS_ICON_OPTIONS}
                                          />
                                        ),
                                      },
                                      {
                                        id: "other",
                                        label: "Other",
                                        content: (
                                          <OtherItemEditor
                                            item={item}
                                            ruleIndex={index}
                                            itemIndex={i}
                                            updateBuyItemField={
                                              updateBuyItemField
                                            }
                                            openMediaLibrary={openMediaLibrary}
                                            ICON_OPTIONS={OTHER_ICON_OPTIONS}
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
                          label={__("Display Style", "th-store-one")}
                          visible={false}
                        >
                          <SelectControl
                            value={rule.social_style}
                            options={[
                              {
                                label: __("Style1", "th-store-one"),
                                value: "style1",
                              },
                              {
                                label: __("Style2", "th-store-one"),
                                value: "style2",
                              },
                              {
                                label: __("Style3", "th-store-one"),
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
                         <UniversalRangeControl
                              label={__("Max Show On Screen", "th-store-one")}
                              responsive={false}
                              value={rule.max_show}
                               min={1}
                               max={10}
                              onChange={(v) =>
                                updateField(index, "max_show", v)
                              }
                              defaultValue="4"
                            />
                        <S1Field
                          label={__("Enable Original", "th-store-one")}
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={rule.original_enabled}
                            onChange={(v) =>
                              updateField(index, "original_enabled", v)
                            }
                          />
                        </S1Field>
                        {!rule.original_enabled && (
                          <>
                            <S1FieldGroup title={__("Icon", "th-store-one")}>
                              <S1Field>
                                <THBackgroundControl
                                  allowGradient={true}
                                  label={__("Background", "th-store-one")}
                                  value={rule.icon_bg_clr}
                                  onChange={(v) => {
                                    const updatedRule = {
                                      ...rule,
                                      icon_bg_clr: v,
                                    };
                                    updateField(index, "icon_bg_clr", v);
                                    onLivePreview?.(updatedRule, index);
                                  }}
                                />
                              </S1Field>
                              <S1Field>
                                <THBackgroundControl
                                  allowGradient={true}
                                  label={__("Color", "th-store-one")}
                                  value={rule.icon_clr}
                                  onChange={(v) => {
                                    const updatedRule = {
                                      ...rule,
                                      icon_clr: v,
                                    };
                                    updateField(index, "icon_clr", v);
                                    onLivePreview?.(updatedRule, index);
                                  }}
                                />
                              </S1Field>
                            </S1FieldGroup>
                            <S1FieldGroup title={__("Icon Hover", "th-store-one")}>
                              <S1Field>
                                <THBackgroundControl
                                  allowGradient={true}
                                  label={__("Background", "th-store-one")}
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
                                  label={__("Color", "th-store-one")}
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
                            </S1FieldGroup>
                          </>
                        )}
                        <UniversalRangeControl
                          label={__("Icon Size", "th-store-one")}
                          responsive={false}
                          units={["px"]}
                          value={rule.icon_size}
                          onChange={(v) => updateField(index, "icon_size", v)}
                          defaultValue="18px"
                        />
                        <UniversalRangeControl
                          label={__("Border Radius", "th-store-one")}
                          responsive={false}
                          units={["px", "%"]}
                          value={rule.border_radius}
                          onChange={(v) =>
                            updateField(index, "border_radius", v)
                          }
                          defaultValue="50%"
                        />

                        <S1FieldGroup title={__("Position", "th-store-one")}>
                          {(rule.social_style === "style1" ||
                            rule.social_style === "style2") && (
                            <UniversalRangeControl
                              label={__("Top", "th-store-one")}
                              responsive={false}
                              units={["%", "px"]}
                              value={rule.position_top}
                              onChange={(v) =>
                                updateField(index, "position_top", v)
                              }
                              defaultValue="50%"
                            />
                          )}
                          {rule.social_style === "style3" && (
                            <UniversalRangeControl
                              label={__("Bottom", "th-store-one")}
                              responsive={false}
                              units={["%", "px"]}
                              value={rule.position_bottom}
                              onChange={(v) =>
                                updateField(index, "position_bottom", v)
                              }
                              defaultValue="20px"
                            />
                          )}
                          {rule.social_style === "style1" && (
                            <UniversalRangeControl
                              label={__("Left", "th-store-one")}
                              responsive={false}
                              units={["%", "px"]}
                              value={rule.position_left}
                              onChange={(v) =>
                                updateField(index, "position_left", v)
                              }
                              defaultValue="10px"
                            />
                          )}
                          {rule.social_style === "style2" && (
                            <UniversalRangeControl
                              label={__("Right", "th-store-one")}
                              responsive={false}
                              units={["%", "px"]}
                              value={rule.position_right}
                              onChange={(v) =>
                                updateField(index, "position_right", v)
                              }
                              defaultValue="10px"
                            />
                          )}
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
      {/* Add Rule */}
      <div className="store-one-add-rule" onClick={addRule}>
        {__("+ Add New Rule", "th-store-one")}
      </div>
      <ResetModuleButton
        moduleId="quick-social"
        onReset={() => {
          updateAll([newsocialTRule()]);
        }}
      />
      </div> 
    </div>
  );
}