import Style1 from "./Style1";
import Style2 from "./Style2";
import Style3 from "./Style3";
import Style4 from "./Style4";
import './live-style.css';
import { __ } from '@wordpress/i18n';

const PreviewSaleCountdown = ({ settings = {} }) => {
    const style = settings?.sale_countdown_style || 'style1';

    const changeStyle = (value) => {
        window.dispatchEvent(
            new CustomEvent('storeone:changeSaleCountdownStyle', {
                detail: { style: value }
            })
        );
    };

    return (
        <div className="s1-countdown-preview">

            {/* ================= STYLE TABS ================= */}
            <div className="s1-style-tabs">

                <button
                    className={`s1-style-tab ${style === 'style1' ? 'active' : ''}`}
                    onClick={() => changeStyle('style1')}
                >
                    <span>{__("Default", "th-store-one")}</span>
                </button>

                <button
                    className={`s1-style-tab ${style === 'style2' ? 'active' : ''}`}
                    onClick={() => changeStyle('style2')}
                >
                    <span>{__("Minimal", "th-store-one")}</span>
                </button>

                <button
                    className={`s1-style-tab ${style === 'style3' ? 'active' : ''}`}
                    onClick={() => changeStyle('style3')}
                >
                    <span>{__("Boxed", "th-store-one")}</span>
                </button>

                <button
                    className={`s1-style-tab ${style === 'style4' ? 'active' : ''}`}
                    onClick={() => changeStyle('style4')}
                >
                    <span>{__("Urgency", "th-store-one")}</span>
                </button>

            </div>

            {/* ================= PREVIEW ================= */}
            <div className="s1-preview-area">

                {style === 'style1' && <Style1 settings={settings} />}
                {style === 'style2' && <Style2 settings={settings} />}
                {style === 'style3' && <Style3 settings={settings} />}
                {style === 'style4' && <Style4 settings={settings} />}

            </div>

        </div>
    );
};

export default PreviewSaleCountdown;