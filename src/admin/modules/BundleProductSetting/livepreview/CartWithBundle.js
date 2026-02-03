import React from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './live-style.css';

const cartItem = {
    name: __("Sample Bundle Product", "store-one"),
    img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/prd1.png",
    price: "$23.10",
    old_price: "$30.00",
    qty: 1,
};

const bundleItems = [
    {
        id: 1,
        name: __("Album", "store-one"),
        qty: 1,
        price: "$23.10",
    },
    {
        id: 2,
        name: __("Cap", "store-one"),
        qty: 1,
        price: "$25.10",
        old_price: "$30.00",
    },
];

const CartWithBundle = () => {
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

                            <div className="s1-cart-price">
                                <div className="static-skeleton static-price"></div>
                            </div>

                            <div className="s1-cart-bundle-details">
                            <div className="s1-cart-bundle-items">
                                <ul>
                                    {bundleItems.map((item) => (
                                        <li key={item.id}>
                                            <span className="title">{item.qty} ×  {item.name} :</span>
                                            <span className="price">{item.price} <del>{item.old_price ? item.old_price : ''}</del></span> 
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            </div>

                            
                            <div className="static-skeleton static-title quantity"></div>

                           <div className="static-skeleton static-title"></div>

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
