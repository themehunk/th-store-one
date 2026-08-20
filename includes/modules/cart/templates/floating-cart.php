<?php
/**
 * Floating Cart Template.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}


/**
 * Get background/color value.
 *
 * Supports string and background-control array values.
 */
$s1_get_color = static function ($value) {

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
 * Settings
 * ========================================================= */

$show_quantity = ! empty(
    $settings['taiowc_fixed_show_quantity']
);

$cart_count = WC()->cart
    ? WC()->cart->get_cart_contents_count()
    : 0;

$position = $settings['taiowc_fixed_position']
    ?? 'fxd-right';

$horizontal = absint(
    $settings['taiowc_fixed_horizontal'] ?? 15
);

$bottom = absint(
    $settings['taiowc_fixed_bottom'] ?? 90
);


/* =========================================================
 * Floating Cart Colors
 * ========================================================= */

$fixed_bg = $s1_get_color(
    $settings['taiowc_fixed_bg'] ?? ''
);

$fixed_icon_color = $s1_get_color(
    $settings['taiowc_fixed_icon_color'] ?? ''
);

$fixed_price_color = $s1_get_color(
    $settings['taiowc_fixed_price_color'] ?? ''
);

$fixed_quantity_bg = $s1_get_color(
    $settings['taiowc_fixed_quantity_bg'] ?? ''
);

$fixed_quantity_color = $s1_get_color(
    $settings['taiowc_fixed_quantity_color'] ?? ''
);


/* =========================================================
 * CSS Variables
 * ========================================================= */

$floating_style = '';

if ($fixed_bg) {
    $floating_style .= '--s1-floating-bg:' .
        esc_attr($fixed_bg) . ';';
}

if ($fixed_icon_color) {
    $floating_style .= '--s1-floating-icon:' .
        esc_attr($fixed_icon_color) . ';';
}

if ($fixed_price_color) {
    $floating_style .= '--s1-floating-price:' .
        esc_attr($fixed_price_color) . ';';
}

if ($fixed_quantity_bg) {
    $floating_style .= '--s1-floating-quantity-bg:' .
        esc_attr($fixed_quantity_bg) . ';';
}

if ($fixed_quantity_color) {
    $floating_style .= '--s1-floating-quantity-color:' .
        esc_attr($fixed_quantity_color) . ';';
}
/* =========================================================
 * Floating Cart Position
 * ========================================================= */
$floating_style_pos = "";
if ('fxd-left' === $position) {
    $floating_style_pos  .= 'left:' .
        $horizontal .
        'px;';
} else {
    $floating_style_pos  .= 'right:' .
        $horizontal .
        'px;';
}

$floating_style_pos  .= 'bottom:' .
    $bottom .
    'px;';

/* =========================================================
 * Cart Visibility
 * ========================================================= */

$show_when_empty = ! empty(
    $settings['taiowc_cart_visibility']
);

$hidden = '';

if (! $show_when_empty && 0 === $cart_count) {
    $hidden = 'storeone-hidden';
}


/* =========================================================
 * Classes
 * ========================================================= */

$classes = array(
    's1-floating-cart',
    'storeone-floating-cart',
    'storeone-cart-toggle',
);

$classes[] = ('fxd-left' === $position)
    ? 's1-floating-left'
    : 's1-floating-right';
$mobile_settings = $this->mobile_settings;
?>

<div
    class="store-one-floating-cart store-one-cart <?php echo esc_attr($hidden); ?>"
    style="<?php echo esc_attr($floating_style); ?>" data-mobile-disable="<?php echo ! empty(
        $mobile_settings['taiowcp_dsble_fxd_crt']
    ) ? 'true' : 'false'; ?>"
    data-mobile-disable-quantity="<?php echo ! empty(
        $mobile_settings['taiowcp_dsble_fxd_crt_qnty']
    ) ? 'true' : 'false'; ?>"
    data-mobile-position="<?php echo esc_attr(
        $mobile_settings['taiowcp_fxd_cart_mobile_position']
    ); ?>"
>

    <div
        class="<?php echo esc_attr(implode(' ', $classes)); ?>"
        data-cart-type="floating"
        role="button"
        tabindex="0"
        aria-label="<?php esc_attr_e('Open Cart', 'th-store-one'); ?>"
        style="<?php echo esc_attr($floating_style_pos); ?>" 
    >

        <div class="s1-preview-cart-icon storeone-cart-target">

            <?php
            Th_Store_One_Cart_Icons::render($settings);
?>

        </div>

<span class="s1-floating-cart-count-wrapper">
        <?php if ($show_quantity && $cart_count > 0) : ?>

            <span class="s1-floating-cart-count">

                <?php echo absint($cart_count); ?>

            </span>

        <?php endif; ?>
        </div>

    </div>

</div>