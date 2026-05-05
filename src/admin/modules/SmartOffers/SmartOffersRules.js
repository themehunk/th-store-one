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
import { ICONS } from "@th-storeone-global/icons";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";

/* ---------------- DEFAULT RULE ---------------- */
const newSmartOfferRule = () => ({
  flexible_id: crypto.randomUUID(),
  open: true,
  status: "active",
  title: "Smart Offer",

  trigger_type: "specific_products",
  products: [],
  categories: [],
  exclude_products: [],
  min_qty: 2,
  min_amount: 0,

  offer_type: "bxgy",
  x_qty: 2,
  y_qty: 1,
  apply_mode: "step",

  reward_type: "free_product",
  reward_products: [],
  discount_value: 100,
  max_qty: 1,
  apply_on: "cheapest",

  auto_add: true,
  repeat: true,
  remove_if_invalid: true,
  priority: 10,
  stackable: false,
  limit_per_order: 10,

  user_role: "all",
  first_order_only: false,
  start_date: "",
  end_date: "",

  message: "Buy {remaining} more to get FREE gift",
  success_message: "🎉 Free gift added!",
  show_progress: true,
  show_badge: true,

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

            {rule.open && (
              <TabSwitcher
                defaultTab="settings"
                tabs={[

                  /* SETTINGS */
                  {
                    id: "settings",
                    label: "Settings",
                    icon: ICONS.SETTINGS,
                    content: (
                      <div className="store-one-rule-body">

                        <S1FieldGroup title="Basic">
                          <S1Field label="Status" description="Enable or disable this offer rule">
                            <SelectControl
                              value={rule.status}
                              options={[
                                { label: "Active", value: "active" },
                                { label: "Inactive", value: "inactive" },
                              ]}
                              onChange={(v) => updateField(index, "status", v)}
                            />
                          </S1Field>

                          <S1Field label="Title" description="Internal name used to identify this rule">
                            <TextControl
                              value={rule.title}
                              onChange={(v) => updateField(index, "title", v)}
                            />
                          </S1Field>
                        </S1FieldGroup>

                        <S1FieldGroup title="BOGO Logic">
                          <S1Field label="Buy Quantity (X)" description="Minimum number of items a customer must purchase to activate the offer">
                            <TextControl
                              type="number"
                              value={rule.x_qty}
                              onChange={(v) => updateField(index, "x_qty", parseInt(v))}
                            />
                          </S1Field>

                          <S1Field label="Get Quantity (Y)" description="Number of items the customer will receive as free or discounted">
                            <TextControl
                              type="number"
                              value={rule.y_qty}
                              onChange={(v) => updateField(index, "y_qty", parseInt(v))}
                            />
                          </S1Field>

                          <S1Field label="Apply Mode" description="Repeat: offer applies multiple times based on quantity. Once: offer applies only once per order">
                            <SelectControl
                              value={rule.apply_mode}
                              options={[
                                { label: "Repeat", value: "step" },
                                { label: "Once Only", value: "once" },
                              ]}
                              onChange={(v) => updateField(index, "apply_mode", v)}
                            />
                          </S1Field>
                        </S1FieldGroup>

                        <S1FieldGroup title="Reward">
                          <S1Field label="Reward Type" description="Choose whether the customer receives a free product or a discount">
                            <SelectControl
                              value={rule.reward_type}
                              options={[
                                { label: "Free Product", value: "free_product" },
                                { label: "Percentage Discount", value: "discount_percent" },
                                { label: "Fixed Discount", value: "discount_fixed" },
                              ]}
                              onChange={(v) => updateField(index, "reward_type", v)}
                            />
                          </S1Field>

                          {rule.reward_type === "free_product" && (
                            <MultiWooSearchSelector
                              searchType="product"
                              label="Select Free Product (This item will be automatically added to the cart)"
                              value={rule.reward_products}
                              onChange={(v) => updateField(index, "reward_products", v)}
                              detailedView={true}
                            />
                          )}

                          {rule.reward_type !== "free_product" && (
                            <>
                              <S1Field label="Discount Value" description="Enter discount amount. Use percentage or fixed value based on selected type">
                                <TextControl
                                  type="number"
                                  value={rule.discount_value}
                                  onChange={(v) =>
                                    updateField(index, "discount_value", parseFloat(v))
                                  }
                                />
                              </S1Field>

                              <S1Field label="Apply Discount On" description="Select which product should receive the discount">
                                <SelectControl
                                  value={rule.apply_on}
                                  options={[
                                    { label: "Cheapest Product in Cart", value: "cheapest" },
                                    { label: "Highest Price Product", value: "highest" },
                                    { label: "Specific Product", value: "specific" },
                                  ]}
                                  onChange={(v) => updateField(index, "apply_on", v)}
                                />
                              </S1Field>

                              {rule.apply_on === "specific" && (
                                <MultiWooSearchSelector
                                  searchType="product"
                                  label="Select Discount Product (Discount will be applied only to this product)"
                                  value={rule.reward_products}
                                  onChange={(v) => updateField(index, "reward_products", v)}
                                  detailedView={true}
                                />
                              )}
                            </>
                          )}
                        </S1FieldGroup>

                        <S1FieldGroup title="Advanced">
                          <S1Field label="Auto Add Free Product" description="Automatically add the free product to the cart when conditions are met">
                            <ToggleControl
                              checked={rule.auto_add}
                              onChange={(v) => updateField(index, "auto_add", v)}
                              
                            />
                          </S1Field>

                          <S1Field label="Limit Per Order" description="Maximum number of times this offer can be applied in a single order">
                            <TextControl
                              type="number"
                              value={rule.limit_per_order}
                              onChange={(v) =>
                                updateField(index, "limit_per_order", parseInt(v))
                              }
                              
                            />
                          </S1Field>
                        </S1FieldGroup>

                      </div>
                    ),
                  },

                  /* TRIGGER */
                  {
                    id: "trigger",
                    label: "Trigger",
                    icon: ICONS.SETTINGS,
                    content: (
                      <div className="store-one-rule-body">

                        <MultiWooSearchSelector
                          searchType="product"
                          label="Trigger Products (Customer must purchase these products)"
                          value={rule.products}
                          onChange={(v) => updateField(index, "products", v)}
                          detailedView={true}
                        />

                        <MultiWooSearchSelector
                          searchType="product"
                          label="Exclude Products (Offer will not apply if these are in cart)"
                          value={rule.exclude_products}
                          onChange={(v) => updateField(index, "exclude_products", v)}
                          detailedView={true}
                        />

                        <S1Field label="Minimum Quantity" description="Minimum quantity required in cart to activate the offer">
                          <TextControl
                            type="number"
                            value={rule.min_qty}
                            onChange={(v) => updateField(index, "min_qty", parseInt(v))}
                          />
                        </S1Field>

                      </div>
                    ),
                  },

                  /* DISPLAY */
                  {
                    id: "display",
                    label: "Display",
                    icon: ICONS.DISPLAY,
                    content: (
                      <div className="store-one-rule-body">

                        <S1Field label="Offer Message" description="Message shown before the offer is unlocked">
                          <TextControl
                            value={rule.message}
                            onChange={(v) => updateField(index, "message", v)}
                          />
                        </S1Field>

                        <S1Field label="Success Message" description="Message shown after the offer has been successfully applied">
                          <TextControl
                            value={rule.success_message}
                            onChange={(v) => updateField(index, "success_message", v)}
                          />
                        </S1Field>

                        <S1Field label="Show Progress Bar" description="Display a progress bar indicating how close the customer is to unlocking the offer">
                          <ToggleControl
                            checked={rule.show_progress}
                            onChange={(v) => updateField(index, "show_progress", v)}
                          />
                        </S1Field>

                        <DeviceSelector
                          value={rule.devices}
                          onChange={(v) => updateField(index, "devices", v)}
                        />

                      </div>
                    ),
                  }

                ]}
              />
            )}
          </div>
        ))}
      </SortableWrapper>

     

      <div className="store-one-rules-footer">
               <div className="store-one-add-rule" onClick={addRule}>
        + Add Smart Offer Rule
      </div>
      
              <ResetModuleButton
                moduleId="smart-offers"
                onReset={() => updateAll([newSmartOfferRule()])}
              />
            </div>
    </div>
  );
}