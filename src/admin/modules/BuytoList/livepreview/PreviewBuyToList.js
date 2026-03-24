import Style1 from "./Style1";
import Style2 from "./Style2";
import Style3 from "./Style3";
import Style4 from "./Style4";
import Style5 from "./Style5";
import './live-style.css';
import { __ } from '@wordpress/i18n';

const PreviewBuyToList = ({ settings = {} }) => {
    const style = settings?.buy_to_list_style;

    //Tab click → Design SelectControl change
    const changeStyle = (value) => {
        window.dispatchEvent(
            new CustomEvent('storeone:changeListStyle', {
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
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-diamond transition-colors duration-300 text-white" aria-hidden="true"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"></path></svg>
                    <span> {__("Crystal", "th-store-one")}</span>
                </button>

                <button
                    className={`s1-style-tab ${style === 'style_2' ? 'active' : ''}`}
                    onClick={() => changeStyle('style_2')}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon transition-colors duration-300 text-violet-500 opacity-70 group-hover:opacity-100" aria-hidden="true"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path></svg>
                    <span> {__("Midnight", "th-store-one")}</span>
                   
                </button>

                <button
                    className={`s1-style-tab ${style === 'style_3' ? 'active' : ''}`}
                    onClick={() => changeStyle('style_3')}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle transition-colors duration-300 text-gray-900 opacity-70 group-hover:opacity-100" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle></svg>
                    <span>{__("Zen", "th-store-one")}</span>
                </button>
                <button
                    className={`s1-style-tab ${style === 'style_4' ? 'active' : ''}`}
                    onClick={() => changeStyle('style_4')}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wind transition-colors duration-300 text-indigo-500 opacity-70 group-hover:opacity-100" aria-hidden="true"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path></svg>
                    <span>{__("Aurora", "th-store-one")}</span>
                </button>
                 <button
                    className={`s1-style-tab ${style === 'style_5' ? 'active' : ''}`}
                    onClick={() => changeStyle('style_5')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers transition-colors duration-300 text-fuchsia-500 opacity-70 group-hover:opacity-100" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path></svg>
                    <span>{__("Fusion", "th-store-one")}</span>
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