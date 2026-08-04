import { __ } from "@wordpress/i18n";

const currency = th_StoreOneAdmin?.currency_symbol || "$";

const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;

const MenuCartPreview = () => {
  return (
    <div className="s1-menu-preview">
      {/* Header */}

      <header className="s1-menu-header">
        <div className="s1-menu-logo">
          <div className="s1-logo-icon"></div>

          <div className="s1-logo-text">
            <strong>STOREONE</strong>
          </div>
        </div>

        <nav className="s1-menu-nav">
          <span className="s1-menu-line"></span>
          <span className="s1-menu-line"></span>
        </nav>

        <div className="s1-menu-cart">
          <span className="dashicons dashicons-cart"></span>

          <span>{formatPrice(1008)}</span>

          <span className="s1-menu-cart-count">2</span>
        </div>
      </header>

      {/* Hero */}

      <div className="s1-skeleton hero"></div>

      {/* Text */}

      <div className="s1-skeleton title"></div>

      <div className="s1-skeleton text"></div>

      {/* Products */}

      <div className="s1-product-grid">
        <div className="s1-product-card">
          <div className="thumb"></div>
          <div className="line"></div>
          <div className="price"></div>
        </div>

        <div className="s1-product-card">
          <div className="thumb"></div>
          <div className="line"></div>
          <div className="price"></div>
        </div>

        <div className="s1-product-card">
          <div className="thumb"></div>
          <div className="line"></div>
          <div className="price"></div>
        </div>
      </div>
    </div>
  );
};

export default MenuCartPreview;
