// src/admin/modules/FrequentlyBoughtSettings.js

import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { Button, Spinner } from '@wordpress/components';

import FrequentlyBoughtRulesEditor from './FrequentlyBoughtRulesEditor';

const MODULE_ID = 'frequently-bought';

export default function FrequentlyBoughtSettings() {

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [rules, setRules] = useState([]);

    useEffect(() => {
        setLoading(true);
        apiFetch.use(apiFetch.createNonceMiddleware(StoreOneAdmin.nonce));

        apiFetch({
            path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'GET',
        })
            .then((res) => {
                const s = res?.settings || {};
                if (Array.isArray(s.rules)) {
                    setRules(s.rules);
                }
            })
            .catch(() => setError(__('Failed to load settings.', 'store-one')))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = () => {
        setSaving(true);
        setSuccess('');
        setError('');

        const payload = {
            settings: {
                rules,
            },
        };

        apiFetch({
            path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'POST',
            data: payload,
        })
            .then(() => setSuccess(__('Saved successfully!', 'store-one')))
            .catch(() => setError(__('Failed to save.', 'store-one')))
            .finally(() => setSaving(false));
    };

    return (
        <div>
            {loading && (
                <div className="store-one-loader">
                    <Spinner /> {__('Loading…', 'store-one')}
                </div>
            )}

            {!loading && (
                <>
                    {error && <div className="storeone-toast toast-error">{error}</div>}
                    {success && <div className="storeone-toast toast-success">{success}</div>}

                    <FrequentlyBoughtRulesEditor rules={rules} onChange={setRules} />

                    <Button isPrimary onClick={handleSave} disabled={saving} style={{ marginTop: 20 }}>
                        {saving ? __('Saving…', 'store-one') : __('Save Settings', 'store-one')}
                    </Button>
                </>
            )}
        </div>
    );
}
