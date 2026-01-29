import React from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './live-style.css';

const mainProduct = {
    img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/prd1.png",
    name: __("Sample Bundle Product", "store-one"),
    price: "$30.00",
};

const bundleItems = [
    {
        id: 1,
        img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/prd1.png",
        name: __("Hydration Serum", "store-one"),
        price: "$12.00",
        old_price: "$15.00",
        desc: __("A lightweight hydration serum.", "store-one"),
    },
    {
        id: 2,
        img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/prd2.png",
        name: __("Daily Cream", "store-one"),
        price: "$18.00",
        old_price: "$22.00",
        desc: __("A nourishing daily cream designed to soften skin.", "store-one"),
    },
];
const BundleSection = ({ productSettings }) => {
    const productUrl = '#';
    return (
    <div className="storeone-bundle-frontend">
        <h3 className="s1-bundle-title">
            {__("Bundle", "store-one")}
        </h3>

        <div className="storeone-bundle-above-text">
            <p>
                {__(
                    "A lightweight hydration serum that helps lock in moisture and keeps skin fresh all day.",
                    "store-one"
                )}
            </p>
        </div>

        <div className="s1-bundle-items">
            {bundleItems.map((item) => (
                <div key={item.id} className="s1-bundle-item">
                    <label className="s1-check-wrap">
                        <input type="checkbox" checked readOnly />
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
                        <div className="s1-name">
                            {productSettings.show_quantities && (
                                <span className="s1-line-qty-prefix">
                                    {__("1 ×", "store-one")}&nbsp;
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

                            <span className="s1-line-unit">
                                {item.old_price && (
                                    <del className="storeone-old-price">
                                        {item.old_price}
                                    </del>
                                )}
                                <ins className="storeone-sale-price">
                                    {item.price}
                                </ins>
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="storeone-bundle-below-text">
            <p>
                {__(
                    "A nourishing daily cream designed to soften skin and enhance hydration.",
                    "store-one"
                )}
            </p>
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
                    <img
                        src={mainProduct.img}
                        alt={mainProduct.name}
                    />
                </div>
          

                <div className="s1-main-info">
                    <h2>{mainProduct.name}</h2>
                    <span className="s1-main-price">
                        {mainProduct.price}
                    </span>

                    {/*BUNDLE BEFORE ADD TO CART */}
                    {productSettings.position === 'before_cart' && (
                        <BundleSection productSettings={productSettings}/>
                    )}

                    <div className="s1-main-cart">
                        <div className="s1-qty-wrap">
                            <button
                                type="button"
                                className="s1-qty-btn"
                                aria-label={__("Decrease quantity", "store-one")}
                            >
                                −
                            </button>

                            <span className="s1-line-qty">1</span>

                            <button
                                type="button"
                                className="s1-qty-btn"
                                aria-label={__("Increase quantity", "store-one")}
                            >
                                +
                            </button>
                        </div>

                        <button className="s1-add-to-cart">
                            {__("Add to cart", "store-one")}
                        </button>
                    </div>
                    {productSettings.position === 'after_cart' && (
                            <BundleSection productSettings={productSettings} />
                        )}
                    {/* ===== BUNDLE SECTION ===== */}
                    {/* <div className="storeone-bundle-frontend">
                        <h3 className="s1-bundle-title">
                            {__("Bundle", "store-one")}
                        </h3>

                        <div className="storeone-bundle-above-text">
                            <p>
                                {__(
                                    "A lightweight hydration serum that helps lock in moisture and keeps skin fresh all day.",
                                    "store-one"
                                )}
                            </p>
                        </div>

                        <div className="s1-bundle-items">
                            {bundleItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="s1-bundle-item"
                                >
                                    <label className="s1-check-wrap">
                                        <input
                                            type="checkbox"
                                            checked
                                            readOnly
                                        />
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
                                        <div className="s1-name">
                                            {productSettings.show_quantities && __("1 ×", "store-one")} {productSettings.thumbnails_clickable ? (
                                                <a href={productUrl} className="s1-product-link">
                                                    {item.name}
                                                </a>
                                            ) : (
                                                <span>{item.name}</span>
                                            )}
                                        </div>
                                       {productSettings.show_descriptions && (
                                        <div className="s1-desc">
                                            <p>{item.desc}</p>
                                        </div>
                                        )}

                                        <div className="s1-line-price">
                                            
                                            <div className="s1-qty-wrap">
                                                <button
                                                    type="button"
                                                    className="s1-qty-btn"
                                                >
                                                    −
                                                </button>

                                                <span className="s1-line-qty">
                                                    1
                                                </span>

                                                <button
                                                    type="button"
                                                    className="s1-qty-btn"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            

                                            <span className="s1-line-unit">
                                                {item.old_price && (
                                                    <del className="storeone-old-price">
                                                        {item.old_price}
                                                    </del>
                                                )}
                                                <ins className="storeone-sale-price">
                                                    {item.price}
                                                </ins>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="storeone-bundle-below-text">
                            <p>
                                {__(
                                    "A nourishing daily cream designed to soften skin and enhance hydration.",
                                    "store-one"
                                )}
                            </p>
                        </div>
                    </div> */}
                </div>
            </div>

        </div>
    );
};

export default ProductWithBundle;
