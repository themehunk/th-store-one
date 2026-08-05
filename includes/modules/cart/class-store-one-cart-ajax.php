<?php

/**
 * Cart Ajax.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Th_Store_One_Cart_Ajax')) {

    class Th_Store_One_Cart_Ajax
    {
        /**
         * Settings.
         *
         * @var array
         */
        private $settings = array();

        /**
         * Constructor.
         *
         * @param array $settings Module settings.
         */
        public function __construct($settings = array())
        {

            $this->settings = $settings;

            $this->hooks();
        }

        /**
         * Register hooks.
         *
         * @return void
         */
        private function hooks()
        {

            add_action(
                'wp_ajax_storeone_cart_update_quantity',
                array( $this, 'update_quantity' )
            );

            add_action(
                'wp_ajax_nopriv_storeone_cart_update_quantity',
                array( $this, 'update_quantity' )
            );

            add_action(
                'wp_ajax_storeone_cart_remove_item',
                array( $this, 'remove_item' )
            );

            add_action(
                'wp_ajax_nopriv_storeone_cart_remove_item',
                array( $this, 'remove_item' )
            );

            add_action(
                'wp_ajax_storeone_cart_apply_coupon',
                array( $this, 'apply_coupon' )
            );

            add_action(
                'wp_ajax_nopriv_storeone_cart_apply_coupon',
                array( $this, 'apply_coupon' )
            );

            add_action(
                'wp_ajax_storeone_cart_remove_coupon',
                array( $this, 'remove_coupon' )
            );

            add_action(
                'wp_ajax_nopriv_storeone_cart_remove_coupon',
                array( $this, 'remove_coupon' )
            );

            add_action(
                'wp_ajax_storeone_cart_refresh',
                array( $this, 'refresh_cart' )
            );

            add_action(
                'wp_ajax_nopriv_storeone_cart_refresh',
                array( $this, 'refresh_cart' )
            );
        }

        /**
         * Update quantity.
         *
         * @return void
         */
        public function update_quantity()
        {

            check_ajax_referer('store-one-cart', 'nonce');

            $key      = sanitize_text_field(wp_unslash($_POST['cart_key'] ?? ''));
            $quantity = absint($_POST['quantity'] ?? 1);

            if (! WC()->cart || empty($key)) {

                wp_send_json_error();

            }

            WC()->cart->set_quantity(
                $key,
                max(1, $quantity),
                true
            );

            WC()->cart->calculate_totals();

            wp_send_json_success(
                array(
        'notice'    => __('Cart updated.', 'th-store-one'),
        'type'      => 'success',
        'fragments' => apply_filters(
            'woocommerce_add_to_cart_fragments',
            array()
        ),
    )
            );
        }

        /**
         * Remove cart item.
         *
         * @return void
         */
        public function remove_item()
        {

            check_ajax_referer('store-one-cart', 'nonce');

            $key = sanitize_text_field(
                wp_unslash($_POST['cart_key'] ?? '')
            );

            if (WC()->cart) {

                WC()->cart->remove_cart_item($key);

                WC()->cart->calculate_totals();


            }

            wp_send_json_success(
                array(
        'notice'    => __('Product removed from cart.', 'th-store-one'),
        'type'      => 'success',
        'fragments' => apply_filters(
            'woocommerce_add_to_cart_fragments',
            array()
        ),
    )
            );
        }

        /**
         * Apply coupon.
         *
         * @return void
         */
        public function apply_coupon()
        {

            check_ajax_referer('store-one-cart', 'nonce');

            $coupon = wc_format_coupon_code(
                wp_unslash($_POST['coupon'] ?? '')
            );

            if (WC()->cart) {

                WC()->cart->apply_coupon($coupon);

                WC()->cart->calculate_totals();



            }

            wp_send_json_success(
                array(
        'notice'    => __('Coupon applied successfully.', 'th-store-one'),
        'type'      => 'success',
        'fragments' => apply_filters(
            'woocommerce_add_to_cart_fragments',
            array()
        ),
    )
            );
        }

        /**
         * Remove coupon.
         *
         * @return void
         */
        public function remove_coupon()
        {

            check_ajax_referer('store-one-cart', 'nonce');

            $coupon = wc_format_coupon_code(
                wp_unslash($_POST['coupon'] ?? '')
            );

            if (WC()->cart) {

                WC()->cart->remove_coupon($coupon);

                WC()->cart->calculate_totals();

                wc_add_notice(
                    __('Coupon removed.', 'th-store-one'),
                    'success'
                );

            }

            wp_send_json_success(
                array(
        'notice'    => __('Coupon removed.', 'th-store-one'),
        'type'      => 'success',
        'fragments' => apply_filters(
            'woocommerce_add_to_cart_fragments',
            array()
        ),
    )
            );
        }

        /**
         * Refresh cart.
         *
         * @return void
         */
        public function refresh_cart()
        {

            check_ajax_referer('store-one-cart', 'nonce');

            WC_AJAX::get_refreshed_fragments();
        }
    }
}
