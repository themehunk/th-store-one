import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';

import FrequentlyBoughtRulesEditor from './FrequentlyBoughtRulesEditor';

const MODULE_ID = 'frequently-bought';

export default function FrequentlyBoughtSettings({
    onSettingsChange,
    onLivePreview,
    onRegisterSave, // ✅ REQUIRED for AdminMain
}) {

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [hideToast, setHideToast] = useState(false);

    const [rules, setRules] = useState([]);

    /* notify parent on change */
    useEffect(() => {
        onSettingsChange?.({ rules });
    }, [rules]);

    /* load settings */
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

    /* auto hide toast */
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

    /* 🔥 SAME SAVE FUNCTION */
    const handleSave = () => {
        if (saving) return;

        setSaving(true);
        setSuccess('');
        setError('');

        apiFetch({
            path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'POST',
            data: { settings: { rules } },
        })
            .then(() => setSuccess(__('Saved successfully!', 'store-one')))
            .catch(() => setError(__('Failed to save.', 'store-one')))
            .finally(() => setSaving(false));
    };

    /* 🔥 THIS IS THE KEY — AdminMain yahin se save call karta hai */
    useEffect(() => {
        onRegisterSave?.(() => handleSave);
    }, [rules]);

    return (
        <div>
            {loading && (
                <div className="store-one-loader">
                    <Spinner /> {__('Loading…', 'store-one')}
                </div>
            )}

            {!loading && (
                <>
                    {/* notices SAME */}
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

                    {/* RULES EDITOR */}
                    <FrequentlyBoughtRulesEditor
                        rules={rules}
                        onChange={setRules}
                        onLivePreview={onLivePreview}
                    />
                </>
            )}
        </div>
    );
}
