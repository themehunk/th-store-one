<?php
/**
 * Cart Fragments.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Th_Store_One_Cart_Fragments')) {

    class Th_Store_One_Cart_Fragments
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
         * @param array $settings Module settings.
         */
        public function __construct($settings)
        {

            $this->settings = $settings;

            $this->render = new Th_Store_One_Cart_Render($settings);

            add_filter(
                'woocommerce_add_to_cart_fragments',
                array( $this, 'refresh_fragments' )
            );

            add_action(
                'wc_ajax_storeone_refresh_cart',
                array( $this, 'refresh_cart' )
            );
        }

        public static function get_fragments($settings = array())
        {

            $self = new self($settings);

            return $self->refresh_fragments(array());
        }

        /**
         * Ajax refresh.
         *
         * @return void
         */
        public function refresh_cart()
        {

            WC_AJAX::get_refreshed_fragments();
        }

        /**
         * Refresh fragments.
         *
         * @param array $fragments Fragments.
         *
         * @return array
         */
        public function refresh_fragments($fragments)
        {
            if (! WC()->cart) {
                return $fragments;
            }

            /*
             * Recalculate cart.
             */
            WC()->cart->calculate_shipping();
            WC()->cart->calculate_totals();


            /*
 * Cart Count
 */
            ob_start();

            $cart_count = WC()->cart->get_cart_contents_count();
            ?>

<span class="s1-menu-cart-count-wrapper">

    <?php if ($cart_count > 0) : ?>

        <span class="s1-menu-cart-count">
            <?php echo absint($cart_count); ?>
        </span>

    <?php endif; ?>

</span>

<?php

            $fragments['.s1-menu-cart-count-wrapper'] = ob_get_clean();
            ?>

    <span class="s1-menu-cart-price">
        <?php echo wp_kses_post(WC()->cart->get_cart_total()); ?>
    </span>

    <?php
            $fragments['.s1-menu-cart-price'] = ob_get_clean();
            /*
             * Side Cart
             */
            ob_start();
            $this->render->render_side_cart();
            $fragments['.store-one-side-cart'] = ob_get_clean();
            /*
             * Floating Cart
             */
            ob_start();
            $this->render->render_floating_cart();
            $fragments['.store-one-floating-cart'] = ob_get_clean();
            return $fragments;
        }
    }
}
