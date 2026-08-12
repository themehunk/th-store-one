<?php
/**
 * Shipping Progress.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}



$goal = (float) ($settings['taiowc_free_shipping_amount'] ?? 1000);

$subtotal = WC()->cart ? (float) WC()->cart->get_subtotal() : 0;

$remaining = max(0, $goal - $subtotal);

$percentage = 0;

if ($goal > 0) {
    $percentage = min(100, round(($subtotal / $goal) * 100));
}

$truck_position = min(95, max(5, $percentage));


?>
<div class="s1-shipping-bar">

    <div class="s1-progress-wrap">

       <div class="s1-progress-track">

    <div
        class="s1-progress-fill"
        style="width:<?php echo esc_attr($percentage); ?>%;"
    ></div>

    <div
        class="s1-progress-icon"
        style="left:<?php echo esc_attr($truck_position); ?>%;"
    >
        🚚
    </div>

</div>

        <p class="s1-shipping-text">

            <?php if ($remaining > 0) : ?>

                <?php
                printf(
                    /* translators: %s amount */
                    esc_html__('Spend %s more for free shipping.', 'th-store-one'),
                    '<strong class="s1-shipping-amount">' .
                    wp_kses_post(wc_price($remaining)) .
                    '</strong>'
                );
                ?>

            <?php else : ?>

                <?php esc_html_e(
                    'Congratulations! You have unlocked free shipping.',
                    'th-store-one'
                ); ?>

            <?php endif; ?>

        </p>

    </div>

</div>