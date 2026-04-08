import {
    Card,
    CardHeader,
    CardBody,
    Flex,
    FlexBlock,
    FlexItem,
    ToggleControl,
    Button 
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import FrequentlyBoughtSettings from '../../modules/frequentlyBoughtTogether/FrequentlyBoughtSettings';
import BundleProductSettings from '../../modules/BundleProductSetting/BundleProductSettings';
import BuytoListSettings from '../../modules/BuytoList/BuytoListSettings';
import QuickSocialSettings from '../../modules/QuickSocial/QuickSocialSettings';
import ProductBrandSettings from '../../modules/ProductBrand/ProductBrandSettings';
import TrustBadgesSettings from '../../modules/TrustBadges/TrustBadgesSettings';
import ProductVideoSettings from '../../modules/ProductVideo/ProductVideoSettings';

const ModuleSettings = ({ currentModule, modulesState, onToggleModule, saving, onSettingsChange, onLivePreview,onRegisterSave ,licenseActive}) => {
    const enabled = !!modulesState[currentModule.id];

    const isPremium = currentModule.premium ?? false;
    const isLocked = isPremium && !licenseActive;

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
            case 'product-brand':
                return <ProductBrandSettings
                    onSettingsChange={onSettingsChange}
                    onLivePreview={onLivePreview}
                    onRegisterSave={onRegisterSave}
                />
            case 'trust-badges':
                return <TrustBadgesSettings
                    onSettingsChange={onSettingsChange}
                    onLivePreview={onLivePreview}
                    onRegisterSave={onRegisterSave}
                />
            case 'product-video':
                return <ProductVideoSettings
                    onSettingsChange={onSettingsChange}
                    onLivePreview={onLivePreview}
                    onRegisterSave={onRegisterSave}
                />
            default:
                return <p className="s1-settings__placeholder">
                    {__('More settings will appear here…', 'th-store-one')}
                </p>;
        }
    };
    return (
        <Card className="s1-settings">
            <CardHeader className="s1-settings__header">
                <Flex justify="space-between" align="center">

                    <FlexBlock className="s1-settings__info">
                        <h2 className="s1-settings__title">{currentModule.label}</h2>{isLocked && (
            <span className="s1-license-required-badge">
                {__("Buy Pro", "th-store-one")}
            </span>
        )}
                        <p className="s1-settings__desc">{currentModule.description}</p>
                        {currentModule.id === 'bundle-product' && (
                        
                         <Button
                         className="s1-settings__redirect-btn"
                                        onClick={() =>
                                            window.open(
                                            `${th_StoreOneAdmin.adminUrl}post-new.php?post_type=product`,
                                            "_blank"
                                            )
                                        }
                                        >
                                        {__("Create Bundle", "th-store-one")}
                        </Button>
                        
                        )}
                        {currentModule.id === 'product-video' && (
                        
                         <Button
                         className="s1-settings__redirect-btn"
                                        onClick={() =>
                                            window.open(
                                            `${th_StoreOneAdmin.adminUrl}edit.php?post_type=product`,
                                            "_blank"
                                            )
                                        }
                                        >
                                        {__("Add Video", "th-store-one")}
                        </Button>
                        
                        )}
                         
                    </FlexBlock>

                    <FlexItem className="s1-settings__toggle">
                      
                        <ToggleControl
                            label={enabled ? __('Enabled', 'th-store-one') : __('Disabled', 'th-store-one')}
                            checked={enabled}
                            disabled={saving || isLocked}
                            onChange={(val) => {
                                onToggleModule(currentModule.id, val);
                            }}
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