<?php
/**
 * Side Cart Template.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

$cart_effect = $settings['taiowc_cart_effect'] ?? 'taiowc-slide-right';

$position = 'taiowc-slide-left' === $cart_effect
    ? 'position-left'
    : 'position-right';
/* =========================================================
 * Background / Color Helper
 * ========================================================= */

$get_color = static function ($value) {

    if (empty($value)) {
        return '';
    }

    if (is_string($value)) {
        return $value;
    }

    if (is_array($value)) {
        return (
            $value['gradient']
            ?? $value['background']
            ?? $value['color']
            ?? $value['value']
            ?? ''
        );
    }

    return '';
};
/* =========================================================
 * Header
 * ========================================================= */

$header_bg = $get_color(
    $settings['taiowc_cart_pan_hdr_bg_clr'] ?? ''
);

$header_heading = $get_color(
    $settings['taiowc_cart_pan_hd_clr'] ?? ''
);

$header_icon = $get_color(
    $settings['taiowc_cart_pan_icon_clr'] ?? ''
);

$header_close = $get_color(
    $settings['taiowc_cart_pan_cls_clr'] ?? ''
);
/* =========================================================
 * Cart Content
 * ========================================================= */

$cart_bg = $get_color(
    $settings['taiowc_cart_pan_bg_clr'] ?? ''
);

$product_bg = $get_color(
    $settings['taiowc_cart_pan_prd_bg_clr'] ?? ''
);

$product_title = $get_color(
    $settings['taiowc_cart_pan_prd_tle_clr'] ?? ''
);

$product_text = $get_color(
    $settings['taiowc_cart_pan_prd_txt_clr'] ?? ''
);

$product_border = $get_color(
    $settings['taiowc_cart_pan_prd_brd_clr'] ?? ''
);

$product_rating = $get_color(
    $settings['taiowc_cart_pan_prd_rat_clr'] ?? ''
);

$product_delete = $get_color(
    $settings['taiowc_cart_pan_prd_dlt_clr'] ?? ''
);
/* =========================================================
 * Order Area
 * ========================================================= */

$order_bg = $get_color(
    $settings['taiowc_cart_pan_pay_bg_clr'] ?? ''
);

$order_text = $get_color(
    $settings['taiowc_cart_pan_pay_txt_clr'] ?? ''
);

$order_heading = $get_color(
    $settings['taiowc_cart_pan_pay_hd_clr'] ?? ''
);

$order_link = $get_color(
    $settings['taiowc_cart_pan_pay_link_clr'] ?? ''
);

$checkout_bg = $get_color(
    $settings['taiowc_cart_pan_pay_btn_bg_clr'] ?? ''
);

$checkout_text = $get_color(
    $settings['taiowc_cart_pan_pay_btn_clr'] ?? ''
);

$cart_button_bg = $get_color(
    $settings['taiowc_cart_pan_pay_cart_bg_clr'] ?? ''
);

$cart_button_text = $get_color(
    $settings['taiowc_cart_pan_pay_cart_clr'] ?? ''
);


/* =========================================================
 * Shipping
 * ========================================================= */

$shipping_bg = $get_color(
    $settings['taiowc_shipping_bg'] ?? ''
);

$shipping_track = $get_color(
    $settings['taiowc_shipping_track'] ?? ''
);

$shipping_fill = $get_color(
    $settings['taiowc_shipping_fill'] ?? ''
);

$shipping_icon_bg = $get_color(
    $settings['taiowc_shipping_icon_bg'] ?? ''
);

$shipping_icon_border = $get_color(
    $settings['taiowc_shipping_icon_border'] ?? ''
);

$shipping_text = $get_color(
    $settings['taiowc_shipping_text'] ?? ''
);

$shipping_amount = $get_color(
    $settings['taiowc_shipping_amount'] ?? ''
);


/* =========================================================
 * CSS Variables
 * ========================================================= */

$style = '';

$variables = array(
    '--s1-cart-header-bg'       => $header_bg,
    '--s1-cart-header-heading'  => $header_heading,
    '--s1-cart-header-icon'     => $header_icon,
    '--s1-cart-header-close'    => $header_close,

    '--s1-cart-bg'              => $cart_bg,

    '--s1-product-bg'           => $product_bg,
    '--s1-product-title'        => $product_title,
    '--s1-product-text'         => $product_text,
    '--s1-product-border'       => $product_border,
    '--s1-product-rating'       => $product_rating,
    '--s1-product-delete'       => $product_delete,

    '--s1-order-bg'             => $order_bg,
    '--s1-order-text'           => $order_text,
    '--s1-order-heading'        => $order_heading,
    '--s1-order-link'           => $order_link,

    '--s1-checkout-bg'          => $checkout_bg,
    '--s1-checkout-text'        => $checkout_text,

    '--s1-cart-button-bg'       => $cart_button_bg,
    '--s1-cart-button-text'     => $cart_button_text,

    '--s1-shipping-bg'          => $shipping_bg,
    '--s1-shipping-track'       => $shipping_track,
    '--s1-shipping-fill'        => $shipping_fill,
    '--s1-shipping-icon-bg'     => $shipping_icon_bg,
    '--s1-shipping-icon-border' => $shipping_icon_border,
    '--s1-shipping-text'        => $shipping_text,
    '--s1-shipping-amount'      => $shipping_amount,
);

foreach ($variables as $property => $value) {

    if ($value !== '') {
        $style .= $property . ':' . esc_attr($value) . ';';
    }
}
$mobile_settings = $this->mobile_settings;
$mobile_cart_effect = $mobile_settings[
    'taiowcp_cart_mobile_effect'
] ?? 'global';
?>
<div class="store-one-side-cart store-one-cart" data-cart-effect="<?php echo esc_attr($cart_effect); ?>" 
    data-mobile-disable-shipping="<?php echo ! empty(
        $mobile_settings['taiowcp_dsble_mob_ship']
    ) ? 'true' : 'false'; ?>"
    data-mobile-disable-coupon="<?php echo ! empty(
        $mobile_settings['taiowcp_dsble_mob_coupan']
    ) ? 'true' : 'false'; ?>"

    data-mobile-cart-effect="<?php echo esc_attr($mobile_cart_effect); ?>"
    >

<div class="s1-side-cart-wrapper">

	<div class="s1-side-cart-overlay"></div>

	<div
		class="s1-side-cart-preview <?php echo esc_attr($position); ?>"
		data-cart-panel style="<?php echo esc_attr($style); ?>"
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
        if (! empty($settings['taiowc_show_shipping_bar'])) {

            do_action('storeone_cart_shipping_bar', $settings);

        }
?>

		<div class="s1-side-cart-body">
			<?php
    if (WC()->cart && ! WC()->cart->is_empty()) {

        do_action('storeone_cart_items', $settings);
        /**
         * AI Suggestion
         */
        if (! empty($settings['taiowc_show_ai_suggestion'])) {
            do_action('storeone_cart_ai_suggestion', $settings);
        }

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