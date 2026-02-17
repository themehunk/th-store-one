import { useState } from '@wordpress/element';
import ModuleCard from '../ModuleCard/ModuleCard';
import { __ } from '@wordpress/i18n';
const ModuleGrid = ({ modulesList, modulesState, tabs, setActiveModule }) => {

    const [activeTab, setActiveTab] = useState(tabs[0].name);

    const currentTab = tabs.find(tab => tab.name === activeTab);

    return (
        <div className="s1-modules">

            <div className="s1-content-area">

            {/* Header + Tab List Wrapper */}
            <div className="s1-top-section">

                <div className="s1-modules__header">
                    <h2>{__('Store', 'store-one')} <span>{__('Intelligence', 'store-one')}</span></h2>
                    <p>{__('Activate high-conversion modules powered by machine learning and real-time behavioral analysis.', 'store-one')}</p>
                </div>
                <div className="s1-tabs">
                <div className="s1-tabs-list components-tab-panel__tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            className={`s1-tab-btn components-tab-panel__tabs-item ${activeTab === tab.name ? 'is-active' : ''}`}
                            onClick={() => setActiveTab(tab.name)}
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>
                </div>

            </div>

            {/* Tab Content */}
            <div className="s1-modules__grid">
                {modulesList
                    .filter((m) => currentTab.modules.includes(m.id))
                    .map((mod) => (
                        <ModuleCard
                            key={mod.id}
                            mod={mod}
                            modulesState={modulesState}
                            setActiveModule={setActiveModule}
                        />
                    ))}
            </div>

            </div>

        </div>
    );
};

export default ModuleGrid;