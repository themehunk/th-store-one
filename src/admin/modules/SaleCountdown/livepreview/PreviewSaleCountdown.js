import Style1 from "./Style1";
import Style2 from "./Style2";
import Style3 from "./Style3";
import Style4 from "./Style4";

import ArchiveStyle1 from "./ArchiveStyle1";
import ArchiveStyle2 from "./ArchiveStyle2";
import ArchiveStyle3 from "./ArchiveStyle3";

import './live-style.css';
import { __ } from '@wordpress/i18n';

const PreviewSaleCountdown = ({ settings = {} }) => {

    /* ================= SETTINGS ================= */
    const style = settings?.sale_countdown_style || 'style1';
    const archiveStyle = settings?.sale_countdown_archive_style || 'acstyle1';
    const previewType = settings?.sale_countdown_preview_type || 'single';

    /* ================= CHANGE MAIN TAB ================= */
    const changePreviewType = (type) => {
        window.dispatchEvent(
            new CustomEvent('storeone:changeSaleCountdownPreviewType', {
                detail: { type }
            })
        );
    };

    /* ================= CHANGE STYLE ================= */
    const changeStyle = (value) => {
        window.dispatchEvent(
            new CustomEvent('storeone:updateSaleCountdownStyle', {
                detail: {
                    type: previewType,
                    value
                }
            })
        );
    };

    return (
        <div className="s1-countdown-preview">

            {/* ================= MAIN TABS ================= */}
            <div className="s1-main-tabs">

                <button
                    className={`s1-main-tab ${previewType === 'single' ? 'active' : ''}`}
                    onClick={() => changePreviewType('single')}
                >
                    {__("Single Product", "th-store-one")}
                </button>

                <button
                    className={`s1-main-tab ${previewType === 'archive' ? 'active' : ''}`}
                    onClick={() => changePreviewType('archive')}
                >
                    {__("Archive / Loop", "th-store-one")}
                </button>

            </div>

            {/* ================= STYLE TABS ================= */}
            <div className="s1-style-tabs">

                {/* ===== SINGLE PRODUCT ===== */}
                {previewType === 'single' && (
                    <>
                        <button
                            className={`s1-style-tab ${style === 'style1' ? 'active' : ''}`}
                            onClick={() => changeStyle('style1')}
                        >
                            {__("Default", "th-store-one")}
                        </button>

                        <button
                            className={`s1-style-tab ${style === 'style2' ? 'active' : ''}`}
                            onClick={() => changeStyle('style2')}
                        >
                            {__("Minimal", "th-store-one")}
                        </button>

                        <button
                            className={`s1-style-tab ${style === 'style3' ? 'active' : ''}`}
                            onClick={() => changeStyle('style3')}
                        >
                            {__("Boxed", "th-store-one")}
                        </button>

                        <button
                            className={`s1-style-tab ${style === 'style4' ? 'active' : ''}`}
                            onClick={() => changeStyle('style4')}
                        >
                            {__("Urgency", "th-store-one")}
                        </button>
                    </>
                )}

                {/* ===== ARCHIVE ===== */}
                {previewType === 'archive' && (
                    <>
                        <button
                            className={`s1-style-tab ${archiveStyle === 'acstyle1' ? 'active' : ''}`}
                            onClick={() => changeStyle('acstyle1')}
                        >
                            {__("Simple", "th-store-one")}
                        </button>
                        <button
                            className={`s1-style-tab ${archiveStyle === 'acstyle2' ? 'active' : ''}`}
                            onClick={() => changeStyle('acstyle2')}
                        >
                            {__("Circle", "th-store-one")}
                        </button>

                        <button
                            className={`s1-style-tab ${archiveStyle === 'acstyle3' ? 'active' : ''}`}
                            onClick={() => changeStyle('acstyle3')}
                        >
                            {__("Small", "th-store-one")}
                        </button>

                        
                    </>
                )}

            </div>

            {/* ================= PREVIEW AREA ================= */}
            <div className="s1-preview-area">

                {/* ===== SINGLE ===== */}
                {previewType === 'single' && (
                    <>
                        {style === 'style1' && <Style1 settings={settings} />}
                        {style === 'style2' && <Style2 settings={settings} />}
                        {style === 'style3' && <Style3 settings={settings} />}
                        {style === 'style4' && <Style4 settings={settings} />}
                    </>
                )}

                {/* ===== ARCHIVE ===== */}
                {previewType === 'archive' && (
                    <>
                        {archiveStyle === 'acstyle1' && <ArchiveStyle1 settings={settings} />}
                        {archiveStyle === 'acstyle2' && <ArchiveStyle2 settings={settings} />}
                        {archiveStyle === 'acstyle3' && <ArchiveStyle3 settings={settings} />}
                    </>
                )}

            </div>

        </div>
    );
};

export default PreviewSaleCountdown;