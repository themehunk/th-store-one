import { useState, useEffect, useRef } from '@wordpress/element';
import {
    TextControl,
    SelectControl,
    Button,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import Sortable from 'sortablejs';
import MiniColorPicker from '../components/GlobalSettings/MiniColorPicker';

/* ------------------------------------------
   New Rule Template
------------------------------------------- */
const newRuleTemplate = () => ({
    campaign_status: 'inactive',
    offer_title: '',
    discount_amount: 0,
    shipping_date: '',
    pre_order_start: '',
    pre_order_end: '',
    text_color: '#ffffff',
    text_hover_color: '#ffffff',
    bg_color: '#212121',
    bg_hover_color: '#414141',
    border_color: '#212121',
    border_hover_color: '#414141',
    flexible_id: crypto.randomUUID(),
    open: true,
});

/* ------------------------------------------
   Sortable Wrapper (Stable)
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
export default function PreOrderRulesEditor({ rules, onChange }) {

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

    const addRule = () => updateAll([...rules, newRuleTemplate()]);

    // Ensure first rule always open by default
    useEffect(() => {
        if (rules.length === 0) {
            updateAll([newRuleTemplate()]);
        } else {
            const arr = [...rules];
            arr[0].open = true;
            updateAll(arr);
        }
    }, []);

    return (
        <div className="store-one-rules-container" style={{ marginTop: 30 }}>
            
            <h3 style={{ marginBottom: 15 }}>
                {__('Rules', 'store-one')}
            </h3>

            <SortableWrapper
                items={rules}
                onSortEnd={(oldIndex, newIndex) => reorder(oldIndex, newIndex)}
            >
                {rules.map((rule, index) => (
                    <div
                        key={rule.flexible_id}
                        className="store-one-rule-item"
                        style={{
                            border: '1px solid #ddd',
                            padding: 0,
                            borderRadius: 10,
                            marginBottom: 20,
                            background: '#fff',
                            boxShadow: '0px 3px 10px rgba(0,0,0,0.05)',
                            overflow: 'hidden',
                        }}
                    >

                        {/* Header Bar */}
                        <div
                            className="store-one-rule-header"
                            style={{
                                padding: '10px 12px',
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                            }}
                        >

                            {/* Drag Handle */}
                            <span
                                className="dashicons dashicons-menu drag-handle"
                                style={{
                                    cursor: 'grab',
                                    fontSize: 18,
                                    opacity: 0.8,
                                }}
                            ></span>

                            {/* RULE TITLE */}
                            <strong style={{ flex: 1, fontSize: 15 }}>
                                {sprintf(
                                    __('Rule %d: %s', 'store-one'),
                                    index + 1,
                                    rule.offer_title
                                        ? rule.offer_title
                                        : __('Untitled', 'store-one')
                                )}
                            </strong>

                            {/* Expand/Collapse */}
                            <span
                                onClick={() => toggleOpen(index)}
                                className={`dashicons ${
                                    rule.open
                                        ? 'dashicons-arrow-up-alt2'
                                        : 'dashicons-arrow-down-alt2'
                                }`}
                                style={{
                                    cursor: 'pointer',
                                    fontSize: 16,
                                    color:'#999'
                                }}
                            ></span>

                            {/* Duplicate */}
                            <span
                                onClick={() => duplicateRule(index)}
                                className="dashicons dashicons-admin-page"
                                style={{
                                    cursor: 'pointer',
                                    fontSize: 16,
                                    color:'#999'
                                }}
                            ></span>

                            {/* Remove */}
                            <span
                                onClick={() => removeRule(index)}
                                className="dashicons dashicons-no-alt"
                                style={{
                                    cursor: 'pointer',
                                    fontSize: 16,
                                    color: '#cc0000',
                                    
                                }}
                            ></span>

                        </div>

                        {/* Collapsible Content */}
                        {rule.open && (
                            <div style={{ padding: 15 }}>

                                <TextControl
                                    label={__('Offer Title', 'store-one')}
                                    value={rule.offer_title}
                                    onChange={(v) => updateField(index, 'offer_title', v)}
                                />

                                <SelectControl
                                    label={__('Campaign Status', 'store-one')}
                                    value={rule.campaign_status}
                                    options={[
                                        { label: __('Active', 'store-one'), value: 'active' },
                                        { label: __('Inactive', 'store-one'), value: 'inactive' },
                                    ]}
                                    onChange={(v) => updateField(index, 'campaign_status', v)}
                                />

                                <TextControl
                                    label={__('Discount Amount', 'store-one')}
                                    type="number"
                                    value={rule.discount_amount}
                                    onChange={(v) => updateField(index, 'discount_amount', v)}
                                />

                                <TextControl
                                    label={__('Shipping Date', 'store-one')}
                                    type="datetime-local"
                                    value={rule.shipping_date}
                                    onChange={(v) => updateField(index, 'shipping_date', v)}
                                />

                                <TextControl
                                    label={__('Start Date', 'store-one')}
                                    type="datetime-local"
                                    value={rule.pre_order_start}
                                    onChange={(v) => updateField(index, 'pre_order_start', v)}
                                />

                                <TextControl
                                    label={__('End Date', 'store-one')}
                                    type="datetime-local"
                                    value={rule.pre_order_end}
                                    onChange={(v) => updateField(index, 'pre_order_end', v)}
                                />

                                {/* COLOR PICKERS */}
                                <div
                                    className="store-one-color-panel"
                                    style={{
                                        marginTop: 20,
                                        padding: 15,
                                        border: '1px solid #eee',
                                        borderRadius: 10,
                                        background: '#fafafa',
                                    }}
                                >
                                    <h4 style={{ marginBottom: 10 }}>
                                        {__('Button Colors', 'store-one')}
                                    </h4>

                                    <MiniColorPicker
                                        label={__('Text Color', 'store-one')}
                                        value={rule.text_color}
                                        onChange={(v) =>
                                            updateField(index, 'text_color', v)
                                        }
                                    />

                                    <MiniColorPicker
                                        label={__('Text Hover Color', 'store-one')}
                                        value={rule.text_hover_color}
                                        onChange={(v) =>
                                            updateField(index, 'text_hover_color', v)
                                        }
                                    />

                                    <MiniColorPicker
                                        label={__('Background Color', 'store-one')}
                                        value={rule.bg_color}
                                        onChange={(v) =>
                                            updateField(index, 'bg_color', v)
                                        }
                                    />

                                    <MiniColorPicker
                                        label={__('Background Hover Color', 'store-one')}
                                        value={rule.bg_hover_color}
                                        onChange={(v) =>
                                            updateField(index, 'bg_hover_color', v)
                                        }
                                    />

                                    <MiniColorPicker
                                        label={__('Border Color', 'store-one')}
                                        value={rule.border_color}
                                        onChange={(v) =>
                                            updateField(index, 'border_color', v)
                                        }
                                    />

                                    <MiniColorPicker
                                        label={__('Border Hover Color', 'store-one')}
                                        value={rule.border_hover_color}
                                        onChange={(v) =>
                                            updateField(index, 'border_hover_color', v)
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </SortableWrapper>

            <div
    className="store-one-add-rule"
    onClick={addRule}
    style={{
        
        cursor: 'pointer',
        color: '#007cba',
        fontWeight: 600,
        fontSize: '14px',
        display: 'inline-block'
    }}
>
{__('+ Add New Rule', 'store-one')}
</div>

        </div>
    );
}