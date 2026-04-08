import { Card, CardBody, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const ModuleCard = ({ mod, modulesState, setActiveModule, licenseActive  }) => {
    const isActive = modulesState[mod.id];
    const isPremium = mod.premium ?? false;
    const isLocked = isPremium && !licenseActive;

    return (
        <Card className="s1-module-card">
           <CardBody
            className={[
                    's1-module-card__body',
                    isPremium ? 'is-premium' : 'is-free',
                    isActive ? 'is-active' : '',
                    isLocked ? 'is-locked' : ''
                ].join(' ')}
            >

                <div className="s1-module-card__top"  >
                    <span className="s1-module-card__icon">{mod.icon}</span>
                    <div className="s1-module-card__right">
                    <span className={`s1-module-card__badge ${isActive ? 'is-on' : 'is-off'}`}>
                        { isActive
                            ? __('Active', 'th-store-one')
                            : __('Inactive', 'th-store-one')
                        }
                    </span>
                    <span className={`s1-module-card__pro ${isPremium ? 'is-premium' : 'is-free'}`}>
                        {isPremium
                            ? __('PRO', 'th-store-one')
                            : __('Free', 'th-store-one')
                        }
                    </span>
                    </div>
                </div>

                <h3 className="s1-module-card__title">{ mod.label }</h3>

                <p className="s1-module-card__desc">{ mod.description }</p>

                <Button
                    className="s1-module-card__btn"
                    isPrimary
                    onClick={() => setActiveModule(mod.id)}
                >
                    {isLocked
                        ? __('Upgrade License', 'th-store-one')
                        : __('Configure', 'th-store-one')
                    } →
                </Button>

            </CardBody>
        </Card>
    );
};

export default ModuleCard;
