import {
    TextControl,
    TextareaControl,
    SelectControl,
    ToggleControl,
    RangeControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function CheckoutPageSettings({
    settings,
    updateSetting,
}) {

    // FIX: status toggle convert active/inactive ↔ boolean
    const statusChecked = settings.status === "active";

    return (
        <div className="store-one-rule-body">

            {/* STATUS TOGGLE */}
            <div className="s1-field-control">
               <label className="s1-field-label">
                    {__('Status', 'th-store-one')}
               </label>

               <SelectControl
                    value={settings.checkout_enabled}
                    onChange={(v) => updateSetting('checkout_enabled', v)}
                    options={[
                         { label: __('Active', 'th-store-one'), value: 'active' },
                         { label: __('Inactive', 'th-store-one'), value: 'inactive' },
                    ]}
               />
               </div>
               {/* PLACEMENT */}
            <div className="s1-field-control">
                <label className="s1-field-label">
                    {__('Placement on product page', 'th-store-one')}
                </label>
                <SelectControl
                    value={settings.checkout_placement}
                    onChange={(v) => updateSetting('checkout_placement', v)}
                    options={[
                        { label: __('After Billing Details', 'th-store-one'), value: 'after_billing' },
                        { label: __('Before Billing Details', 'th-store-one'), value: 'before_billing' },
                        { label: __('Before Order Details', 'th-store-one'), value: 'after_order' },
                        { label: __('Before Payment Gateway', 'th-store-one'), value: 'before_payment' },
                         { label: __('Before Order Button', 'th-store-one'), value: 'before_order' },
                         { label: __('After Order Button', 'th-store-one'), value: 'after_order' },
                    ]}
                />
            </div>

            {/* BUNDLE TITLE */}
            <div className="s1-field-control">
                <label className="s1-field-label">{__('Bundle title', 'th-store-one')}</label>
                <TextControl
                    value={settings.checkout_bundle_title}
                    onChange={(v) => updateSetting('checkout_bundle_title', v)}
                />
            </div>

           <div className="s1-field-control">
                <label className="s1-field-label">{__('You save label', 'th-store-one')}</label>
                <TextControl
                    value={settings.checkout_you_save_label}
                    onChange={(v) => updateSetting('checkout_you_save_label', v)}
                />
            </div>
            <div className="s1-field-control">
                <label className="s1-field-label">{__('Button Text', 'th-store-one')}</label>
                <TextControl
                    value={settings.checkout_button_text}
                    onChange={(v) => updateSetting('checkout_button_text', v)}
                />
            </div>

        </div>
    );
}
