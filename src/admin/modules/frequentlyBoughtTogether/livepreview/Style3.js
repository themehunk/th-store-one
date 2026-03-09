import { __ } from '@wordpress/i18n';
import { getTextStyle, getRadius } from '@storeone/utils/styleHelpers';

const dummyProducts = [
    {
        id: 1,
        img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/prd1.png",
        name: "Dewleaf Hydration Serum",
        price: "$119.00",
        checked: true,
    },
    {
        id: 2,
        img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/prd2.png",
        name: "Rosemist Daily Cream",
        price: "$40.00",
        oldPrice: "$45.00",
        checked: true,
    },
    {
        id: 3,
        img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/prd3.png",
        name: "Greenveil Repair Balm",
        price: "$25.00",
        checked: true,
    },
];

const Style3 = ({ settings }) => {
    return (
        <section
            className="s1-fbt-box style_3"
            style={{
                            background: settings?.bundel_bg_clr || undefined,
                            border: '1px solid ' + (settings?.outer_brd_clr || "#F5F5F5"),
                            borderRadius: getRadius(settings?.border_radius),
  
                        }}
           >
            {/* TITLE */}
            <h2
                className="s1-fbt-title"
                style={getTextStyle(settings?.bundel_title_clr)}
            >
                {settings?.title || __("Frequently Bought Together", "store-one")}
            </h2>

            {/* PRODUCTS */}
            <div
                className="s1-fbt-flex-list"
            >
                {dummyProducts.map((p, i) => (
                    <div
                        key={p.id}
                        className="s1-fbt-flex-item"
                        
                        style={{
                
                borderColor: settings?.bundel_brd_clr || undefined,
                borderRadius: getRadius(settings?.border_radius),
                }}
                    >
                        {/* CHECK */}
                        <input
                            type="checkbox"
                            className="product-checkbox s1-fbt-checkbox"
                            defaultChecked={i === 0}
                            disabled={i === 0}
                             style={{
                                background: i === 0
                                    ? settings?.bundel_chk_bg_clr 
                                    : "",
                                color: settings?.bundel_chk_clr ,
                               
                            }}
                        />

                        {/* IMAGE */}
                        <div className="s1-fbt-thumb">
                            <img src={p.img} alt={p.name} />
                        </div>

                        {/* TITLE */}
                        <div className="s1-fbt-info" style={{ color: settings?.prd_tle_clr }}>
                                {p.name}
                        </div>

                        {/* PRICE */}
                        <div
                            className="s1-fbt-price"
                            style={{ color: settings?.prd_prc_clr }}
                        >
                            {p.oldPrice && (
                                <del className="s1-old-price">{p.oldPrice}</del>
                            )}
                            <span>{p.price}</span>
                        </div>
                    </div>
                ))}


                  {/* TOTAL BAR */}
            <div
                className="s1-fbt-total-bar"
            >
                <div className="s1-fbt-total-left">
                    <span className="s1-total-label" style={{
                        color:settings?.bundel_cnt_clr || undefined
                    }}>
                        {__("3 items selected:", "store-one")}
                    </span>

                    <div className="s1-total-price" style={{
                        color: settings?.prd_prc_clr
                    }}>
                        <strong>$184.00</strong>
                        <del>$189.00</del>
                    </div>
                </div>

                <button
                    className="s1-fbt-add-btn"
                    style={{
                        background: settings?.bundel_btn_bg,
                        color: settings?.bundel_btn_txt,
                    }}
                >
                    {__("Add All to Cart", "store-one")}
                </button>
            </div>
            </div>


            

          
        </section>
    );
};

export default Style3;
