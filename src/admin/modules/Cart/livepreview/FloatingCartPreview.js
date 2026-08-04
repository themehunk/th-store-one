import { __ } from "@wordpress/i18n";

const currency = th_StoreOneAdmin?.currency_symbol || "$";

const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;

const FloatingCartPreview = () => {
  return (
    <div className="s1-menu-preview">
      {/* Header - Same as Menu Cart */}

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
          <span className="s1-menu-line"></span>
        </nav>
      </header>

      {/* Existing Skeleton */}
      <div className="s1-skeleton hero"></div>

      <div className="s1-product-grid">
        {[1, 2, 3].map((i) => (
          <div className="s1-product-card" key={i}>
            <div className="thumb"></div>
            <div className="line"></div>
            <div className="price"></div>
          </div>
        ))}
      </div>

      {/* Floating Cart */}

      <div className="s1-floating-cart">
        <span className="dashicons dashicons-cart"></span>

        <span className="s1-floating-cart-count">2</span>
      </div>
    </div>
  );
};

export default FloatingCartPreview;
