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

            $this->render = new Th_Store_One_Cart_Render($settings);

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

            add_action(
                'wp_ajax_storeone_cart_update_shipping',
                array( $this, 'update_shipping_method' )
            );

            add_action(
                'wp_ajax_nopriv_storeone_cart_update_shipping',
                array( $this, 'update_shipping_method' )
            );

            add_action(
                'wp_ajax_storeone_cart_calculate_shipping',
                array( $this, 'calculate_shipping' )
            );

            add_action(
                'wp_ajax_nopriv_storeone_cart_calculate_shipping',
                array( $this, 'calculate_shipping' )
            );

            add_action(
                'wp_ajax_th_store_one_ai_suggest',
                array($this, 'ai_suggest_handler')
            );

            add_action(
                'wp_ajax_nopriv_th_store_one_ai_suggest',
                array($this, 'ai_suggest_handler')
            );
            add_action(
                'wp_ajax_storeone_cart_add_item',
                array($this, 'add_item')
            );

            add_action(
                'wp_ajax_nopriv_storeone_cart_add_item',
                array($this, 'add_item')
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
 * Update shipping method.
 *
 * @return void
 */
        public function update_shipping_method()
        {

            check_ajax_referer('store-one-cart', 'nonce');

            if (! WC()->session || ! WC()->cart) {
                wp_send_json_error();
            }

            $methods = wp_unslash($_POST['shipping_method'] ?? array());

            WC()->session->set('chosen_shipping_methods', $methods);

            WC()->cart->calculate_totals();

            wp_send_json_success(
                array(
                    'notice'    => __('Shipping method updated.', 'th-store-one'),
                    'type'      => 'success',
                    'fragments' => apply_filters(
                        'woocommerce_add_to_cart_fragments',
                        array()
                    ),
                )
            );
        }
        /**
 * Calculate shipping.
 *
 * @return void
 */
        public function calculate_shipping()
        {

            check_ajax_referer('store-one-cart', 'nonce');

            if (! WC()->customer || ! WC()->cart) {
                wp_send_json_error();
            }

            WC()->customer->set_shipping_country(
                sanitize_text_field($_POST['calc_shipping_country'] ?? '')
            );

            WC()->customer->set_shipping_state(
                sanitize_text_field($_POST['calc_shipping_state'] ?? '')
            );

            WC()->customer->set_shipping_postcode(
                sanitize_text_field($_POST['calc_shipping_postcode'] ?? '')
            );

            WC()->customer->set_shipping_city(
                sanitize_text_field($_POST['calc_shipping_city'] ?? '')
            );

            WC()->customer->save();

            WC()->cart->calculate_shipping();

            WC()->cart->calculate_totals();

            wp_send_json_success(
                array(
                    'notice'    => __('Shipping updated.', 'th-store-one'),
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


        /**
         * AI Suggestion.
         *
         * @return void
         */
        public function ai_suggest_handler()
        {
            check_ajax_referer(
                'store-one-cart',
                'nonce'
            );

            if (! WC()->cart || WC()->cart->is_empty()) {

                wp_send_json_error(
                    array(
                        'message' => __(
                            'Your cart is empty.',
                            'th-store-one'
                        ),
                    )
                );
            }

            $cart        = WC()->cart->get_cart();
            $exclude_ids = array();
            $cat_ids     = array();
            $tag_ids     = array();

            /*
             * Collect cart product IDs,
             * categories and tags.
             */
            foreach ($cart as $item) {

                $pid = (int) $item['product_id'];

                $exclude_ids[] = $pid;

                $cats = wp_get_post_terms(
                    $pid,
                    'product_cat',
                    array(
                        'fields' => 'ids',
                    )
                );

                if (! is_wp_error($cats)) {
                    $cat_ids = array_merge(
                        $cat_ids,
                        $cats
                    );
                }

                $tags = wp_get_post_terms(
                    $pid,
                    'product_tag',
                    array(
                        'fields' => 'ids',
                    )
                );

                if (! is_wp_error($tags)) {
                    $tag_ids = array_merge(
                        $tag_ids,
                        $tags
                    );
                }
            }

            $cat_ids = array_unique($cat_ids);
            $tag_ids = array_unique($tag_ids);

            $suggested_ids = array();

            /*
             * Only in-stock products.
             */
            $stock_meta = array(
                array(
                    'key'     => '_stock_status',
                    'value'   => 'instock',
                    'compare' => '=',
                ),
            );

            /*
             * --------------------------------
             * Priority 1: Cross-sells
             * --------------------------------
             */

            $cross = array_values(
                array_diff(
                    WC()->cart->get_cross_sells(),
                    $exclude_ids
                )
            );

            $suggested_ids = array_merge(
                $suggested_ids,
                $cross
            );

            /*
             * --------------------------------
             * Priority 2: Same Category
             * --------------------------------
             */

            if (
                count($suggested_ids) < 3 &&
                ! empty($cat_ids)
            ) {

                $q = new WP_Query(
                    array(
                        'post_type'      => 'product',
                        'post_status'    => 'publish',
                        'posts_per_page' => 6,
                        'post__not_in'   => $exclude_ids,
                        'orderby'        => 'rand',
                        'meta_query'     => $stock_meta,
                        'tax_query'      => array(
                            array(
                                'taxonomy' => 'product_cat',
                                'field'    => 'term_id',
                                'terms'    => $cat_ids,
                            ),
                        ),
                    )
                );

                while ($q->have_posts()) {

                    $q->the_post();

                    $suggested_ids[] = get_the_ID();
                }

                wp_reset_postdata();
            }

            /*
             * --------------------------------
             * Priority 3: Same Tag
             * --------------------------------
             */

            if (
                count($suggested_ids) < 3 &&
                ! empty($tag_ids)
            ) {

                $q = new WP_Query(
                    array(
                        'post_type'      => 'product',
                        'post_status'    => 'publish',
                        'posts_per_page' => 6,
                        'post__not_in'   => $exclude_ids,
                        'orderby'        => 'rand',
                        'meta_query'     => $stock_meta,
                        'tax_query'      => array(
                            array(
                                'taxonomy' => 'product_tag',
                                'field'    => 'term_id',
                                'terms'    => $tag_ids,
                            ),
                        ),
                    )
                );

                while ($q->have_posts()) {

                    $q->the_post();

                    $suggested_ids[] = get_the_ID();
                }

                wp_reset_postdata();
            }

            /*
             * --------------------------------
             * Priority 4: Related Products
             * --------------------------------
             */

            if (count($suggested_ids) < 3) {

                foreach ($cart as $item) {

                    $related = wc_get_related_products(
                        $item['product_id'],
                        6,
                        $exclude_ids
                    );

                    $suggested_ids = array_merge(
                        $suggested_ids,
                        $related
                    );

                    if (count($suggested_ids) >= 3) {
                        break;
                    }
                }
            }

            /*
             * Remove duplicates and cart products.
             */
            $suggested_ids = array_slice(
                array_unique(
                    array_diff(
                        $suggested_ids,
                        $exclude_ids
                    )
                ),
                0,
                3
            );

            /*
             * --------------------------------
             * Fallback: Random Products
             * --------------------------------
             */

            if (count($suggested_ids) < 3) {

                $q = new WP_Query(
                    array(
                        'post_type'      => 'product',
                        'post_status'    => 'publish',
                        'posts_per_page' => 3 - count($suggested_ids),
                        'post__not_in'   => array_merge(
                            $exclude_ids,
                            $suggested_ids
                        ),
                        'orderby'        => 'rand',
                        'meta_query'     => $stock_meta,
                    )
                );

                while ($q->have_posts()) {

                    $q->the_post();

                    $suggested_ids[] = get_the_ID();
                }

                wp_reset_postdata();
            }

            /*
             * No suggestions.
             */
            if (empty($suggested_ids)) {

                wp_send_json_error(
                    array(
                        'message' => __(
                            'No suggestions found.',
                            'th-store-one'
                        ),
                    )
                );
            }

            /*
             * --------------------------------
             * Build Product HTML
             * --------------------------------
             */

            ob_start();

            foreach ($suggested_ids as $pid) {

                $product = wc_get_product($pid);

                if (! $product) {
                    continue;
                }

                $product_permalink = $product->is_visible()
                    ? $product->get_permalink()
                    : '';

                $name = $product->get_name();

                $image = $product->get_image(
                    'woocommerce_thumbnail'
                );

                $price = $product->get_price_html();

                $rating = (float) $product->get_average_rating();

                ?>

    <div class="s1-ai-product-card">

    <div class="s1-ai-product-thumb">

        <?php if ($product_permalink) : ?>

            <a href="<?php echo esc_url($product_permalink); ?>">

                <?php echo wp_kses_post($image); ?>

            </a>

        <?php else : ?>

            <?php echo wp_kses_post($image); ?>

        <?php endif; ?>

    </div>


    <div class="s1-ai-product-content">

        <?php if ($name) : ?>

            <h4 class="s1-ai-product-title">

                <?php if ($product_permalink) : ?>

                    <a href="<?php echo esc_url($product_permalink); ?>">
                        <?php echo esc_html($name); ?>
                    </a>

                <?php else : ?>

                    <?php echo esc_html($name); ?>

                <?php endif; ?>

            </h4>

        <?php endif; ?>


        <div class="s1-ai-product-price">

            <?php echo wp_kses_post($price); ?>

        </div>

    </div>
    <div class="s1-ai-product-btn">
       <?php

                    $add_btn = $this->render
                    ? $this->render->store_one_cart_add_to_cart_url(
                        $product
                    )
                    : '';

                echo wp_kses_post($add_btn);?>

    </div>

</div>

    <?php
            }

            $html = ob_get_clean();

            wp_send_json_success(
                array(
                    'intro' => '',
                    'html'  => $html,
                )
            );
        }

        public function add_item()
        {
            check_ajax_referer(
                'store-one-cart',
                'nonce'
            );

            $product_id = absint(
                $_POST['product_id'] ?? 0
            );

            $quantity = absint(
                $_POST['quantity'] ?? 1
            );

            if (! $product_id) {
                wp_send_json_error(
                    array(
                        'message' => __(
                            'Invalid product.',
                            'th-store-one'
                        ),
                    )
                );
            }

            $product = wc_get_product($product_id);

            if (! $product) {
                wp_send_json_error(
                    array(
                        'message' => __(
                            'Product not found.',
                            'th-store-one'
                        ),
                    )
                );
            }

            $added = WC()->cart->add_to_cart(
                $product_id,
                max(1, $quantity)
            );

            if (! $added) {
                wp_send_json_error(
                    array(
                        'message' => __(
                            'Product could not be added to cart.',
                            'th-store-one'
                        ),
                    )
                );
            }

            WC()->cart->calculate_totals();

            wp_send_json_success(
                array(
                    'notice' => sprintf(
                        /* translators: %s: product name */
                        __('%s added to cart.', 'th-store-one'),
                        $product->get_name()
                    ),
                    'type' => 'success',
                    'fragments' => apply_filters(
                        'woocommerce_add_to_cart_fragments',
                        array()
                    ),
                )
            );
        }
    }
}
