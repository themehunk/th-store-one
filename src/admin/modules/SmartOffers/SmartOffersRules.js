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
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import DeviceSelector from "@th-storeone-global/DeviceSelector";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import {
  CopyIcon,
  TrashIcon,
  DragHandleDots2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";

/* ---------------- DEFAULT RULE ---------------- */
const newSmartOfferRule = () => ({
  flexible_id: crypto.randomUUID(),
  open: true,
  status: "active",
  title: "Smart Offer",

  /* TRIGGER */
  trigger_type: "specific_products",
  products: [],
  categories: [],
  min_qty: 2,
  min_amount: 0,

  /* REWARD */
  reward_type: "free_product",
  reward_products: [],
  discount_value: 100,
  max_qty: 1,

  /* BEHAVIOR */
  auto_add: true,
  repeat: true,
  remove_if_invalid: true,
  priority: 10,

  /* DISPLAY */
  message: "Buy {remaining} more to get FREE gift",
  show_progress: true,

  /* VISIBILITY */
  devices: ["desktop"],
});

/* ---------------- SORTABLE ---------------- */
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
export default function SmartOffersRules({ rules, onChange }) {

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

  const toggleOpen = (i) => {
    const arr = [...rules];
    arr[i].open = !arr[i].open;
    updateAll(arr);
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
    updateAll([...rules, newSmartOfferRule()]);
  };

  useEffect(() => {
    if (!rules.length) {
      updateAll([newSmartOfferRule()]);
    }
  }, []);

  return (
    <div className="store-one-rules-container">

      <h3 className="store-one-section-title">
        {__("Smart Offers", "th-store-one")}
      </h3>

      <SortableWrapper items={rules} onSortEnd={reorder}>
        {rules.map((rule, index) => (
          <div key={rule.flexible_id} className="store-one-rule-item">

            {/* HEADER */}
            <div className="store-one-rule-header">
              <DragHandleDots2Icon className="drag-handle s1-icon" />

              <strong className="s1-rule-title">
                {sprintf("Rule %d: %s", index + 1, rule.title)}
              </strong>

              <CopyIcon className="s1-icon" onClick={() => duplicateRule(index)} />
              <TrashIcon className="s1-icon s1-icon-danger" onClick={() => removeRule(index)} />

              {rule.open ? (
                <ChevronUpIcon className="s1-icon" onClick={() => toggleOpen(index)} />
              ) : (
                <ChevronDownIcon className="s1-icon" onClick={() => toggleOpen(index)} />
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

                        <S1Field label="Priority">
                          <TextControl
                            type="number"
                            value={rule.priority}
                            onChange={(v) =>
                              updateField(index, "priority", parseInt(v))
                            }
                          />
                        </S1Field>
                      </div>
                    ),
                  },

                  /* ================= TRIGGER ================= */
                  {
                    id: "trigger",
                    label: "Trigger",
                    content: (
                      <div className="store-one-rule-body">

                        <S1Field label="Trigger Type">
                          <SelectControl
                            value={rule.trigger_type}
                            options={[
                              { label: "Products", value: "specific_products" },
                              { label: "Categories", value: "specific_categories" },
                              { label: "Cart Total", value: "cart_total" },
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
                            value={rule.products}
                            onChange={(v) => updateField(index, "products", v)}
                          />
                        )}

                        <S1Field label="Minimum Quantity">
                          <TextControl
                            type="number"
                            value={rule.min_qty}
                            onChange={(v) =>
                              updateField(index, "min_qty", parseInt(v))
                            }
                          />
                        </S1Field>

                      </div>
                    ),
                  },

                  /* ================= REWARD ================= */
                  {
                    id: "reward",
                    label: "Reward",
                    content: (
                      <div className="store-one-rule-body">

                        <S1Field label="Reward Type">
                          <SelectControl
                            value={rule.reward_type}
                            options={[
                              { label: "Free Product", value: "free_product" },
                              { label: "Discount %", value: "discount_percent" },
                              { label: "Fixed Discount", value: "discount_fixed" },
                            ]}
                            onChange={(v) =>
                              updateField(index, "reward_type", v)
                            }
                          />
                        </S1Field>

                        <MultiWooSearchSelector
                          searchType="product"
                          label="Reward Products"
                          value={rule.reward_products}
                          onChange={(v) =>
                            updateField(index, "reward_products", v)
                          }
                        />

                        <S1Field label="Max Quantity">
                          <TextControl
                            type="number"
                            value={rule.max_qty}
                            onChange={(v) =>
                              updateField(index, "max_qty", parseInt(v))
                            }
                          />
                        </S1Field>

                      </div>
                    ),
                  },

                  /* ================= BEHAVIOR ================= */
                  {
                    id: "behavior",
                    label: "Behavior",
                    content: (
                      <div className="store-one-rule-body">

                        <S1Field label="Auto Add Reward">
                          <ToggleControl
                            checked={rule.auto_add}
                            onChange={(v) =>
                              updateField(index, "auto_add", v)
                            }
                          />
                        </S1Field>

                        <S1Field label="Repeat Rule">
                          <ToggleControl
                            checked={rule.repeat}
                            onChange={(v) =>
                              updateField(index, "repeat", v)
                            }
                          />
                        </S1Field>

                        <S1Field label="Remove if Condition Fails">
                          <ToggleControl
                            checked={rule.remove_if_invalid}
                            onChange={(v) =>
                              updateField(index, "remove_if_invalid", v)
                            }
                          />
                        </S1Field>

                      </div>
                    ),
                  },

                  /* ================= DISPLAY ================= */
                  {
                    id: "display",
                    label: "Display",
                    content: (
                      <div className="store-one-rule-body">

                        <S1Field label="Message">
                          <TextControl
                            value={rule.message}
                            onChange={(v) =>
                              updateField(index, "message", v)
                            }
                          />
                        </S1Field>

                        <S1Field label="Show Progress Bar">
                          <ToggleControl
                            checked={rule.show_progress}
                            onChange={(v) =>
                              updateField(index, "show_progress", v)
                            }
                          />
                        </S1Field>

                      </div>
                    ),
                  },

                  /* ================= VISIBILITY ================= */
                  {
                    id: "visibility",
                    label: "Visibility",
                    content: (
                      <div className="store-one-rule-body">
                        <DeviceSelector
                          value={rule.devices}
                          onChange={(v) =>
                            updateField(index, "devices", v)
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

      {/* ADD RULE */}
      <div className="store-one-add-rule" onClick={addRule}>
        + Add Smart Offer Rule
      </div>
    </div>
  );
}