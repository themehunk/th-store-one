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
    },
    {
        id: 2,
        name: __("Cap", "store-one"),
        qty: 1,
    },
];

const CartWithBundle = () => {
    return (
        <div className="s1-cart-preview">

            <h2 className="s1-cart-title">
                {__("Cart", "store-one")}
            </h2>

            <div className="s1-cart-layout">

                {/* ===== LEFT: CART ITEMS ===== */}
                <div className="s1-cart-items">

                    <div className="s1-cart-item">

                        <div className="s1-cart-thumb">
                            <img src={cartItem.img} alt={cartItem.name} />
                        </div>

                        <div className="s1-cart-info">
                            <a href="#" className="s1-cart-product-name">
                                {cartItem.name}
                            </a>

                            <div className="s1-cart-price">
                                {cartItem.old_price && (
                                    <del>{cartItem.old_price}</del>
                                )}
                                <ins>{cartItem.price}</ins>
                                <span className="s1-cart-save">
                                    {__("Save $6.90", "store-one")}
                                </span>
                            </div>

                            <div className="s1-cart-bundle-details">
                            <div className="s1-cart-bundle-items">
                                <strong>
                                    {__("Bundle items:", "store-one")}
                                </strong>
                                <ul>
                                    {bundleItems.map((item) => (
                                        <li key={item.id}>
                                            {item.name} × {item.qty}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="s1-bundle-total">
                                <strong>
                                    {__("Bundle items:", "store-one")}
                                </strong>
                                <span>{cartItem.price}</span>
                            </div>
                            </div>

                            <div className="s1-cart-qty">
                                <button type="button">−</button>
                                <span>{cartItem.qty}</span>
                                <button type="button">+</button>
                            </div>
                            


                            <a href="#" className="s1-cart-remove">
                                {__("Remove item", "store-one")}
                            </a>

                        </div>

                        <div className="s1-cart-total">
                            {cartItem.price}
                        </div>
                    </div>

                </div>

                {/* ===== RIGHT: CART TOTALS ===== */}
                <div className="s1-cart-totals">

                    <h3>{__("Cart totals", "store-one")}</h3>

                    <div className="s1-cart-row">
                        <span>{__("Estimated total", "store-one")}</span>
                        <strong>$23.10</strong>
                    </div>

                    <button className="s1-checkout-btn">
                        {__("Proceed to checkout", "store-one")}
                    </button>

                </div>

            </div>
        </div>
    );
};

export default CartWithBundle;
