const PreviewTable = ({ settings }) => {
  return (
    <table
      className="th-preview-table"
      style={{
        background: settings.thw_wishlist_table_bg_color,
        color: settings.thw_wishlist_table_txt_color,
        borderColor: settings.thw_wishlist_table_brd_color,
      }}
    >
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Stock</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>Leather Bag</td>
          <td>$49</td>
          <td>In Stock</td>
        </tr>

        <tr>
          <td>Sport Shoes</td>
          <td>$69</td>
          <td>In Stock</td>
        </tr>
      </tbody>
    </table>
  );
};

export default PreviewTable;
