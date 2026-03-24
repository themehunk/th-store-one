import {
    TextControl,
    TextareaControl,
    SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import PlacementPriorityControl from "@th-storeone-global/PlacementPriorityControl";

export default function SingleProductSettings({
    settings,
    updateSetting,
}) {
    // FIX: status toggle convert active/inactive ↔ boolean
    const statusChecked = settings.status === "active";


    return (
        <div className="store-one-rule-body">

           
            <PlacementPriorityControl
                placement={settings.placement}
                priority={settings.priority}
                onPlacementChange={(v) => updateSetting('placement', v)}
                onPriorityChange={(v) => updateSetting('priority', v)}
            />
            {/* BUNDLE TITLE */}
            <div className="s1-field-wrapper">
                <label className="s1-field-label">{__('Bundle Title', 'th-store-one')}</label>
                <div className="s1-field-control">
                <TextControl
                    value={settings.bundle_title}
                    onChange={(v) => updateSetting('bundle_title', v)}
                />
                </div>
            </div>

            {/* PRICE LABELS */}
            <div className="s1-field-wrapper">
                <label className="s1-field-label">{__('Price Label', 'th-store-one')}</label>
                <div className="s1-field-control">
                <TextControl
                    value={settings.price_label}
                    onChange={(v) => updateSetting('price_label', v)}
                />
                </div>
            </div>

            <div className="s1-field-wrapper">
                <label className="s1-field-label">
                    {__('Price label for one selected product', 'th-store-one')}
                </label>
                <div className="s1-field-control">
                <TextControl
                    value={settings.one_price_label}
                    onChange={(v) => updateSetting('one_price_label', v)}
                    help={__('{count} items selected', 'th-store-one')}
                />
                </div>
            </div>

            {/* NO VARIATION SELECTED */}
            <div className="s1-field-wrapper">
                <label className="s1-field-label">{__('No variation selected text', 'th-store-one')}</label>
               <div className="s1-field-control">
                <TextareaControl
                    value={settings.no_variation_text}
                    onChange={(v) => updateSetting('no_variation_text', v)}
                />
                </div>
            </div>

            <div className="s1-field-wrapper">
                <label className="s1-field-label">
                    {__('No variation selected (no discount)', 'th-store-one')}
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
                    {__('Button Text', 'th-store-one')}
                </label>
                <div className="s1-field-control">
                <TextControl
                    value={settings.button_text}
                    onChange={(v) => updateSetting('button_text', v)}
                    
                />
                </div>
            </div>

            {/* <div className="s1-field-wrapper">
                    <THRangeControl  label={__('Bundle border radius', 'store-one')} defaultValue={10} value={20} onChange={(v) => updateSetting("border_radius", v)}/>
            </div> */}
            {/* BORDER RADIUS */}
            {/* <div className="s1-field-wrapper">
               <label className="s1-field-label">
                    {__('Bundle border radius', 'store-one')}
               </label>
                <div className="s1-field-control"> */}
                {/* RESPONSIVE RANGE */}
                {/* <UniversalRangeControl
                    label="Border Radius"
                    responsive={true}
                    units={['px', '%','rem']}
                    value={settings.border_radius}
                    onChange={(v) => updateSetting("border_radius", v)}
                    defaultValue="10px"
                /> */}
                {/* </div>
               </div> */}

        </div>
    );
}