import './live-style.css';
import { __ } from '@wordpress/i18n';

const PreviewSmartOffers = ({ settings = {} }) => {

    const {
        x_qty = 2,
        y_qty = 1,

        reward_type = 'free_product',
        discount_value = 20,

        offer_heading = 'Buy {x} Get {y}',
        offer_subheading = 'Limited time offer',

        show_product_image = true,
        show_product_title = true,
        show_discount_badge = true,

        badge_text = 'BEST DEAL',

        message = 'Buy {remaining} more to unlock offer',

        show_progress = true,

        heading_color = '#111827',
        text_color = '#6b7280',
        price_color = '#111827',

        badge_bg = 'linear-gradient(135deg, #22c55e, #16a34a);',
        badge_color = '#ffffff',

        progress_fill = '#22c55e',

        message_color = '#6b7280',

        card_bg = 'linear-gradient(180deg, #f7fff9 0%, #ffffff 100%);',
        card_active_bg = 'linear-gradient(180deg, #f7fff9 0%, #ffffff 100%);',

        card_padding = 18,

        card_border = {},
    } = settings;

    /* ================= HEADING ================= */

    let heading = offer_heading;

    heading = heading
        .replace('{x}', x_qty)
        .replace('{y}', y_qty)
        .replace('{discount}', discount_value)
        .replace('{product}', 'Hair Claw');

    /* ================= BORDER ================= */

    const borderWidth = card_border?.width || {};

    const borderRadius = card_border?.radius || {};

    const borderStyle = card_border?.style || 'solid';

    const borderColor = card_border?.color || '#e5e7eb';

    return (

        <div className="th-offer-wrapper">

            <div
                className="th-offer-card"
                style={{

                    /* FRONTEND VARIABLES */

                    '--th-card-bg': card_bg,
                    '--th-card-active-bg': card_active_bg,

                    background: card_bg,

                    borderStyle: borderStyle,
                    borderColor: borderColor,

                    borderTopWidth:
                        borderWidth?.top || '1px',

                    borderRightWidth:
                        borderWidth?.right || '1px',

                    borderBottomWidth:
                        borderWidth?.bottom || '1px',

                    borderLeftWidth:
                        borderWidth?.left || '1px',

                    borderTopLeftRadius:
                        borderRadius?.top || '16px',

                    borderTopRightRadius:
                        borderRadius?.right || '16px',

                    borderBottomRightRadius:
                        borderRadius?.bottom || '16px',

                    borderBottomLeftRadius:
                        borderRadius?.left || '16px',
                }}
            >

                <label>

                    <input
                        type="radio"
                        checked={true}
                        readOnly
                    />

                    <div
                        className="th-card-inner"
                        style={{

                            paddingTop:
                                `${card_padding}px`,

                            paddingRight:
                                `${card_padding}px`,

                            paddingBottom:
                                `${card_padding}px`,

                            paddingLeft:
                                `${card_padding + 18}px`,
                        }}
                    >

                        {/* BADGE */}

                        {show_discount_badge && (
                            <div
                                className="th-offr-badge"
                                style={{
                                    background: badge_bg,
                                    color: badge_color,
                                }}
                            >
                                {badge_text}
                            </div>
                        )}

                        {/* ROW */}

                        <div className="th-row">

                            {/* IMAGE */}

                            {show_product_image && (
                                <div className="th-left">

                                    <img
                                        src="https://dummyimage.com/100x100/e5e7eb/111827"
                                        alt=""
                                    />

                                </div>
                            )}

                            {/* CONTENT */}

                            <div className="th-mid">

                                <strong
                                    className="th-offer-heading"
                                    style={{
                                        color: heading_color,
                                    }}
                                >
                                    {heading}
                                </strong>

                                {show_product_title && (
                                    <div
                                        className="th-product-title"
                                        style={{
                                            color: text_color,
                                        }}
                                    >
                                        Premium Hair Claw
                                    </div>
                                )}

                                {!!offer_subheading && (
                                    <div
                                        className="th-offer-subheading"
                                        style={{
                                            color: text_color,
                                        }}
                                    >
                                        {offer_subheading}
                                    </div>
                                )}

                                <div className="th-offer-meta">

                                    {reward_type ===
                                        'free_product' && (
                                        __('Free Product Offer', 'th-store-one')
                                    )}

                                    {reward_type ===
                                        'discount_percent' && (
                                        `${discount_value}% OFF`
                                    )}

                                    {reward_type ===
                                        'discount_fixed' && (
                                        `$${discount_value} OFF`
                                    )}

                                </div>

                            </div>

                            {/* PRICE */}

                            <div className="th-right">

                                <span className="th-price">

                                    <del>
                                        $120
                                    </del>

                                    <strong
                                        style={{
                                            color: price_color,
                                        }}
                                    >
                                        $90
                                    </strong>

                                </span>

                            </div>

                        </div>

                        {/* PROGRESS */}

                        {show_progress && (
                            <div className="th-progress">

                                <div
                                    className="th-bar"
                                    style={{
                                        width: '70%',
                                        background:
                                            progress_fill,
                                    }}
                                />

                            </div>
                        )}

                        {/* MESSAGE */}

                        <div
                            className="th-msg"
                            style={{
                                color: message_color,
                            }}
                        >
                            {message.replace(
                                '{remaining}',
                                '1'
                            )}
                        </div>

                    </div>

                </label>

            </div>

        </div>
    );
};

export default PreviewSmartOffers;