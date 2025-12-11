import { __ } from '@wordpress/i18n';
import { getTextStyle, getRadius } from '@storeone/utils/styleHelpers';

const dummy = [
    { id: 1, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png", name: "Sample Product A", price: "₹499" },
    { id: 2, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png", name: "Sample Product B", price: "₹299" },
   
];

const Style1 = ({ settings }) => {


    return (
        <section className="s1-fbt-box style_1" style={{
    background: settings?.bundel_bg_clr || undefined,
    '--s1-plus-bg': settings?.bundel_plus_clr || "#888",
    borderRadius: getRadius(settings?.border_radius), // ✅ PLUS SIGN LIVE PREVIEW
  }}>

            <h2 className="s1-fbt-title" style={getTextStyle(settings?.bundel_title_clr|| undefined)}>
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
                            <h4 className="s1-fbt-name" style={{ color: settings?.prd_tle_clr|| undefined }}>{p.name}</h4>
                            <div className="s1-fbt-price" style={{ color: settings?.prd_prc_clr|| undefined }}>{p.price}</div>
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

                                    <span className="s1-fbt-product-title" style={{ color: settings?.prd_tle_clr|| undefined }}>{p.name}</span>
                                    <span className="s1-fbt-product-price" style={{ color: settings?.prd_prc_clr|| undefined }}>{p.price}</span>
                                </label>
                            </div>
                        ))}

                        {/* Total Box */}
                        <div className="s1-fbt-total-box">
                            <div className="s1-fbt-total-label" style={{ color: settings?.bundel_cnt_clr|| undefined }}>{__("Bundle Price:", "store-one")}<div className="s1-fbt-total-value" style={{ color: settings?.prd_prc_clr|| undefined , marginLeft: '10px'}}>₹899</div></div>
                            <button className="s1-fbt-add-btn" style={{ background: settings?.bundel_btn_bg|| undefined ,color: settings?.bundel_btn_txt || undefined }}>
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