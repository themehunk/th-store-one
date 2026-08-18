<?php
/**
 * Cart Coupon.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}


/*
 * Check if at least one coupon exists.
 *
 * Lite only controls whether the coupon
 * box/form should be available.
 */
$coupon_posts = get_posts(
    array(
        'posts_per_page' => 1,
        'post_type'      => 'shop_coupon',
        'post_status'    => 'publish',
        'fields'         => 'ids',
    )
);

if (! empty($coupon_posts)) :

    /*
     * Default Lite coupon form text.
     *
     * Pro can override these values.
     */
    $coupon_form_settings = apply_filters(
        'storeone_cart_coupon_form_settings',
        array(
            'coupon_hd' => 'Coupon',
            'placeholder_text' => 'Coupon code',
            'apply_text'       => 'Apply',
        )
    );

    $coupon_hd = $coupon_form_settings['coupon_hd']
        ?? 'Coupon';

    $placeholder_text = $coupon_form_settings['placeholder_text']
        ?? 'Coupon code';

    $apply_text = $coupon_form_settings['apply_text']
        ?? 'Apply';
    ?>

    <div class="s1-cart-coupon">

        <button
            type="button"
            class="s1-coupon-toggle"
            aria-expanded="false"
        >
            <span>
                <?php echo esc_attr($coupon_hd); ?>
            </span>

            <span class="s1-coupon-arrow">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </span>
        </button>


        <div class="s1-coupon-content">

            <!-- =========================================
                 LITE COUPON FORM
                 ========================================= -->

            <form class="s1-coupon-form">

                <input
                    type="text"
                    name="coupon_code"
                    class="s1-coupon-input"
                    placeholder="<?php echo esc_attr($placeholder_text); ?>"
                >

                <button
                    type="submit"
                    class="s1-coupon-btn"
                >
                    <?php echo esc_html($apply_text); ?>
                </button>

            </form>


            <!-- =========================================
                 PRO COUPON CONTENT
                 ========================================= -->

            <?php
            do_action(
                'storeone_cart_coupon_pro_content',
                $settings
            );
    ?>

        </div>

    </div>

<?php endif; ?>