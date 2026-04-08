import React from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './live-style.css';

const bundleItems = [
    {
        id: 1,
        name: __("Album", "th-store-one"),
        qty: 1,
        price: "$23.10",
    },
    {
        id: 2,
        name: __("Cap", "th-store-one"),
        qty: 1,
        price: "$25.10",
        old_price: "$30.00",
    },
];

const CartWithBundle = ({ settings = {} }) => {
    const cartSettings = settings.cart_page || {};

    return (
        <div className="s1-cart-preview">
            <div className="s1-cart-layout">

                {/* ===== LEFT: CART ITEMS ===== */}
                <div className="s1-cart-items">
                    <div className="s1-cart-item">
                        <div className="s1-cart-thumb">
                            <div className="static-skeleton static-main-img"></div>
                        </div>

                        <div className="s1-cart-info">
                            <div className="static-skeleton static-title"></div>

                            {!cartSettings.hide_products_price && (
                                <div className="s1-cart-price">
                                    <div className="static-skeleton static-price"></div>
                                </div>
                            )}

                            {!cartSettings.hide_products && (
                                <div className="s1-cart-bundle-items">
                                    <ul>
                                        {bundleItems.map((item) => (
                                            <li key={item.id}>
                                                <span className="title">
                                                    {cartSettings.include_links ? (
                                                        <a href="#">{item.name}</a>
                                                    ) : (
                                                        item.name
                                                    )}
                                                    {!cartSettings.hide_products_qty && (
                                                        <span className="s1-bundle-qty-inline"> &times;{item.qty}</span>
                                                    )}
                                                </span>
                                                {!cartSettings.hide_products_price && (
                                                    <span className="price">{item.price} {item.old_price && <del>{item.old_price}</del>}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {!cartSettings.hide_products_qty && (
                                <div className="s1-cart-qty">
                                    <button className="s1-qty-btn">−</button>
                                    <span>1</span>
                                    <button className="s1-qty-btn">+</button>
                                </div>
                            )}
                        </div>

                        <div className="s1-cart-total">
                            <div className="static-skeleton static-price"></div>
                        </div>
                    </div>
                </div>

                {/* ===== RIGHT: CART TOTALS ===== */}
                <div className="s1-cart-totals">
                    <div className="static-skeleton static-cart"></div>
                </div>

            </div>
        </div>
    );
};

export default CartWithBundle;
