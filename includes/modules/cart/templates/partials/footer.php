<?php
/**
 * Side Cart Footer.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! WC()->cart) {
    return;
}

$cart = WC()->cart;


/*
 * Lite default payment settings.
 *
 * These values are not editable in Lite.
 * Pro can override them through filter.
 */
$payment_settings = apply_filters(
    'storeone_cart_payment_settings',
    array(
        'payment_heading' => 'ORDER SUMMARY',
        'subtotal_text'   => 'Sub Total',
        'show_discount'   => true,
        'discount_text'   => 'Discount',
        'total_text'      => 'ORDER TOTAL',
    )
);


$payment_heading = $payment_settings['payment_heading'];
$subtotal_text   = $payment_settings['subtotal_text'];
$show_discount   = $payment_settings['show_discount'];
$discount_text   = $payment_settings['discount_text'];
$total_text      = $payment_settings['total_text'];
?>

<div class="s1-side-cart-footer">

    <h4 class="s1-footer-heading">
        <?php echo esc_html($payment_heading); ?>
    </h4>


    <?php
    if (! empty($settings['taiowc_show_coupon'])) {
        do_action(
            'storeone_cart_coupon',
            $settings
        );
    }

if (! empty($settings['taiowc_show_shipping'])) {
    do_action(
        'storeone_cart_shipping',
        $settings
    );
}
?>


    <div class="s1-summary-row">

        <span>
            <?php echo esc_html($subtotal_text); ?>
        </span>

        <strong>
            <?php
        echo wp_kses_post(
            WC()->cart->get_cart_subtotal()
        );
?>
        </strong>

    </div>


    <?php
    $discount_total = WC()->cart->get_discount_total();
$discount_tax   = WC()->cart->get_discount_tax();
$total_discount = $discount_total + $discount_tax;

if ($show_discount && $total_discount > 0) :
    ?>

        <div class="s1-summary-row s1-summary-discount">

            <span>
                <?php echo esc_html($discount_text); ?>
            </span>

            <strong>
                -<?php echo wp_kses_post(
                    wc_price($total_discount)
                ); ?>
            </strong>

        </div>

    <?php endif; ?>


    <div class="s1-summary-row s1-summary-total">

        <span>
            <?php echo esc_html($total_text); ?>
        </span>

        <strong>
            <?php
            echo wp_kses_post(
                wc_price(
                    WC()->cart->get_total('edit')
                )
            );
?>
        </strong>

    </div>


    <div class="s1-cart-actions">

        <a
            href="<?php echo esc_url(
                wc_get_cart_url()
            ); ?>"
            class="s1-cart-btn s1-view-cart-btn"
        >
            <?php esc_html_e(
                'View Cart',
                'th-store-one'
            ); ?>
        </a>


        <a
            href="<?php echo esc_url(
                wc_get_checkout_url()
            ); ?>"
            class="s1-cart-btn s1-checkout-btn"
        >
            <?php esc_html_e(
                'Checkout →',
                'th-store-one'
            ); ?>
        </a>

    </div>


    <?php
    /*
     * Footer copyright.
     */
    do_action(
        'storeone_cart_footer_copyright',
        $settings
    );


/*
 * Extra footer content.
 */
do_action(
    'storeone_cart_footer_after',
    $settings
);
?>

</div>