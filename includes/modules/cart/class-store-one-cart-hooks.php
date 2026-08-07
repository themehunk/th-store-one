<?php

/**
 * Cart Hooks.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Th_Store_One_Cart_Hooks')) {

    class Th_Store_One_Cart_Hooks
    {
        /**
         * Settings.
         *
         * @var array
         */
        private $settings = array();

        /**
         * Renderer.
         *
         * @var Th_Store_One_Cart_Render
         */
        private $render = null;

        /**
         * Constructor.
         *
         * @param array $settings Module settings.
         */
        public function __construct($settings = array())
        {

            $this->settings = $settings;

            $this->render = new Th_Store_One_Cart_Render($settings);

            $this->register_hooks();
        }

        /**
         * Register hooks.
         *
         * @return void
         */
        private function register_hooks()
        {

            if (! $this->is_enabled()) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Frontend Render
            |--------------------------------------------------------------------------
            */

            add_action(
                'wp_footer',
                array( $this, 'render_side_cart' ),
                20
            );

            add_action(
                'wp_footer',
                array( $this, 'render_floating_cart' ),
                21
            );

            /*
            |--------------------------------------------------------------------------
            | Side Cart Partials
            |--------------------------------------------------------------------------
            */

            add_action(
                'storeone_cart_header',
                array( $this, 'cart_header' ),
                10,
                1
            );

            add_action(
                'storeone_cart_shipping',
                array( $this, 'cart_shipping' ),
                10,
                1
            );

            add_action(
                'storeone_cart_items',
                array( $this, 'cart_items' ),
                10,
                1
            );

            add_action(
                'storeone_cart_empty',
                array( $this, 'cart_empty' ),
                10,
                1
            );

            add_action(
                'storeone_cart_coupon',
                array( $this, 'cart_coupon' ),
                10,
                1
            );

            add_action(
                'storeone_cart_total',
                array( $this, 'cart_total' ),
                10,
                1
            );

            add_action(
                'storeone_cart_footer',
                array( $this, 'cart_footer' ),
                10,
                1
            );
        }		/**
         * Header.
         *
         * @param array $settings Settings.
         *
         * @return void
         */
        public function cart_header($settings)
        {

            include TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/cart/templates/partials/header.php';
        }

        /**
         * Shipping.
         *
         * @param array $settings Settings.
         *
         * @return void
         */
        public function cart_shipping($settings)
        {

            include TH_STORE_ONE_PLUGIN_DIR .
                'includes/modules/cart/templates/partials/free-shipping.php';
        }

        /**
         * Cart Items.
         *
         * @param array $settings Settings.
         *
         * @return void
         */
        public function cart_items($settings)
        {

            include TH_STORE_ONE_PLUGIN_DIR .
                'includes/modules/cart/templates/partials/body.php';
        }

        /**
         * Empty Cart.
         *
         * @param array $settings Settings.
         *
         * @return void
         */
        public function cart_empty($settings)
        {

            include TH_STORE_ONE_PLUGIN_DIR .
                'includes/modules/cart/templates/partials/empty-cart.php';
        }

        /**
         * Coupon.
         *
         * @param array $settings Settings.
         *
         * @return void
         */
        public function cart_coupon($settings)
        {

            include TH_STORE_ONE_PLUGIN_DIR .
                'includes/modules/cart/templates/partials/coupon.php';
        }

        /**
         * Total.
         *
         * @param array $settings Settings.
         *
         * @return void
         */
        public function cart_total($settings)
        {

            include TH_STORE_ONE_PLUGIN_DIR .
                'includes/modules/cart/templates/partials/total.php';
        }

        /**
         * Footer.
         *
         * @param array $settings Settings.
         *
         * @return void
         */
        public function cart_footer($settings)
        {

            include TH_STORE_ONE_PLUGIN_DIR .
                'includes/modules/cart/templates/partials/footer.php';
        }		/**
         * Render Side Cart.
         *
         * @return void
         */
        public function render_side_cart()
        {

            if (! $this->can_render()) {
                return;
            }

            echo $this->render->render_side_cart();
        }

        /**
         * Render Floating Cart.
         *
         * @return void
         */
        public function render_floating_cart()
        {

            if (! $this->can_render()) {
                return;
            }

            echo $this->render->render_floating_cart();
        }

        /**
         * Can render.
         *
         * @return bool
         */
        private function can_render()
        {

            if (is_admin()) {
                return false;
            }

            if (is_cart() && ! empty($this->settings['taiowc_hide_cart_page'])) {
                return false;
            }

            if (is_checkout() && ! empty($this->settings['taiowc_hide_checkout_page'])) {
                return false;
            }

            if (is_shop() && ! empty($this->settings['taiowc_hide_shop_page'])) {
                return false;
            }

            if (is_account_page() && ! empty($this->settings['taiowc_hide_account_page'])) {
                return false;
            }

            if (is_product() && ! empty($this->settings['taiowc_hide_single_page'])) {
                return false;
            }

            if (is_front_page() && ! empty($this->settings['taiowc_hide_home_page'])) {
                return false;
            }

            if (is_home() && ! empty($this->settings['taiowc_hide_blog_page'])) {
                return false;
            }

            return true;
        }

        /**
         * Module enabled.
         *
         * @return bool
         */
        private function is_enabled()
        {

            return ! empty($this->settings['taiowc_show_cart']);
        }
    }
}
