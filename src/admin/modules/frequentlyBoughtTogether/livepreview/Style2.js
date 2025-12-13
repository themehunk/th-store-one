import { __ } from '@wordpress/i18n';
import { getTextStyle, getRadius } from '@storeone/utils/styleHelpers';

const dummyProducts = [
    {
        id: 1,
        img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png",
        name: "Premium Wool Cardigan",
        price: "$119.00",
    },
    {
        id: 2,
        img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png",
        name: "Leather Tote Bag - Red",
        price: "$40.00",
    },
    {
        id: 3,
        img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png",
        name: "Classic Silk Scarf",
        price: "$25.00",
    },
];

const Style2 = ({ settings }) => {
    return (
        <section
            className="s1-fbt-box style_2"
            style={{
                borderRadius: getRadius(settings?.border_radius),
                background: settings?.bundel_bg_clr || "#fff",
            }}
        >
            {/* TITLE */}
            <h2
                className="s1-fbt-title"
                style={getTextStyle(settings?.bundel_title_clr)}
            >
                {__("Frequently Bought Together", "store-one")}
            </h2>

            <div className="s1-fbt-style2-wrap">

                {/* LEFT SIDE */}
                <div className="s1-fbt-style2-left">

                    {/* IMAGE EQUATION */}
                    <div className="s1-fbt-equation">
                        {dummyProducts.map((p, i) => (
                            <div key={p.id} className="s1-fbt-eq-item">
                                {i !== 0 && <span className="s1-fbt-plus"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus text-white" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span>}
                                <div className="s1-fbt-eq-img">
                                    <img src={p.img} alt={p.name} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PRODUCT CHECK LIST */}
                    <ul className="s1-fbt-checklist">
                        {dummyProducts.map((p) => (
                            <li key={p.id}>
                                <span className="s1-check-icon">✓</span>
                                <div className="s1-title-wrap">
                                <span className="s1-name">{p.name}</span>
                                <span className="s1-price">{p.price}</span>
                                </div>
                            </li>
                        ))}
                    </ul>

                </div>

                {/* RIGHT SIDE */}
                <div className="s1-fbt-style2-right">

                    <div className="s1-fbt-total-box">
                        <div className="s1-total-text">
                            <span>Total for 3 items:</span>
                            <del>$189.00</del>
                        </div>
                        <div className="s1-total-price">
                            <span>Bundle price: </span>
                            <del>$189.00</del>
                        </div>

                        <button className="s1-fbt-add-btn">
                            {__("Add All to Cart", "store-one")}
                        </button>
                    </div>

                </div>

            </div>
        </section>
    );
};

export default Style2;
