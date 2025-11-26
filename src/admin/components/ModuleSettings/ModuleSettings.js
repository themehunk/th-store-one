import { Card, CardBody, CardHeader, Flex, FlexBlock, FlexItem, Button, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const ModuleSettings = ({
    currentModule,
    modulesState,
    setModulesState,
    saving,
    saveSettings
}) => {
    const isEnabled = modulesState[currentModule.id];

    return (
        <Card className="settings-card">
            <CardHeader>
                <Flex justify="space-between" align="center">
                    <FlexBlock>
                        <h2 className="settings-title">
                            { currentModule.label }
                        </h2>

                        <p className="settings-desc">
                            { currentModule.description }
                        </p>
                    </FlexBlock>

                    <FlexItem>
                        <ToggleControl
                            label={
                                isEnabled
                                    ? __('Enabled', 'store-one')
                                    : __('Disabled', 'store-one')
                            }
                            checked={isEnabled}
                            onChange={(value) =>
                                setModulesState((prev) => ({
                                    ...prev,
                                    [currentModule.id]: value,
                                }))
                            }
                        />
                    </FlexItem>
                </Flex>
            </CardHeader>

            <CardBody>

                <p>{ __('More settings will appear here…', 'store-one') }</p>

                <Button
                    isPrimary
                    disabled={saving}
                    onClick={saveSettings}
                    className="save-btn"
                >
                    { saving
                        ? __('Saving…', 'store-one')
                        : __('Save Settings', 'store-one')
                    }
                </Button>

            </CardBody>
        </Card>
    );
};

export default ModuleSettings;
