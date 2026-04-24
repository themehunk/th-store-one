/* ------------------------ imports ------------------------ */
import { useEffect, useRef } from "@wordpress/element";
import {
  TextControl,
  SelectControl,
  ToggleControl,
} from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import Sortable from "sortablejs";

import TabSwitcher from "@th-storeone-global/TabSwitcher";
import MultiWooSearchSelector from "@th-storeone-global/MultiWooSearchSelector";
import ExcludeWooCondition from "@th-storeone-global/ExcludeWooCondition";

import ResetModuleButton from "@th-storeone-global/ResetModuleButton";
import { ICONS } from "@th-storeone-global/icons";
import {
  CopyIcon,
  TrashIcon,
  DragHandleDots2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  TextAlignLeftIcon,
} from "@radix-ui/react-icons";

import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";

/* ------------------------ DEFAULT RULE ------------------------ */

const newInactiveTabRule = () => ({
  status: "active",
  rule_name: "Inactive Tab Rule",
open: true,
  message_type: "dynamic",
  custom_message: "Come back!",
  dynamic_template: "You left {cart_count} items",
  icon_enabled: true,
  icontype: "icon",
  selected_icon: "cart",
  custom_svg: "",
  image_url: "",

  rotation_enabled: false,
  rotation_messages: [
    {
      id: crypto.randomUUID(),
      text: "Don’t miss this!",
      icon_enabled: true,
      icontype: "icon",
      selected_icon: "cart",
      custom_svg: "",
      image_url: "",
      open: true,
    },
    {
      id: crypto.randomUUID(),
      text: "Limited stock!",
      icon_enabled: true,
      icontype: "icon",
      selected_icon: "alert",
      custom_svg: "",
      image_url: "",
      open: false,
    },
  ],
  interval: 2000,
  delay: 0,

  trigger_type: "all_products",
  products: [],
  pages: [],

  exclude_products_enabled: false,
  exclude_products: [],
  exclude_pages_enabled: false,
  exclude_pages: [],

  devices: ["desktop", "mobile"],

  priority: 10,

  flexible_id: crypto.randomUUID(),
  open: true,
});

const MESSAGE_ICON_OPTIONS = [
  {
    id: "alert",
    icon: <span>⚡</span>,
  },
  {
    id: "cart",
    icon: <span>🛍️</span>,
  },
  {
    id: "fire",
    icon: <span>🔥</span>,
  },
  {
    id: "clock",
    icon: <span>⏳</span>,
  },
  {
    id: "sad",
    icon: <span>😢</span>,
  },
  {
    id: "heart",
    icon: <span>❤️</span>,
  }
];
/* ------------------------ SORTABLE ------------------------ */

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

/* ------------------------ MAIN COMPONENT ------------------------ */

export default function InactiveTabRules({ rules, onChange }) {
  const updateAll = (arr) => onChange([...arr]);

  const updateField = (i, field, val) => {
    const arr = [...rules];
    arr[i][field] = val;
    updateAll(arr);
  };

  const reorder = (oldIndex, newIndex) => {
    const arr = [...rules];
    const moved = arr.splice(oldIndex, 1)[0];
    arr.splice(newIndex, 0, moved);
    updateAll(arr);
  };

  const addRule = () => {
    updateAll([...rules, newInactiveTabRule()]);
  };

  const removeRule = (i) => {
    const arr = [...rules];
    arr.splice(i, 1);
    updateAll(arr);
  };

  const duplicateRule = (i) => {
    const arr = [...rules];
    const copy = {
      ...arr[i],
      flexible_id: crypto.randomUUID(),
      open: true,
    };
    arr.splice(i + 1, 0, copy);
    updateAll(arr);
  };

  const toggleOpen = (i) => {
    const arr = [...rules];
    arr[i].open = !arr[i].open;
    updateAll(arr);
  };

  useEffect(() => {
    if (rules.length === 0) {
      updateAll([newInactiveTabRule()]);
    } else {
      const arr = [...rules];
      arr[0].open = true;
      updateAll(arr);
    }
  }, []);

  const addRotationItem = (ruleIndex) => {
    const list = rules[ruleIndex].rotation_messages || [];

    const newList = [
      ...list,
      { id: crypto.randomUUID(), text: "", open: true },
    ];

    updateField(ruleIndex, "rotation_messages", newList);
  };

  const removeRotationItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].rotation_messages];
    list.splice(itemIndex, 1);
    updateField(ruleIndex, "rotation_messages", list);
  };

  const toggleRotationItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].rotation_messages];
    list[itemIndex].open = !list[itemIndex].open;
    updateField(ruleIndex, "rotation_messages", list);
  };

  const updateRotationItem = (ruleIndex, itemIndex, value) => {
    const list = [...rules[ruleIndex].rotation_messages];
    list[itemIndex].text = value;
    updateField(ruleIndex, "rotation_messages", list);
  };
  const duplicateRotationItem = (ruleIndex, itemIndex) => {
    const list = [...rules[ruleIndex].rotation_messages];

    const copy = {
      ...list[itemIndex],
      id: crypto.randomUUID(),
      open: true,
    };

    list.splice(itemIndex + 1, 0, copy);

    updateField(ruleIndex, "rotation_messages", list);
  };

  useEffect(() => {
    const updated = rules.map((rule) => {
      if (!rule.rotation_messages) return rule;

      const fixedMessages = rule.rotation_messages.map((item) => {
        if (typeof item === "string") {
          return {
            id: crypto.randomUUID(),
            text: item,
            open: false,
          };
        }
        return item;
      });

      return {
        ...rule,
        rotation_messages: fixedMessages,
      };
    });

    updateAll(updated);
  }, []);

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
        {__("Inactive Tab Message", "th-store-one")}
      </h3>

      <SortableWrapper items={rules} onSortEnd={reorder}>
        {rules.map((rule, index) => (
          <div key={rule.flexible_id} className="store-one-rule-item">
            {/* HEADER */}
            <div className="store-one-rule-header">
              <DragHandleDots2Icon className="drag-handle s1-icon" />

              <strong className="s1-rule-title">
                {sprintf(
                  __("Rule %d: %s", "th-store-one"),
                  index + 1,
                  rule.rule_name || "Untitled",
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
                <ChevronUpIcon onClick={() => toggleOpen(index)} />
              ) : (
                <ChevronDownIcon onClick={() => toggleOpen(index)} />
              )}
            </div>

            {/* BODY */}
            {rule.open && (
              <TabSwitcher
                defaultTab="settings"
                tabs={[
                  {
                    id: "settings",
                    label: "Settings",
                    icon: ICONS.SETTINGS,
                    content: (
                      <div className="store-one-rule-body">
                        <S1Field label="Status">
                          <SelectControl
                            value={rule.status}
                            options={[
                              { label: "Active", value: "active" },
                              { label: "Inactive", value: "inactive" },
                            ]}
                            onChange={(v) => updateField(index, "status", v)}
                          />
                        </S1Field>

                        <S1Field label="Rule Name">
                          <TextControl
                            value={rule.rule_name}
                            onChange={(v) => updateField(index, "rule_name", v)}
                          />
                        </S1Field>

                        <S1Field label="Delay (ms)">
                          <TextControl
                            value={rule.delay}
                            onChange={(v) =>
                              updateField(index, "delay", parseInt(v) || 0)
                            }
                          />
                        </S1Field>

                        <S1Field label="Interval (ms)">
                          <TextControl
                            value={rule.interval}
                            onChange={(v) =>
                              updateField(index, "interval", parseInt(v) || 0)
                            }
                          />
                        </S1Field>

                        <S1Field
                          label={__("Rotation Message Enabled", "th-store-one")}
                        >
                          <ToggleControl
                            checked={rule.rotation_enabled}
                            onChange={(v) =>
                              updateField(index, "rotation_enabled", v)
                            }
                          />
                        </S1Field>
                      </div>
                    ),
                  },

                  {
                    id: "message",
                    label: "Message",
                    icon: <TextAlignLeftIcon />,
                    content: (
                      <div className="store-one-rule-body">
                        <S1Field label="Message Type">
                          <SelectControl
                            value={rule.message_type}
                            options={[
                              { label: "Custom", value: "custom" },
                              { label: "Dynamic", value: "dynamic" },
                            ]}
                            onChange={(v) =>
                              updateField(index, "message_type", v)
                            }
                          />
                        </S1Field>

                        {rule.message_type === "custom" && (
                          <S1Field label="Custom Message">
                            <TextControl
                              value={rule.custom_message}
                              onChange={(v) =>
                                updateField(index, "custom_message", v)
                              }
                            />
                          </S1Field>
                        )}

                        <S1Field
                          label="Enable Icon"
                          classN="s1-toggle-wrpapper"
                        >
                          <ToggleControl
                            checked={rule.icon_enabled}
                            onChange={(v) =>
                              updateField(index, "icon_enabled", v)
                            }
                          />
                        </S1Field>

                        {rule.message_type === "dynamic" && (
                          <S1Field label="Dynamic Template">
                            <TextControl
                              value={rule.dynamic_template}
                              onChange={(v) =>
                                updateField(index, "dynamic_template", v)
                              }
                            />
                          </S1Field>
                        )}

                        {rule.icon_enabled && (
                          <>
                            <S1Field label="Icon Type">
                              <SelectControl
                                value={rule.icontype}
                                options={[
                                  { label: "Icon", value: "icon" },
                                  { label: "Image", value: "image" },
                                  { label: "SVG", value: "custom_svg" },
                                ]}
                                onChange={(v) =>
                                  updateField(index, "icontype", v)
                                }
                              />
                            </S1Field>

                            {/* ICON SELECT */}
                            {(rule.icontype || "icon") === "icon" && (
                              <S1Field classN="s1-toggle-wrpapper list-icon">
                                {MESSAGE_ICON_OPTIONS.map(({ id, icon }) => (
                                  <div
                                    key={id}
                                    className={`s1-icon-option ${
                                      rule.selected_icon === id ? "active" : ""
                                    }`}
                                    onClick={() =>
                                      updateField(index, "selected_icon", id)
                                    }
                                  >
                                    {icon}
                                  </div>
                                ))}
                              </S1Field>
                            )}

                            {/* SVG */}
                            {rule.icontype === "custom_svg" && (
                              <S1Field label="SVG Code">
                                <TextControl
                                  value={rule.custom_svg}
                                  onChange={(v) =>
                                    updateField(index, "custom_svg", v)
                                  }
                                />
                              </S1Field>
                            )}

                            {/* IMAGE */}
                            {rule.icontype === "image" && (
                              <S1Field label="Upload Image">
                                <div className="s1-image-upload-wrapper">
                                  {rule.image_url ? (
                                    <div className="s1-image-card">
                                      <div className="s1-image-preview">
                                        <img src={rule.image_url} alt="" />
                                      </div>

                                      <div className="s1-image-actions">
                                        <button
                                          type="button"
                                          className="s1-btn s1-btn-edit"
                                          onClick={() =>
                                            openMediaLibrary((media) =>
                                              updateField(
                                                index,
                                                "image_url",
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
                                            updateField(index, "image_url", "")
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
                                          updateField(
                                            index,
                                            "image_url",
                                            media.url,
                                          ),
                                        )
                                      }
                                    >
                                      <span className="s1-btn-icon">
                                        {ICONS.DISPLAY}
                                      </span>
                                      <div className="s1-upload-text">
                                        <strong>Upload Image</strong>
                                        <p>Select or upload an image file</p>
                                        <small className="s1-upload-note">
                                          PNG, JPG, and SVG formats supported
                                        </small>
                                      </div>
                                    </button>
                                  )}
                                </div>
                              </S1Field>
                            )}
                          </>
                        )}

                        {rule.rotation_enabled && (
                          <S1FieldGroup title="Rotation Messages">
                            {rule.rotation_messages?.map((item, i) => (
                              <div
                                key={item.id}
                                className="store-one-rule-item inner"
                              >
                                <div className="store-one-rule-header">
                                  <strong className="s1-rule-title">
                                    Message {i + 1}
                                  </strong>
                                  <CopyIcon
                                    className="s1-icon"
                                    onClick={() =>
                                      duplicateRotationItem(index, i)
                                    }
                                  />
                                  <TrashIcon
                                    className="s1-icon s1-icon-danger"
                                    onClick={() => removeRotationItem(index, i)}
                                  />

                                  {item.open ? (
                                    <ChevronUpIcon
                                      onClick={() =>
                                        toggleRotationItem(index, i)
                                      }
                                    />
                                  ) : (
                                    <ChevronDownIcon
                                      onClick={() =>
                                        toggleRotationItem(index, i)
                                      }
                                    />
                                  )}
                                </div>

                                {item.open && (
                                  <div className="store-one-rule-body">
                                    <TextControl
                                      value={item.text}
                                      onChange={(v) =>
                                        updateRotationItem(index, i, v)
                                      }
                                      placeholder="Enter message..."
                                    />
                                    <S1Field
                                      label="Enable Icon"
                                      classN="s1-toggle-wrpapper"
                                    >
                                      <ToggleControl
                                        checked={item.icon_enabled}
                                        onChange={(v) => {
                                          const list = [
                                            ...rule.rotation_messages,
                                          ];
                                          list[i].icon_enabled = v;
                                          updateField(
                                            index,
                                            "rotation_messages",
                                            list,
                                          );
                                        }}
                                      />
                                    </S1Field>

                                    {item.icon_enabled && (
                                      <>
                                        <S1Field label="Icon Type">
                                          <SelectControl
                                            value={item.icontype}
                                            options={[
                                              { label: "Icon", value: "icon" },
                                              {
                                                label: "Image",
                                                value: "image",
                                              },
                                              {
                                                label: "SVG",
                                                value: "custom_svg",
                                              },
                                            ]}
                                            onChange={(v) => {
                                              const list = [
                                                ...rule.rotation_messages,
                                              ];
                                              list[i].icontype = v;
                                              updateField(
                                                index,
                                                "rotation_messages",
                                                list,
                                              );
                                            }}
                                          />
                                        </S1Field>

                                        {/* ICON SELECT */}
                                        {(item.icontype || "icon") ===
                                          "icon" && (
                                          <S1Field classN="s1-toggle-wrpapper list-icon">
                                            {MESSAGE_ICON_OPTIONS.map(
                                              ({ id, icon }) => (
                                                <div
                                                  key={id}
                                                  className={`s1-icon-option ${
                                                    item.selected_icon === id
                                                      ? "active"
                                                      : ""
                                                  }`}
                                                  onClick={() => {
                                                    const list = [
                                                      ...rule.rotation_messages,
                                                    ];
                                                    list[i].selected_icon = id;
                                                    updateField(
                                                      index,
                                                      "rotation_messages",
                                                      list,
                                                    );
                                                  }}
                                                >
                                                  {icon}
                                                </div>
                                              ),
                                            )}
                                          </S1Field>
                                        )}

                                        {/* SVG */}
                                        {item.icontype === "custom_svg" && (
                                          <S1Field label="SVG Code">
                                            <TextControl
                                              value={item.custom_svg}
                                              onChange={(v) => {
                                                const list = [
                                                  ...rule.rotation_messages,
                                                ];
                                                list[i].custom_svg = v;
                                                updateField(
                                                  index,
                                                  "rotation_messages",
                                                  list,
                                                );
                                              }}
                                            />
                                          </S1Field>
                                        )}

                                        {/* IMAGE */}
                                        {item.icontype === "image" && (
                                          <S1Field label="Upload Image">
                                            <div className="s1-image-upload-wrapper">
                                              {item.image_url ? (
                                                <div className="s1-image-card">
                                                  <div className="s1-image-preview">
                                                    <img
                                                      src={item.image_url}
                                                      alt=""
                                                    />
                                                  </div>

                                                  <div className="s1-image-actions">
                                                    <button
                                                      type="button"
                                                      className="s1-btn s1-btn-edit"
                                                      onClick={() =>
                                                        openMediaLibrary(
                                                          (media) => {
                                                            const list = [
                                                              ...rule.rotation_messages,
                                                            ];
                                                            list[i].image_url =
                                                              media.url;
                                                            updateField(
                                                              index,
                                                              "rotation_messages",
                                                              list,
                                                            );
                                                          },
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
                                                      onClick={() => {
                                                        const list = [
                                                          ...rule.rotation_messages,
                                                        ];
                                                        list[i].image_url = "";
                                                        updateField(
                                                          index,
                                                          "rotation_messages",
                                                          list,
                                                        );
                                                      }}
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
                                                    openMediaLibrary(
                                                      (media) => {
                                                        const list = [
                                                          ...rule.rotation_messages,
                                                        ];
                                                        list[i].image_url =
                                                          media.url;
                                                        updateField(
                                                          index,
                                                          "rotation_messages",
                                                          list,
                                                        );
                                                      },
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
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}

                            <div
                              className="store-one-add-rule"
                              onClick={() => addRotationItem(index)}
                            >
                              + Add Message
                            </div>
                          </S1FieldGroup>
                        )}
                      </div>
                    ),
                  },

                  {
                    id: "targeting",
                    label: "Targeting",
                    icon: <span className="dashicons dashicons-sticky"></span>,
                    content: (
                      <div className="store-one-rule-body">
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
                            ]}
                            onChange={(v) =>
                              updateField(index, "trigger_type", v)
                            }
                          />
                        </S1Field>

                        {rule.trigger_type === "specific_pages" && (
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

                        {rule.trigger_type === "specific_products" && (
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
                        {rule.trigger_type === "all_products" && (
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
                        )}
                        {rule.trigger_type === "all_pages" && (
                          <ExcludeWooCondition
                            label={__("Exclude pages", "th-store-one")}
                            searchType="page"
                            enabled={rule.exclude_pages_enabled}
                            items={rule.exclude_pages}
                            onToggle={(v) =>
                              updateField(index, "exclude_pages_enabled", v)
                            }
                            onChangeItems={(items) =>
                              updateField(index, "exclude_pages", items)
                            }
                            detailedView={true}
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

      {/* FOOTER */}
      <div className="store-one-rules-footer">
        <div className="store-one-add-rule" onClick={addRule}>
          {__("+ Add New Rule", "th-store-one")}
        </div>

        <ResetModuleButton
          moduleId="inactive-tab"
          onReset={() => updateAll([newInactiveTabRule()])}
        />
      </div>
    </div>
  );
}
