import { __ } from "@wordpress/i18n";

const currency = th_StoreOneAdmin?.currency_symbol || "$";

const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;

const products = [
  {
    id: 1,
    name: "Classic Red Sneakers",
    price: 900,
    qty: 1,
    rating: 5,
  },
  {
    id: 2,
    name: "Minimalist White Tee",
    price: 108,
    qty: 1,
    rating: 5,
  },
];

const SideCartPreview = ({ settings = {} }) => {
  const subtotal = products.reduce(
    (total, product) => total + product.price * product.qty,
    0,
  );

  const totalItems = products.reduce(
    (total, product) => total + product.qty,
    0,
  );

  return (
    <div className="s1-side-cart-preview">
      {/* Header */}
      <div className="s1-side-cart-header">
        <div className="s1-side-cart-title">
          <span className="dashicons dashicons-cart"></span>

          <span>{__("Your Cart", "th-store-one")}</span>

          <span className="s1-cart-count">{totalItems}</span>
        </div>

        <span className="dashicons dashicons-no-alt"></span>
      </div>
      {/* Free Shipping Bar */}

      <div className="s1-shipping-progress">
        <div className="s1-progress-wrap">
          <div className="s1-progress-track">
            <div className="s1-progress-fill" style={{ width: "72%" }}></div>
          </div>

          <div className="s1-progress-icon" style={{ left: "72%" }}>
            🚚
          </div>
        </div>

        <p>
          {__("Spend", "th-store-one")} <strong>{formatPrice(258)}</strong>{" "}
          {__("more for free shipping", "th-store-one")}
        </p>
      </div>

      {/* Body */}
      <div className="s1-side-cart-body">
        {products.map((product) => (
          <div className="s1-cart-item" key={product.id}>
            {/* Skeleton Thumbnail */}
            <div className="s1-cart-thumb"></div>

            <div className="s1-cart-content">
              <h4>{product.name}</h4>

              <div className="s1-cart-rating">★★★★★</div>

              <div className="s1-woo-cart-qty">
                <button type="button">−</button>

                <span>{product.qty}</span>

                <button type="button">+</button>
              </div>
            </div>

            <div className="s1-cart-price">{formatPrice(product.price)}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="s1-side-cart-footer">
        <h5>{__("ORDER SUMMARY", "th-store-one")}</h5>

        <div className="s1-summary-row">
          <span>{__("Subtotal", "th-store-one")}</span>

          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="s1-summary-row total">
          <span>{__("ORDER TOTAL", "th-store-one")}</span>

          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="s1-cart-actions">
          <button type="button" className="outline">
            {__("View Cart", "th-store-one")}
          </button>

          <button type="button" className="primary">
            {__("Checkout →", "th-store-one")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideCartPreview;
