import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import MultiWooSearchSelector from '@storeone-global/MultiWooSearchSelector';

export default function ExcludeCondition({
    label,
    searchType,
    enabled,
    items,
    onToggle,
    onChangeItems,
    detailedView
}) {
    const isSearchable = searchType !== 'on_sale';

    return (
        <>

            {/* Toggle Row */}
            <div className="s1-field-wrapper s1-exclude-header">
                <label className="s1-field-label">{label}</label>

                <div className="s1-field-control">
                    <ToggleControl
                        checked={enabled}
                        onChange={onToggle}
                    />
                </div>
            </div>

            {/* Multi Search */}
            {enabled && isSearchable && (
                <div className="s1-field-wrapper s1-exclude-search">
                    <label className="s1-field-label">
                        {__('Search', 'store-one')}
                    </label>

                    <div className="s1-field-control">
                        <MultiWooSearchSelector
                            searchType={searchType}
                            placeholder={__('Search & select…', 'store-one')}
                            value={items}
                            onChange={onChangeItems}
                            detailedView={detailedView} 
                        />
                    </div>
                </div>
            )}
        </>
    );
}
