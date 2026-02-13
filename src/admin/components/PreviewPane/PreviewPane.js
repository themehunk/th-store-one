import { Card, CardHeader, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PreviewFBT from '../../modules/frequentlyBoughtTogether/livepreview/PreviewFBT';
import PreviewBndl from '../../modules/BundleProductSetting/livepreview/PreviewBndl';
import PreviewBuyToList from '../../modules/BuytoList/livepreview/PreviewBuyToList';
import PreviewQuickSocial from '../../modules/QuickSocial/livepreview/PreviewQuickSocial';
const PreviewPane = ({ currentModule, settings }) => {


    // `settings` can be either a single rule object (live preview)
    // or a full module settings object with `rules` array (fallback).
    const moduleSettings = settings || {};
    const activeRule = Array.isArray(moduleSettings.rules) && moduleSettings.rules.length > 0
        ? moduleSettings.rules[0]
        : moduleSettings;

    return (
        <Card className="preview-card">
            <CardHeader>
                <h3 className="preview-title">{ __('Preview', 'store-one') }</h3>
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
                                    key={(activeRule.flexible_id || 'rule') + (activeRule.display_style || '')}
                                    settings={activeRule}
                                />
                            )}

                            {currentModule?.id === "bundle-product" && activeRule && (
                                <PreviewBndl
                                    key={(activeRule.flexible_id || 'rule') + (activeRule.display_style || '')}
                                    settings={settings}
                                />
                            )}
                            {currentModule?.id === "buy-to-list" && activeRule && (
                                <PreviewBuyToList
                                    key={(activeRule.flexible_id || 'rule') + (activeRule.display_style || '')}
                                    settings={activeRule}
                                />
                            )}
                            {currentModule?.id === "quick-social" && activeRule && (
                                <PreviewQuickSocial
                                    key={(activeRule.flexible_id || 'rule') + (activeRule.display_style || '')}
                                    settings={activeRule}
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
