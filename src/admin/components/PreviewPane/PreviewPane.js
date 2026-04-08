import { Card, CardHeader, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PreviewFBT from '../../modules/frequentlyBoughtTogether/livepreview/PreviewFBT';
import PreviewBndl from '../../modules/BundleProductSetting/livepreview/PreviewBndl';
import PreviewBuyToList from '../../modules/BuytoList/livepreview/PreviewBuyToList';
import PreviewQuickSocial from '../../modules/QuickSocial/livepreview/PreviewQuickSocial';
import PreviewProductBrand from '../../modules/ProductBrand/livepreview/PreviewProductBrand';
import TrustBadges from '../../modules/TrustBadges/livepreview/PreviewTrustBadges';
import ProductVideo from '../../modules/ProductVideo/livepreview/PreviewProductVideo';
import { useSelect } from '@wordpress/data';

import { STORE_NAME } from '@th-storeone/store/productVideoStore';
const PreviewPane = ({ currentModule, settings }) => {
    
    const moduleSettings = settings || {};
    const activeRule = Array.isArray(moduleSettings.rules) && moduleSettings.rules.length > 0
        ? moduleSettings.rules[0]
        : moduleSettings;

    const activeTab = useSelect(
  (select) => select(STORE_NAME)?.getActiveTab(),
  []
);

    return (
        <Card className="preview-card">
            <CardHeader>
                <h3 className="preview-title">{ __('Preview', 'th-store-one') }</h3>
            </CardHeader>

            <CardBody>
                <div className="preview-box">

                    <div className="preview-browser-bar">
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                    </div>

                    <div className="preview-content">
                        <div className="preview-pane-box">

                            {currentModule?.id === "frequently-bought" && activeRule && (
                                <PreviewFBT
                                     key={currentModule.id}
                                    settings={activeRule}
                                />
                            )}
                            {currentModule?.id === "bundle-product" && activeRule && (
                                <PreviewBndl
                                    key={currentModule.id}
                                    settings={settings}
                                />
                            )}
                            
                            {currentModule?.id === "buy-to-list" && activeRule && (
                                <PreviewBuyToList
                                    key={currentModule.id}
                                    settings={activeRule}
                                />
                            )}
                            {currentModule?.id === "quick-social" && activeRule && (
                                 <PreviewQuickSocial
                                     key={currentModule.id}
                                    settings={activeRule}
                                />
                            )}
                             {currentModule?.id === "product-brand" && activeRule && (
                                <PreviewProductBrand
                                     key={currentModule.id}
                                    settings={activeRule}
                                />
                            )}
                            {currentModule?.id === "trust-badges" && activeRule && (
                                <TrustBadges
                                     key={currentModule.id}
                                    settings={activeRule}
                                />
                            )}
                            {currentModule?.id === "product-video" && activeRule && (
                                <ProductVideo
                                    key={currentModule.id}
                                    settings={settings}
                                    activeTab={activeTab}
                                />
            
                            )}
                        </div>
                    </div>

                </div>
            </CardBody>
        </Card>
    );
};

export default PreviewPane;
