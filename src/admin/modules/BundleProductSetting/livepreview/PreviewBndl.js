import { useState } from '@wordpress/element';
import Product from "./ProductWithBundle";
import Cart from "./CartWithBundle";

import './live-style.css';
import { __ } from '@wordpress/i18n';

const PreviewBndl = ({ settings = {} }) => {
    const [style, setStyle] = useState('product');
    return (
        <div className="s1-preview-wrap">
            {/* ================= STYLE TABS ================= */}
            <div className="s1-style-tabs">
                <button
                    className={`s1-style-tab ${style === 'product' ? 'active' : ''}`}
                    onClick={() => setStyle('product')}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-layout-grid"
                        aria-hidden="true"
                    >
                        <rect width="7" height="7" x="3" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="14" rx="1" />
                        <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                    <span>{__("Product Page", "store-one")}</span>
                </button>

                <button
                    className={`s1-style-tab ${style === 'cart' ? 'active' : ''}`}
                    onClick={() => setStyle('cart')}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-square-plus"
                        aria-hidden="true"
                    >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M8 12h8" />
                        <path d="M12 8v8" />
                    </svg>
                    <span>{__("Cart Page", "th-store-one")}</span>
                </button>
            </div>

            {/* ================= PREVIEW ================= */}

            {style === 'product' && <Product settings={settings} />}
            {style === 'cart' && <Cart settings={settings} />}

        </div>
    );
};

export default PreviewBndl;
