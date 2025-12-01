import {
    TextControl,
    TextareaControl,
    SelectControl,
    ToggleControl,
    RangeControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import MiniColorPicker from '@storeone-global/MiniColorPicker';
import UniversalRangeControl from '@storeone-global/UniversalRangeControl';
import DeviceControl from '@storeone-global/DeviceControl';
export default function SingleProductSettings({
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
                    value={settings.status}
                    onChange={(v) => updateSetting('status', v)}
                    options={[
                         { label: __('Active', 'store-one'), value: 'active' },
                         { label: __('Inactive', 'store-one'), value: 'inactive' },
                    ]}
               />
               </div>

            {/* PLACEMENT */}
            <div className="s1-field-control">
                <label className="s1-field-label">
                    {__('Placement on product page', 'store-one')}
                </label>
                <SelectControl
                    value={settings.placement}
                    onChange={(v) => updateSetting('placement', v)}
                    options={[
                        { label: __('After Product Summary', 'store-one'), value: 'after_summary' },
                        { label: __('Before Product Summary', 'store-one'), value: 'before_summary' },
                        { label: __('After Title', 'store-one'), value: 'after_title' },
                        { label: __('After Add to Cart', 'store-one'), value: 'after_add_to_cart' },
                    ]}
                />
            </div>

            {/* PRIORITY */}
            <div className="s1-field-control">
                <label className="s1-field-label">{__('Priority', 'store-one')}</label>
                <TextControl
                    type="number"
                    value={settings.priority}
                    onChange={(v) => updateSetting('priority', v)}
                />
            </div>

            {/* BUNDLE TITLE */}
            <div className="s1-field-control">
                <label className="s1-field-label">{__('Bundle title', 'store-one')}</label>
                <TextControl
                    value={settings.bundle_title}
                    onChange={(v) => updateSetting('bundle_title', v)}
                />
            </div>

            {/* PRICE LABELS */}
            <div className="s1-field-control">
                <label className="s1-field-label">{__('Price label', 'store-one')}</label>
                <TextControl
                    value={settings.price_label}
                    onChange={(v) => updateSetting('price_label', v)}
                />
            </div>

            <div className="s1-field-control">
                <label className="s1-field-label">
                    {__('Price label for one selected product', 'store-one')}
                </label>
                <TextControl
                    value={settings.one_price_label}
                    onChange={(v) => updateSetting('one_price_label', v)}
                />
            </div>

            <div className="s1-field-control">
                <label className="s1-field-label">
                    {__('Price label when only one product selected', 'store-one')}
                </label>
                <TextControl
                    value={settings.single_only_label}
                    onChange={(v) => updateSetting('single_only_label', v)}
                />
            </div>

            {/* YOU SAVE LABEL */}
            <div className="s1-field-control">
                <label className="s1-field-label">{__('You save label', 'store-one')}</label>
                <TextControl
                    value={settings.you_save_label}
                    onChange={(v) => updateSetting('you_save_label', v)}
                />
            </div>

            {/* NO VARIATION SELECTED */}
            <div className="s1-field-control">
                <label className="s1-field-label">{__('No variation selected text', 'store-one')}</label>
                <TextareaControl
                    value={settings.no_variation_text}
                    onChange={(v) => updateSetting('no_variation_text', v)}
                />
            </div>

            <div className="s1-field-control">
                <label className="s1-field-label">
                    {__('No variation selected (no discount)', 'store-one')}
                </label>
                <TextareaControl
                    value={settings.no_variation_no_discount_text}
                    onChange={(v) => updateSetting('no_variation_no_discount_text', v)}
                />
            </div>

            {/* BUTTON TEXT */}
            <div className="s1-field-control">
                <label className="s1-field-label">{__('Button text', 'store-one')}</label>
                <TextControl
                    value={settings.button_text}
                    onChange={(v) => updateSetting('button_text', v)}
                />
            </div>

            {/* COLORS — using MiniColorPicker */}
            <MiniColorPicker
                label={__('Plus sign background color', 'store-one')}
                value={settings.plus_bg_color}
                onChange={(v) => updateSetting('plus_bg_color', v)}
            />

            <MiniColorPicker
                label={__('Plus sign text color', 'store-one')}
                value={settings.plus_text_color}
                onChange={(v) => updateSetting('plus_text_color', v)}
            />

            <MiniColorPicker
                label={__('Bundle border color', 'store-one')}
                value={settings.border_color}
                onChange={(v) => updateSetting('border_color', v)}
            />

            {/* BORDER RADIUS */}
            <div className="s1-field-control">
               <label className="s1-field-label">
                    {__('Bundle border radius', 'store-one')}
               </label>
                
                {/* RESPONSIVE RANGE */}
                <UniversalRangeControl
                    label="Border Radius"
                    responsive={true}
                    units={['px', '%']}
                    value={settings.border_radius}
                    onChange={(v) => updateSetting("border_radius", v)}
                    defaultValue="10px"
                />
               </div>

        </div>
    );
}
