<?php
/**
 * Coupon Form.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! wc_coupons_enabled()) {
    return;
}
?>

<div class="s1-cart-coupon">

	<form
		class="s1-coupon-form"
		method="post"
	>

		<input
			type="text"
			name="coupon_code"
			class="s1-coupon-input"
			placeholder="<?php esc_attr_e('Coupon code', 'th-store-one'); ?>"
		/>

		<button
			type="submit"
			class="button s1-coupon-btn"
		>

			<?php esc_html_e('Apply', 'th-store-one'); ?>

		</button>

	</form>

</div>