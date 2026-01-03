<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * StoreOne Bundle – Frontend + Cart + Checkout
 * SIMPLE PRODUCT BASED (STABLE)
 */
class StoreOne_Bundle_Frontend {

    public function __construct() {

        /* =============================
         * FRONTEND (INSIDE ADD TO CART FORM)
         * ============================= */
        add_action(
            'woocommerce_before_add_to_cart_button',
            [ $this, 'render_bundle' ],
            5
        );

        add_action(
            'wp_enqueue_scripts',
            [ $this, 'enqueue_assets' ]
        );

        /* =============================
         * CART / CHECKOUT
         * ============================= */
        add_filter(
            'woocommerce_add_cart_item_data',
            [ $this, 'add_bundle_to_cart_item' ],
            10,
            2
        );

        add_action(
            'woocommerce_before_calculate_totals',
            [ $this, 'set_bundle_price' ]
        );

        add_filter(
            'woocommerce_get_item_data',
            [ $this, 'display_bundle_in_cart' ],
            10,
            2
        );

        add_action(
            'woocommerce_checkout_create_order_line_item',
            [ $this, 'save_bundle_to_order' ],
            10,
            4
        );
    }

    /* =============================
     * FRONTEND RENDER
     * ============================= */
    public function render_bundle() {

        global $product;

        if ( ! $product ) return;

        // 🔥 bundle detected by meta, NOT product type
        $items = get_post_meta(
            $product->get_id(),
            '_storeone_bundle_products',
            true
        );

        $scope = get_post_meta(
        $product->get_id(),
        '_storeone_discount_scope',
        true
    ) ?: 'store_bundle';

        if ( empty( $items ) || ! is_array( $items ) ) return;
        ?>

        <div class="storeone-bundle-frontend" data-discount-scope="<?php echo esc_attr( $scope ); ?>">

            <h3 class="s1-bundle-title">
                <?php esc_html_e( 'Bundle includes', 'store-one' ); ?>
            </h3>

            <div class="s1-bundle-items">

                <?php foreach ( $items as $item ) :

                    if ( empty( $item['id'] ) ) continue;

                    $p = wc_get_product( $item['id'] );
                    if ( ! $p ) continue;

                    $price = (float) $p->get_price();
                    $qty   = max( 1, absint( $item['qty'] ?? 1 ) );

                    
                ?>

                <div class="s1-bundle-item"
                     data-id="<?php echo esc_attr( $p->get_id() ); ?>"
                     data-price="<?php echo esc_attr( $price ); ?>"
                     data-qty="<?php echo esc_attr( $qty ); ?>"
                     data-optional="<?php echo esc_attr( $item['optional'] ?? 0 ); ?>"
                     data-discount-type="<?php echo esc_attr( $item['discount_type'] ?? 'percent' ); ?>"
                     data-discount-percent="<?php echo esc_attr( $item['discount_percent'] ?? 0 ); ?>"
                     data-discount-fixed="<?php echo esc_attr( $item['discount_fixed'] ?? 0 ); ?>">

                    <?php if ( ! empty( $item['optional'] ) ) : ?>
                        <label class="s1-check-wrap">
                            <input type="checkbox"
                                   class="s1-bundle-check"
                                   checked>
                        </label>
                    <?php endif; ?>

                    <div class="s1-thumb">
                        <?php echo $p->get_image( 'woocommerce_thumbnail' ); ?>
                    </div>

                    <div class="s1-info">
                    <div class="s1-name"><?php echo esc_html( $p->get_name() ); ?></div>
                    <div class="s1-unit-price"><?php echo wc_price( $price ); ?></div>
                    <?php if ( ! empty( $item['allow_change_quantity'] ) ) : 
                        $min = max( 1, absint( $item['min_qty'] ?? 1 ) );
                        $max = $item['max_qty']; // 0 = no limit
                        $val = max( $min, $qty );
                    ?>
                    <div class="s1-qty-wrap">
                        <button type="button" class="s1-qty-btn minus">−</button>
                        <input type="number"
                        class="s1-qty-input"
                        min="<?php echo esc_attr( $min ); ?>"
                        <?php if ( $max > 0 ) : ?>
                            max="<?php echo esc_attr( $max ); ?>"
                        <?php endif; ?>
                        value="<?php echo esc_attr( $val ); ?>">
                                    <button type="button" class="s1-qty-btn plus">+</button>
                                </div>
                    <?php endif;?>
                </div>


                    <!-- <div class="s1-line-price"></div> -->
                </div>

                <?php endforeach; ?>

            </div>

            <!-- 🔥 MUST be inside form -->
            <input type="hidden"
                   id="storeone_bundle_data"
                   name="storeone_bundle_data">

        </div>
        <?php
    }

    /* =============================
     * ASSETS
     * ============================= */
    public function enqueue_assets() {

        if ( ! is_product() ) return;

        /* ===============================
        * FRONTEND CSS
        * =============================== */
        wp_enqueue_style(
            'storeone-bundle-frontend',
            STORE_ONE_PLUGIN_URL . 'assets/css/bundle-front.css',
            [],
            STORE_ONE_VERSION
        );

        wp_enqueue_script(
            'storeone-bundle-frontend',
            STORE_ONE_PLUGIN_URL . 'assets/js/bundle-front.js',
            [ 'jquery' ],
            STORE_ONE_VERSION,
            true
        );

        wp_localize_script(
            'storeone-bundle-frontend',
            'StoreOneFrontend',
            [
                'currency' => get_woocommerce_currency_symbol(),
            ]
        );
    }

    /* =============================
     * ADD TO CART
     * ============================= */
    public function add_bundle_to_cart_item( $cart_item_data, $product_id ) {

        if ( empty( $_POST['storeone_bundle_data'] ) ) {
            return $cart_item_data;
        }

        $bundle = json_decode(
            wp_unslash( $_POST['storeone_bundle_data'] ),
            true
        );

        if ( empty( $bundle ) || ! is_array( $bundle ) ) {
            return $cart_item_data;
        }

        $cart_item_data['storeone_bundle'] = $bundle;

        // 🔥 force unique cart row
        $cart_item_data['unique_key'] = md5( microtime() . rand() );

        return $cart_item_data;
    }

    /* =============================
     * SET CART PRICE
     * ============================= */
    public function set_bundle_price( $cart ) {

        if ( is_admin() && ! defined( 'DOING_AJAX' ) ) return;

        foreach ( $cart->get_cart() as $cart_item ) {

            if ( empty( $cart_item['storeone_bundle'] ) ) continue;

            $total = 0;

            foreach ( $cart_item['storeone_bundle'] as $item ) {
                $total += floatval( $item['price'] );
            }

            $cart_item['data']->set_price( $total );
        }
    }

    /* =============================
     * CART DISPLAY
     * ============================= */
    public function display_bundle_in_cart( $item_data, $cart_item ) {

        if ( empty( $cart_item['storeone_bundle'] ) ) return $item_data;

        foreach ( $cart_item['storeone_bundle'] as $item ) {

            $p = wc_get_product( $item['id'] );
            if ( ! $p ) continue;

            $item_data[] = [
                'name'  => $p->get_name(),
                'value' => wc_price( $item['price'] ),
            ];
        }

        return $item_data;
    }

    /* =============================
     * ORDER META
     * ============================= */
    public function save_bundle_to_order(
        $order_item,
        $cart_item_key,
        $values,
        $order
    ) {
        if ( empty( $values['storeone_bundle'] ) ) return;

        $order_item->add_meta_data(
            __( 'Bundle Items', 'store-one' ),
            wp_json_encode( $values['storeone_bundle'] )
        );
    }
}
