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

const MiniCartWithBundle = ({ settings = {} }) => {
    const miniSettings = settings.cart_page || {};

    return (
        <div className="s1-minicart-preview">
            <div className="s1-minicart-header">
                <span className="s1-minicart-heading">{__("Shopping Cart", "th-store-one")}</span>
                <span className="s1-minicart-close">&times;</span>
            </div>

            <div className="s1-minicart-items">
                {/* ===== BUNDLE PRODUCT ===== */}
                <div className="s1-minicart-item">
                    <div className="s1-minicart-thumb">
                        <div className="static-skeleton static-mini-img"></div>
                    </div>
                    <div className="s1-minicart-info">
                        <div className="s1-minicart-name">
                            <div className="static-skeleton static-mini-title"></div>
                        </div>

                        {!miniSettings.hide_products_price && (
                            <div className="s1-minicart-price">
                                <div className="static-skeleton static-mini-price"></div>
                            </div>
                        )}

                        {!miniSettings.hide_products && (
                            <div className="s1-minicart-bundle-items">
                                <ul>
                                    {bundleItems.map((item) => (
                                        <li key={item.id}>
                                            <span className="title">
                                                {miniSettings.include_links ? (
                                                    <a href="#">{item.name}</a>
                                                ) : (
                                                    item.name
                                                )}
                                                {!miniSettings.hide_products_qty && (
                                                    <span className="s1-bundle-qty-inline"> &times;{item.qty}</span>
                                                )}
                                            </span>
                                            {!miniSettings.hide_products_price && (
                                                <span className="price">{item.price} {item.old_price && <del>{item.old_price}</del>}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="s1-minicart-remove">&times;</div>
                </div>
            </div>

            <div className="s1-minicart-footer">
                <div className="s1-minicart-subtotal">
                    <span>{__("Subtotal:", "th-store-one")}</span>
                    <span className="s1-minicart-subtotal-price">$48.20</span>
                </div>
                <div className="s1-minicart-actions">
                    <div className="static-skeleton static-mini-btn"></div>
                    <div className="static-skeleton static-mini-btn dark"></div>
                </div>
            </div>
        </div>
    );
};

export default MiniCartWithBundle;
