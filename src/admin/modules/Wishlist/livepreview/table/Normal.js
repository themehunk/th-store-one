import { __ } from "@wordpress/i18n";

const Normal = ({ settings }) => {
  const style = {
    background: settings.thw_wishlist_table_bg_color,
    color: settings.thw_wishlist_table_txt_color,
    borderColor: settings.thw_wishlist_table_brd_color,
  };

  return (
    <div className="thwl-normal">
      <div className="thwl-normal-header">
        <div className="thwl-normal-title">
          <h3>Wishlist</h3>
          {/* <span className="thwl-badge">Public</span> */}
        </div>

        <button className="thwl-share-btn">
          <span class="dashicons dashicons-share"></span>
        </button>
      </div>

      <table
        className="thwl-table"
        style={{
          "--thwl-table-bg": settings.thw_wishlist_table_bg_color,
          "--thwl-table-text": settings.thw_wishlist_table_txt_color,
          "--thwl-table-border": settings.thw_wishlist_table_brd_color,
        }}
      >
        <thead>
          <tr>
            {/* <th className="thwl-check-col">
              <span className="thwl-checkbox"></span>
            </th> */}
            <th>Product</th>
            <th>Title</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Action</th>
            <th>Remove</th>
            {/* <th>Note</th> */}
          </tr>
        </thead>

        <tbody>
          {[1, 2].map((item) => (
            <tr key={item}>
              {/* <td>
                <span className="thwl-checkbox"></span>
              </td> */}

              <td>
                <div className="thwl-image-skeleton">
                  <div className="thwl-image-icon"></div>
                </div>
              </td>

              <td>Sample Product</td>

              <td>£49.00</td>

              <td>
                <span className="thwl-stock">In Stock</span>
              </td>

              <td>
                <button className="thwl-cart-btn">Add to Cart</button>
              </td>

              <td>
                <span className="thwl-remove">×</span>
              </td>

              {/* <td>
                <button className="thwl-note-btn">Note</button>

                <span className="thwl-edit">✎</span>

                <span className="thwl-delete">🗑</span>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Normal;
