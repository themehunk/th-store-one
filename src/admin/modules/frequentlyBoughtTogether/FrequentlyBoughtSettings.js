
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { Button, Spinner } from '@wordpress/components';

import FrequentlyBoughtRulesEditor from './FrequentlyBoughtRulesEditor';

const MODULE_ID = 'frequently-bought';

export default function FrequentlyBoughtSettings({onSettingsChange}) {

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [hideToast, setHideToast] = useState(false);

    const [rules, setRules] = useState([]);

    useEffect(() => {
    onSettingsChange?.({ rules });
    }, [rules]);

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

    /* AUTO HIDE TOAST */
    useEffect(() => {
        if (success || error) {
            setHideToast(false);

            const timer = setTimeout(() => setHideToast(true), 2500);
            const removeTimer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);

            return () => {
                clearTimeout(timer);
                clearTimeout(removeTimer);
            };
        }
    }, [success, error]);

    const handleSave = () => {
        setSaving(true);
        setSuccess('');
        setError('');

        const payload = { settings: { rules } };

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
                    {/* Correct Toasts */}
                    {error && (
                        <div className={`s1-toast s1-toast--error ${hideToast ? 'hide' : ''}`}>
                            <span className="s1-toast__icon"></span>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className={`s1-toast s1-toast--success ${hideToast ? 'hide' : ''}`}>
                            <span className="s1-toast__icon"></span>
                            <span>{success}</span>
                        </div>
                    )}

                    <FrequentlyBoughtRulesEditor rules={rules} onChange={setRules} />

                    <Button
                        isPrimary
                        onClick={handleSave}
                        disabled={saving}
                        style={{ marginTop: 20 }}
                    >
                        {saving ? __('Saving…', 'store-one') : __('Save Settings', 'store-one')}
                    </Button>
                </>
            )}
        </div>
    );
}
