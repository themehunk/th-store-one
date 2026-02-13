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

import FrequentlyBoughtSettings from '../../modules/frequentlyBoughtTogether/FrequentlyBoughtSettings';
import BundleProductSettings from '../../modules/BundleProductSetting/BundleProductSettings';
import BuytoListSettings from '../../modules/BuytoList/BuytoListSettings';
import QuickSocialSettings from '../../modules/QuickSocial/QuickSocialSettings';

const ModuleSettings = ({ currentModule, modulesState, onToggleModule, saving, onSettingsChange, onLivePreview,onRegisterSave }) => {
    const enabled = !!modulesState[currentModule.id];

    const renderModuleContent = () => {
        switch (currentModule.id) {
            case 'frequently-bought':
                return <FrequentlyBoughtSettings
                    onSettingsChange={onSettingsChange}
                    onLivePreview={onLivePreview}
                    onRegisterSave={onRegisterSave}
                />
            case 'bundle-product':
                return <BundleProductSettings
                    onSettingsChange={onSettingsChange}
                    onLivePreview={onLivePreview}
                    onRegisterSave={onRegisterSave}
                />
            case 'buy-to-list':
                return <BuytoListSettings
                    onSettingsChange={onSettingsChange}
                    onLivePreview={onLivePreview}
                    onRegisterSave={onRegisterSave}
                />
            case 'quick-social':
                return <QuickSocialSettings
                    onSettingsChange={onSettingsChange}
                    onLivePreview={onLivePreview}
                    onRegisterSave={onRegisterSave}
                />
            default:
                return <p className="s1-settings__placeholder">
                    {__('More settings will appear here…', 'store-one')}
                </p>;
        }
    };
    return (
        <Card className="s1-settings">
            <CardHeader className="s1-settings__header">
                <Flex justify="space-between" align="center">

                    <FlexBlock className="s1-settings__info">
                        <h2 className="s1-settings__title">{currentModule.label}</h2>
                        <p className="s1-settings__desc">{currentModule.description}</p>
                    </FlexBlock>

                    <FlexItem className="s1-settings__toggle">
                        <ToggleControl
                            label={enabled ? __('Enabled', 'store-one') : __('Disabled', 'store-one')}
                            checked={enabled}
                            disabled={saving}
                            onChange={(val) => onToggleModule(currentModule.id, val)}
                        />
                    </FlexItem>

                </Flex>
            </CardHeader>

            <CardBody className="s1-settings__body">
                {renderModuleContent()}
            </CardBody>
        </Card>
    );
};
export default ModuleSettings;