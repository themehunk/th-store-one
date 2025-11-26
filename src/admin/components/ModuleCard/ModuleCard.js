import { Card, CardBody, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const ModuleCard = ({ mod, modulesState, setActiveModule }) => {
    const isActive = modulesState[mod.id];

    return (
        <Card className="module-card">
            <CardBody>

                <div className="mod-top">
                    <span className="mod-icon">{mod.icon}</span>

                    <span className={`badge ${isActive ? 'on' : 'off'}`}>
                        { isActive
                            ? __('Active', 'store-one')
                            : __('Inactive', 'store-one')
                        }
                    </span>
                </div>

                <h3>{ mod.label }</h3>

                <p>{ mod.description }</p>

                <Button
                    className="try-now"
                    isPrimary
                    onClick={() => setActiveModule(mod.id)}
                >
                    { __('Try now', 'store-one') } →
                </Button>

            </CardBody>
        </Card>
    );
};

export default ModuleCard;
