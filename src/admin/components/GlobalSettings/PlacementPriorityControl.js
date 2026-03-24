import { SelectControl, TextControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";


const PLACEMENTS = [
    { label: __('Before Product Summary', 'store-one'), value: 'woocommerce_single_product_summary' },
    { label: __('Before Add to Cart Form', 'store-one'), value: 'woocommerce_before_add_to_cart_form' },
    { label: __('After Add to Cart Form', 'store-one'), value: 'woocommerce_after_add_to_cart_form' },
    { label: __('Before Product Meta', 'store-one'), value: 'woocommerce_product_meta_start' },
    { label: __('After Product Meta', 'store-one'), value: 'woocommerce_product_meta_end' },
    { label: __('After Product Summary', 'store-one'), value: 'woocommerce_after_single_product_summary' },
];

export default function PlacementPriorityControl({
    placement,
    priority,
    onPlacementChange,
    onPriorityChange,
    showPriority = true
}) {
    return (
        <div className="s1-field-wrapper col-2">

            <div className="s1-field-col">
                <label className="s1-field-label">
                    {__('Placement on product page', 'th-store-one')}
                </label>

                <div className="s1-field-control">
                    <SelectControl
                        value={placement}
                        options={PLACEMENTS}
                        onChange={onPlacementChange}
                    />
                </div>
            </div>

            {showPriority && (
                <div className="s1-field-col">
                    <label className="s1-field-label">
                        {__('Priority', 'th-store-one')}
                    </label>

                    <div className="s1-field-control">
                        <TextControl
                            type="number"
                            value={priority}
                            onChange={onPriorityChange}
                        />
                    </div>
                </div>
            )}

        </div>
    );
}