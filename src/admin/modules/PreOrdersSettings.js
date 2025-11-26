// src/admin/modules/PreOrdersSettings.js
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
    Card,
    CardHeader,
    CardBody,
    TextControl,
    SelectControl,
    Button,
    Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const MODULE_ID = 'pre-orders';

const PreOrdersSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // yaha sirf kuch example fields rakhe hain:
    const [mode, setMode] = useState('unified_order');
    const [helpText, setHelpText] = useState('');
    // rules ko simple array form me rakh sakte ho (aage UI banayenge):
    const [rules, setRules] = useState([]);

    // 1) LOAD settings from REST
    useEffect(() => {
        setLoading(true);
        setError('');
        setSuccess('');

        apiFetch.use(apiFetch.createNonceMiddleware(StoreOneAdmin.nonce));

        apiFetch({
            path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'GET',
        })
            .then((res) => {
                const s = res?.settings || {};

                if (s.modes) {
                    setMode(s.modes);
                }
                if (typeof s.helping_instructions_only_pre_orders === 'string') {
                    setHelpText(s.helping_instructions_only_pre_orders);
                }
                if (Array.isArray(s.rules)) {
                    setRules(s.rules);
                }
            })
            .catch(() => {
                setError(__('Failed to load pre-order settings.', 'store-one'));
            })
            .finally(() => setLoading(false));
    }, []);

    // 2) SAVE settings
    const handleSave = () => {
        setSaving(true);
        setError('');
        setSuccess('');

        const payload = {
            settings: {
                modes: mode,
                helping_instructions_only_pre_orders: helpText,
                rules, // abhi jo bhi array hai woh as-is jayega
            },
        };

        apiFetch({
            path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'POST',
            data: payload,
        })
            .then(() => {
                setSuccess(__('Settings saved successfully.', 'store-one'));
            })
            .catch(() => {
                setError(__('Failed to save settings.', 'store-one'));
            })
            .finally(() => setSaving(false));
    };

    return (
        <Card className="settings-card">
            <CardHeader>
                <h2 className="settings-title">
                    {__('Pre-orders Settings', 'store-one')}
                </h2>
                <p className="settings-desc">
                    {__(
                        'Configure how pre-orders behave in your store.',
                        'store-one'
                    )}
                </p>
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
                        {error && (
                            <div className="storeone-toast toast-error">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="storeone-toast toast-success">
                                {success}
                            </div>
                        )}

                        <SelectControl
                            label={__('Pre-order mode', 'store-one')}
                            value={mode}
                            options={[
                                {
                                    label: __(
                                        'Unified order (all together)',
                                        'store-one'
                                    ),
                                    value: 'unified_order',
                                },
                                {
                                    label: __(
                                        'Separate order for pre-orders',
                                        'store-one'
                                    ),
                                    value: 'separate_order_for_pre_orders',
                                },
                                {
                                    label: __(
                                        'Group pre-orders into one order',
                                        'store-one'
                                    ),
                                    value:
                                        'group_pre_order_into_one_order',
                                },
                            ]}
                            onChange={setMode}
                        />

                        <TextControl
                            label={__(
                                'Helping instructions (customers)',
                                'store-one'
                            )}
                            help={__(
                                'Shown near the pre-order options to explain how it works.',
                                'store-one'
                            )}
                            value={helpText}
                            onChange={setHelpText}
                        />

                        {/* Yaha baad me rules ka full repeater UI aayega */}
                        {/* <PreOrderRulesEditor rules={rules} onChange={setRules} /> */}

                        <Button
                            isPrimary
                            onClick={handleSave}
                            disabled={saving}
                            style={{ marginTop: '16px' }}
                        >
                            {saving
                                ? __('Saving…', 'store-one')
                                : __('Save settings', 'store-one')}
                        </Button>
                    </>
                )}
            </CardBody>
        </Card>
    );
};

export default PreOrdersSettings;
