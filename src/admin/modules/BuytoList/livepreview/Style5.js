import React from 'react';
import { __ } from '@wordpress/i18n';
import { getTextStyle, getRadius } from '@storeone/utils/styleHelpers';
import { ICONS } from '@storeone-global/icons';

const dummy = [
    { id: 1, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/prd1.png", name: "Dewleaf Hydration Serum", price: "$119.00" },
    { id: 2, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/prd2.png", name: "Rosemist Daily Cream", price: "$40.00" },
];

const Style5 = ({ settings = {} }) => {

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

    return (
        <div className="s1-product-preview btl-style-5">

            <div className="s1-main-product">

                <div className="s1-main-thumb">
                    <div className="static-skeleton static-main-img"></div>
                </div>

                <div className="s1-main-info">

                    <div className="static-skeleton static-title"></div>
                    <div className="static-skeleton static-price"></div>

                    {/* ================= BUY TO LIST ================= */}
                    <div
                        className="s1-btl-preview"
                        style={{
                            background: settings.btl_bg_clr || "#fff"
                        }}
                    >

                        <div
                            className="s1-btl-title"
                            style={{
                                color: settings.btl_title_clr || "#111"
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
                                                background: settings.btl_icon_bg_clr || "#fff",
                                                color: settings.btl_icon_clr || "#2563eb"
                                            }}
                                        >
                                            {SelectedIcon}
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

export default Style5;
