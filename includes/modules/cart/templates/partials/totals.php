<?php
/**
 * Cart Totals.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! WC()->cart) {
    return;
}

$cart = WC()->cart;

$show_subtotal = ! empty($settings['taiowc_show_subtotal']);
$show_total    = ! empty($settings['taiowc_show_total']);
?>

<div class="s1-cart-summary">

	<?php if ($show_subtotal) : ?>

		<div class="s1-summary-row">

			<span>
				<?php esc_html_e('Subtotal', 'th-store-one'); ?>
			</span>

			<span>

				<?php echo wp_kses_post($cart->get_cart_subtotal()); ?>

			</span>

		</div>

	<?php endif; ?>

	<?php if (wc_tax_enabled() && ! wc_prices_include_tax()) : ?>

		<div class="s1-summary-row">

			<span>

				<?php esc_html_e('Tax', 'th-store-one'); ?>

			</span>

			<span>

				<?php echo wp_kses_post(wc_price($cart->get_taxes_total())); ?>

			</span>

		</div>

	<?php endif; ?>

	<?php if ($cart->has_discount()) : ?>

		<div class="s1-summary-row">

			<span>

				<?php esc_html_e('Discount', 'th-store-one'); ?>

			</span>

			<span>

				-<?php echo wp_kses_post(wc_price($cart->get_discount_total())); ?>

			</span>

		</div>

	<?php endif; ?>

	<?php if ($show_total) : ?>

		<div class="s1-summary-row s1-summary-total">

			<span>

				<?php esc_html_e('Total', 'th-store-one'); ?>

			</span>

			<span>

				<?php echo wp_kses_post($cart->get_total()); ?>

			</span>

		</div>

	<?php endif; ?>

</div>