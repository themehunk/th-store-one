import { Card, CardHeader, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PreviewFBT from '../../modules/frequentlyBoughtTogether/livepreview/PreviewFBT';

const PreviewPane = ({ currentModule, settings }) => {

    const moduleSettings = settings || {};

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

                            {currentModule?.id === "frequently-bought" && (
                                <PreviewFBT settings={moduleSettings} />
                            )}

                            {/* You can add more modules here */}
                        </div>
                    </div>

                </div>
            </CardBody>
        </Card>
    );
};

export default PreviewPane;
