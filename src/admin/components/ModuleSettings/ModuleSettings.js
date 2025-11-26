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

const ModuleSettings = ({ currentModule, modulesState, onToggleModule, saving }) => {
    const enabled = !!modulesState[currentModule.id];

    /**
     * Decide which module settings panel to show
     */
    const renderModuleContent = () => {
        switch (currentModule.id) {

            case 'pre-order':  // ✔ correct module ID
                return <PreOrdersSettings />;

            case 'cart':  // ✔ new smart cart UI
                return <SmartCartSettings />;

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

                    <FlexItem>
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
                    </FlexItem>
                </Flex>
            </CardHeader>

            <CardBody>{renderModuleContent()}</CardBody>
        </Card>
    );
};

export default ModuleSettings;
