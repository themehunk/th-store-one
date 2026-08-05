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

$show_icon = ! empty($settings['taiowc_shipping_show_icon']);
?>

<div class="s1-shipping-progress">

	<div class="s1-progress-wrap">

		<div class="s1-progress-track">

			<div
				class="s1-progress-fill"
				style="width:<?php echo esc_attr($percentage); ?>%;"
			></div>

		</div>

		<?php if ($show_icon) : ?>

			<div
				class="s1-progress-icon"
				style="left:<?php echo esc_attr($truck_position); ?>%;"
			>

				🚚

			</div>

		<?php endif; ?>

	</div>

	<p class="s1-shipping-text">

		<?php
        if ($remaining > 0) :

            printf(

                /* translators: %s amount */

                esc_html__('Spend %s more for FREE shipping.', 'th-store-one'),
                '<strong class="s1-shipping-amount">' .
                wp_kses_post(wc_price($remaining)) .
                '</strong>'
            );
        else :

            esc_html_e(
                'Congratulations! You have unlocked FREE shipping.',
                'th-store-one'
            );

        endif;
?>

	</p>

</div>