<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class StoreOne_Bundle_Frontend {

    public function __construct() {

        $settings = $this->get_bundle_settings();

        $hook = $settings['product_page']['position'] === 'after_cart'
        ? 'woocommerce_after_add_to_cart_button'
        : 'woocommerce_before_add_to_cart_button';

        add_action( $hook, [ $this, 'render_bundle' ], 5 );

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
            [ $this, 'set_bundle_price' ],10,3
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


        add_filter(
            'woocommerce_cart_item_hash',
            [ $this, 'add_cart_item_hash' ],
            10,
            2
        );

        add_filter(
        'woocommerce_widget_cart_item_quantity',
        [ $this, 'hide_bundle_in_mini_cart' ],
        10,
        3
        );

        add_filter(
            'woocommerce_cart_contents_count',
            [ $this, 'bundle_cart_count' ],99
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

    $settings = $this->get_bundle_settings();

    $items = get_post_meta(
        $product->get_id(),
        '_storeone_bundle_products',
        true
    );

    if ( empty( $items ) || ! is_array( $items ) ) return;

    ?>
    <div class="storeone-bundle-frontend">

        <h3 class="s1-bundle-title">
            <?php esc_html_e( 'Bundle includes', 'store-one' ); ?>
        </h3>

        <div class="s1-bundle-items">

            <?php foreach ( $items as $item ) :

                if ( empty( $item['id'] ) ) continue;

                $p = wc_get_product( $item['id'] );
                if ( ! $p ) continue;

                $qty = max( 1, absint( $item['qty'] ?? 1 ) );

                // PRICE SOURCE
                if ( $settings['product_page']['price_based_on'] === 'regular' ) {
                    $price = (float) $p->get_regular_price();
                } else {
                    $price = (float) $p->get_price();
                }

                if ( ! $price ) {
                    $price = (float) $p->get_price();
                }
            ?>

            <div class="s1-bundle-item"
                data-id="<?php echo esc_attr( $p->get_id() ); ?>"
                data-price="<?php echo esc_attr( $price ); ?>"
                data-qty="<?php echo esc_attr( $qty ); ?>"
                data-variable="<?php echo $p->is_type('variable') ? '1' : '0'; ?>">

                <?php if ( ! empty( $item['optional'] ) ) : ?>
                    <label class="s1-check-wrap">
                        <input type="checkbox" class="s1-bundle-check" checked>
                    </label>
                <?php endif; ?>

                <?php if ( $settings['product_page']['show_thumbnails'] ) : ?>
                    <div class="s1-thumb">
                        <?php
                        if ( $settings['product_page']['thumbnails_clickable'] ) {
                            echo '<a href="' . esc_url( $p->get_permalink() ) . '">';
                        }

                        echo wp_kses_post( $p->get_image( 'woocommerce_thumbnail' ) );

                        if ( $settings['product_page']['thumbnails_clickable'] ) {
                            echo '</a>';
                        }
                        ?>
                    </div>
                <?php endif; ?>

                <div class="s1-info">

                    <div class="s1-name">
                        <?php
                        if ( $settings['product_page']['thumbnails_clickable'] ) {
                            echo '<a href="' . esc_url( $p->get_permalink() ) . '">';
                        }

                        echo esc_html( $p->get_name() );

                        if ( $settings['product_page']['thumbnails_clickable'] ) {
                            echo '</a>';
                        }
                        ?>
                    </div>

                    <?php if ( $settings['product_page']['show_descriptions'] ) : ?>
                        <div class="s1-desc">
                            <?php echo wp_kses_post( wpautop( $p->get_short_description() ) ); ?>
                        </div>
                    <?php endif; ?>

                    <?php if ( $settings['product_page']['price_display'] !== 'hide' ) : ?>
    <div class="s1-line-price">

        <?php if ( $settings['product_page']['show_quantities'] ) : ?>
            <span class="s1-line-qty"><?php echo esc_html( $qty ); ?></span>
            <span class="s1-line-multiply">×</span>
        <?php endif; ?>

        <?php
        $is_variable = $p->is_type( 'variable' );

        if (
            $is_variable &&
            ! empty( $settings['product_page']['show_price_range'] )
        ) {

            $min = $p->get_variation_price( 'min', true );
            $max = $p->get_variation_price( 'max', true );

            if ( $min !== $max ) {
                $price_html = wc_price( $min ) . ' – ' . wc_price( $max );
            } else {
                $price_html = wc_price( $min );
            }

        } else {
            $price_html = wc_price( $price );
        }
        ?>

        <span class="s1-line-unit">
            <?php echo $price_html; ?>
        </span>

        <?php if ( $settings['product_page']['price_display'] === 'total' ) : ?>
            <span class="s1-line-equal">=</span>
            <strong class="s1-line-total">
                <?php echo wc_price( $price * $qty ); ?>
            </strong>
        <?php endif; ?>

         </div>
        <?php endif; ?>
                </div>
            </div>

            <?php endforeach; ?>

        </div>

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

    // 🔥 MAKE SCOPE PART OF CART DATA
    $bundle['scope'] = get_post_meta(
        absint( $_POST['add-to-cart'] ),
        '_storeone_discount_scope',
        true
    ) ?: 'store_bundle';

    $cart_item_data['storeone_bundle'] = $bundle;

    // 🔥 stable unique key (not random on refresh)
    $cart_item_data['storeone_bundle_key'] = md5( wp_json_encode( $bundle ) );

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

    $settings = $this->get_bundle_settings();

    if (
        ! empty( $settings['cart_page']['hide_products'] ) &&
        isset( $cart_item['storeone_bundle'] )
    ) {
        return $item_data;
    }

    if ( empty( $cart_item['storeone_bundle'] ) ) {
        return $item_data;
    }

    $bundle = $cart_item['storeone_bundle'];
    $scope  = $bundle['scope'] ?? 'store_bundle';

    $display_type  = $settings['cart_page']['display_type'] ?? 'list';
    $include_links = ! empty( $settings['cart_page']['include_links'] );

    /* --------------------------------
     * STORE BUNDLE → SHOW BUNDLE PRICE
     * -------------------------------- */
    if ( $scope === 'store_bundle' ) {

    $bundle = $cart_item['storeone_bundle'];
    $qty    = max( 1, absint( $cart_item['quantity'] ) );

    $items_html = '';

    /* --------------------------------
     * 1️⃣ SHOW BUNDLE ITEMS (NO PRICE)
     * -------------------------------- */
    foreach ( $bundle['items'] as $item ) {

            $product = wc_get_product( $item['id'] );
            if ( ! $product ) continue;

            $item_qty = max( 1, absint( $item['qty'] ?? 1 ) ) * $qty;

            $name = esc_html( $product->get_name() );

            if ( $include_links ) {
                $name = '<a href="' . esc_url( $product->get_permalink() ) . '">' . $name . '</a>';
            }
            $is_block_cart = function_exists( 'wc_current_theme_is_fse' ) && wc_current_theme_is_fse();


            if ( $display_type === 'bullet' ) {

                if ( $is_block_cart ) {
                    // ✅ Block Cart SAFE bullets
                    $items_html .= '• ' . $name . ' × ' . $item_qty . '<br>';
                } else {
                    // ✅ Normal Cart REAL bullets
                    $items_html .= '<li>' . $name . ' × ' . $item_qty . '</li>';
                }

            } else {
                // ✅ List mode (both carts)
                $items_html .= '<span class="s1-bundle-item">' . $name . ' × ' . $item_qty . '</span><br>';
            }
        }
    if ( $display_type === 'bullet' && ! $is_block_cart ) {
    $items_html = '<ul class="s1-bundle-cart-list">' . $items_html . '</ul>';
    }

    /* --------------------------------
     * 2️⃣ SHOW BUNDLE TOTAL PRICE
     * -------------------------------- */
    $item_data[] = [
            'name'  => __( 'Bundle items', 'store-one' ),
            'value' => $items_html,
        ];

        $product = $cart_item['data'];
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
        $name = esc_html( $product->get_name() ) . ' × ' . $qty;

        if ( $include_links ) {
            $name = '<a href="' . esc_url( $product->get_permalink() ) . '">' . $name . '</a>';
        }

        $item_data[] = [
            'name'  => $name,
            'value' => $final_total < $regular_total
                ? '<del>' . wc_price( $regular_total ) . '</del> <ins>' . wc_price( $final_total ) . '</ins>'
                : wc_price( $regular_total ),
        ];
    }

    return $item_data;

   }

   public function bundle_cart_count( $count ) {

    $settings = $this->get_bundle_settings();

    if ( ( $settings['cart_page']['cart_count'] ?? 'bundle' ) !== 'items' ) {
        return $count;
    }

    $total = 0;

    foreach ( WC()->cart->get_cart() as $cart_item ) {

        if ( empty( $cart_item['storeone_bundle'] ) ) {
            $total += $cart_item['quantity'];
            continue;
        }

        foreach ( $cart_item['storeone_bundle']['items'] as $item ) {
            $total += max( 1, absint( $item['qty'] ?? 1 ) );
        }
    }

    return $total;
    
    }

   public function hide_bundle_in_mini_cart( $quantity_html, $cart_item, $cart_item_key ) {

        $settings = $this->get_bundle_settings();

        if (
            ! empty( $settings['cart_page']['hide_products_mini'] ) &&
            isset( $cart_item['storeone_bundle'] )
        ) {
            return '';
        }

        return $quantity_html;
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

    private function get_bundle_settings() {

    $modules = get_option( 'store_one_module_set', [] );
    $bundle  = $modules['bundle-product'] ?? [];

    $defaults = [
        'product_page' => [
            'show_price_range'     => true,
            'show_thumbnails'      => true,
            'show_descriptions'    => false,
            'show_quantities'      => true,
            'thumbnails_clickable' => true,
            'price_display'        => 'unit', // unit | total | hide
            'price_based_on'       => 'sale', // sale | regular
            'position'             => 'before_cart',
        ],
        'cart_page' => [
            'hide_products'       => false,
            'hide_products_mini'  => false,
            'include_links'       => true,
            'cart_count'          => 'bundle', // bundle | items
            'display_type'        => 'list',   // list | bullet
        ],
        
    ];

    return wp_parse_args( $bundle, $defaults );

   }
   
}