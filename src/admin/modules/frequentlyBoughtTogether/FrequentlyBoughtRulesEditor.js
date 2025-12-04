/* ------------------------ imports ------------------------ */
import { useState, useEffect, useRef } from '@wordpress/element';
import { TextControl, SelectControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import Sortable from 'sortablejs';
import MultiWooSearchSelector from '@storeone-global/MultiWooSearchSelector';
import ExcludeWooCondition from '@storeone-global/ExcludeWooCondition';
import TabSwitcher from '@storeone-global/TabSwitcher';
import UserCondition from '@storeone-global/UserCondition';
import SingleProductSettings from './SingleProductSettings';
import S1Accordion from "@storeone-global/S1Accordion";
import { CopyIcon, TrashIcon, DragHandleDots2Icon ,ChevronDownIcon,
    ChevronUpIcon } from "@radix-ui/react-icons";
/* Field Wrapper */
const S1Field = ({ label, children }) => (
    <div className="s1-field-wrapper">
        {label && <label className="s1-field-label">{label}</label>}
        <div className="s1-field-control">{children}</div>
    </div>
);

/* Default Rule */
const newFBTRule = () => ({
    status: 'active',
    offer_title: '',
    trigger_type: 'all_products',

    products: [],
    categories: [],
    tags: [],

    flexible_id: crypto.randomUUID(),
    open: true,

    offer_products: [],      // NEW: bundle products
    offer_products_optional: true,

    // NEW: exclude system
    exclude_products_enabled: false,
    exclude_products: [],

    exclude_categories_enabled: false,
    exclude_categories: [],

    exclude_tags_enabled: false,
    exclude_tags: [],

    exclude_brands_enabled: false,
    exclude_brands: [],

    exclude_on_sale_enabled: false, 

    user_condition: "all",
    exclude_enabled: false,

    allowed_roles: [],
    allowed_users: [],

    exclude_roles: [],
    exclude_users: [],

    exclude_users_enabled: false,

    /* -----------------------
     * SINGLE PAGE SETTINGS
     * ---------------------- */
    single_enabled: true,

    placement: "after_summary",
    priority: 10,

    bundle_title: "Frequently Bought Together",

    price_label: "Bundle price",
    one_price_label: "Product price",
    single_only_label: "",

    you_save_label: "You save: {amount}",

    no_variation_text: "Please select an option to see your savings.",
    no_variation_no_discount_text: "Please select an option to see the total price.",

    button_text: "Add to cart",

    plus_bg_color: "#212121",
    plus_text_color: "#ffffff",
    border_color: "#f9f9f9",
    background: {
    color: "#ffffff",
    },
    border_radius: {
        Desktop: "0px",
        Tablet: "0px",
        Mobile: "0px",
    },
   
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
export default function FrequentlyBoughtRulesEditor({ rules, onChange }) {

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
    };

    const updateField = (i, field, val) => {
        const arr = [...rules];
        arr[i][field] = val;
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

    const addRule = () => updateAll([...rules, newFBTRule()]);

    useEffect(() => {
        if (rules.length === 0) {
            updateAll([newFBTRule()]);
        } else {
            const arr = [...rules];
            arr[0].open = true;
            updateAll(arr);
        }
    }, []);

    return (
        <div className="store-one-rules-container">

            <h3 className="store-one-section-title">{__('Offer Bundle', 'store-one')}</h3>

            <SortableWrapper items={rules} onSortEnd={reorder}>
                {rules.map((rule, index) => (
                    <div key={rule.flexible_id} className="store-one-rule-item">

                        {/* ---------------------- Header ---------------------- */}
                        <div className="store-one-rule-header">
                            <DragHandleDots2Icon className="drag-handle s1-icon" />
                            {/* <span className="dashicons dashicons-menu drag-handle s1-icon" /> */}

                            <strong className="s1-rule-title">
                                {sprintf(
                                    __('Rule %d: %s', 'store-one'),
                                    index + 1,
                                    rule.offer_title || __('Untitled', 'store-one')
                                )}
                            </strong>

                            <CopyIcon className="s1-icon" onClick={() => duplicateRule(index)}/>
                            <TrashIcon className="s1-icon s1-icon-danger"
                                onClick={() => removeRule(index)} />
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
                                defaultTab="settings"
                                tabs={[
                                    {
                                        id: 'settings',
                                        label: __('Settings', 'store-one'),
                                        icon: '',
                                        content: (
                                            <div className="store-one-rule-body">

                                                <S1Field label={__('Status', 'store-one')}>
                                                    <SelectControl
                                                        value={rule.status}
                                                        options={[
                                                            { label: __('Active', 'store-one'), value: 'active' },
                                                            { label: __('Inactive', 'store-one'), value: 'inactive' },
                                                        ]}
                                                        onChange={(v) => updateField(index, 'status', v)}
                                                    />
                                                </S1Field>

                                                <S1Field label={__('Offer Name', 'store-one')}>
                                                    <TextControl
                                                        value={rule.offer_title}
                                                        onChange={(v) => updateField(index, 'offer_title', v)}
                                                    />
                                                </S1Field>

                                                <S1Field label={__('Trigger Type', 'store-one')}>
                                                    <SelectControl
                                                        value={rule.trigger_type}
                                                        options={[
                                                            { label: __('All Products', 'store-one'), value: 'all_products' },
                                                            { label: __('Specific Products', 'store-one'), value: 'specific_products' },
                                                            { label: __('Specific Categories', 'store-one'), value: 'specific_categories' },
                                                            { label: __('Specific Tags', 'store-one'), value: 'specific_tags' },
                                                        ]}
                                                        onChange={(v) => updateField(index, 'trigger_type', v)}
                                                    />
                                                </S1Field>

                                                {rule.trigger_type === 'specific_products' && (
                                                    <MultiWooSearchSelector
                                                        searchType="product"
                                                        label={__('Select Products', 'store-one')}
                                                        value={rule.products || []}
                                                        onChange={(items) => updateField(index, 'products', items)}
                                                    />
                                                )}

                                                {rule.trigger_type === 'specific_categories' && (
                                                    <MultiWooSearchSelector
                                                        searchType="category"
                                                        label={__('Select Categories', 'store-one')}
                                                        value={rule.categories || []}
                                                        onChange={(items) => updateField(index, 'categories', items)}
                                                    />
                                                )}

                                                {rule.trigger_type === 'specific_tags' && (
                                                    <MultiWooSearchSelector
                                                        searchType="tag"
                                                        label={__('Select Tags', 'store-one')}
                                                        value={rule.tags || []}
                                                        onChange={(items) => updateField(index, 'tags', items)}
                                                    />
                                                )}

                                {/* ———————— EXCLUDE OPTIONS ————————— */}

                                <ExcludeWooCondition
                                    label={__('Exclude products', 'store-one')}
                                    searchType="product"
                                    enabled={rule.exclude_products_enabled}
                                    items={rule.exclude_products}
                                    onToggle={(v) => updateField(index, 'exclude_products_enabled', v)}
                                    onChangeItems={(items) => updateField(index, 'exclude_products', items)}
                                />

                                <ExcludeWooCondition
                                    label={__('Exclude categories', 'store-one')}
                                    searchType="category"
                                    enabled={rule.exclude_categories_enabled}
                                    items={rule.exclude_categories}
                                    onToggle={(v) => updateField(index, 'exclude_categories_enabled', v)}
                                    onChangeItems={(items) => updateField(index, 'exclude_categories', items)}
                                />

                                <ExcludeWooCondition
                                    label={__('Exclude product tags', 'store-one')}
                                    searchType="tag"
                                    enabled={rule.exclude_tags_enabled}
                                    items={rule.exclude_tags}
                                    onToggle={(v) => updateField(index, 'exclude_tags_enabled', v)}
                                    onChangeItems={(items) => updateField(index, 'exclude_tags', items)}
                                />

                                <ExcludeWooCondition
                                    label={__('Exclude brands', 'store-one')}
                                    searchType="brand"
                                    enabled={rule.exclude_brands_enabled}
                                    items={rule.exclude_brands}
                                    onToggle={(v) => updateField(index, 'exclude_brands_enabled', v)}
                                    onChangeItems={(items) => updateField(index, 'exclude_brands', items)}
                                />

                                <ExcludeWooCondition
                                    label={__('Exclude On-Sale products', 'store-one')}
                                    searchType="on_sale"
                                    enabled={rule.exclude_on_sale_enabled}
                                    items={[]}   // no search selector for this one
                                    onToggle={(v) => updateField(index, 'exclude_on_sale_enabled', v)}
                                    onChangeItems={() => {}}
                                    />

                                    <MultiWooSearchSelector
                                                        searchType="product"
                                                        label={__('Search Offer products', 'store-one')}
                                                        value={rule.offer_products || []}
                                                        onChange={(items) => updateField(index, 'offer_products', items)}
                                                    />

                                                </div>
                                        ),
                                    },

                                    {
                                        id: 'user',
                                        label: __('User Condition', 'store-one'),
                                        icon: '',
                                        content: (
                                            <div className="store-one-rule-body">
                                            <UserCondition
                                                rule={rule}
                                                index={index}
                                                updateField={updateField}
                                                Field={S1Field}
                                            />
                                            </div>
                                        ),
                                    },
                                    {
                                        id: 'single',
                                        label: __('Display Page', 'store-one'),
                                        icon: '',
                                        content: (
                                            <>
                                            <S1Accordion title={__("Single Product Page Settings", "store-one")} defaultOpen={true}>
                                            <SingleProductSettings
                                                settings={rule}
                                                updateSetting={(key, val) => updateField(index, key, val)}
                                            />
                                            </S1Accordion>

                                            <S1Accordion title={__("Cart Page Settings", "store-one")}>
                                                    
                                            </S1Accordion>

                                            <S1Accordion title={__("Checkout Page Settings", "store-one")}>
                                                
                                            </S1Accordion>
                                        </>
                                             
                                        ),
                                    },
                                    {
                                        id: 'design',
                                        label: __('Design', 'store-one'),
                                        icon: '',
                                        content: (
                                            <div className="store-one-rule-body">
                                                
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
                {__('+ Add New Rule', 'store-one')}
            </div>
        </div>
    );
}
