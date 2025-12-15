import Style1 from "./Style1";
import Style2 from "./Style2";
import Style3 from "./Style3";
import './live-style.css';

const PreviewFBT = ({ settings = {} }) => {
    const style = settings?.display_style;

    // 🔥 Tab click → Design SelectControl change
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
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-grid" aria-hidden="true"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>
                    <span> Grid</span>
                </button>

                <button
                    className={`s1-style-tab ${style === 'style_2' ? 'active' : ''}`}
                    onClick={() => changeStyle('style_2')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-plus" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>
                    <span> Style 2</span>
                   
                </button>

                <button
                    className={`s1-style-tab ${style === 'style_3' ? 'active' : ''}`}
                    onClick={() => changeStyle('style_3')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list" aria-hidden="true"><path d="M3 5h.01"></path><path d="M3 12h.01"></path><path d="M3 19h.01"></path><path d="M8 5h13"></path><path d="M8 12h13"></path><path d="M8 19h13"></path></svg>
                    <span> Style 3</span>
                </button>
            </div>

            {/* ================= PREVIEW ================= */}
            {style === 'style_1' && <Style1 settings={settings} />}
            {style === 'style_2' && <Style2 settings={settings} />}
            {style === 'style_3' && <Style3 settings={settings} />}

        </div>
    );
};

export default PreviewFBT;