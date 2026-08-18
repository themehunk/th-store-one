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

$show_cart_button = ! empty(
    $settings['taiowc_cart_pan_cart_shw']
);

$empty_cart_text = ! empty($settings['taiowc_empty_cart_txt'])
    ? $settings['taiowc_empty_cart_txt']
    : __('Continue Shopping', 'th-store-one');

$empty_cart_url = ! empty($settings['taiowc_empty_cart_url'])
    ? $settings['taiowc_empty_cart_url']
    : wc_get_page_permalink('shop');
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

	<?php if ($show_cart_button) : ?>

    <a
        class="button s1-return-shop"
        href="<?php echo esc_url($empty_cart_url); ?>"
    >
        <?php echo esc_html($empty_cart_text); ?>
    </a>

<?php endif; ?>

</div>