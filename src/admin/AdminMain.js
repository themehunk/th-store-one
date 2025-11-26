import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import Header from './components/Header/Header';
import ModuleGrid from './components/ModuleGrid/ModuleGrid';
import ModuleSettings from './components/ModuleSettings/ModuleSettings';
import PreviewPane from './components/PreviewPane/PreviewPane';
import GlobalSettings from './components/GlobalSettings/GlobalSettings';

import { Notice, Spinner, Button } from '@wordpress/components';
import './admin.scss';

const modulesList = [
    {
        id: 'woo-search',
        label: __('Woo Search', 'store-one'),
        description: __('Boost product discovery.', 'store-one'),
        icon: '🔍',
    },
    {
        id: 'cart',
        label: __('Smart Cart', 'store-one'),
        description: __('Elegant AJAX mini cart.', 'store-one'),
        icon: '🛒',
    },
    {
        id: 'frequently-bought',
        label: __('Frequently Bought', 'store-one'),
        description: __('AI-powered combos.', 'store-one'),
        icon: '🤝',
    },
];

const tabs = [
    {
        name: 'all',
        title: __('All Modules', 'store-one'),
        modules: ['woo-search', 'cart', 'frequently-bought'],
    },
    {
        name: 'recommended',
        title: __('Recommended', 'store-one'),
        modules: ['woo-search', 'cart'],
    },
    {
        name: 'trending',
        title: __('Trending', 'store-one'),
        modules: ['frequently-bought'],
    },
];

const AdminMain = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [activeModule, setActiveModule] = useState(null);

    const [modulesState, setModulesState] = useState({
        'woo-search': true,
        cart: true,
        'frequently-bought': true,
    });

    const currentModule = activeModule
        ? modulesList.find((m) => m.id === activeModule)
        : null;

    // Fetch settings
    useEffect(() => {
        if (!window.StoreOneAdmin) {
            setError(__('Configuration missing.', 'store-one'));
            setLoading(false);
            return;
        }

        apiFetch.use(apiFetch.createNonceMiddleware(StoreOneAdmin.nonce));

        apiFetch({ path: `${StoreOneAdmin.restUrl}settings` })
            .then((res) => {
                if (res?.settings?.modules) {
                    const newState = {};

                    modulesList.forEach((mod) => {
                        newState[mod.id] =
                            !!res.settings.modules[mod.id]?.enabled;
                    });

                    setModulesState(newState);
                }
            })
            .catch(() =>
                setError(__('Failed to load settings.', 'store-one'))
            )
            .finally(() => setLoading(false));
    }, []);

    // Save settings
    const saveSettings = () => {
        setSaving(true);

        const payload = { settings: { modules: {} } };

        modulesList.forEach((mod) => {
            payload.settings.modules[mod.id] = {
                enabled: modulesState[mod.id],
            };
        });

        apiFetch({
            path: `${StoreOneAdmin.restUrl}settings`,
            method: 'POST',
            data: payload,
        })
            .then(() =>
                setSuccess(__('Saved successfully!', 'store-one'))
            )
            .catch(() =>
                setError(__('Failed to save settings.', 'store-one'))
            )
            .finally(() => setSaving(false));
    };

    return (
        <div className="store-one-admin">
            {/* {error && (
                <Notice
                    status="error"
                    isDismissible
                    onRemove={() => setError('')}
                >
                    {error}
                </Notice>
            )}

            {success && (
                <Notice
                    status="success"
                    isDismissible
                    onRemove={() => setSuccess('')}
                >
                    {success}
                </Notice>
            )} */}

            <Header
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setActiveModule={setActiveModule}
            />

            {currentPage === 'dashboard' && (
                <>
                    {/* MODULE GRID */}
                    {!loading && !activeModule && (
                        <ModuleGrid
                            modulesList={modulesList}
                            modulesState={modulesState}
                            tabs={tabs}
                            setActiveModule={setActiveModule}
                        />
                    )}

                    {/* MODULE SETTINGS PAGE */}
                    {!loading && activeModule && currentModule && (
                        <div className="store-module-wrap">
                            <Button
                                isTertiary
                                className="back-btn"
                                onClick={() => setActiveModule(null)}
                            >
                                ← {__('Go Back', 'store-one')}
                            </Button>

                            <div className="settings-grid">
                                <ModuleSettings
                                    currentModule={currentModule}
                                    modulesState={modulesState}
                                    setModulesState={setModulesState}
                                    saving={saving}
                                    saveSettings={saveSettings}
                                />

                                <PreviewPane />
                            </div>
                        </div>
                    )}

                    {/* LOADING */}
                    {loading && (
                        <div className="store-loader">
                            <Spinner />
                            {__('Loading…', 'store-one')}
                        </div>
                    )}
                </>
            )}

            {/* GLOBAL SETTINGS PAGE */}
            {currentPage === 'settings' && (
                <GlobalSettings
                    modulesList={modulesList}
                    modulesState={modulesState}
                    setModulesState={setModulesState}
                />
            )}
        </div>
    );
};

export default AdminMain;
