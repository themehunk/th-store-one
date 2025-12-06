import {
    TextControl,
    TextareaControl,
    SelectControl,
    ToggleControl,
    RangeControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function CartPageSettings({
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
                    {__('Status', 'store-one')}
               </label>

               <SelectControl
                    value={settings.cart_enabled}
                    onChange={(v) => updateSetting('cart_enabled', v)}
                    options={[
                         { label: __('Active', 'store-one'), value: 'active' },
                         { label: __('Inactive', 'store-one'), value: 'inactive' },
                    ]}
               />
               </div>

            {/* BUNDLE TITLE */}
            <div className="s1-field-control">
                <label className="s1-field-label">{__('Bundle title', 'store-one')}</label>
                <TextControl
                    value={settings.cart_bundle_title}
                    onChange={(v) => updateSetting('cart_bundle_title', v)}
                />
            </div>

           <div className="s1-field-control">
                <label className="s1-field-label">{__('You save label', 'store-one')}</label>
                <TextControl
                    value={settings.cart_you_save_label}
                    onChange={(v) => updateSetting('cart_you_save_label', v)}
                />
            </div>
            <div className="s1-field-control">
                <label className="s1-field-label">{__('Button Text', 'store-one')}</label>
                <TextControl
                    value={settings.cart_button_text}
                    onChange={(v) => updateSetting('cart_button_text', v)}
                />
            </div>

        </div>
    );
}
