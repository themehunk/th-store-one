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
// color
$menu_cart_bg = $settings['taiowc_bg_color'] ?? '';
$menu_price_color = $settings['taiowc_price_color'] ?? '';
$menu_quantity_bg = $settings['taiowc_quantity_bg'] ?? '';
$menu_quantity_color = $settings['taiowc_quantity_color'] ?? '';
$menu_icon_color = $settings['taiowc_icon_color'] ?? '';

$menu_cart_style = '';

if (! empty($menu_cart_bg)) {
    $menu_cart_style .= '--s1-menu-cart-bg:' . esc_attr($menu_cart_bg) . ';';
}

if (! empty($menu_price_color)) {
    $menu_cart_style .= '--s1-menu-cart-price:' . esc_attr($menu_price_color) . ';';
}

if (! empty($menu_quantity_bg)) {
    $menu_cart_style .= '--s1-menu-cart-quantity-bg:' . esc_attr($menu_quantity_bg) . ';';
}

if (! empty($menu_quantity_color)) {
    $menu_cart_style .= '--s1-menu-cart-quantity-color:' . esc_attr($menu_quantity_color) . ';';
}

if (! empty($menu_icon_color)) {
    $menu_cart_style .= '--s1-menu-cart-icon:' . esc_attr($menu_icon_color) . ';';
}
$mobile_settings = $this->mobile_settings;
?>
<div class="store-one-cart">
<div
	class="s1-menu-cart storeone-menu-cart"
	data-cart-type="menu"
	data-mobile-disable="<?php echo ! empty(
	    $mobile_settings['taiowcp_dsble_mnu_crt']
	) ? 'true' : 'false'; ?>"
    data-mobile-disable-quantity="<?php echo ! empty(
        $mobile_settings['taiowcp_dsble_mnu_crt_qnty']
    ) ? 'true' : 'false'; ?>"
    data-mobile-disable-price="<?php echo ! empty(
        $mobile_settings['taiowcp_dsble_mnu_crt_price']
    ) ? 'true' : 'false'; ?>"
>

	<button
		type="button"
		class="s1-menu-cart-toggle storeone-cart-toggle"
		aria-label="<?php esc_attr_e('Open Cart', 'th-store-one'); ?>"
		 style="<?php echo esc_attr($menu_cart_style); ?>"
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

    <span class="s1-menu-cart-count-wrapper">

        <?php if ($cart_count > 0) : ?>

            <span class="s1-menu-cart-count">
                <?php echo absint($cart_count); ?>
            </span>

        <?php endif; ?>

    </span>

<?php endif; ?>

	</button>

</div>
		</div>