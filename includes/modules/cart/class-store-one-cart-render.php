<?php

/**
 * Cart Render.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Th_Store_One_Cart_Render')) {

    class Th_Store_One_Cart_Render
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
        }

        /**
         * Render cart.
         *
         * @param string $type Cart type.
         *
         * @return string
         */
        public function render($type = 'menu-cart')
        {

            ob_start();

            switch ($type) {

                case 'floating-cart':
                    $this->get_template('floating-cart.php');
                    break;

                case 'side-cart':
                    $this->get_template('side-cart.php');
                    break;

                default:
                    $this->get_template('menu-cart.php');
                    break;
            }

            return ob_get_clean();
        }

        /**
         * Load template.
         *
         * @param string $template Template file.
         *
         * @return void
         */
        private function get_template($template)
        {

            $file = TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/cart/templates/' . $template;

            if (file_exists($file)) {

                $settings = $this->settings;

                include $file;
            }
        }

        /**
         * Get setting.
         *
         * @param string $key Setting key.
         * @param mixed  $default Default value.
         *
         * @return mixed
         */
        public function get_setting($key, $default = '')
        {

            return $this->settings[ $key ] ?? $default;
        }

        public function render_side_cart()
        {

            ob_start();

            $this->get_template('side-cart.php');

            return ob_get_clean();
        }

        public function render_floating_cart()
        {

            ob_start();

            $this->get_template('floating-cart.php');

            return ob_get_clean();
        }
    }
}
