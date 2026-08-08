
<?php
/**
 * Cart Body.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}
$coupon_posts = get_posts(
    array(
        'posts_per_page' => 1,
        'post_type'      => 'shop_coupon',
        'post_status'    => 'publish',
        'fields'         => 'ids',
    )
);

if (! empty($coupon_posts)) :
    ?>

<div class="s1-cart-coupon">
	<button
        type="button"
        class="s1-coupon-toggle"
        aria-expanded="false"
    >
        <span><?php esc_html_e('Coupons', 'th-store-one'); ?></span>

        <span class="s1-coupon-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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

    <form class="s1-coupon-form">

        <input
            type="text"
            name="coupon_code"
            class="s1-coupon-input"
            placeholder="<?php esc_attr_e('Coupon code', 'th-store-one'); ?>"
        >

        <button type="submit" class="s1-coupon-btn">
            <?php esc_html_e('Apply', 'th-store-one'); ?>
        </button>

    </form>

    <?php


    if (!empty($coupon_posts)) :
        ?>

<div class="s1-coupon-slider">

    <div class="swiper s1-coupon-swiper">

        <div class="swiper-wrapper">

            <?php foreach ($coupon_posts as $coupon_post) :

                $coupon = new WC_Coupon($coupon_post->post_title);

                $code = $coupon->get_code();

                $added = WC()->cart && WC()->cart->has_discount($code);
                ?>

            <div class="swiper-slide">

                <div class="s1-coupon-card <?php echo $added ? 'is-applied' : ''; ?>">

    <div class="s1-coupon-left">

        <div class="s1-coupon-code">
            <?php echo esc_html($code); ?>
        </div>

        <?php if ($coupon->get_description()) : ?>

            <div class="s1-coupon-desc">
                <?php echo esc_html($coupon->get_description()); ?>
            </div>

        <?php endif; ?>

    </div>

    <button
        type="button"
        class="s1-apply-coupon <?php echo $added ? 'is-applied' : ''; ?>"
        data-coupon="<?php echo esc_attr($code); ?>"
        <?php disabled($added); ?>
    >
        <?php echo $added ? __('Applied', 'th-store-one') : __('Apply', 'th-store-one'); ?>
    </button>

</div>

            </div>

            <?php endforeach; ?>

        </div>

        <div class="swiper-pagination"></div>

    </div>

</div>

<?php endif; ?>

    <?php
    $coupons = WC()->cart ? WC()->cart->get_coupons() : array();

    if (! empty($coupons)) :
        ?>

        <ul class="s1-applied-coupons">

            <?php foreach ($coupons as $code => $coupon) : ?>

                <li>

                    <span><?php echo esc_html($code); ?></span>

                    <button
                        type="button"
                        class="s1-remove-coupon"
                        data-coupon="<?php echo esc_attr($code); ?>"
                    >
                        ×
                    </button>

                </li>

            <?php endforeach; ?>

        </ul>

    <?php endif; ?>

</div>
</div>
<?php endif;?>