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
import DeviceSelector from "@th-storeone-global/DeviceSelector";
import THBackgroundControl from "@th-storeone-control/color";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import UniversalBorderControl from "@th-storeone-control/UniversalBorderControl";
import UniversalDimensionControl from "@th-storeone-control/UniversalDimensionControl";
import {
  CopyIcon,
  TrashIcon,
  DragHandleDots2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  TextAlignLeftIcon,
} from "@radix-ui/react-icons";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import { ICONS } from "@th-storeone-global/icons";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";
import PlacementPriorityControl from "@th-storeone-global/PlacementPriorityControl";

const newSaleRule = () => ({
  flexible_id: crypto.randomUUID(),
  noti_style: "style1",
  open: true,
  status: "active",
  data_source: "real-order",
  product_to_show: 5,
  show_time: "24_hours",
  order_status: [],
  products: [],
  exclude_products_enabled: false,
  exclude_products: [],
  trigger_type: "all_products",
  fake_orders: [
    {
      id: crypto.randomUUID(),
      fakeCustomerName: "",
      fakeCustomerAddress: "{city}, {state}, {country}, {address}",
      fakeTime:"1 Week ago",
      fakePrductSrc: "store_product",
      fakeProductList: [],
      fakeCustomProduct: "{Product Name}, {Price}, {Sku}",
      fakeprd_image_url: "",
      fakeprd_url: "https://",
      open: true,
    },
  ],
  display_notification: "{customer name} from {city} ",
  display_notification_n:"purchase, {product name} {sku}",
  display_duration: 4,
  delay_between: 5,
  position: "bottom_right",
  devices: ["desktop"],
  initial_delay: "2",
  random_delay: true,
  random_delay_range: "4",
  animation: "slide",
  loop: true,
  productsInclude: [],
  categoriesInclude: [],
  exclude_productsInclude_enabled: false,
  exclude_categoryInclude_enabled: false,
  noti_title_clr: "#000000",
  noti_text_clr:"#1e1e1e",
  noti_bg_clr: "#fff",
  noti_border: {
    width: {
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
    },
    style: "solid",
    color: "#e5e7eb",
    radius: {
      top: "10px",
      right: "10px",
      bottom: "10px",
      left: "10px",
    },
  },
  noti_padding: {
    top: "15px",
    right: "15px",
    bottom: "15px",
    left: "15px",
  }
  
});

const STYLE_DEFAULTS = {
  style1: {
    noti_title_clr: "#111",
    noti_bg_clr: "#ffffff",
    noti_text_clr:"#1e1e1e",
    noti_border: {
      style: "solid",
      color: "#e5e7eb",
      width: {
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
    },
    radius: {
      top: "10px",
      right: "10px",
      bottom: "10px",
      left: "10px",
    },
      }
  },
  style2: {
   noti_title_clr: "#fff",
   noti_text_clr:"#fff",
    noti_bg_clr: "#111827",
    noti_border: {
      style: "solid",
        color: "#111827",
        width: {
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
    },
    radius: {
      top: "10px",
      right: "10px",
      bottom: "10px",
      left: "10px",
    },
      }
  },
  style3: {
    noti_title_clr: "#111",
    noti_bg_clr: "#ffffff",
    noti_text_clr:"#1e1e1e",
    noti_border: {
        style: "dashed",
        color: "#cbd5e1",
        width: {
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
    },
    radius: {
      top: "10px",
      right: "10px",
      bottom: "10px",
      left: "10px",
    },
      }
  },
  style4: {
    noti_title_clr: "#fff",
    noti_text_clr:"#fff",
    noti_bg_clr: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    noti_border: {
        style: "solid",
        color: "transparent",
        width: {
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
    },
    radius: {
      top: "10px",
      right: "10px",
      bottom: "10px",
      left: "10px",
    },
      }
  },
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

/* ---------------- MAIN ---------------- */
export default function SaleNotificationRule({
  rules,
  onChange,
  onLivePreview,
}) {
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
    const arr = [...rules, newSaleRule()];
    updateAll(arr);
    const newIndex = arr.length - 1;
    onLivePreview?.(arr[newIndex], newIndex);
  };

  useEffect(() => {
    if (rules.length === 0) {
      updateAll([newSaleRule()]);
    } else {
      const arr = [...rules];
      arr[0].open = true;
      updateAll(arr);
    }
  }, []);
  /* ================= HELPER (ADDED) ================= */
  const applyStyleDefaults = (rule, style) => {
    const defaults = STYLE_DEFAULTS[style] || {};
    const updated = { ...rule, noti_style: style };

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

    window.addEventListener("storeone:changeNotifyStyle", handler);
    return () =>
      window.removeEventListener("storeone:changeNotifyStyle", handler);
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

  const updateFakeList = (ruleIndex, newList) => {
    const arr = [...rules];
    arr[ruleIndex].fake_orders = newList;
    updateAll(arr);
    onLivePreview?.(arr[ruleIndex], ruleIndex);
  };

  const addFakeItem = (ruleIndex) => {
    const list = rules[ruleIndex].fake_orders || [];
    updateFakeList(ruleIndex, [
      ...list,
      {
        id: crypto.randomUUID(),
        text: "",
        open: true,
      },
    ]);
  };

  const removeFakeItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].fake_orders];
    list.splice(itemIndex, 1);
    updateFakeList(ruleIndex, list);
  };

  const updateFakeItemField = (ruleIndex, itemIndex, field, value) => {

  const list = rules[ruleIndex].fake_orders.map((item, i) => {
    if (i === itemIndex) {
      return {
        ...item,
        [field]: value,
      };
    }
    return item;
  });

  updateFakeList(ruleIndex, list);
};

  const toggleFakeItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].fake_orders];
    list[itemIndex].open = !list[itemIndex].open;
    updateFakeList(ruleIndex, list);
  };

  const reorderFakeList = (ruleIndex, oldIndex, newIndex) => {
    const list = [...rules[ruleIndex].fake_orders];
    const moved = list.splice(oldIndex, 1)[0];
    list.splice(newIndex, 0, moved);
    updateFakeList(ruleIndex, list);
  };

  const duplicateFakeItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].fake_orders];
    const copy = {
      ...list[itemIndex],
      id: crypto.randomUUID(),
      open: true,
    };
    list.splice(itemIndex + 1, 0, copy);
    updateFakeList(ruleIndex, list);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="store-one-rules-container">
      <h3 className="store-one-section-title">
        {__("Sale Notifications", "th-store-one")}
      </h3>
      <SortableWrapper items={rules} onSortEnd={reorder}>
        {rules.map((rule, index) => (
          <div key={rule.flexible_id} className="store-one-rule-item">
            {/* HEADER */}
            <div className="store-one-rule-header">
              <DragHandleDots2Icon className="drag-handle s1-icon" />

              <strong className="s1-rule-title">
                {sprintf(
                  "Rule %d: %s",
                  index + 1,
                  rule.title || "Notification",
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
                        {/* ENABLE */}
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

                        <S1Field label={__("Data Source", "th-store-one")}>
                          <SelectControl
                            value={rule.data_source}
                            options={[
                              {
                                label: __("Real Order", "th-store-one"),
                                value: "real-order",
                              },
                              {
                                label: __("Fake Order", "th-store-one"),
                                value: "fake-order",
                              },
                            ]}
                            onChange={(v) =>
                              updateField(index, "data_source", v)
                            }
                          />
                        </S1Field>

                        {/* real rule */}
                        {rule.data_source == "real-order" ? (
                          <>
                            <S1FieldGroup
                              title={__("Real Order Settings", "th-store-one")}
                            >
                              <S1Field
                                label={__(
                                  "Number of Product to Show in Notifications",
                                  "th-store-one",
                                )}
                              >
                                <TextControl
                                  value={rule.product_to_show}
                                  onChange={(v) =>
                                    updateField(index, "product_to_show", v)
                                  }
                                />
                              </S1Field>
                              <S1Field
                                label={__(
                                  "Show Order from last",
                                  "th-store-one",
                                )}
                              >
                                <SelectControl
                                  value={rule.show_time}
                                  options={[
                                    {
                                      label: "---- Days ----",
                                      value: "",
                                      disabled: true,
                                    },
                                    {
                                      label: "Last 24 Hours",
                                      value: "24_hours",
                                    },
                                    { label: "Last 3 Days", value: "3_days" },
                                    { label: "Last 5 Days", value: "5_days" },

                                    {
                                      label: "---- Weeks ----",
                                      value: "",
                                      disabled: true,
                                    },
                                    { label: "1 Week", value: "1_week" },
                                    { label: "2 Weeks", value: "2_weeks" },
                                    { label: "3 Weeks", value: "3_weeks" },

                                    {
                                      label: "---- Months ----",
                                      value: "",
                                      disabled: true,
                                    },
                                    { label: "1 Month", value: "1_month" },
                                    { label: "2 Months", value: "2_months" },
                                    { label: "3 Months", value: "3_months" },
                                    {
                                      label: "---- Years ----",
                                      value: "",
                                      disabled: true,
                                    },
                                    { label: "1 Year", value: "1_year" },
                                    { label: "2 Years", value: "2_years" },
                                    { label: "3 Years", value: "3_years" },
                                  ]}
                                  onChange={(v) =>
                                    updateField(index, "show_time", v)
                                  }
                                />
                              </S1Field>
                              <S1Field
                                label={__("Order Status", "th-store-one")}
                              >
                                <MultiWooSearchSelector
                                  searchType="order_status"
                                  value={rule.order_status || []}
                                  onChange={(items) =>
                                    updateField(index, "order_status", items)
                                  }
                                />
                              </S1Field>
                              <MultiWooSearchSelector
                                searchType="product"
                               
                                label={__(
                                  "Add Selected Products to List",
                                  "th-store-one",
                                )}
                                value={rule.products || []}
                                onChange={(items) =>
                                  updateField(index, "products", items)
                                }
                                detailedView={true}
                              />
                              <ExcludeWooCondition
                                label={__("Exclude products", "th-store-one")}
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
                            </S1FieldGroup>
                          </>
                        ) : (
                          <S1FieldGroup title="Fake Orders">
                            <SortableWrapper
                              items={rule.fake_orders}
                              onSortEnd={(oldI, newI) =>
                                reorderFakeList(index, oldI, newI)
                              }
                            >
                              {rule.fake_orders?.map((item, i) => (
                                <div
                                  key={item.id}
                                  className="store-one-rule-item inner"
                                >
                                  <div className="store-one-rule-header">
                                    <DragHandleDots2Icon className="drag-handle s1-icon" />
                                    <strong className="s1-rule-title">
                                      {sprintf(
                                        __("Fake %d", "th-store-one"),
                                        i + 1,
                                      )}
                                    </strong>
                                    <CopyIcon
                                      className="s1-icon"
                                      onClick={() =>
                                        duplicateFakeItem(index, i)
                                      }
                                    />
                                    <TrashIcon
                                      className="s1-icon s1-icon-danger"
                                      onClick={() => removeFakeItem(index, i)}
                                    />

                                    {item.open ? (
                                      <ChevronUpIcon
                                        onClick={() => toggleFakeItem(index, i)}
                                      />
                                    ) : (
                                      <ChevronDownIcon
                                        onClick={() => toggleFakeItem(index, i)}
                                      />
                                    )}
                                  </div>
                                  {item.open && (
                                    <div className="store-one-rule-body">
                                      <S1Field
                                        label={__(
                                          "Customer Name",
                                          "th-store-one",
                                        )}
                                      >
                                        <TextControl
                                          value={item.fakeCustomerName}
                                          onChange={(v) =>
                                            updateFakeItemField(
                                              index,
                                              i,
                                              "fakeCustomerName",
                                              v,
                                            )
                                          }
                                        />
                                      </S1Field>

                                      <S1Field
                                        label={__(
                                          "Customer Address",
                                          "th-store-one",
                                        )}
                                      >
                                        <TextControl
                                          value={item.fakeCustomerAddress}
                                          onChange={(v) =>
                                            updateFakeItemField(
                                              index,
                                              i,
                                              "fakeCustomerAddress",
                                              v,
                                            )
                                          }
                                          placeholder="{customer_name}, {city}, {state}, {country}, {address}"
                                        />
                                        
                                      </S1Field>
                                      <S1Field
                                        label={__(
                                          "Time to Sold",
                                          "th-store-one",
                                        )}
                                      >
                                        <TextControl
                                          value={item.fakeTime}
                                          onChange={(v) =>
                                            updateFakeItemField(
                                              index,
                                              i,
                                              "fakeTime",
                                              v,
                                            )
                                          }
                                          placeholder="1 week ago"
                                        />
                                        
                                      </S1Field>

                                      <S1Field
                                        label={__(
                                          "Product Source",
                                          "th-store-one",
                                        )}
                                      >
                                        <SelectControl
                                          value={item.fakePrductSrc}
                                          options={[
                                            {
                                              label: __(
                                                "Store Product",
                                                "th-store-one",
                                              ),
                                              value: "store_product",
                                            },
                                            {
                                              label: __(
                                                "Custom Product",
                                                "th-store-one",
                                              ),
                                              value: "custom_product",
                                            },
                                          ]}
                                          onChange={(v) =>
                                            updateFakeItemField(
                                              index,
                                              i,
                                              "fakePrductSrc",
                                              v,
                                            )
                                          }
                                        />
                                      </S1Field>
                                      {item.fakePrductSrc ===
                                      "store_product" ? (
                                        <MultiWooSearchSelector
                                          searchType="product"
                                          label="Select Product"
                                          value={item.fakeProductList || []}
                                          onChange={(items) =>
                                            updateFakeItemField(index, i, "fakeProductList", items)
                                          }
                                          detailedView={true}
                                          isSingle={true}
                                        />
                                      ) : (
                                        <>
                                          <S1Field
                                            label={__(
                                              "Product Details",
                                              "th-store-one",
                                            )}
                                          >
                                            <TextControl
                                              value={item.fakeCustomProduct}
                                              onChange={(v) =>
                                                updateFakeItemField(
                                                  index,
                                                  i,
                                                  "fakeCustomProduct",
                                                  v,
                                                )
                                              }
                                              placeholder="{Product Name}, {Price}, {Sku}"
                                            />
                                            <p className="s1-help-text">
                                              Available Tags:{" "}
                                              {
                                                "{order}, {invoice}, {ref}"
                                              }
                                            </p>
                                          </S1Field>
                                          <S1Field
                                            label={__(
                                              "Product Link",
                                              "th-store-one",
                                            )}
                                          >
                                            <TextControl
                                              value={item.fakeprd_url}
                                              onChange={(v) =>
                                                updateFakeItemField(
                                                  index,
                                                  i,
                                                  "fakeprd_url",
                                                  v,
                                                )
                                              }
                                              placeholder="https://"
                                            />
                                            
                                          </S1Field>
                                          <S1Field
                                            label={__(
                                              "Product Image",
                                              "th-store-one",
                                            )}
                                          >
                                            <div className="s1-image-upload-wrapper">
                                              {item.fakeprd_image_url ? (
                                                <div className="s1-image-card">
                                                  <div className="s1-image-preview">
                                                    <img
                                                      src={
                                                        item.fakeprd_image_url
                                                      }
                                                      alt=""
                                                    />
                                                  </div>

                                                  <div className="s1-image-actions">
                                                    <button
                                                      type="button"
                                                      className="s1-btn s1-btn-edit"
                                                      onClick={() =>
                                                        openMediaLibrary(
                                                          (media) =>
                                                            updateFakeItemField(
                                                              index,
                                                              i,
                                                              "fakeprd_image_url",
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

                                                    <button
                                                      type="button"
                                                      className="s1-btn s1-btn-remove"
                                                      onClick={() =>
                                                        updateFakeItemField(
                                                          index,
                                                          i,
                                                          "fakeprd_image_url",
                                                          "",
                                                        )
                                                      }
                                                    >
                                                      <TrashIcon />
                                                    </button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  className="s1-upload-card"
                                                  onClick={() =>
                                                    openMediaLibrary((media) =>
                                                      updateFakeItemField(
                                                        index,
                                                        i,
                                                        "fakeprd_image_url",
                                                        media.url,
                                                      ),
                                                    )
                                                  }
                                                >
                                                  <span className="s1-btn-icon">
                                                    {ICONS.DISPLAY}
                                                  </span>
                                                  <div className="s1-upload-text">
                                                    <strong>
                                                      Upload Image
                                                    </strong>
                                                    <p>
                                                      Select or upload an image
                                                      file
                                                    </p>
                                                    <small className="s1-upload-note">
                                                      PNG, JPG, and SVG formats
                                                      supported
                                                    </small>
                                                  </div>
                                                </button>
                                              )}
                                            </div>
                                          </S1Field>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </SortableWrapper>
                            <div
                              className="store-one-add-rule"
                              onClick={() => addFakeItem(index)}
                            >
                              + Add Fake Order
                            </div>
                          </S1FieldGroup>
                        )}
                      </div>
                    ),
                  },

                  /* ================= VISIBILITY ================= */
                  {
                    id: "displaynotification",
                    label: "Notification",
                    icon: <TextAlignLeftIcon />,
                    content: (
                      <div className="store-one-rule-body">
                        <S1Field
                          label={__(
                            "Display Notification Format (Bold)",
                            "th-store-one",
                          )}
                        >
                          <TextControl
                            value={rule.display_notification}
                            onChange={(items) =>
                              updateField(index, "display_notification", items)
                            }
                            placeholder="{customer name} from {city}"
                          />
                          <p className="s1-help-text">
                            Available Tags:{" "}
                            {
                              "{customer_name}, {city}, {state}, {country}, {product_name}, {order}, {invoice}, {ref}"
                            }
                          </p>
                        </S1Field>
                        <S1Field
                          label={__(
                            "Display Notification Format",
                            "th-store-one",
                          )}
                        >
                          <TextControl
                            value={rule.display_notification_n}
                            onChange={(items) =>
                              updateField(index, "display_notification_n", items)
                            }
                            placeholder="purchase {product_name} {sku}"
                          />
                          <p className="s1-help-text">
                            Available Tags:{" "}
                            {
                              "{customer_name}, {city}, {state}, {country}, {product_name}, {order}, {invoice}, {ref}"
                            }
                          </p>
                        </S1Field>
                        {/* ================= TIMING SETTINGS ================= */}

                        <S1FieldGroup
                          title={__("Notification Timing", "th-store-one")}
                        >
                          {/*Display Duration */}
                          <S1Field
                            label={__("Display Duration (sec)", "th-store-one")}
                          >
                            <TextControl
                              type="number"
                              value={rule.display_duration || 4}
                              onChange={(v) =>
                                updateField(
                                  index,
                                  "display_duration",
                                  parseInt(v) || 0,
                                )
                              }
                              help="How long each notification stays visible"
                            />
                          </S1Field>

                          {/* Delay Between Notifications */}
                          <S1Field
                            label={__(
                              "Delay Between Notifications (sec)",
                              "th-store-one",
                            )}
                          >
                            <TextControl
                              type="number"
                              value={rule.delay_between || 5}
                              onChange={(v) =>
                                updateField(
                                  index,
                                  "delay_between",
                                  parseInt(v) || 0,
                                )
                              }
                              help="Time gap before showing next notification"
                            />
                          </S1Field>
                        </S1FieldGroup>

                        {/* ================= POSITION ================= */}

                        <S1FieldGroup title={__("Position", "th-store-one")}>
                          <S1Field
                            label={__("Notification Position", "th-store-one")}
                          >
                            <SelectControl
                              value={rule.position || "bottom_right"}
                              options={[
                                {
                                  label: "Bottom Right",
                                  value: "bottom_right",
                                },
                                { label: "Bottom Left", value: "bottom_left" },
                                { label: "Top Right", value: "top_right" },
                                { label: "Top Left", value: "top_left" },
                              ]}
                              onChange={(v) =>
                                updateField(index, "position", v)
                              }
                            />
                          </S1Field>

                          <S1FieldGroup
                            title={__("Behavior Settings", "th-store-one")}
                          >
                            {/* Initial Delay */}
                            <S1Field
                              label={__("Initial Delay Range(sec)", "th-store-one")}
                            >
                              <UniversalRangeControl
                                value={String(rule.initial_delay ?? 2)}
                                min={1}
                                max={30}
                                step={1}
                                units={null}
                                onChange={(v) =>
                                  updateField(index, "initial_delay", v)
                                }
                              />
                            </S1Field>

                            {/* Random Delay */}
                            <S1Field label={__("Random Delay", "th-store-one")}>
                              <ToggleControl
                                checked={rule.random_delay}
                                onChange={(v) =>
                                  updateField(index, "random_delay", v)
                                }
                              />
                            </S1Field>

                            {/* Random Delay Range */}
                            {rule.random_delay && (
                              <S1Field
                                label={__("Random Delay Range (sec)", "th-store-one")}
                              >
                                <UniversalRangeControl
                                  value={String(rule.random_delay_range ?? 4)}
                                  min={1}
                                  max={30}
                                  step={1}
                                  units={null}
                                  onChange={(v) =>
                                    updateField(index, "random_delay_range", v)
                                  }
                                />
                              </S1Field>
                            )}

                            {/*Animation */}
                            <S1Field
                              label={__(
                                "Notification Animation",
                                "th-store-one",
                              )}
                            >
                              <SelectControl
                                value={rule.animation || "slide"}
                                options={[
                                  { label: "Slide In", value: "slide" },
                                  { label: "Fade In", value: "fade" },
                                  { label: "Zoom In", value: "zoom" },
                                ]}
                                onChange={(v) =>
                                  updateField(index, "animation", v)
                                }
                              />
                            </S1Field>

                            {/*Loop */}
                            <S1Field
                              label={__("Loop Notifications", "th-store-one")}
                            >
                              <ToggleControl
                                checked={rule.loop}
                                onChange={(v) => updateField(index, "loop", v)}
                              />
                            </S1Field>
                          </S1FieldGroup>
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
                        <S1Field label="Trigger Type">
                          <SelectControl
                            value={rule.trigger_type}
                            options={[
                              { label: "All Pages", value: "all_products" },
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
                            value={rule.productsInclude || []}
                            onChange={(items) =>
                              updateField(index, "productsInclude", items)
                            }
                          />
                        )}

                        {rule.trigger_type === "specific_categories" && (
                          <MultiWooSearchSelector
                            searchType="category"
                            label="Select Categories"
                            value={rule.categoriesInclude}
                            onChange={(items) =>
                              updateField(index, "categoriesInclude", items)
                            }
                          />
                        )}
                        {(rule.trigger_type === "specific_products" ||
                          rule.trigger_type === "all_products") && (
                          <ExcludeWooCondition
                            label={__("Exclude products", "th-store-one")}
                            searchType="product"
                            enabled={rule.exclude_productsInclude_enabled}
                            items={rule.exclude_products}
                            onToggle={(v) =>
                              updateField(
                                index,
                                "exclude_productsInclude_enabled",
                                v,
                              )
                            }
                            onChangeItems={(items) =>
                              updateField(
                                index,
                                "exclude_productsInclude",
                                items,
                              )
                            }
                            detailedView={true}
                          />
                        )}
                        {rule.trigger_type === "specific_categories" && (
                          <ExcludeWooCondition
                            label={__("Exclude categories", "th-store-one")}
                            searchType="category"
                            enabled={rule.exclude_categoriesInclude_enabled}
                            items={rule.exclude_categoriesInclude}
                            onToggle={(v) =>
                              updateField(
                                index,
                                "exclude_categoriesInclude_enabled",
                                v,
                              )
                            }
                            onChangeItems={(items) =>
                              updateField(
                                index,
                                "exclude_categoriesInclude",
                                items,
                              )
                            }
                            detailedView={true}
                          />
                        )}
                        <S1Field label={__("Device Visibility", "th-store-one")}>
                          <DeviceSelector
                            value={rule.devices || ["desktop"]}
                            onChange={(v) => updateField(index, "devices", v)}
                          />
                        </S1Field>
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
                            label={__("Background", "th-store-one")}
                            value={rule.noti_bg_clr || "#ffffff"}
                            onChange={(v) => {
                              const updatedRule = { ...rule, noti_bg_clr: v };
                              updateField(index, "noti_bg_clr", v);
                              onLivePreview?.(updatedRule, index);
                            }}
                          />
                        </S1Field>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Title", "th-store-one")}
                            value={rule.noti_title_clr}
                            onChange={(v) => {
                              const updatedRule = {
                                ...rule,
                                noti_title_clr: v,
                                noti_title_clr_auto: false,
                              };
                              updateField(index, "noti_title_clr", v);
                              updateField(index, "noti_title_clr_auto", false);
                              onLivePreview?.(updatedRule, index);
                            }}
                          />
                        </S1Field>
                        <S1Field>
                          <THBackgroundControl
                            allowGradient={true}
                            label={__("Text", "th-store-one")}
                            value={rule.noti_text_clr}
                            onChange={(v) => {
                              const updatedRule = {
                                ...rule,
                                noti_text_clr: v,
                                noti_text_clr_auto: false,
                              };
                              updateField(index, "noti_text_clr", v);
                              updateField(index, "noti_text_clr_auto", false);
                              onLivePreview?.(updatedRule, index);
                            }}
                          />
                        </S1Field>
                        <UniversalDimensionControl
                          label="Padding"
                          value={rule?.noti_padding}
                          responsive={false}
                          onChange={(v) =>
                            updateField(index, "noti_padding", v)
                          }
                        />
                        <UniversalBorderControl
                          value={rule?.noti_border}
                          onChange={(v) => updateField(index, "noti_border", v)}
                        />
                        <S1Field
                          label={__("Display Style", "th-store-one")}
                          visible={false}
                        >
                          <SelectControl
                            value={rule.noti_style}
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
                              {
                                label: __("Style4", "th-store-one"),
                                value: "style4",
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
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </div>
        ))}
      </SortableWrapper>

      {/* ADD RULE */}
      <div className="store-one-rules-footer">
        <div className="store-one-add-rule" onClick={addRule}>
          + Add New Notification Rule
        </div>

        <ResetModuleButton
          moduleId="sale-notification"
          onReset={() => updateAll([newSaleRule()])}
        />
      </div>
    </div>
  );
}
