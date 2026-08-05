<?php
/**
 * Menu Cart Template.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

$show_price    = ! empty($settings['taiowc_show_price']);
$show_quantity = ! empty($settings['taiowc_show_quantity']);

$cart_count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;

$cart_total = WC()->cart ? WC()->cart->get_cart_total() : '';

$icon_type = $settings['taiowc_icontype'] ?? 'icon';

$icon = $settings['taiowc_cart_icon'] ?? 'icon-1';

$image = $settings['taiowc_image_url'] ?? '';

$custom_svg = $settings['taiowc_custom_svg'] ?? '';
?>
<div class="store-one-cart">
<div
	class="s1-menu-cart storeone-menu-cart"
	data-cart-type="menu"
>

	<button
		type="button"
		class="s1-menu-cart-toggle storeone-cart-toggle"
		aria-label="<?php esc_attr_e('Open Cart', 'th-store-one'); ?>"
	>

		<span class="s1-preview-cart-icon">

			<?php Th_Store_One_Cart_Icons::render($settings); ?>
		</span>

		<?php if ($show_price) : ?>

			<span class="s1-menu-cart-price">

				<?php echo wp_kses_post($cart_total); ?>

			</span>

		<?php endif; ?>

		<?php if ($show_quantity) : ?>

			<span class="s1-menu-cart-count">

				<?php echo absint($cart_count); ?>

			</span>

		<?php endif; ?>

	</button>

</div>
		</div>