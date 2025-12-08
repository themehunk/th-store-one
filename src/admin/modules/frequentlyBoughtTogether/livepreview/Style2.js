import { __ } from '@wordpress/i18n';

const dummyProducts = [
    { id: 1, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png", name: "Sample Product A", price: "₹499" },
    { id: 2, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png", name: "Sample Product B", price: "₹299" },
   
];

const Style2 = ({ settings }) => {
    return (
        <section className="s1-fbt-box style_2">

            {/* Title */}
            <h2 className="s1-fbt-title" style={{ color: settings?.bundel_title_clr || undefined }}>
                {settings?.title || __("Frequently Bought Together", "store-one")}
            </h2>

            <div className="s1-fbt-content s1-fbt-product-wrap">

                {/* LEFT SIDE — IMAGES + TOTAL BOX */}
                <div className="s1-fbt-content-one">
                    
                    {/* PRODUCT ROW (images + plus signs) */}
                    <div className="s1-fbt-product-row">

                        {dummyProducts.map((p, i) => (
                            <div key={p.id} style={{ display: "flex", alignItems: "center" }}>

                                {/* PLUS SIGN (after first product) */}
                                {i > 0 && <span className="s1-fbt-plus-sign">+</span>}

                                {/* PRODUCT IMAGE */}
                                <div className={`s1-fbt-product s1-fbt-active ${i === 0 ? "dltprd" : ""}`}>
                                    <div className="s1-fbt-image">
                                        <img src={p.img} alt={p.name} />
                                    </div>
                                </div>

                            </div>
                        ))}

                    </div>

                    {/* TOTAL BOX (dummy values for preview) */}
                    <div className="s1-fbt-total-box">
                        <div className="s1-fbt-total-label">
                            {__("Bundle Price:", "store-one")}
                            <div className="s1-fbt-total-value">
                            ₹999
                        </div>
                        </div>

                        

                        <button className="s1-fbt-add-btn">
                            {__("Add Bundle to Cart", "store-one")}
                        </button>
                    </div>

                </div>

                {/* RIGHT SIDE — CHECKBOX LIST */}
                <div className="s1-fbt-content-two">
                    <div className="s1-fbt-product-list">

                        {dummyProducts.map((p, i) => (
                            <div key={p.id} className="s1-fbt-product-list-add">
                                <label>
                                    <input
                                        type="checkbox"
                                        className="product-checkbox s1-fbt-checkbox"
                                        defaultChecked={i !== 0}
                                        disabled={i === 0}
                                    />

                                    <span className="s1-fbt-product-title">
                                        <a href="#">{p.name}</a>
                                    </span>

                                    <span className="s1-fbt-product-price">
                                        {p.price}
                                    </span>
                                </label>
                            </div>
                        ))}

                    </div>
                </div>

            </div>

        </section>
    );
};

export default Style2;
