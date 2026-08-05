<?php

/**
 * TH Store One - Cart Bootstrap
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Th_Store_One_Cart')) {

    final class Th_Store_One_Cart
    {
        /**
         * Instance
         *
         * @var self|null
         */
        private static $instance = null;

        private $settings = array();

        /**
         * Get instance.
         *
         * @return self
         */
        public static function instance()
        {

            if (null === self::$instance) {
                self::$instance = new self();
            }

            return self::$instance;
        }

        /**
         * Constructor.
         */
        public function __construct($settings = array())
        {

            $this->settings = $settings;

            $this->includes();

            $this->init_classes();
        }

        /**
         * Include required files.
         *
         * @return void
         */
        private function includes()
        {

            require_once __DIR__ . '/class-store-one-cart-assets.php';
            require_once __DIR__ . '/class-store-one-cart-shortcode.php';
            require_once __DIR__ . '/class-store-one-cart-icons.php';
            require_once __DIR__ . '/class-store-one-cart-nav-menu.php';
            require_once __DIR__ . '/class-store-one-cart-fragments.php';
            require_once __DIR__ . '/class-store-one-cart-ajax.php';
            require_once __DIR__ . '/class-store-one-cart-hooks.php';
            require_once __DIR__ . '/class-store-one-cart-render.php';
        }

        /**
         * Initialize module classes.
         *
         * @return void
         */
        private function init_classes()
        {

            new Th_Store_One_Cart_Assets($this->settings);

            new Th_Store_One_Cart_Render($this->settings);

            new Th_Store_One_Cart_Shortcode($this->settings);

            new Th_Store_One_Cart_Nav_Menu($this->settings);

            new Th_Store_One_Cart_Fragments($this->settings);

            new Th_Store_One_Cart_Ajax($this->settings);

            new Th_Store_One_Cart_Hooks($this->settings);
        }
    }

    Th_Store_One_Cart::instance();
}
