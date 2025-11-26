import { Card, CardHeader, CardBody, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const PreviewPane = () => {
    return (
        <Card className="preview-card">
            <CardHeader>
                <h3 className="preview-title">
                    { __('Preview', 'store-one') }
                </h3>
            </CardHeader>
            <CardBody>
                <div className="preview-box">
                    <div className="preview-browser-bar">
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                    </div>
                    <div className="preview-content">
                        <div className="preview-thumb" />
                        <div className="preview-line lg" />
                        <div className="preview-line" />
                        <div className="preview-line" />

                        <div className="preview-highlight-text">
                            { __('Ships on November 26, 2025.', 'store-one') }
                        </div>
                        <Button
                            isSecondary
                            className="preview-btn"
                        >
                            { __('Pre Order Now!', 'store-one') }
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};
export default PreviewPane;