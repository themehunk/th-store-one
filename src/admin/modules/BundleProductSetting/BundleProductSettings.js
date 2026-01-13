import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import {S1Field, S1FieldGroup} from '@storeone-global/S1Field';
import {
    Spinner,
    ToggleControl,
    SelectControl,
} from '@wordpress/components';

const MODULE_ID = 'bundle-product';

/* ---------------------------------
 * DEFAULT SETTINGS
 * --------------------------------- */
const DEFAULT_SETTINGS = {
    product_page: {
        show_price_range: true,
        show_thumbnails: true,
        show_descriptions: false,
        show_quantities: true,
        thumbnails_clickable: true,
        price_display: 'unit',     // unit | total
        price_based_on: 'sale',    // sale | regular
        position: 'before_cart',   // before_cart | after_cart
    },
    cart_page: {
        hide_products: false,
        hide_products_mini: false,
        include_links: true,
        cart_count: 'bundle',     // bundle | items
        display_type: 'list',     // list | bullet
    },
};

export default function BundleProductSettings({
    onSettingsChange,
    onRegisterSave,
}) {

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [hideToast, setHideToast] = useState(false);

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    /* ---------------------------------
     * LOAD SETTINGS
     * --------------------------------- */
    useEffect(() => {
        apiFetch.use(apiFetch.createNonceMiddleware(StoreOneAdmin.nonce));

        apiFetch({
            path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'GET',
        })
            .then((res) => {
                const s = res?.settings || {};
                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...s,
                    product_page: {
                        ...DEFAULT_SETTINGS.product_page,
                        ...(s.product_page || {}),
                    },
                });
            })
            .catch(() =>
                setError(__('Failed to load settings.', 'store-one'))
            )
            .finally(() => setLoading(false));
    }, []);

    /* ---------------------------------
     * SAVE HANDLER
     * --------------------------------- */
    const handleSave = () => {
        if (saving) return;

        setSaving(true);
        setSuccess('');
        setError('');

        apiFetch({
            path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'POST',
            data: { settings },
        })
            .then(() =>
                setSuccess(__('Saved successfully!', 'store-one'))
            )
            .catch(() =>
                setError(__('Failed to save.', 'store-one'))
            )
            .finally(() => setSaving(false));
    };

    /* ---------------------------------
        * NOTIFY PARENT ON CHANGE 🔥
        * --------------------------------- */
        useEffect(() => {
            onSettingsChange?.(settings);
        }, [settings]);

    /* ---------------------------------
     * REGISTER SAVE WITH ADMIN MAIN
     * --------------------------------- */
    useEffect(() => {
        onRegisterSave?.(() => handleSave);
    }, [settings]);

    /* ---------------------------------
     * AUTO HIDE TOAST
     * --------------------------------- */
    useEffect(() => {
        if (success || error) {
            setHideToast(false);

            const t1 = setTimeout(() => setHideToast(true), 2500);
            const t2 = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        }
    }, [success, error]);

    /* ---------------------------------
     * RENDER
     * --------------------------------- */
    return (
        <div className="storeone-module-settings">

            {loading && (
                <div className="store-one-loader">
                    <Spinner /> {__('Loading…', 'store-one')}
                </div>
            )}

            {!loading && (
                <>
                    {/* NOTICES */}
                    {error && (
                        <div className={`s1-toast s1-toast--error ${hideToast ? 'hide' : ''}`}>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className={`s1-toast s1-toast--success ${hideToast ? 'hide' : ''}`}>
                            <span>{success}</span>
                        </div>
                    )}

                    {/* ---------------------------------
                     * PRODUCT PAGE SETTINGS
                     * --------------------------------- */}
                    <h3 className="store-one-section-title">
                        {__('Bundle settings', 'store-one')}
                    </h3>
                    
                    <div className="store-one-content-settings">
                        <S1FieldGroup
                    title={__('Product page', 'store-one')}
                    >
                      <S1Field label={__('Display bundle price as range for variable products', 'store-one')} classN="s1-toggle-wrpapper">
                            <ToggleControl
                                checked={settings.product_page.show_price_range}
                            onChange={(v) =>
                                setSettings({
                                    ...settings,
                                    product_page: {
                                        ...settings.product_page,
                                        show_price_range: v,
                                    },
                                })
                            }
                            />
                    </S1Field>
                    <S1Field label={__('Display bundled product thumbnails', 'store-one')} classN="s1-toggle-wrpapper">
                    <ToggleControl
                        checked={settings.product_page.show_thumbnails}
                        onChange={(v) =>
                            setSettings({
                                ...settings,
                                product_page: {
                                    ...settings.product_page,
                                    show_thumbnails: v,
                                },
                            })
                        }
                    />
                    </S1Field>
                    <S1Field label={__('Display bundled product descriptions', 'store-one')} classN="s1-toggle-wrpapper">
                    <ToggleControl
                        checked={settings.product_page.show_descriptions}
                        onChange={(v) =>
                            setSettings({
                                ...settings,
                                product_page: {
                                    ...settings.product_page,
                                    show_descriptions: v,
                                },
                            })
                        }
                    />
                    </S1Field>
                    <S1Field label={__('Display bundled product quantities', 'store-one')} classN="s1-toggle-wrpapper">
                    <ToggleControl
                        
                        checked={settings.product_page.show_quantities}
                        onChange={(v) =>
                            setSettings({
                                ...settings,
                                product_page: {
                                    ...settings.product_page,
                                    show_quantities: v,
                                },
                            })
                        }
                    />
                    </S1Field>
                    <S1Field label={__('Make bundled product thumbnails and titles clickable', 'store-one')} classN="s1-toggle-wrpapper">
                    <ToggleControl
                        checked={settings.product_page.thumbnails_clickable}
                        onChange={(v) =>
                            setSettings({
                                ...settings,
                                product_page: {
                                    ...settings.product_page,
                                    thumbnails_clickable: v,
                                },
                            })
                        }
                    />
                    </S1Field>
                    <S1Field label={__('Display prices of bundled products', 'store-one')}>
                    <SelectControl
                        value={settings.product_page.price_display}
                        options={[
                            { label: __('Price per unit', 'store-one'), value: 'unit' },
                            { label: __('Total price', 'store-one'), value: 'total' },
                            { label: __('Hide', 'store-one'), value: 'hide' },
                        ]}
                        onChange={(v) =>
                            setSettings({
                                ...settings,
                                product_page: {
                                    ...settings.product_page,
                                    price_display: v,
                                },
                            })
                        }
                    />
                    </S1Field>
                    
                    <S1Field label={__('Calculate the prices of bundled products based on', 'store-one')}>
                        <SelectControl
                        value={settings.product_page.price_based_on}
                        options={[
                            { label: __('Sale price', 'store-one'), value: 'sale' },
                            { label: __('Regular price', 'store-one'), value: 'regular' },
                        ]}
                        onChange={(v) =>
                            setSettings({
                                ...settings,
                                product_page: {
                                    ...settings.product_page,
                                    price_based_on: v,
                                },
                            })
                        }
                    />
                    </S1Field>
                    <S1Field label={__('Where to display the bundled products', 'store-one')}>
                        <SelectControl
                        value={settings.product_page.position}
                        options={[
                            { label: __('Before add to cart button', 'store-one'), value: 'before_cart' },
                            { label: __('After add to cart button', 'store-one'), value: 'after_cart' },
                        ]}
                        onChange={(v) =>
                            setSettings({
                                ...settings,
                                product_page: {
                                    ...settings.product_page,
                                    position: v,
                                },
                            })
                        }
                    />
                    </S1Field>
                    </S1FieldGroup>

                     <S1FieldGroup
                    title={__('Cart Page', 'store-one')}
                    >
                        <S1Field label={__('Hide bundled products in cart', 'store-one')} classN="s1-toggle-wrpapper">
                                <ToggleControl
                                    checked={settings.cart_page.hide_products}
                                    onChange={(v) =>
                                        setSettings({
                                            ...settings,
                                            cart_page: { ...settings.cart_page, hide_products: v },
                                        })
                                    }
                                />
                            </S1Field>

                            <S1Field label={__('Hide bundled products in mini cart', 'store-one')} classN="s1-toggle-wrpapper">
                                <ToggleControl
                                    checked={settings.cart_page.hide_products_mini}
                                    onChange={(v) =>
                                        setSettings({
                                            ...settings,
                                            cart_page: { ...settings.cart_page, hide_products_mini: v },
                                        })
                                    }
                                />
                            </S1Field>

                            <S1Field label={__('Include links to bundled products', 'store-one')} classN="s1-toggle-wrpapper">
                                <ToggleControl
                                    checked={settings.cart_page.include_links}
                                    onChange={(v) =>
                                        setSettings({
                                            ...settings,
                                            cart_page: { ...settings.cart_page, include_links: v },
                                        })
                                    }
                                />
                            </S1Field>

                            <S1Field label={__('Cart contents count will include', 'store-one')}>
                                <SelectControl
                                    value={settings.cart_page.cart_count}
                                    options={[
                                        { label: __('Bundle as one product', 'store-one'), value: 'bundle' },
                                        { label: __('Bundled items separately', 'store-one'), value: 'items' },
                                    ]}
                                    onChange={(v) =>
                                        setSettings({
                                            ...settings,
                                            cart_page: { ...settings.cart_page, cart_count: v },
                                        })
                                    }
                                />
                            </S1Field>

                            <S1Field label={__('Show bundled products', 'store-one')}>
                                <SelectControl
                                    value={settings.cart_page.display_type}
                                    options={[
                                        { label: __('List inline', 'store-one'), value: 'list' },
                                        { label: __('Bulleted list', 'store-one'), value: 'bullet' },
                                    ]}
                                    onChange={(v) =>
                                        setSettings({
                                            ...settings,
                                            cart_page: { ...settings.cart_page, display_type: v },
                                        })
                                    }
                                />
                            </S1Field>


                    </S1FieldGroup>
                    </div>
                   
                </>
            )}
        </div>
        
    );
}