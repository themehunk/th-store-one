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

        foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {

            include TH_STORE_ONE_PLUGIN_DIR .
                'includes/modules/cart/templates/partials/items.php';
        }

    } else {

        do_action('storeone_cart_empty', $settings);
    }

?>

