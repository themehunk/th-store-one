<?php
/**
 * Empty Cart.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

$title = $settings['taiowc_empty_title'] ?? __('Your cart is empty', 'th-store-one');

$text = $settings['taiowc_empty_text'] ?? __('Looks like you have not added anything yet.', 'th-store-one');
?>

<div class="s1-empty-cart">

	<div class="s1-empty-cart-icon">

		<?php Th_Store_One_Cart_Icons::render($settings); ?>

	</div>

	<h3>

		<?php echo esc_html($title); ?>

	</h3>

	<p>

		<?php echo esc_html($text); ?>

	</p>

	<a
		class="button s1-return-shop"
		href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>"
	>

		<?php esc_html_e('Continue Shopping', 'th-store-one'); ?>

	</a>

</div>