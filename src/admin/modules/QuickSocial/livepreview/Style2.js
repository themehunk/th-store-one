import React from 'react';
import { ICONS } from '@storeone-global/icons';

const Style2 = ({ settings = {} }) => {

    const list = settings?.buy_list || [];

    return (
          <div className="s1-product-preview social_link">

            <div className="s1-main-product">

                {/* ================= QUICK SOCIAL SKELETON ================= */}

                <div
                    className={`s1-quick-social s1-quick-social--style2`}
                   
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

export default Style2;