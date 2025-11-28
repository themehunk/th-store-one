import { useState, useEffect, useRef } from '@wordpress/element';
import {
    TextControl,
    SelectControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import Sortable from 'sortablejs';

/* ------------------------------------------
   Unified Store-One Field Wrapper
------------------------------------------- */
const S1Field = ({ label, children }) => (
    <div className="s1-field-wrapper">
        {label && <label className="s1-field-label">{label}</label>}
        <div className="s1-field-control">{children}</div>
    </div>
);

/* ------------------------------------------
   New FBT Rule Template
------------------------------------------- */
const newFBTRule = () => ({
    status: 'active',
    offer_title: '',
    trigger_type: 'all_products',

    product_ids: '',
    category_ids: '',
    tag_ids: '',

    discount_type: 'percentage',
    discount_amount: 0,

    flexible_id: crypto.randomUUID(),
    open: true,
});

/* ------------------------------------------
   Sortable Wrapper
------------------------------------------- */
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

/* ------------------------------------------
   Main Component
------------------------------------------- */
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

    // First rule always open
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
            
            <h3 className="store-one-section-title">
                {__('Offer Bundle', 'store-one')}
            </h3>

            <SortableWrapper items={rules} onSortEnd={reorder}>

                {rules.map((rule, index) => (
                    <div
                        key={rule.flexible_id}
                        className="store-one-rule-item"
                    >

                        {/* Header */}
                        <div className="store-one-rule-header">

                            {/* Drag Handle */}
                            <span className="dashicons dashicons-menu drag-handle s1-icon" />

                            <strong className="s1-rule-title">
                                {sprintf(
                                    __('Rule %d: %s', 'store-one'),
                                    index + 1,
                                    rule.offer_title || __('Untitled', 'store-one')
                                )}
                            </strong>

                            {/* Collapse */}
                            <span
                                className={`dashicons s1-icon ${
                                    rule.open ? 'dashicons-arrow-up-alt2' : 'dashicons-arrow-down-alt2'
                                }`}
                                onClick={() => toggleOpen(index)}
                            />

                            {/* Duplicate */}
                            <span
                                className="dashicons dashicons-admin-page s1-icon"
                                onClick={() => duplicateRule(index)}
                            />

                            {/* Delete */}
                            <span
                                className="dashicons dashicons-no-alt s1-icon s1-icon-danger"
                                onClick={() => removeRule(index)}
                            />
                        </div>

                        {/* Body */}
                        {rule.open && (
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
                                    <S1Field label={__('Product IDs (comma separated)', 'store-one')}>
                                        <TextControl
                                            value={rule.product_ids}
                                            onChange={(v) => updateField(index, 'product_ids', v)}
                                        />
                                    </S1Field>
                                )}

                                {rule.trigger_type === 'specific_categories' && (
                                    <S1Field label={__('Category IDs (comma separated)', 'store-one')}>
                                        <TextControl
                                            value={rule.category_ids}
                                            onChange={(v) => updateField(index, 'category_ids', v)}
                                        />
                                    </S1Field>
                                )}

                                {rule.trigger_type === 'specific_tags' && (
                                    <S1Field label={__('Tag IDs (comma separated)', 'store-one')}>
                                        <TextControl
                                            value={rule.tag_ids}
                                            onChange={(v) => updateField(index, 'tag_ids', v)}
                                        />
                                    </S1Field>
                                )}

                                <S1Field label={__('Discount Type', 'store-one')}>
                                    <SelectControl
                                        value={rule.discount_type}
                                        options={[
                                            { label: __('Percentage', 'store-one'), value: 'percentage' },
                                            { label: __('Fixed Amount', 'store-one'), value: 'fixed' },
                                        ]}
                                        onChange={(v) => updateField(index, 'discount_type', v)}
                                    />
                                </S1Field>

                                <S1Field label={__('Discount Amount', 'store-one')}>
                                    <TextControl
                                        type="number"
                                        value={rule.discount_amount}
                                        onChange={(v) => updateField(index, 'discount_amount', v)}
                                    />
                                </S1Field>

                            </div>
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
