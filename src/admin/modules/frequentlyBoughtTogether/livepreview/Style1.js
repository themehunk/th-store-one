import { __ } from '@wordpress/i18n';

const dummy = [
    { id: 1, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png", name: "Sample Product A", price: "₹499" },
    { id: 2, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png", name: "Sample Product B", price: "₹299" },
   
];

const Style1 = ({ settings }) => {
    return (
        <section className="s1-fbt-box style_1">

            <h2 className="s1-fbt-title" style={{ color: settings?.bundel_title_clr || undefined }}>
                {settings?.title || __("Frequently Bought Together", "store-one")}
            </h2>

            <div className="s1-fbt-content s1-fbt-product-wrap">

                {/* LEFT GRID */}
                <div className="s1-fbt-content-one">
                    {dummy.map((p, i) => (
                        <div key={p.id} className={`s1-fbt-product ${i === 0 ? "s1-fbt-active" : "s1-fbt-inactive"}`}>
                            <div className="s1-fbt-image">
                                <img src={p.img} alt={p.name} />
                            </div>
                            <h4 className="s1-fbt-name">{p.name}</h4>
                            <div className="s1-fbt-price">{p.price}</div>
                        </div>
                    ))}
                </div>

                {/* RIGHT LIST */}
                <div className="s1-fbt-content-two s1-fbt-products">
                    <div className="s1-fbt-product-list">

                        {dummy.map((p, i) => (
                            <div className="s1-fbt-product-list-add" key={p.id}>
                                <label>
                                    <input type="checkbox" defaultChecked={i !== 0} disabled={i === 0} />

                                    <span className="s1-fbt-product-title">{p.name}</span>
                                    <span className="s1-fbt-product-price">{p.price}</span>
                                </label>
                            </div>
                        ))}

                        {/* Total Box */}
                        <div className="s1-fbt-total-box">
                            <div className="s1-fbt-total-label">{__("Bundle Price:", "store-one")}<div className="s1-fbt-total-value">₹899</div></div>
                            
                            <button className="s1-fbt-add-btn">
                                {__("Add Bundle to Cart", "store-one")}
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
};

export default Style1;