<?php
/**
 * Floating Cart Template.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

$show_quantity = ! empty($settings['taiowc_fixed_show_quantity']);

$cart_count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;

$position = $settings['taiowc_fixed_position'] ?? 'fxd-right';

$icon_type  = $settings['taiowc_icontype'] ?? 'icon';
$icon       = $settings['taiowc_cart_icon'] ?? 'icon-1';
$image      = $settings['taiowc_image_url'] ?? '';
$custom_svg = $settings['taiowc_custom_svg'] ?? '';

$classes = array(
    's1-floating-cart',
    'storeone-floating-cart',
    'storeone-cart-toggle',
);

$classes[] = ('fxd-left' === $position)
    ? 's1-floating-left'
    : 's1-floating-right';

$show_when_empty = ! empty($settings['taiowc_cart_visibility']);
$cart_count      = WC()->cart->get_cart_contents_count();

$hidden = '';

if (!$show_when_empty && $cart_count == 0) {
    $hidden = 'storeone-hidden';
}
?>
<div class="store-one-floating-cart store-one-cart <?php echo esc_attr($hidden); ?>">
<div
	class="<?php echo esc_attr(implode(' ', $classes)); ?>"
	data-cart-type="floating"
	role="button"
	tabindex="0"
	aria-label="<?php esc_attr_e('Open Cart', 'th-store-one'); ?>"
>

	<div class="s1-preview-cart-icon storeone-cart-target">
	<?php Th_Store_One_Cart_Icons::render($settings); ?>
</div>

	<?php if ($show_quantity && $cart_count > 0) : ?>

    <span class="s1-floating-cart-count">
        <?php echo absint($cart_count); ?>
    </span>

<?php endif; ?>

</div>
	</div>