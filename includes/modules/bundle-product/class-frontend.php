<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class StoreOne_Bundle_Frontend {

    public function __construct() {

        add_action(
            'woocommerce_before_add_to_cart_button',
            [ $this, 'render_bundle' ],
            5
        );

        add_action(
            'wp_enqueue_scripts',
            [ $this, 'enqueue_assets' ]
        );

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

        add_filter(
            'woocommerce_get_cart_item_from_session',
            [ $this, 'restore_bundle_from_session' ],
            10,
            2
        );

        add_action(
            'woocommerce_checkout_create_order_line_item',
            [ $this, 'save_bundle_to_order' ],
            10,
            4
        );

        add_filter( 'woocommerce_add_to_cart_validation',
            [ $this, 'validate_bundle_data' ],
            10,
            3
        );

        add_filter( 'woocommerce_quantity_input_args', [ $this, 'custom_woocommerce_quantity_limits' ], 10, 2 );

    }

    public function custom_woocommerce_quantity_limits( $args, $product ) {
    $bundle_min = absint( get_post_meta( $product->get_id(), '_storeone_min_qty', true ) );
    $bundle_max = absint( get_post_meta( $product->get_id(), '_storeone_max_qty', true ) );
    // Set your limits here
    $args['min_value'] = $bundle_min;   // Minimum value
    $args['max_value'] = $bundle_max;  // Maximum value
    $args['step']      = 1;   // Quantity increment step
    return $args;
    }

    public function render_bundle() {

    global $product;
    if ( ! $product ) return;

    $items = get_post_meta(
        $product->get_id(),
        '_storeone_bundle_products',
        true
    );

    if ( empty( $items ) || ! is_array( $items ) ) return;

    $scope = get_post_meta(
        $product->get_id(),
        '_storeone_discount_scope',
        true
    ) ?: 'store_bundle';

    $bundle_min = absint( get_post_meta( $product->get_id(), '_storeone_min_qty', true ) );
    $bundle_max = absint( get_post_meta( $product->get_id(), '_storeone_max_qty', true ) );
    
    ?>

    <div class="storeone-bundle-frontend"
         data-discount-scope="<?php echo esc_attr( $scope ); ?>"
         data-bundle-min="<?php echo esc_attr( $bundle_min ); ?>"
         data-bundle-max="<?php echo esc_attr( $bundle_max ); ?>">

        <h3 class="s1-bundle-title"><?php esc_html_e( 'Bundle includes', 'store-one' ); ?></h3>

        <?php
        $above = get_post_meta( $product->get_id(), '_storeone_above_text', true );
        if ( $above ) :
        ?>
            <div class="storeone-bundle-above-text">
                <?php echo wp_kses_post( wpautop( $above ) ); ?>
            </div>
        <?php endif; ?>

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
                    <?php echo wp_kses_post( $p->get_image( 'woocommerce_thumbnail' ) ); ?>
                </div>

                <div class="s1-info">
                    <div class="s1-name">
                        <a href="<?php echo esc_url( $p->get_permalink() ); ?>" target="_blank">
                            <?php echo esc_html( $p->get_name() ); ?>
                        </a>
                    </div>

                    <div class="s1-unit-price"><?php echo wc_price( $price ); ?></div>

                    <?php if ( ! empty( $item['allow_change_quantity'] ) ) :
                        $min = max( 1, absint( $item['min_qty'] ?? 1 ) );
                        $max = absint( $item['max_qty'] ?? 0 );
                        $val = max( $min, $qty );
                    ?>
                    <div class="s1-qty-wrap">
                        <button type="button" class="s1-qty-btn minus">−</button>

                        <input type="number"
                               class="s1-qty-input"
                               name="storeone_bundle_qty[]"
                               min="<?php echo esc_attr( $min ); ?>"
                               <?php if ( $max > 0 ) : ?>
                                   max="<?php echo esc_attr( $max ); ?>"
                               <?php endif; ?>
                               value="<?php echo esc_attr( $val ); ?>">

                        <button type="button" class="s1-qty-btn plus">+</button>
                    </div>
                    <?php endif; ?>
                </div>

            </div>

            <?php endforeach; ?>

        </div>

        <?php
        $below = get_post_meta( $product->get_id(), '_storeone_below_text', true );
        if ( $below ) :
        ?>
            <div class="storeone-bundle-below-text">
                <?php echo wp_kses_post( wpautop( $below ) ); ?>
            </div>
        <?php endif; ?>

        <input type="hidden" id="storeone_bundle_data" name="storeone_bundle_data">
    </div>
    <?php
}

    public function validate_bundle_data( $passed, $product_id, $qty ) {

    if ( empty( $_POST['storeone_bundle_data'] ) ) {
        return $passed;
    }

    $bundle = json_decode( wp_unslash( $_POST['storeone_bundle_data'] ), true );
    if ( empty( $bundle['items'] ) ) {
        wc_add_notice( __( 'Please select bundle items.', 'store-one' ), 'error' );
        return false;
    }

    $bundle_min = absint( get_post_meta( $product_id, '_storeone_min_qty', true ) );
    $bundle_max = absint( get_post_meta( $product_id, '_storeone_max_qty', true ) );

    $total = 0;
    foreach ( $bundle['items'] as $item ) {
        $total += max( 1, absint( $item['qty'] ?? 1 ) );
    }

    if ( $bundle_min > 0 && $total < $bundle_min ) {
        wc_add_notice(
            sprintf( __( 'Minimum %d items required in bundle.', 'store-one' ), $bundle_min ),
            'error'
        );
        return false;
    }

    if ( $bundle_max > 0 && $total > $bundle_max ) {
        wc_add_notice(
            sprintf( __( 'Maximum %d items allowed in bundle.', 'store-one' ), $bundle_max ),
            'error'
        );
        return false;
    }

    return $passed;
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
    }

    /* =============================
     * ADD TO CART
     * ============================= */
    public function add_bundle_to_cart_item( $cart_item_data ) {

        if ( empty( $_POST['storeone_bundle_data'] ) ) return $cart_item_data;

        $bundle = json_decode( wp_unslash( $_POST['storeone_bundle_data'] ), true );
        if ( empty( $bundle['items'] ) ) return $cart_item_data;

        $cart_item_data['storeone_bundle'] = $bundle;
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

        $bundle = $cart_item['storeone_bundle'];
        $scope  = $bundle['scope'] ?? 'store_bundle';

        /* --------------------------------
         * STORE BUNDLE → USE WC PRICE
         * -------------------------------- */
        if ( $scope === 'store_bundle' ) {

            $product = $cart_item['data'];
            if ( ! $product ) continue;

            // WC price already correct
            return;
        }

        /* --------------------------------
         * STORE PRODUCT → CALCULATE ITEMS
         * -------------------------------- */
        $total = 0;

        foreach ( $bundle['items'] as $item ) {

            $product = wc_get_product( $item['id'] );
            if ( ! $product ) continue;

            $qty   = max( 1, absint( $item['qty'] ?? 1 ) );
            $price = (float) $product->get_regular_price();
            if ( ! $price ) {
                $price = (float) $product->get_price();
            }

            if ( ( $item['discount_type'] ?? '' ) === 'percent' ) {
                $price -= $price * floatval( $item['discount_percent'] ?? 0 ) / 100;
            }

            if ( ( $item['discount_type'] ?? '' ) === 'fixed' ) {
                $price -= floatval( $item['discount_fixed'] ?? 0 );
            }

            $price = max( 0, $price );
            $total += $price * $qty;
        }

        $cart_item['data']->set_price( $total );
    }
}

    public function display_bundle_in_cart( $item_data, $cart_item ) {

    if ( empty( $cart_item['storeone_bundle'] ) ) {
        return $item_data;
    }

    $bundle = $cart_item['storeone_bundle'];
    $scope  = $bundle['scope'] ?? 'store_bundle';

    /* --------------------------------
     * STORE BUNDLE → SHOW BUNDLE PRICE
     * -------------------------------- */
    if ( $scope === 'store_bundle' ) {

    $bundle = $cart_item['storeone_bundle'];
    $qty    = max( 1, absint( $cart_item['quantity'] ) );

    /* --------------------------------
     * 1️⃣ SHOW BUNDLE ITEMS (NO PRICE)
     * -------------------------------- */
    foreach ( $bundle['items'] as $item ) {

        $product = wc_get_product( $item['id'] );
        if ( ! $product ) continue;

        $item_qty = max( 1, absint( $item['qty'] ?? 1 ) );

        $item_data[] = [
            'name'  => $product->get_name(),
            'value' => '× ' . ( $item_qty * $qty ),
        ];
    }

    /* --------------------------------
     * 2️⃣ SHOW BUNDLE TOTAL PRICE
     * -------------------------------- */
    $product = $cart_item['data'];

    $regular = (float) $product->get_regular_price() * $qty;
    $price   = (float) $product->get_price() * $qty;

    $item_data[] = [
        'name'  => __( 'Bundle price', 'store-one' ),
        'value' => wc_price( $price ),
    ];

    return $item_data;
   }

    /* --------------------------------
     * STORE PRODUCT → PER ITEM DISPLAY
     * -------------------------------- */
    foreach ( $bundle['items'] as $item ) {

        $product = wc_get_product( $item['id'] );
        if ( ! $product ) continue;

        $qty = max( 1, absint( $item['qty'] ?? 1 ) );

        $regular = (float) $product->get_regular_price();
        if ( ! $regular ) {
            $regular = (float) $product->get_price();
        }

        $final = $regular;

        if ( ( $item['discount_type'] ?? '' ) === 'percent' ) {
            $final -= $regular * floatval( $item['discount_percent'] ?? 0 ) / 100;
        }

        if ( ( $item['discount_type'] ?? '' ) === 'fixed' ) {
            $final -= floatval( $item['discount_fixed'] ?? 0 );
        }

        $final = max( 0, $final );

        $regular_total = $regular * $qty;
        $final_total   = $final * $qty;

        $item_data[] = [
            'name'  => $product->get_name() . ' × ' . $qty,
            'value' => $final_total < $regular_total
                ? '<del>' . wc_price( $regular_total ) . '</del> <ins>' . wc_price( $final_total ) . '</ins>'
                : wc_price( $regular_total ),
        ];
    }

    return $item_data;
}



    public function restore_bundle_from_session( $cart_item, $session_item ) {
        if ( isset( $session_item['storeone_bundle'] ) ) {
            $cart_item['storeone_bundle'] = $session_item['storeone_bundle'];
        }
        return $cart_item;
    }

    public function save_bundle_to_order( $order_item, $cart_item_key, $values ) {
        if ( empty( $values['storeone_bundle'] ) ) return;

        $order_item->add_meta_data(
            __( 'Bundle Items', 'store-one' ),
            wp_json_encode( $values['storeone_bundle'] )
        );
    }
}
