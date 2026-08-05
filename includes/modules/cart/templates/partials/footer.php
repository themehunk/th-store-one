<?php
/**
 * Side Cart Footer.
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

$show_subtotal = $settings['taiowc_show_subtotal'] ?? true;
$show_total    = $settings['taiowc_show_total'] ?? true;
$show_cart     = $settings['taiowc_show_cart'] ?? true;
$show_checkout = $settings['taiowc_show_checkout'] ?? true;

$cart_url     = wc_get_cart_url();
$checkout_url = wc_get_checkout_url();
?>

<div class="s1-side-cart-footer">

	<h4 class="s1-footer-heading">
		<?php esc_html_e('ORDER SUMMARY', 'th-store-one'); ?>
	</h4>

	<div class="s1-summary-row">
		<span><?php esc_html_e('Subtotal', 'th-store-one'); ?></span>

		<strong><?php echo wp_kses_post(WC()->cart->get_cart_subtotal()); ?></strong>
	</div>

	<div class="s1-summary-row s1-summary-total">
		<span><?php esc_html_e('ORDER TOTAL', 'th-store-one'); ?></span>

		<strong><?php echo wp_kses_post(wc_price(WC()->cart->get_total('edit'))); ?></strong>
	</div>

	<div class="s1-cart-actions">

		<a
			href="<?php echo esc_url(wc_get_cart_url()); ?>"
			class="s1-cart-btn s1-view-cart-btn"
		>
			<?php esc_html_e('View Cart', 'th-store-one'); ?>
		</a>

		<a
			href="<?php echo esc_url(wc_get_checkout_url()); ?>"
			class="s1-cart-btn s1-checkout-btn"
		>
			<?php esc_html_e('Checkout →', 'th-store-one'); ?>
		</a>

	</div>



	<?php
    /**
     * Extra footer content.
     *
     * Coupon
     * Trust badges
     * Payment icons
     * Cross sell
     */
    do_action('storeone_cart_footer_after', $settings);
?>

</div>