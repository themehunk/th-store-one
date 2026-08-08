<?php
/**
 * Cart Body.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}
?>



	<?php

if (WC()->cart && ! WC()->cart->is_empty()) {

    $cart = WC()->cart->get_cart();

    /**
     * Cart item order.
     *
     * prd_first = Newest First
     * prd_last  = Newest Last
     */
    $cart_order = $settings['taiowc_cart_item_order'] ?? 'prd_first';

    if ('prd_first' === $cart_order) {
        $cart = array_reverse($cart, true);
    }

    foreach ($cart as $cart_item_key => $cart_item) {

        include TH_STORE_ONE_PLUGIN_DIR .
            'includes/modules/cart/templates/partials/items.php';
    }

} else {

    do_action('storeone_cart_empty', $settings);
}

?>
