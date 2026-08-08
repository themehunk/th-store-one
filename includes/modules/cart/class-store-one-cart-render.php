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

        public function store_one_cart_add_to_cart_url($product)
        {
            $quantity = 1;

            $html = sprintf(
                '<a href="%s"
            rel="nofollow"
            data-product_id="%s"
            data-product_sku="%s"
            data-quantity="%s"
            class="button th-button s1-ai-add-to-cart">
            <span class="dashicons dashicons-plus-alt2"></span>
        </a>',
                esc_url($product->add_to_cart_url()),
                esc_attr($product->get_id()),
                esc_attr($product->get_sku()),
                esc_attr($quantity)
            );

            return $html;
        }
    }
}
