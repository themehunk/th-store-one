import { ICONS } from '@storeone-global/icons';
import './live-style.css';

const PreviewBuyToList = ({ settings = {} }) => {

    const iconMap = {
        check: ICONS.CheckSVG,
        star: ICONS.StarSVG,
        heart: ICONS.HeartSVG,
        bolt: ICONS.BoltSVG,
        rocket: ICONS.RocketSVG,
    };

    const SelectedIcon =
    iconMap[settings.selected_icon] || ICONS.CheckSVG;

   const listItems = [
    "Premium Quality Material",
    "Fast & Secure Shipping",
    "30 Days Easy Returns",
    "Trusted by 10,000+ Customers"
];
    return (
        <div className="s1-product-preview">

            <div className="s1-main-product">

                {/* LEFT IMAGE */}
                <div className="s1-main-thumb">
                    <div className="static-skeleton static-main-img"></div>
                </div>

                {/* RIGHT CONTENT */}
                <div className="s1-main-info">

                    <div className="static-skeleton static-title"></div>
                    <div className="static-skeleton static-price"></div>

                    {/* ================= BUY TO LIST ================= */}
                    <div className="s1-btl-preview">

                        <div className="static-skeleton static-btl-title"></div>

                        <ul className="s1-btl-list">
    {listItems.map((text, index) => (
        <li key={index} className="s1-btl-item">

            {/* Icon */}
            <span className="s1-btl-icon">
                {SelectedIcon}
            </span>

            {/* Text */}
            <span className="s1-btl-text">
                {text}
            </span>

        </li>
    ))}
</ul>

                    </div>
                    {/* ================= END BUY TO LIST ================= */}

                    <div className="s1-main-cart">
                        <div className="static-skeleton static-qty"></div>
                        <div className="static-skeleton static-btn"></div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default PreviewBuyToList;