import Style1 from "./Style1";
import Style2 from "./Style2";
import Style3 from "./Style3";

import './live-style.css';
import { __ } from '@wordpress/i18n';

const PreviewQuickSocial = ({ settings = {} }) => {

    const style = settings?.social_style || 'style1';

    const changeStyle = (value) => {
        window.dispatchEvent(
            new CustomEvent('storeone:changeSocialStyle', {
                detail: { style: value }
            })
        );
    };

    return (
        <div className="s1-fbt-preview-wrap">

            <div className="s1-style-tabs">

                <button
                    className={`s1-style-tab ${style === 'style1' ? 'active' : ''}`}
                    onClick={() => changeStyle('style1')}
                >
                    <span>{__("Left", "th-store-one")}</span>
                </button>

                <button
                    className={`s1-style-tab ${style === 'style2' ? 'active' : ''}`}
                    onClick={() => changeStyle('style2')}
                >
                    <span>{__("Right", "th-store-one")}</span>
                </button>

                <button
                    className={`s1-style-tab ${style === 'style3' ? 'active' : ''}`}
                    onClick={() => changeStyle('style3')}
                >
                    <span>{__("Bottom", "th-store-one")}</span>
                </button>

            </div>

            {style === 'style1' && <Style1 settings={settings} />}
            {style === 'style2' && <Style2 settings={settings} />}
            {style === 'style3' && <Style3 settings={settings} />}

        </div>
    );
};

export default PreviewQuickSocial;