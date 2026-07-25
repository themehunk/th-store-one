import { __ } from "@wordpress/i18n";

const Traditional = ({ settings }) => {
  return (
    <div
      className="s1-traditional"
      style={{
        background: settings.thw_wishlist_table_bg_color,
        color: settings.thw_wishlist_table_txt_color,
        borderColor: settings.thw_wishlist_table_brd_color,
      }}
    >
      <div className="s1-tr-header">
        <div className="s1-tr-title">
          <h3>Wishlist1</h3>
          <span className="s1-tr-badge">Public</span>
        </div>
        <span class="dashicons dashicons-share"></span>
      </div>

      {[1, 2, 3].map((i) => (
        <div className="s1-tr-row" key={i}>
          <div className="s1-tr-left">
            <span className="s1-tr-checkbox"></span>

            <div className="s1-tr-image-skeleton">
              <div className="s1-tr-image-icon"></div>
            </div>
          </div>

          <div className="info">
            <h4>Leather Backpack</h4>

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
