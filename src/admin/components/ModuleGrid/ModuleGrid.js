import { TabPanel } from '@wordpress/components';
import ModuleCard from '../ModuleCard/ModuleCard';

const ModuleGrid = ({ modulesList, modulesState, tabs, setActiveModule }) => {
    return (
        <div className="modules-wrapper">
            <TabPanel className="module-tabs" tabs={tabs}>
                {(tab) => (
                    <div className="modules-grid">
                        {modulesList
                            .filter((m) => tab.modules.includes(m.id))
                            .map((mod) => (
                                <ModuleCard
                                    key={mod.id}
                                    mod={mod}
                                    modulesState={modulesState}
                                    setActiveModule={setActiveModule}
                                />
                            ))}
                    </div>
                )}
            </TabPanel>
        </div>
    );
};

export default ModuleGrid;
