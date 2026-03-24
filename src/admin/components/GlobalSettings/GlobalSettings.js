import { Card, CardHeader, CardBody, ToggleControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const GlobalSettings = ({ modulesList, modulesState, onToggleAllModules,licenseActive }) => {

    const allEnabled = modulesList
        .filter((mod) => !mod.premium || licenseActive)
        .every((mod) => !!modulesState[mod.id]);

    return (
       <div className="s1-content-area">
        <div className="settings-global-wrap">
            <Card className="settings-card">
                <CardHeader>
                    <h3>{__('Plugin Status', 'th-store-one')}</h3>
                </CardHeader>

                <CardBody>
                    <ToggleControl
                        label={__('Enable all modules (master switch)', 'th-store-one')}
                        checked={allEnabled}
                        onChange={(enableAll) => onToggleAllModules(enableAll)}
                    />

                    <p style={{ marginTop: '12px' }}>
                        {__('This switch quickly turns all modules on or off.', 'th-store-one')}
                    </p>
                </CardBody>
            </Card>

            <Card className="settings-card" style={{ marginTop: 16 }}>
                <CardHeader>
                    <h3>{__('Support & Documentation', 'store-one')}</h3>
                </CardHeader>

                <CardBody>
                    <p>{__('Need help? Visit documentation or contact support.', 'th-store-one')}</p>

                    <Button isSecondary href="https://themehunk.com/docs/store-one/" style={{ marginRight: '8px' }}>
                        {__('View Docs', 'th-store-one')}
                    </Button>

                    <Button isSecondary target="_blank" href="https://themehunk.com/contact-us/">
                        {__('Contact Support', 'th-store-one')}
                    </Button>
                </CardBody>
            </Card>
        </div>
        </div>
    );
};

export default GlobalSettings;
