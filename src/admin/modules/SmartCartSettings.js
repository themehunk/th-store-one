import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
    Card,
    CardHeader,
    CardBody,
    SelectControl,
    ToggleControl,
    TextControl,
    Button,
    Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const MODULE_ID = 'cart';

const SmartCartSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // toast
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // module fields
    const [cartPosition, setCartPosition] = useState('right');
    const [animation, setAnimation] = useState('slide');
    const [showSubtotal, setShowSubtotal] = useState(true);
    const [buttonText, setButtonText] = useState('Checkout Now');

    // Load settings
    useEffect(() => {
        apiFetch.use(apiFetch.createNonceMiddleware(StoreOneAdmin.nonce));

        apiFetch({ path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}` })
            .then((res) => {
                const s = res.settings;

                setCartPosition(s.cart_position ?? 'right');
                setAnimation(s.animation ?? 'slide');
                setShowSubtotal(!!s.show_subtotal);
                setButtonText(s.button_text ?? 'Checkout Now');
            })
            .catch(() => setError(__('Failed to load Smart Cart settings.', 'store-one')))
            .finally(() => setLoading(false));
    }, []);

    // Save settings
    const handleSave = () => {
        setSaving(true);
        setError('');
        setSuccess('');

        apiFetch({
            path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'POST',
            data: {
                settings: {
                    cart_position: cartPosition,
                    animation: animation,
                    show_subtotal: showSubtotal,
                    button_text: buttonText,
                },
            },
        })
            .then(() => setSuccess(__('Settings saved successfully!', 'store-one')))
            .catch(() => setError(__('Failed to save settings.', 'store-one')))
            .finally(() => setSaving(false));
    };

    return (
        <Card className="settings-card">
            <CardHeader>
                <h2>{__('Smart Cart Settings', 'store-one')}</h2>
                <p>{__('Configure the behavior and style of the Smart Cart.', 'store-one')}</p>
            </CardHeader>

            <CardBody>
                {loading && (
                    <div className="store-loader-inline">
                        <Spinner />
                        {__('Loading…', 'store-one')}
                    </div>
                )}

                {!loading && (
                    <>
                        {error && <div className="storeone-toast toast-error">{error}</div>}
                        {success && <div className="storeone-toast toast-success">{success}</div>}

                        <SelectControl
                            label={__('Cart Position', 'store-one')}
                            value={cartPosition}
                            onChange={setCartPosition}
                            options={[
                                { label: __('Right', 'store-one'), value: 'right' },
                                { label: __('Left', 'store-one'), value: 'left' },
                            ]}
                        />

                        <SelectControl
                            label={__('Open Animation', 'store-one')}
                            value={animation}
                            onChange={setAnimation}
                            options={[
                                { label: __('Slide', 'store-one'), value: 'slide' },
                                { label: __('Fade', 'store-one'), value: 'fade' },
                                { label: __('Zoom', 'store-one'), value: 'zoom' },
                            ]}
                        />

                        <ToggleControl
                            label={__('Show Subtotal', 'store-one')}
                            checked={showSubtotal}
                            onChange={setShowSubtotal}
                        />

                        <TextControl
                            label={__('Checkout Button Text', 'store-one')}
                            value={buttonText}
                            onChange={setButtonText}
                        />

                        <Button
                            isPrimary
                            disabled={saving}
                            onClick={handleSave}
                            style={{ marginTop: 16 }}
                        >
                            {saving ? __('Saving…', 'store-one') : __('Save Settings', 'store-one')}
                        </Button>
                    </>
                )}
            </CardBody>
        </Card>
    );
};

export default SmartCartSettings;
