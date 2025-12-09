import { __ } from '@wordpress/i18n';

const dummyProducts =[
    { id: 1, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png", name: "Sample Product A", price: "₹499" },
    { id: 2, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png", name: "Sample Product B", price: "₹299" },
   
];

const Style3 = ({ settings }) => {
    return (
        <section className={`s1-fbt-box style_3`} >

            {/* TITLE */}
            <h2 className="s1-fbt-title" style={{ color: settings?.bundel_title_clr || undefined }}>
                {settings?.title || __("Frequently Bought Together", "store-one")}
            </h2>

            <div className="s1-fbt-content s1-fbt-product-wrap" data-id="1" style={{
            background: settings?.bundel_bg_clr || undefined 
        }}>

                <div className="s1-fbt-content-table s1-fbt-products">
                    <div className="s1-fbt-product-list">

                        <table className="s1-fbt-product-table" >
                            <tbody>

                                {dummyProducts.map((p, i) => (
                                    <tr key={p.id} className="s1-fbt-product-list-add" style={{
            borderColor: settings?.bundel_brd_clr || undefined 
        }}>

                                        {/* CHECKBOX */}
                                        <td className="s1-fbt-check">
                                            <input
                                                type="checkbox"
                                                className="product-checkbox s1-fbt-checkbox"
                                                defaultChecked={i === 0}
                                                disabled={i === 0}
                                            />
                                        </td>

                                        {/* IMAGE + TITLE */}
                                        <td className="s1-fbt-td-title">
                                            <label>

                                                {/* PRODUCT IMAGE WRAPPER */}
                                                <div className="s1-fbt-product">
                                                    <div className="s1-fbt-image">
                                                        <img src={p.img} alt={p.name} />
                                                    </div>
                                                </div>

                                                {/* TITLE */}
                                                <span className="s1-fbt-product-title">
                                                    <a style={{ color: settings?.prd_tle_clr|| undefined }} href="#">{p.name}</a>
                                                </span>

                                                {/* VARIATIONS placeholder */}
                                                {/* In actual UI variations load in this area */}

                                            </label>
                                        </td>

                                        {/* PRICE */}
                                        <td className="s1-fbt-last">
                                            <span style={{ color: settings?.prd_prc_clr|| undefined }} className="s1-fbt-product-price">
                                                {p.price}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>

                            <tfoot>
                                <tr className="s1-fbt-total-row" style={{
            borderColor: settings?.bundel_brd_clr || undefined 
        }}>
                                    <td></td>
                                    <td></td>
                                    <td className="s1-fbt-total-wrap">

                                        {/* TOTAL BOX (dummy) */}
                                        <div className="s1-fbt-total-box">
                                            <div className="s1-fbt-total-label" style={{ color: settings?.bundel_cnt_clr|| undefined }}>
                                                {__("Bundle Price:", "store-one")}
                                                <div style={{ color: settings?.prd_prc_clr|| undefined }} className="s1-fbt-total-value">
                                                ₹999
                                            </div>
                                            </div>

                                            

                                            <button className="s1-fbt-add-btn" style={{ background: settings?.bundel_btn_bg|| undefined ,color: settings?.bundel_btn_txt || undefined }}>
                                                {__("Add Bundle to Cart", "store-one")}
                                            </button>
                                        </div>

                                    </td>
                                </tr>
                            </tfoot>

                        </table>

                    </div>
                </div>

            </div>

        </section>
    );
};

export default Style3;
