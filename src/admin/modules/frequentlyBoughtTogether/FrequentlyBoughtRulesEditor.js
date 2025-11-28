/* ------------------------ imports ------------------------ */
import { useState, useEffect, useRef } from '@wordpress/element';
import { TextControl, SelectControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import Sortable from 'sortablejs';
import MultiWooSearchSelector from '../../components/GlobalSettings/MultiWooSearchSelector';
import ExcludeWooCondition from '../../components/GlobalSettings/ExcludeWooCondition';
import TabSwitcher from '../../components/GlobalSettings/TabSwitcher';

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
        <div className="store-one-rules-container" style={{ marginTop: 30 }}>

            <h3 className="store-one-section-title">{__('Offer Bundle', 'store-one')}</h3>

            <SortableWrapper items={rules} onSortEnd={reorder}>
                {rules.map((rule, index) => (
                    <div key={rule.flexible_id} className="store-one-rule-item">

                        {/* ---------------------- Header ---------------------- */}
                        <div className="store-one-rule-header">
                            <span className="dashicons dashicons-menu drag-handle s1-icon" />

                            <strong className="s1-rule-title">
                                {sprintf(
                                    __('Rule %d: %s', 'store-one'),
                                    index + 1,
                                    rule.offer_title || __('Untitled', 'store-one')
                                )}
                            </strong>

                            <span
                                className={`dashicons s1-icon ${rule.open ? 'dashicons-arrow-up-alt2' : 'dashicons-arrow-down-alt2'}`}
                                onClick={() => toggleOpen(index)}
                            />

                            <span
                                className="dashicons dashicons-admin-page s1-icon"
                                onClick={() => duplicateRule(index)}
                            />

                            <span
                                className="dashicons dashicons-no-alt s1-icon s1-icon-danger"
                                onClick={() => removeRule(index)}
                            />
                        </div>

                        {/* ---------------------- Body ---------------------- */}
                        {rule.open && (
                            <TabSwitcher
                                defaultTab="settings"
                                tabs={[
                                    {
                                        id: 'settings',
                                        label: __('Settings', 'store-one'),
                                        icon: 'dashicons-admin-generic',
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

                                            </div>
                                        ),
                                    },

                                    {
                                        id: 'style',
                                        label: __('Style', 'store-one'),
                                        icon: 'dashicons-art',
                                        content: (
                                            <div>
                                                {/* Style content here */}
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
