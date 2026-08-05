<?php
/**
 * Side Cart Template.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

$position = $settings['taiowc_cart_effect'] ?? 'taiowc-slide-right';

$position = 'taiowc-slide-left' === $position
    ? 'position-left'
    : 'position-right';
?>
<div class="store-one-side-cart store-one-cart">
<div class="s1-side-cart-wrapper">

	<div class="s1-side-cart-overlay"></div>

	<div
		class="s1-side-cart-preview <?php echo esc_attr($position); ?>"
		data-cart-panel
	>

		<?php
        /**
         * Header
         */
        do_action('storeone_cart_header', $settings);
?>

		<?php
/**
 * Shipping Progress
 */
if (! empty($settings['taiowc_show_free_shipping_bar'])) {

    do_action('storeone_cart_shipping', $settings);

}
?>
<div class="s1-cart-notices"></div>
		<div class="s1-side-cart-body">
			<?php
    if (WC()->cart && ! WC()->cart->is_empty()) {

        do_action('storeone_cart_items', $settings);

    } else {

        do_action('storeone_cart_empty', $settings);

    }
?>

		</div>

		<?php

        do_action('storeone_cart_footer', $settings);

?>

	</div>

</div>
</div>