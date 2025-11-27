import {
    Card,
    CardHeader,
    CardBody,
    Flex,
    FlexBlock,
    FlexItem,
    ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// dynamic module UIs
import PreOrdersSettings from '../../modules/PreOrdersSettings';
import SmartCartSettings from '../../modules/SmartCartSettings';
import FrequentlyBoughtSettings from '../../modules/frequentlyBoughtTogether/FrequentlyBoughtSettings';
const ModuleSettings = ({ currentModule, modulesState, onToggleModule, saving }) => {
    const enabled = !!modulesState[currentModule.id];

    /**
     * Decide which module settings panel to show
     */
    const renderModuleContent = () => {
        switch (currentModule.id) {

            // case 'pre-order':  // ✔ correct module ID
            //     return <PreOrdersSettings />;

            // case 'cart':  // ✔ new smart cart UI
            //     return <SmartCartSettings />;

            case 'frequently-bought':  // 👈 NEW MODULE
                return <FrequentlyBoughtSettings />;

            default:
                return <p>{__('More settings will appear here…', 'store-one')}</p>;
        }
    };

    return (
        <Card className="settings-card">
            <CardHeader>
                <Flex justify="space-between" align="center">
                    <FlexBlock>
                        <h2 className="settings-title">{currentModule.label}</h2>
                        <p className="settings-desc">{currentModule.description}</p>
                    </FlexBlock>

                    <FlexItem style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                        <ToggleControl
                            label={
                                enabled
                                    ? __('Enabled', 'store-one')
                                    : __('Disabled', 'store-one')
                            }
                            
                            checked={enabled}
                            disabled={saving}
                            onChange={(val) => onToggleModule(currentModule.id, val)}
                        />
                        {/* Tutorial Icon */}
            {/* <a
                href="https://your-tutorial-link.com"
                target="_blank"
                rel="noopener noreferrer"
                className="store-one-tutorial-icon"
                title={__('View Tutorial', 'store-one')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: '#f3f3f3',
                    cursor: 'pointer',
                    textDecoration: 'none',
                }}
            >
                <span
                    className="dashicons dashicons-admin-links"
                    style={{
                        fontSize: '18px',
                        color: '#555',
                        marginTop: '2px',
                    }}
                ></span>
            </a> */}
                    </FlexItem>
                </Flex>
            </CardHeader>

            <CardBody>{renderModuleContent()}</CardBody>
        </Card>
    );
};
export default ModuleSettings;
