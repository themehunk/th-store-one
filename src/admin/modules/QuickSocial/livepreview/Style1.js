import React from 'react';
import { ICONS } from '@storeone-global/icons';

const Style1 = ({ settings = {} }) => {



    const rule = settings || {};

     const styleVars = {
        '--s1-icon-size': rule?.icon_size || '18px',
        '--s1-icon-bg': rule?.icon_bg_clr || '#ffffff',
        '--s1-icon-color': rule?.icon_clr || '#000000',
        '--s1-icon-hover-bg': rule?.icon_bg_hvr_clr || '#ffffff',
        '--s1-icon-hover-color': rule?.icon_hvr_clr || '#2563eb',
        '--s1-border-radius': rule?.border_radius || '50%',
    };

    return (
          <div className="s1-product-preview social_link" style={styleVars}>

            <div className="s1-main-product">

                {/* ================= QUICK SOCIAL SKELETON ================= */}

                <div
                    className={`s1-quick-social s1-quick-social--style1`}
                   
                >
                    <div className="s1-quick-social__inner">

                        {/* 3 Skeleton Icons */}
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="s1-quick-social__item s1-quick-social__skeleton"
                            >
                                <div className="s1-quick-social__icon">
                                    <div className="s1-icon-placeholder" />
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

                {/* ================= END QUICK SOCIAL ================= */}


                {/* LEFT IMAGE */}
                <div className="s1-main-thumb">
                    <div className="static-skeleton static-main-img"></div>
                </div>

                {/* RIGHT CONTENT */}
                <div className="s1-main-info">

                    <div className="static-skeleton static-title"></div>
                    <div className="static-skeleton static-price"></div>

                    {/* BUY TO LIST */}
                    <div className="s1-btl-preview">
                        <div className="static-skeleton static-btl-title"></div>
                        <ul className="s1-btl-list">
                            <li className="static-skeleton static-btl-title"></li>
                            <li className="static-skeleton static-btl-title"></li>
                        </ul>
                    </div>

                    <div className="s1-main-cart">
                        <div className="static-skeleton static-qty"></div>
                        <div className="static-skeleton static-btn"></div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Style1;