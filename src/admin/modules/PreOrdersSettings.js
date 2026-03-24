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

import PreOrderRulesEditor from './PreOrderRulesEditor';

const MODULE_ID = 'pre-orders';

const PreOrdersSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [mode, setMode] = useState('unified_order');
    const [instructions, setInstructions] = useState('');
    const [rules, setRules] = useState([]);

    // Load module settings
    useEffect(() => {
        setLoading(true);
        setError('');
        apiFetch.use(apiFetch.createNonceMiddleware(th_StoreOneAdmin.nonce));

        apiFetch({
            path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'GET',
        })
            .then((res) => {
                const s = res?.settings || {};

                s.modes && setMode(s.modes);
                setInstructions(s.helping_instructions_only_pre_orders || '');
                Array.isArray(s.rules) && setRules(s.rules);
            })
            .catch(() => {
                setError(__('Failed to load pre-order settings.', 'store-one'));
            })
            .finally(() => setLoading(false));
    }, []);

    // Save settings
    const handleSave = () => {
        setSaving(true);
        setError('');
        setSuccess('');

        apiFetch({
            path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'POST',
            data: {
                settings: {
                    modes: mode,
                    helping_instructions_only_pre_orders: instructions,
                    rules,
                },
            },
        })
            .then(() => setSuccess(__('Settings saved successfully.', 'store-one')))
            .catch(() => setError(__('Failed to save settings.', 'store-one')))
            .finally(() => setSaving(false));
    };

    return (
        <>
        <Card>
            <CardHeader>
                <h2>{__('Pre Orders Settings', 'store-one')}</h2>
            </CardHeader>

            <CardBody>
                {loading && (
                    <div className="store-loader-inline">
                        <Spinner /> {__('Loading…', 'store-one')}
                    </div>
                )}

                {!loading && (
                    <>
                        {error && <div className="storeone-toast toast-error">{error}</div>}
                        {success && <div className="storeone-toast toast-success">{success}</div>}

                        <SelectControl
                            label={__('Pre-order Mode', 'store-one')}
                            value={mode}
                            onChange={setMode}
                            options={[
                                { label: 'Unified order', value: 'unified_order' },
                                { label: 'Separate order', value: 'separate_order_for_pre_orders' },
                                { label: 'Group pre-orders', value: 'group_pre_order_into_one_order' },
                            ]}
                        />

                        <TextControl
                            label={__('Customer Instruction', 'store-one')}
                            value={instructions}
                            onChange={setInstructions}
                        />

                        {/* RULES EDITOR */}
                        <PreOrderRulesEditor rules={rules} onChange={setRules} />

                        
                    </>
                )}
            </CardBody>
            
        </Card>
        <div className='save-button-wrap'>
        <Button
                            isPrimary
                            disabled={saving}
                            onClick={handleSave}
                            style={{ marginTop: 20 }}
                        >
                            {saving ? __('Saving…', 'store-one') : __('Save Settings', 'store-one')}
                        </Button>
                        </div>
                        </>

    );
};

export default PreOrdersSettings;
