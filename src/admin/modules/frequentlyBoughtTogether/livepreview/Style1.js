import React from 'react';
import { __ } from '@wordpress/i18n';
import { getTextStyle, getRadius } from '@storeone/utils/styleHelpers';

const dummy = [
    { id: 1, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/prd1.png", name: "Premium Wool", price: "$119.00" },
    { id: 2, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/prd2.png", name: "Leather Tote", price: "$40.00" },
    // { id: 3, img: StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/th-placeholder.png", name: "Classic Silk Scarf", price: "$25.00" },
];

const Style1 = ({ settings }) => {
    return (
        <section
            className="s1-fbt-box style_1"
            style={{
                background: settings?.bundel_bg_clr || undefined,
                borderRadius: getRadius(settings?.border_radius),
            }}
        >
            <h2
                className="s1-fbt-title"
                style={getTextStyle(settings?.bundel_title_clr)}
            >
                {settings?.title || __("Frequently Bought Together", "store-one")}
            </h2>

            <div className="s1-fbt-content-wrap">

                {/* PRODUCTS ROW */}
                <div className="s1-fbt-cards-row">

                    {dummy.map((p, i) => (
                        <React.Fragment key={p.id}>

                            {/* CARD HOLDER */}
                            <div className="s1-fbt-card-holder">

                                {/* CHECKBOX */}
                                {/* CHECKBOX */}
<label
    className={`s1-fbt-check-wrap ${i === 0 ? 'is-checked' : 'is-unchecked'}`}
>
    <input
        type="checkbox"
        checked={i === 0}
        readOnly
    />

    <span
        className="s1-fbt-check-ui"
        style={{
            background: i === 0
                ? settings?.bundel_chk_bg_clr || "#111"
                : "#fff",
            color: settings?.bundel_chk_clr || "#fff",
        }}
    >
        {i === 0 && (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20 6 9 17l-5-5" />
            </svg>
        )}
    </span>
</label>

                                {/* CARD */}
                                <div className="s1-fbt-card">
                                    <div className="s1-fbt-image">
                                        <img src={p.img} alt={p.name} />
                                    </div>

                                    <div className="s1-fbt-card-title" style={{
                                        color: settings?.prd_tle_clr || undefined
                                    }}>
                                        {p.name}
                                    </div>

                                    <div className="s1-fbt-card-price" style={{
                                        color: settings?.prd_prc_clr || undefined
                                    }}>
                                        {p.price}
                                    </div>
                                </div>

                            </div>

                            {/* PLUS BETWEEN CARDS */}
                            {i < dummy.length - 1 && (
                                <div className="s1-fbt-plus-wrap">
                                <span
                                    className="s1-fbt-plus-floating"
                                    style={{ background: settings?.bundel_plus_bg_clr || "#111", color: settings?.bundel_plus_clr || "#fff" }}
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus text-white" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>

                                </span>
                                </div>
                            )}

                        </React.Fragment>
                    ))}

                </div>

                {/* SUMMARY */}
                <div className="s1-fbt-summary"  style={{
                                        background: settings?.bundel_cnt_bg || undefined,
                                        color: settings?.bundel_cnt_clr || undefined
                                    }}>
                    <div className="s1-fbt-footer-wrap-1">
                        <div className="s1-fbt-bundle-wrap">
                        <div className="s1-fbt-summary-label">
                            {__("Bundle Total:", "store-one")}
                        </div>
                        <div className="s1-fbt-summary-price" style={{
                                        color: settings?.prd_prc_clr || undefined
                                    }}>
                            $184.00 
                        </div>
                        <span className="s1-fbt-summary-count">
                            3 items selected
                        </span>
                        </div>
                        <div className="s1-fbt-bundle-list-wrap">
                           <ul className="s1-fbt-checklist">
                                        {dummy.map((p) => (
                                            <li key={p.id}>
                                                
                                                <div className="s1-title-wrap">
                                                <span className="s1-name" style={{
                                        color: settings?.prd_tle_clr || undefined
                                    }}>{p.name}</span>
                                                <span className="s1-price" style={{
                                        color: settings?.prd_prc_clr || undefined
                                    }}>{p.price}</span>
                                                </div>
                                            </li>
                                        ))}
                        </ul>
                        </div>
                    </div>
                    <div className="s1-fbt-footer-wrap-2">

                    <button
                        className="s1-fbt-add-btn"
                        style={{
                            background: settings?.bundel_btn_bg || "#111",
                            color: settings?.bundel_btn_txt || "#fff",
                        }}
                    >
                        {__("Add All to Cart", "store-one")}
                    </button>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Style1;