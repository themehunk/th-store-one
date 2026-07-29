import { __ } from "@wordpress/i18n";

const Traditional = ({ settings }) => {
  return (
    <div
      className="s1-traditional"
      style={{
        "--thwl-bg": settings.thw_wishlist_table_bg_color,
        "--thwl-text": settings.thw_wishlist_table_txt_color,
        "--thwl-border": settings.thw_wishlist_table_brd_color,
      }}
    >
      <div className="s1-tr-header">
        <div className="s1-tr-title">
          <h3>Wishlist</h3>
        </div>

        <span className="dashicons dashicons-share"></span>
      </div>

      {[1, 2].map((i) => (
        <div className="s1-tr-row" key={i}>
          <div className="s1-tr-left">
            <div className="s1-tr-image-skeleton">
              <div className="s1-tr-image-icon"></div>
            </div>
          </div>

          <div className="info">
            <h4>Sample Product</h4>

            <span className="price">£89.00</span>

            <small className="stock">In Stock</small>
          </div>

          <div className="s1-tr-actions">
            <button>{__("Add To Cart", "th-store-one")}</button>

            <span className="s1-tr-remove">×</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Traditional;
