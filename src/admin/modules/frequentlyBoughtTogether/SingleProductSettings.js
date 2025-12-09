import {
    TextControl,
    TextareaControl,
    SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import MiniColorPicker from '@storeone-global/MiniColorPicker';
import UniversalRangeControl from '@storeone-global/UniversalRangeControl';
import THRangeControl from '@storeone-control/rangeControl';


export default function SingleProductSettings({
    settings,
    updateSetting,
}) {
    // FIX: status toggle convert active/inactive ↔ boolean
    const statusChecked = settings.status === "active";

    return (
        <div className="store-one-rule-body">

            {/* STATUS TOGGLE */}
            <div className="s1-field-wrapper">
               <label className="s1-field-label">
                    {__('Status', 'store-one')}
               </label>
              <div className="s1-field-control">
               <SelectControl
                    value={settings.single_enabled}
                    onChange={(v) => updateSetting('single_enabled', v)}
                    options={[
                         { label: __('Active', 'store-one'), value: 'active' },
                         { label: __('Inactive', 'store-one'), value: 'inactive' },
                    ]}
               />
               </div>
               </div>

            {/* PLACEMENT */}
            <div className="s1-field-wrapper">
                <label className="s1-field-label">
                    {__('Placement on product page', 'store-one')}
                </label>
                <div className="s1-field-control">
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
            </div>

            {/* PRIORITY */}
            <div className="s1-field-wrapper">
                <label className="s1-field-label">{__('Priority', 'store-one')}</label>
                <div className="s1-field-control">
                <TextControl
                    type="number"
                    value={settings.priority}
                    onChange={(v) => updateSetting('priority', v)}
                />
                </div>
            </div>

            {/* BUNDLE TITLE */}
            <div className="s1-field-wrapper">
                <label className="s1-field-label">{__('Bundle title', 'store-one')}</label>
                <div className="s1-field-control">
                <TextControl
                    value={settings.bundle_title}
                    onChange={(v) => updateSetting('bundle_title', v)}
                />
                </div>
            </div>

            {/* PRICE LABELS */}
            <div className="s1-field-wrapper">
                <label className="s1-field-label">{__('Price label', 'store-one')}</label>
                <div className="s1-field-control">
                <TextControl
                    value={settings.price_label}
                    onChange={(v) => updateSetting('price_label', v)}
                />
                </div>
            </div>

            <div className="s1-field-wrapper">
                <label className="s1-field-label">
                    {__('Price label for one selected product', 'store-one')}
                </label>
                <div className="s1-field-control">
                <TextControl
                    value={settings.one_price_label}
                    onChange={(v) => updateSetting('one_price_label', v)}
                />
                </div>
            </div>

            {/* NO VARIATION SELECTED */}
            <div className="s1-field-wrapper">
                <label className="s1-field-label">{__('No variation selected text', 'store-one')}</label>
               <div className="s1-field-control">
                <TextareaControl
                    value={settings.no_variation_text}
                    onChange={(v) => updateSetting('no_variation_text', v)}
                />
                </div>
            </div>

            <div className="s1-field-wrapper">
                <label className="s1-field-label">
                    {__('No variation selected (no discount)', 'store-one')}
                </label>
                <div className="s1-field-control">
                <TextareaControl
                    value={settings.no_variation_no_discount_text}
                    onChange={(v) => updateSetting('no_variation_no_discount_text', v)}
                />
                </div>
            </div>

            {/* BUTTON TEXT */}
            <div className="s1-field-wrapper">
                <label className="s1-field-label">
                    {__('Button text', 'store-one')}
                </label>
                <div className="s1-field-control">
                <TextControl
                    value={settings.button_text}
                    onChange={(v) => updateSetting('button_text', v)}
                    help={__('Use {count} to show selected items count.', 'store-one')}
                />
                </div>
            </div>

            <div className="s1-field-wrapper">
                    <THRangeControl  label={__('Bundle border radius', 'store-one')} defaultValue={10} value={20} onChange={(v) => updateSetting("border_radius", v)}/>
            </div>
            {/* BORDER RADIUS */}
            <div className="s1-field-wrapper">
               <label className="s1-field-label">
                    {__('Bundle border radius', 'store-one')}
               </label>
                <div className="s1-field-control">
                {/* RESPONSIVE RANGE */}
                <UniversalRangeControl
                    label="Border Radius"
                    responsive={true}
                    units={['px', '%','rem']}
                    value={settings.border_radius}
                    onChange={(v) => updateSetting("border_radius", v)}
                    defaultValue="10px"
                />
                </div>
               </div>

        </div>
    );
}