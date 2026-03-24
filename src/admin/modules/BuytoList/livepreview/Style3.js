import React from 'react';
import { __ } from '@wordpress/i18n';
import { ICONS } from '@th-storeone-global/icons';



const Style3 = ({ settings = {} }) => {

    const iconMap = {
        check: ICONS.CheckSVG,
        star: ICONS.StarSVG,
        heart: ICONS.HeartSVG,
        bolt: ICONS.BoltSVG,
        rocket: ICONS.RocketSVG,
    };

    const SelectedIcon =
        iconMap[settings.selected_icon] || ICONS.CheckSVG;

    const listItems = [
        "Premium Quality Material",
        "Fast & Secure Shipping",
        "30 Days Easy Returns",
        "Trusted by 10,000+ Customers"
    ];

    /* ================= ICON RENDER FUNCTION ================= */
            const renderIcon = () => {
        
                if (!settings.icon_enabled) return null;
        
                // 1Preset SVG Icon
                if ((settings.icontype || 'icon') === 'icon') {
                    const IconComponent =
                        iconMap[settings.selected_icon] || ICONS.CheckSVG;
        
                    return IconComponent;
                }
        
                // 2️Custom SVG Code
                if (settings.icontype === 'custom_svg' && settings.custom_svg) {
                    return (
                        <span
                            className="s1-custom-svg"
                            dangerouslySetInnerHTML={{
                                __html: settings.custom_svg
                            }}
                        />
                    );
                }
        
                // 3️Image Upload
                if (settings.icontype === 'image' && settings.image_url) {
                    return (
                        <img
                            src={settings.image_url}
                            alt=""
                            className="s1-icon-image"
                            style={{
                                width: "16px",
                                height: "16px",
                                objectFit: "contain"
                            }}
                        />
                    );
                }
        
                return null;
            };
        

    return (
        <div className="s1-product-preview btl-style-3">

            <div className="s1-main-product">

                <div className="s1-main-thumb">
                    <div className="static-skeleton static-main-img"></div>
                </div>

                <div className="s1-main-info">

                    <div className="static-skeleton static-title"></div>
                    <div className="static-skeleton static-price"></div>

                    {/* ================= BUY TO LIST ================= */}
                    <div
                        className="s1-btl-preview s1-btl-preview-3"
                        style={{
                            background: settings.btl_bg_clr || "#fff",
                            borderColor: settings.btl_border_clr || "#e5e7eb",
                            borderRadius: settings.btl_border_radius || "8px",
                        }}
                    >

                        <div
                            className="s1-btl-title"
                            style={{
                                color: settings.btl_title_clr || "#111",
                            }}
                        >
                            {settings.list_title || "Featured List"}
                        </div>

                        <ul className="s1-btl-list">
                            {listItems.map((text, index) => (
                                <li key={index} className="s1-btl-item">
                                       {settings.icon_enabled && (
                                        <span
                                            className="s1-btl-icon"
                                            style={{
                                                background:
                                                    settings.icontype === 'image'
                                                        ? "transparent"
                                                        : settings.btl_icon_bg_clr || "#fff",
                                                color: settings.btl_icon_clr || "#2563eb"
                                            }}
                                        >
                                            {renderIcon()}
                                        </span>
                                    )}

                                    <span
                                        className="s1-btl-text"
                                        style={{
                                            color: settings.btl_list_clr || "#111"
                                        }}
                                    >
                                        {text}
                                    </span>

                                </li>
                            ))}
                        </ul>

                    </div>
                    {/* ================= END BUY TO LIST ================= */}

                    <div className="s1-main-cart">
                        <div className="static-skeleton static-qty"></div>
                        <div className="static-skeleton static-btn"></div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Style3;
