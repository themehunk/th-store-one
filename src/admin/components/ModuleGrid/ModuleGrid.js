import { TabPanel } from '@wordpress/components';
import ModuleCard from '../ModuleCard/ModuleCard';

const ModuleGrid = ({ modulesList, modulesState, tabs, setActiveModule }) => {
    return (
        <div className="s1-modules">
            
            {/* Tabs */}
            <TabPanel className="s1-tabs" tabs={tabs}>
                {(tab) => (
                    <div className="s1-modules__grid">
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
