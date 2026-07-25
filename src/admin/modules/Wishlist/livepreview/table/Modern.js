import { __ } from "@wordpress/i18n";

const Modern = ({ settings }) => {
  return (
    <div className="thwl-modern">
      <div className="thwl-modern-header">
        <div className="thwl-modern-title">
          <h3>Wishlist1</h3>
          <span className="thwl-badge">Public</span>
        </div>

        <button className="thwl-share-btn">
          <span class="dashicons dashicons-share"></span>
        </button>
      </div>

      <div className="thwl-modern-grid">
        {[1, 2].map((i) => (
          <div
            className="thwl-modern-card"
            key={i}
            style={{
              background: settings.thw_wishlist_table_bg_color,
              color: settings.thw_wishlist_table_txt_color,
              borderColor: settings.thw_wishlist_table_brd_color,
            }}
          >
            <div className="thwl-card-top">
              <span className="thwl-checkbox"></span>

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
