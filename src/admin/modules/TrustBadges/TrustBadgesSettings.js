import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';

import TrustBadgesRules from './TrustBadgesRules';

const MODULE_ID = 'trust-badges';

export default function TrustBadgesSettings({
    onSettingsChange,
    onLivePreview,
    onRegisterSave,
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
        apiFetch.use(apiFetch.createNonceMiddleware(th_StoreOneAdmin.nonce));
        apiFetch({
            path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'GET',
        })
            .then((res) => {
                const s = res?.settings || {};
                if (Array.isArray(s.rules)) {
                    setRules(s.rules);
                }
            })
            .catch(() => setError(__('Failed to load settings.', 'th-store-one')))
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
    /*SAME SAVE FUNCTION */
    const handleSave = () => {
        if (saving) return;
        setSaving(true);
        setSuccess('');
        setError('');
        apiFetch({
            path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'POST',
            data: { settings: { rules } },
        })
            .then(() => setSuccess(__('Saved successfully!', 'th-store-one')))
            .catch(() => setError(__('Failed to save.', 'th-th-store-one')))
            .finally(() => setSaving(false));
    };
    
    useEffect(() => {
        onRegisterSave?.(() => handleSave);
    }, [rules]);
    return (
        <div>
            {loading && (
                <div className="store-one-loader">
                    <Spinner /> {__('Loading…', 'th-store-one')}
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
                    <TrustBadgesRules
                        rules={rules}
                        onChange={setRules}
                        onLivePreview={onLivePreview}
                    />
                </>
            )}
        </div>
    );
}