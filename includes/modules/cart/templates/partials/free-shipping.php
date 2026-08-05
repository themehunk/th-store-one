<?php
/**
 * Free Shipping Progress.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! WC()->cart) {
    return;
}

$goal = (float) ($settings['taiowc_free_shipping_amount'] ?? 1000);

if ($goal <= 0) {
    return;
}

$subtotal = (float) WC()->cart->get_subtotal();

$remaining = max(0, $goal - $subtotal);

$percentage = min(
    100,
    max(
        0,
        round(($subtotal / $goal) * 100)
    )
);

$truck_position = min(
    95,
    max(
        5,
        $percentage
    )
);

$icon = $settings['taiowc_shipping_icon'] ?? '🚚';
?>

<div class="s1-free-shipping">

	<div class="s1-progress-wrap">

		<div class="s1-progress-track">

			<div
				class="s1-progress-fill"
				style="width:<?php echo esc_attr($percentage); ?>%;"
			></div>

		</div>

		<div
			class="s1-progress-icon"
			style="left:<?php echo esc_attr($truck_position); ?>%;"
		>

			<?php echo wp_kses_post($icon); ?>

		</div>

	</div>

	<div class="s1-free-shipping-text">

		<?php if ($remaining > 0) : ?>

			<?php
            printf(
                /* translators: %s Remaining amount */
                esc_html__('Spend %s more for FREE shipping.', 'th-store-one'),
                '<strong>' . wp_kses_post(wc_price($remaining)) . '</strong>'
            );
		    ?>

		<?php else : ?>

			<strong>

				<?php esc_html_e('🎉 Congratulations!', 'th-store-one'); ?>

			</strong>

			<?php esc_html_e('You have unlocked FREE shipping.', 'th-store-one'); ?>

		<?php endif; ?>

	</div>

</div>