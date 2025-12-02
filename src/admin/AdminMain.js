import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import Header from '@storeone-header/Header';
import ModuleGrid from '@storeone-modulegrid/ModuleGrid';
import ModuleSettings from '@storeone-modulesettings/ModuleSettings';
import PreviewPane from '@storeone-modulepreviewpane/PreviewPane';
import GlobalSettings from '@storeone-global/GlobalSettings';

import { Notice, Spinner, Button } from '@wordpress/components';
import './admin.scss';
//import '@storeone-global/globalsetting.scss';

const modulesList = [
    {
        id: 'frequently-bought',
        label: __('Frequently Bought', 'store-one'),
        description: __('AI-powered combos.', 'store-one'),
        icon: '🤝',
    },
    // {
    //     id: 'pre-order',
    //     label: __('Pre Oreder', 'store-one'),
    //     description: __('Boost product discovery.', 'store-one'),
    //     icon: '🔍',
    // },
    // {
    //     id: 'cart',
    //     label: __('Smart Cart', 'store-one'),
    //     description: __('Elegant AJAX mini cart.', 'store-one'),
    //     icon: '🛒',
    // },
];

const tabs = [
    {
        name: 'all',
        title: __('All Modules', 'store-one'),
        modules: ['frequently-bought'],
    },
    {
        name: 'recommended',
        title: __('Recommended', 'store-one'),
        modules: ['frequently-bought'],
    },
    {
        name: 'trending',
        title: __('Trending', 'store-one'),
        modules: ['frequently-bought'],
    },
];

const AdminMain = () => {
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState('');
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [activeModule, setActiveModule] = useState(null);

    const [modulesState, setModulesState] = useState({
        'pre-order': true,
        cart: true,
        'frequently-bought': true,
    });

    const currentModule = activeModule
        ? modulesList.find((m) => m.id === activeModule)
        : null;

    // Attach nonce middleware.
    apiFetch.use(apiFetch.createNonceMiddleware(StoreOneAdmin.nonce));

    /**
     * Load modules state from REST.
     */
    useEffect(() => {
        setLoading(true);

        apiFetch({ path: `${StoreOneAdmin.restUrl}modules` })
            .then((res) => {
                if (res?.modules) {
                    const newState = { ...modulesState };

                    modulesList.forEach((mod) => {
                        newState[mod.id] =
                            res.modules[mod.id] !== undefined
                                ? !!res.modules[mod.id]
                                : true;
                    });

                    setModulesState(newState);
                }
            })
            .catch(() => {
                setError(__('Failed to load settings.', 'store-one'));
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Save whole modulesState to REST.
     */
    const saveModules = (nextState) => {
        setSaving(true);
        setError('');
        setSuccess('');

        apiFetch({
            path: `${StoreOneAdmin.restUrl}modules`,
            method: 'POST',
            data: { modules: nextState },
        })
            .then(() => {
                setSuccess(__('Saved successfully!', 'store-one'));
            })
            .catch(() => {
                setError(__('Failed to save settings.', 'store-one'));
            })
            .finally(() => setSaving(false));
    };

    /**
     * Toggle single module (auto-saves).
     */
    const handleToggleModule = (moduleId, enabled) => {
        setModulesState((prev) => {
            const next = {
                ...prev,
                [moduleId]: !!enabled,
            };
            saveModules(next);
            return next;
        });
    };

    /**
     * Master switch (Enable all / Disable all).
     */
    const handleToggleAllModules = (enableAll) => {
        setModulesState((prev) => {
            const next = {};
            modulesList.forEach((mod) => {
                next[mod.id] = !!enableAll;
            });
            saveModules(next);
            return next;
        });
    };

    const [hideToast, setHideToast] = useState(false);

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

    return (
        <div className="store-one-admin">

    {success && (
        <div className={`s1-toast s1-toast--success ${hideToast ? 'hide' : ''}`}>
            <span className="s1-toast__icon"></span>
            <span>{success}</span>
        </div>
    )}

    {error && (
        <div className={`s1-toast s1-toast--error ${hideToast ? 'hide' : ''}`}>
            <span className="s1-toast__icon"></span>
            <span>{error}</span>
        </div>
    )}

    <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setActiveModule={setActiveModule}
    />

    {currentPage === 'dashboard' && (
        <>
            {!loading && !activeModule && (
                <ModuleGrid
                    modulesList={modulesList}
                    modulesState={modulesState}
                    tabs={tabs}
                    setActiveModule={setActiveModule}
                />
            )}

            {!loading && activeModule && currentModule && (
                <div className="store-module-wrap">
                    <Button
                        isTertiary
                        className="back-btn"
                        onClick={() => setActiveModule(null)}
                    >
                        ← {__('Go Back', 'store-one')}
                    </Button>

                    {/* 🔥 FIXED CLASS HERE */}
                    <div className="s1-settings-layout">

                        <ModuleSettings
                            currentModule={currentModule}
                            modulesState={modulesState}
                            onToggleModule={handleToggleModule}
                            saving={saving}
                        />
                    <div className="s1-preview-pane">
                        <PreviewPane />
                    </div>
                       
                    </div>
                </div>
            )}

            {loading && (
                <div className="s1-loader">
                    <Spinner />
                    {__('Loading…', 'store-one')}
                </div>
            )}
        </>
    )}

    {currentPage === 'settings' && (
        <GlobalSettings
            modulesList={modulesList}
            modulesState={modulesState}
            onToggleAllModules={handleToggleAllModules}
        />
    )}

</div>

    );
};

export default AdminMain;