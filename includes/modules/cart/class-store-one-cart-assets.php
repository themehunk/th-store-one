<?php

/**
 * Cart Assets.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Th_Store_One_Cart_Assets')) {

    class Th_Store_One_Cart_Assets
    {
        /**
         * Module settings.
         *
         * @var array
         */
        private $settings = array();

        /**
         * Constructor.
         *
         * @param array $settings Module settings.
         */
        public function __construct($settings)
        {

            $this->settings = $settings;

            add_action(
                'wp_enqueue_scripts',
                array( $this, 'enqueue_assets' )
            );
        }

        /**
         * Enqueue frontend assets.
         *
         * @return void
         */
        public function enqueue_assets()
        {

            if (! $this->is_enabled()) {
                return;
            }


            $this->enqueue_scripts();
        }


        /**
         * Enqueue scripts.
         *
         * @return void
         */
        private function enqueue_scripts()
        {

            wp_localize_script(
                'th-store-one-frontend',
                'storeOneCart',
                $this->get_localize_data()
            );
        }

        /**
         * Localize frontend data.
         *
         * @return array
         */
        private function get_localize_data()
        {

            return array(

                'ajaxUrl'          => admin_url('admin-ajax.php'),
                'wcAjaxUrl'       => WC_AJAX::get_endpoint('%%endpoint%%'),
                'nonce'             => wp_create_nonce('store-one-cart'),

                'cartOpen'         => $this->get_setting(
                    'taiowc_cart_open',
                    'simple-open'
                ),

                'cartVisibility'   => (bool) $this->get_setting(
                    'taiowc_cart_visibility',
                    true
                ),

                'isCart'           => is_cart(),

                'isCheckout'       => is_checkout(),

                'cartUrl'          => wc_get_cart_url(),

                'checkoutUrl'      => wc_get_checkout_url(),

                'currencySymbol'   => get_woocommerce_currency_symbol(),

                'is_logged_in'      => is_user_logged_in(),
            );
        }

        /**
         * Check module enabled.
         *
         * @return bool
         */
        private function is_enabled()
        {

            return (bool) $this->get_setting(
                'taiowc_show_cart',
                false
            );
        }

        /**
         * Get setting.
         *
         * @param string $key     Setting key.
         * @param mixed  $default Default value.
         *
         * @return mixed
         */
        private function get_setting($key, $default = '')
        {

            return $this->settings[ $key ] ?? $default;
        }
    }
}
