import { Card, CardBody, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const ModuleCard = ({ mod, modulesState, setActiveModule }) => {
    const isActive = modulesState[mod.id];

    return (
        <Card className="s1-module-card">
            <CardBody className="s1-module-card__body">

                <div className="s1-module-card__top">
                    <span className="s1-module-card__icon">{mod.icon}</span>

                    <span className={`s1-module-card__badge ${isActive ? 'is-on' : 'is-off'}`}>
                        { isActive
                            ? __('Active', 'store-one')
                            : __('Inactive', 'store-one')
                        }
                    </span>
                </div>

                <h3 className="s1-module-card__title">{ mod.label }</h3>

                <p className="s1-module-card__desc">{ mod.description }</p>

                <Button
                    className="s1-module-card__btn"
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
