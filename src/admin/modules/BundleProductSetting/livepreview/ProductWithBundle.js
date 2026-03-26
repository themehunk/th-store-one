import React from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './live-style.css';

const mainProduct = {
    img: th_StoreOneAdmin.homeUrl + "wp-content/plugins/th-store-one/assets/images/prd1.png",
    name: __("Sample Bundle Product", "th-store-one"),
    price: "$30.00",
};

const bundleItems = [
    {
        id: 1,
        img: th_StoreOneAdmin.homeUrl + "wp-content/plugins/th-store-one/assets/images/prd1.png",
        name: __("Hydration Serum", "th-store-one"),
        price: "$12.00",
        old_price: "$15.00",
        desc: __("A lightweight hydration serum.", "th-store-one"),
    },
    {
        id: 2,
        img: th_StoreOneAdmin.homeUrl + "wp-content/plugins/th-store-one/assets/images/prd2.png",
        name: __("Daily Cream", "th-store-one"),
        price: "$18.00",
        old_price: "$22.00",
        desc: __("A nourishing daily cream designed to soften skin.", "th-store-one"),
    },
];
const BundleSection = ({ productSettings }) => {
    const productUrl = '#';
    return (
    <div className="storeone-bundle-frontend">
        <h3 className="s1-bundle-title">
            {__("Bundle", "th-store-one")}
        </h3>


        <div className="s1-bundle-items">
            {bundleItems.map((item) => (
                <div key={item.id} className="s1-bundle-item">
                    <label className="s1-check-wrap">
                        <input type="checkbox" checked readOnly />
                                    <span className="s1-check"><svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="s1-check-icon"
                    >
                        <path d="M20 6 9 17l-5-5" />
                    </svg></span>
                    </label>

                    {productSettings.show_thumbnails && (
                        <div className="s1-thumb">
                            {productSettings.thumbnails_clickable ? (
                                <a href={productUrl}>
                                    <img src={item.img} alt={item.name} />
                                </a>
                            ) : (
                                <img src={item.img} alt={item.name} />
                            )}
                        </div>
                    )}

                    <div className="s1-info">
                        <div className="s1-header-line">
                        <div className="s1-name">
                            {productSettings.show_quantities && (
                                <span className="s1-line-qty-prefix">
                                    {__("1 ×", "th-store-one")}&nbsp;
                                </span>
                            )}

                            {productSettings.thumbnails_clickable ? (
                                <a href={productUrl} className="s1-product-link">
                                    {item.name}
                                </a>
                            ) : (
                                <span>{item.name}</span>
                            )}
                        </div>
                        <span className="s1-line-unit">
                             <ins className="storeone-sale-price">
                                    {item.price}
                                </ins>
                                {item.old_price && (
                                    <del className="storeone-old-price">
                                        {item.old_price}
                                    </del>
                                )}
                               
                            </span>
                            </div>

                        {productSettings.show_descriptions && (
                            <div className="s1-desc">
                                <p>{item.desc}</p>
                            </div>
                        )}

                        <div className="s1-line-price">
                            <div className="s1-qty-wrap">
                                <button className="s1-qty-btn">−</button>
                                <span className="s1-line-qty">1</span>
                                <button className="s1-qty-btn">+</button>
                            </div>

                            
                        </div>
                    </div>
                </div>
            ))}
        </div>

       
    </div>
);
};

const ProductWithBundle = ({ settings = {} }) => {
    const productSettings = settings.product_page || {};
    
    return (
        <div className="s1-product-preview">

            {/* ===== MAIN PRODUCT ===== */}
            <div className="s1-main-product">
                
                <div className="s1-main-thumb">
                    <div className="static-skeleton static-main-img"></div>
                </div>
                <div className="s1-main-info">
                    <div className="static-skeleton static-title"></div>
                    <div className="static-skeleton static-price"></div>

                    {/*BUNDLE BEFORE ADD TO CART */}
                    {productSettings.position === 'before_cart' && (
                        <BundleSection productSettings={productSettings}/>
                    )}

                    <div className="s1-main-cart">
                    
                     <div className="static-skeleton static-qty"></div>
                      <div className="static-skeleton static-btn"></div>
               
                    </div>
                    {productSettings.position === 'after_cart' && (
                            <BundleSection productSettings={productSettings} />
                        )}
                </div>
            </div>
        </div>
    );
};

export default ProductWithBundle;