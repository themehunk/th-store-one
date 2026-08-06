<?php
/**
 * Side Cart Header.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

$cart_count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
$title = ! empty($settings['taiowc_cart_hd'])
    ? $settings['taiowc_cart_hd']
    : __('Your Cart', 'th-store-one');
$show_count = ! empty($settings['taiowc_show_quantity']);
?>

<div class="s1-side-cart-header">
	<div class="s1-cart-notices"></div>
	<div class="s1-side-cart-title">

		<div class="s1-preview-cart-icon">

			<?php Th_Store_One_Cart_Icons::render($settings); ?>

		</div>

		<span class="s1-cart-title">

			<?php echo esc_html($title); ?>

		</span>

		<?php if ($show_count) : ?>

			<span class="s1-cart-count">

				<?php echo absint($cart_count); ?>

			</span>

		<?php endif; ?>

	</div>

	<button
		type="button"
		class="s1-side-cart-close"
		aria-label="<?php esc_attr_e('Close Cart', 'th-store-one'); ?>"
	>

		<svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>

	</button>

</div>