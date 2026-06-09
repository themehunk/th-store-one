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
import UniversalBorderControl from "@th-storeone-control/UniversalBorderControl";

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
  flexible_id: crypto.randomUUID(),
  shopable_list: [
    {
      id: crypto.randomUUID(),
      l_title: "Product List Item",
      items: [
        {
          id: crypto.randomUUID(),
          video_url: "",
          products: [],
        },
      ],
      open: true,
    },
  ],
  product_info_position: "bottom",
  show_prd_popup: false,
  video_auto_play: true,
  video_mute: true,
  prd_delay: "",

  open: true,
  title: "Shoppable Videos",
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
  border: {
    width: {
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
    style: "solid",
    color: "transparent",
    radius: {
      top: "10px",
      right: "10px",
      bottom: "10px",
      left: "10px",
    },
  },
  title_color: "#111",
  prd_title_color: "#111",
  prd_price_color: "#111",
  bg_color: "#ffffff91",
  prd_cart_bg_color: "#22c55e",
  prd_cart_icon_color: "#fff",
  vicon_color: "#fff",
  vicon_bg_color: "#00000073",
  bar_color: "#fff",
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

  const addVideoProduct = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].shopable_list];

    if (!list[itemIndex].items) {
      list[itemIndex].items = [];
    }

    list[itemIndex].items.push({
      id: crypto.randomUUID(),
      video_url: "",
      products: [],
    });

    updateShopableList(ruleIndex, list);
  };

  const removeVideoProduct = (ruleIndex, itemIndex, videoIndex) => {
    const list = [...rules[ruleIndex].shopable_list];

    list[itemIndex].items.splice(videoIndex, 1);

    updateShopableList(ruleIndex, list);
  };

  const updateVideoProductField = (
    ruleIndex,
    itemIndex,
    videoIndex,
    field,
    value,
  ) => {
    const list = [...rules[ruleIndex].shopable_list];

    list[itemIndex].items[videoIndex][field] = value;

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

  const openVideoLibrary = (callback) => {
    const media = window.wp.media({
      title: "Select Video",
      button: {
        text: "Use Video",
      },
      library: {
        type: "video",
      },
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
        {__("Shoppable Videos", "th-store-one")}
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
                                    {sprintf(
                                      __(
                                        "Product List Item %d",
                                        "th-store-one",
                                      ),
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
                                    {(item.items || []).map(
                                      (videoItem, vIndex) => (
                                        <div
                                          key={videoItem.id}
                                          className="store-one-rule-item inner"
                                        >
                                          <div className="store-one-rule-header">
                                            <strong className="s1-rule-title">
                                              Video Product {vIndex + 1}
                                            </strong>

                                            <TrashIcon
                                              className="s1-icon s1-icon-danger"
                                              onClick={() =>
                                                removeVideoProduct(
                                                  index,
                                                  i,
                                                  vIndex,
                                                )
                                              }
                                            />
                                          </div>

                                          <div className="store-one-rule-body">
                                            <S1Field label="Video">
                                              <div className="s1-image-upload-wrapper">
                                                {videoItem.video_url ? (
                                                  <div className="s1-image-card video-card">
                                                    <div className="s1-video-preview">
                                                      <video
                                                        src={
                                                          videoItem.video_url
                                                        }
                                                        controls
                                                        style={{
                                                          width: "100%",
                                                          display: "block",
                                                          borderRadius: "8px",
                                                        }}
                                                      />
                                                    </div>

                                                    <div className="s1-image-actions">
                                                      <button
                                                        type="button"
                                                        className="s1-btn s1-btn-edit"
                                                        onClick={() =>
                                                          openVideoLibrary(
                                                            (media) =>
                                                              updateVideoProductField(
                                                                index,
                                                                i,
                                                                vIndex,
                                                                "video_url",
                                                                media.url,
                                                              ),
                                                          )
                                                        }
                                                      >
                                                        <span className="s1-btn-icon">
                                                          {ICONS.SETTINGS}
                                                        </span>
                                                        Change
                                                      </button>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    className="s1-upload-card"
                                                    onClick={() =>
                                                      openVideoLibrary(
                                                        (media) =>
                                                          updateVideoProductField(
                                                            index,
                                                            i,
                                                            vIndex,
                                                            "video_url",
                                                            media.url,
                                                          ),
                                                      )
                                                    }
                                                  >
                                                    <span className="s1-btn-icon">
                                                      {ICONS.UploadIcon}
                                                    </span>

                                                    <div className="s1-upload-text">
                                                      <p>
                                                        <strong>
                                                          Choose MP4, MOV & WebM
                                                        </strong>
                                                      </p>

                                                      <small className="s1-upload-note">
                                                        Play instantly from your
                                                        device.
                                                      </small>
                                                    </div>
                                                  </button>
                                                )}
                                              </div>
                                            </S1Field>

                                            <MultiWooSearchSelector
                                              searchType="product"
                                              label="Choose Products"
                                              value={videoItem.products || []}
                                              onChange={(value) =>
                                                updateVideoProductField(
                                                  index,
                                                  i,
                                                  vIndex,
                                                  "products",
                                                  value,
                                                )
                                              }
                                              detailedView={true}
                                              productFilters={["category"]}
                                            />
                                          </div>
                                        </div>
                                      ),
                                    )}
                                    <div
                                      className="store-one-add-video-card"
                                      onClick={() => addVideoProduct(index, i)}
                                    >
                                      <div className="store-one-add-video-card__icon">
                                        +
                                      </div>

                                      <div className="store-one-add-video-card__content">
                                        <strong>Add Video Product</strong>

                                        <span>
                                          Create another shoppable video item
                                        </span>
                                      </div>
                                    </div>
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
                            label={__("Video Auto Play", "th-store-one")}
                            description={__(
                              "Automatically start playing videos and switch to the next item based on the configured delay or video duration.",
                              "th-store-one",
                            )}
                          >
                            <ToggleControl
                              checked={rule.video_auto_play}
                              onChange={(v) =>
                                updateField(index, "video_auto_play", v)
                              }
                            />
                          </S1Field>
                          <S1Field
                            label={__("Mute", "th-store-one")}
                            description={__(
                              "Enabling this option will automatically turn off mute.",
                              "th-store-one",
                            )}
                          >
                            <ToggleControl
                              checked={rule.video_mute}
                              onChange={(v) =>
                                updateField(index, "video_mute", v)
                              }
                            />
                          </S1Field>
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
                        </S1FieldGroup>
                        <S1Field label={__("Shortcode", "th-store-one")}>
                          <p className="s1-shortcode-description">
                            {__(
                              "Use this shortcode to display this Shoppable Videos anywhere on your site (posts, pages, widgets, or page builders).",
                              "th-store-one",
                            )}
                          </p>
                          <div className="s1-shortcode-wrapper">
                            <textarea
                              readOnly
                              value={`[th_store_one_shopable_video id="${rule.flexible_id}"]`}
                              className="s1-shortcode-textarea"
                            />

                            <button
                              type="button"
                              className="s1-shortcode-copy"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `[th_store_one_shopable_video id="${rule.flexible_id}"]`,
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
                          <S1Field
                            label={__(
                              "Hide Inherit Navigation",
                              "th-store-one",
                            )}
                            classN="s1-toggle-wrpapper"
                          >
                            <ToggleControl
                              checked={rule.hide_navigation}
                              onChange={(v) =>
                                updateField(index, "hide_navigation", v)
                              }
                            />
                          </S1Field>
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
                          label={__("Choose Style", "th-store-one")}
                          visible={false}
                        >
                          <SelectControl
                            value={rule.list_style}
                            options={[
                              { label: "Style1", value: "style1" },
                              { label: "Style2", value: "style2" },
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

                        <S1Field
                          label={__("Product Info Position", "th-store-one")}
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

                        <S1Field>
                          <THBackgroundControl
                            allowGradient={false}
                            label="Title Color"
                            value={rule.title_color}
                            onChange={(v) =>
                              updateField(index, "title_color", v)
                            }
                          />
                        </S1Field>

                        <UniversalBorderControl
                          value={rule.border}
                          onChange={(v) => updateField(index, "border", v)}
                        />

                        <S1FieldGroup title="Product Info Color">
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={false}
                              label="Background"
                              value={rule.bg_color}
                              onChange={(v) =>
                                updateField(index, "bg_color", v)
                              }
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={false}
                              label="Title"
                              value={rule.prd_title_color}
                              onChange={(v) =>
                                updateField(index, "prd_title_color", v)
                              }
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={false}
                              label="Price"
                              value={rule.prd_price_color}
                              onChange={(v) =>
                                updateField(index, "prd_price_color", v)
                              }
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              label="Cart Background"
                              value={rule.prd_cart_bg_color}
                              onChange={(v) =>
                                updateField(index, "prd_cart_bg_color", v)
                              }
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={false}
                              label="Cart Icon"
                              value={rule.prd_cart_icon_color}
                              onChange={(v) =>
                                updateField(index, "prd_cart_icon_color", v)
                              }
                            />
                          </S1Field>
                        </S1FieldGroup>
                        <S1FieldGroup title="Progress Bar Color">
                          <S1Field>
                            <THBackgroundControl
                              label="Bar Fill"
                              value={rule.bar_color}
                              onChange={(v) =>
                                updateField(index, "bar_color", v)
                              }
                            />
                          </S1Field>
                        </S1FieldGroup>
                        <S1FieldGroup title="Video Icon Color">
                          <S1Field>
                            <THBackgroundControl
                              label="Background"
                              value={rule.vicon_bg_color}
                              onChange={(v) =>
                                updateField(index, "vicon_bg_color", v)
                              }
                            />
                          </S1Field>
                          <S1Field>
                            <THBackgroundControl
                              allowGradient={false}
                              label="Color"
                              value={rule.vicon_color}
                              onChange={(v) =>
                                updateField(index, "vicon_color", v)
                              }
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
