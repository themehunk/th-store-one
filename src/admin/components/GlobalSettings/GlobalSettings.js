import { Card, CardHeader, CardBody, ToggleControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const GlobalSettings = ({ modulesList, modulesState, setModulesState }) => {
    return (
        <div className="settings-global-wrap">

            {/* Plugin Status Section */}
            <Card className="settings-card">
                <CardHeader>
                    <h3>{ __('Plugin Status', 'store-one') }</h3>
                </CardHeader>

                <CardBody>
                    <ToggleControl
                        label={ __('Enable all modules (master switch)', 'store-one') }
                        checked={Object.values(modulesState).every(Boolean)}
                        onChange={(enableAll) => {
                            const updated = {};
                            modulesList.forEach((mod) => {
                                updated[mod.id] = enableAll;
                            });
                            setModulesState(updated);
                        }}
                    />

                    <p style={{ marginTop: '12px' }}>
                        { __('This switch quickly turns all modules on or off.', 'store-one') }
                    </p>
                </CardBody>
            </Card>

            {/* Support & Documentation */}
            <Card className="settings-card" style={{ marginTop: 16 }}>
                <CardHeader>
                    <h3>{ __('Support & Documentation', 'store-one') }</h3>
                </CardHeader>

                <CardBody>
                    <p>
                        { __('Need help? Visit documentation or contact support.', 'store-one') }
                    </p>

                    <Button
                        isSecondary
                        href="#"
                        style={{ marginRight: '8px' }}
                    >
                        { __('View Docs', 'store-one') }
                    </Button>

                    <Button isSecondary href="#">
                        { __('Contact Support', 'store-one') }
                    </Button>
                </CardBody>
            </Card>

        </div>
    );
};

export default GlobalSettings;
