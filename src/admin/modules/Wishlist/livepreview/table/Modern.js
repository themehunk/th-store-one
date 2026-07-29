import { __ } from "@wordpress/i18n";

const Modern = ({ settings }) => {
  return (
    <div className="thwl-modern">
      <div className="thwl-modern-header">
        <div className="thwl-modern-title">
          <h3>Wishlist</h3>
        </div>

        <button className="thwl-share-btn">
          <span className="dashicons dashicons-share"></span>
        </button>
      </div>

      <div className="thwl-modern-grid">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="thwl-modern-card"
            style={{
              "--thwl-card-bg": settings.thw_wishlist_table_bg_color,
              "--thwl-card-text": settings.thw_wishlist_table_txt_color,
              "--thwl-card-border": settings.thw_wishlist_table_brd_color,
            }}
          >
            <div className="thwl-card-top">
              <span className="thwl-remove">×</span>
            </div>

            <div className="thwl-image-skeleton">
              <div className="thwl-image-icon"></div>
            </div>

            <h4>Sample Product</h4>

            <div className="thwl-price">£49.00</div>

            <span className="thwl-stock">In Stock</span>

            <button className="thwl-cart-btn">
              {__("Add to Cart", "th-store-one")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Modern;
