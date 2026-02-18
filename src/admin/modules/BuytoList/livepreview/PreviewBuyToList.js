import Style1 from "./Style1";
import Style2 from "./Style2";
import Style3 from "./Style3";
import Style4 from "./Style4";
import Style5 from "./Style5";
import './live-style.css';
import { __ } from '@wordpress/i18n';

const PreviewBuyToList = ({ settings = {} }) => {
    const style = settings?.display_style;

    //Tab click → Design SelectControl change
    const changeStyle = (value) => {
        window.dispatchEvent(
            new CustomEvent('storeone:changeDisplayStyle', {
                detail: { style: value }
            })
        );
    };

    if (!style) {
        return (
            <div className="s1-fbt-preview-loader">
                <div className="s1-spinner"></div>
            </div>
        );
    }

    return (
        <div className="s1-fbt-preview-wrap">

            {/* ================= STYLE TABS ================= */}
            <div className="s1-style-tabs">
                <button
                    className={`s1-style-tab ${style === 'style_1' ? 'active' : ''}`}
                    onClick={() => changeStyle('style_1')}
                >
                   
                    <span> {__("style1", "store-one")}</span>
                </button>

                <button
                    className={`s1-style-tab ${style === 'style_2' ? 'active' : ''}`}
                    onClick={() => changeStyle('style_2')}
                >
                   
                    <span> {__("style2", "store-one")}</span>
                   
                </button>

                <button
                    className={`s1-style-tab ${style === 'style_3' ? 'active' : ''}`}
                    onClick={() => changeStyle('style_3')}
                >
                   
                    <span>{__("style3", "store-one")}</span>
                </button>
                <button
                    className={`s1-style-tab ${style === 'style_4' ? 'active' : ''}`}
                    onClick={() => changeStyle('style_4')}
                >
                   
                    <span>{__("style4", "store-one")}</span>
                </button>
                 <button
                    className={`s1-style-tab ${style === 'style_5' ? 'active' : ''}`}
                    onClick={() => changeStyle('style_5')}
                >
                    <span>{__("style5", "store-one")}</span>
                </button>
            </div>

            {/* ================= PREVIEW ================= */}
            {style === 'style_1' && <Style1 settings={settings} />}
            {style === 'style_2' && <Style2 settings={settings} />}
            {style === 'style_3' && <Style3 settings={settings} />}
            {style === 'style_4' && <Style4 settings={settings} />}
            {style === 'style_5' && <Style5 settings={settings} />}

        </div>
    );
};

export default PreviewBuyToList;