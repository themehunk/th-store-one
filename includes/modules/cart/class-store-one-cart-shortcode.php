<?php

/**
 * Cart Shortcode.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Th_Store_One_Cart_Shortcode')) {

    class Th_Store_One_Cart_Shortcode
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
        private $render;

        /**
         * Constructor.
         *
         * @param array $settings Settings.
         */
        public function __construct($settings)
        {

            $this->settings = $settings;

            $this->render = new Th_Store_One_Cart_Render($settings);

            $this->register();
        }

        /**
         * Register shortcodes.
         *
         * @return void
         */
        private function register()
        {

            // New shortcode.
            add_shortcode(
                'storeone_cart',
                array( $this, 'render_shortcode' )
            );

            // Backward compatibility.
            add_shortcode(
                'taiowc',
                array( $this, 'render_shortcode' )
            );
        }

        /**
         * Render shortcode.
         *
         * @param array $atts Attributes.
         *
         * @return string
         */
        public function render_shortcode($atts = array())
        {

            if (! class_exists('WooCommerce')) {
                return '';
            }

            if (empty($this->settings['taiowc_show_cart'])) {
                return '';
            }

            $atts = shortcode_atts(
                array(
                    'type' => '',
                ),
                (array) $atts
            );

            $type = $atts['type'];

            /*
             * Default behaviour.
             *
             * If no type supplied then use backend settings.
             */
            if (empty($type)) {

                $type = $this->get_default_type();
            }

            /*
             * Only allow supported layouts.
             */
            if (! in_array($type, array( 'menu', 'floating' ), true)) {

                $type = 'menu';
            }

            return $this->render->render($type);
        }

        /**
         * Get default type.
         *
         * @return string
         */
        private function get_default_type()
        {

            /*
             * Later we can make this configurable.
             *
             * Example:
             * menu
             * floating
             */

            if (! empty($this->settings['taiowc_fixed_position'])) {

                return 'floating';
            }

            return 'menu';
        }
    }
}
