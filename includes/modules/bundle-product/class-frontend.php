<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class StoreOne_Bundle_Frontend {

    private static $instance = null;

    private $bundle_variations = [];

    public static function instance() {
        if ( self::$instance === null ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {

        $settings = $this->get_bundle_settings();

        // $hook = $settings['product_page']['position'] === 'after_cart'
        // ? 'woocommerce_after_add_to_cart_button'
        // : 'woocommerce_before_add_to_cart_button';

        $hook = $settings['product_page']['position'] === 'after_cart'
        ? 'woocommerce_after_add_to_cart_form'
        : 'woocommerce_before_add_to_cart_form';

        add_action( $hook, [ $this, 'render_bundle' ], 5 );

        add_action(
            'woocommerce_after_add_to_cart_button',
            [ $this, 'render_bundle_hidden_input' ],
            5
        );

        add_action( 'woocommerce_storeone_bundle_add_to_cart', function() {
            wc_get_template( 'single-product/add-to-cart/simple.php' );
        });

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
            3
        );

        add_filter(
            'woocommerce_get_cart_item_from_session',
            [ $this, 'restore_bundle_from_session' ],
            5,
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
        

        add_filter( 'woocommerce_quantity_input_args', [ $this, 'bundle_woocommerce_quantity_limits' ], 10, 2 );
        
        add_action( 'wp_ajax_storeone_preview_bundle_price', [ $this, 'ajax_preview_bundle_price' ] );
        add_action( 'wp_ajax_nopriv_storeone_preview_bundle_price', [ $this, 'ajax_preview_bundle_price' ] ); 

   
   
        }
    
    public function ajax_preview_bundle_price() {

    check_ajax_referer( 'storeone_bundle_nonce', 'nonce' );

    $items     = $_POST['items'] ?? [];
    $bundle_id = absint( $_POST['bundle_id'] ?? 0 );

    if ( ! is_array( $items ) || ! $bundle_id ) {
        wp_send_json_error();
    }

    // ✅ NO ITEMS SELECTED → PRICE 0
    if ( empty( $items ) ) {
        wp_send_json_success( [
            'price_html' => wc_price( 0 ),
            'raw'        => 0,
        ] );
    }

    $bundle_items = get_post_meta(
        $bundle_id,
        '_storeone_bundle_products',
        true
    );

    if ( empty( $bundle_items ) || ! is_array( $bundle_items ) ) {
        wp_send_json_error();
    }

    $bundle_map = [];
    foreach ( $bundle_items as $bi ) {
        if ( ! empty( $bi['id'] ) ) {
            $bundle_map[ $bi['id'] ] = $bi;
        }
    }

    $total = 0;

    foreach ( $items as $item ) {

        $product_id = absint( $item['id'] ?? 0 );
        if ( ! $product_id || empty( $bundle_map[ $product_id ] ) ) {
            continue;
        }

        $qty = max( 1, absint( $item['qty'] ?? 1 ) );

        $prices = $this->storeone_get_bundle_item_prices(
            $bundle_id,
            $bundle_map[ $product_id ]
        );

        if ( ! $prices ) continue;

        $total += (float) $prices['sale'] * $qty;
    }

    wp_send_json_success( [
        'price_html' => wc_price( $total ),
        'raw'        => $total,
    ] );
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
            'storeOneBundle',
            [
                'ajaxurl'  => admin_url( 'admin-ajax.php' ),
                'nonce' => wp_create_nonce( 'storeone_bundle_nonce' ),
            ]
        );

    }

    public function bundle_woocommerce_quantity_limits( $args, $product ) {

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
    $discount_scope = get_post_meta(
    $product->get_id(),
    '_storeone_discount_scope',
    true
    );

    if ( empty( $items ) || ! is_array( $items ) ) return;

    ?>
    <div class="storeone-bundle-frontend" data-product-id="<?php echo esc_attr( $product->get_id() ); ?>" data-discount-scope="<?php echo esc_attr($discount_scope);?>" data-bundle-base-price="<?php echo esc_attr( $product->get_price() ); ?>">

        <h3 class="s1-bundle-title">
            <?php esc_html_e( 'Bundle includes', 'store-one' ); ?>
        </h3>
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
                $allow_qty = ! empty( $item['allow_change_quantity'] ) ? 1 : 0;
                $min_qty = isset( $item['min_qty'] ) ? absint( $item['min_qty'] ) : 0;
                $max_qty = isset( $item['max_qty'] ) ? absint( $item['max_qty'] ) : 0;

                // Default qty respect min
                if ( $min_qty > 0 ) {
                    $qty = max( $min_qty, $qty );
                }

                // Respect max
                if ( $max_qty > 0 ) {
                    $qty = min( $max_qty, $qty );
                }

                $prices = $this->storeone_get_bundle_item_prices( $product->get_id(), $item );
            ?>
        
            <div class="s1-bundle-item"

                data-id="<?php echo esc_attr( $p->get_id() ); ?>"
                data-price="<?php
                    echo esc_attr(
                        $discount_scope === 'store_product'
                            ? $prices['sale']
                            : $prices['regular']
                    );
                ?>"
                data-qty="<?php echo esc_attr( $qty ); ?>"
                data-allow-qty="<?php echo esc_attr( $allow_qty ); ?>"
                data-min="<?php echo esc_attr( $min_qty ); ?>"
                data-max="<?php echo esc_attr( $max_qty ); ?>"
                data-variable="<?php echo $p->is_type('variable') ? '1' : '0'; ?>"
                
                data-regular="<?php echo esc_attr( $prices['regular'] ); ?>"
                data-sale="<?php echo esc_attr( $prices['sale'] ); ?>"
              >

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
                        <?php if ( $settings['product_page']['show_quantities'] ) : ?>
                        <span class="s1-line-qty"><?php echo esc_html( $qty ); ?></span>
                        <span class="s1-line-multiply">×</span>
                        <?php endif;?>
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

                <?php if ( $p->is_type( 'variable' ) ) : ?>

                    <div class="s1-variation-form"
                        data-product-id="<?php echo esc_attr( $p->get_id() ); ?>"
                        data-variations='<?php echo wp_json_encode( $p->get_available_variations() ); ?>'>

                        <?php foreach ( $p->get_variation_attributes() as $attribute_name => $options ) : ?>
                            <div class="s1-variation-field">
                                <label><?php echo wc_attribute_label( $attribute_name ); ?></label>
                                <?php
                                wc_dropdown_variation_attribute_options( [
                                    'options'   => $options,
                                    'attribute' => $attribute_name,
                                    'product'   => $p,
                                ] );
                                ?>
                            </div>
                        <?php endforeach; ?>

                        <input type="hidden" class="s1-variation-id" value="">
                    </div>

                <?php endif; ?>

            <?php if ( $settings['product_page']['price_display'] !== 'hide' ) : ?>
            <div class="s1-line-price">
            
            <?php if ( ! empty( $item['allow_change_quantity'] ) ) : ?>
            <div class="s1-qty-wrap">
                <button type="button" class="s1-qty-btn minus">−</button>
                <span class="s1-line-qty"><?php echo esc_html( $qty ); ?></span>
                <button type="button" class="s1-qty-btn plus">+</button>
            </div>
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

         <!-- <span class="s1-line-unit">
           <?php
            // if (
            //     $discount_scope === 'store_product'
            //     && $prices
            //     && (float) $prices['sale'] < (float) $prices['regular']
            // ) {
            //     if( empty( $item['price_hide'] ) )  : 
            //     echo '<del>' . wc_price( $prices['regular'] ) . '</del> ';
            //     endif;
            //     echo '<ins>' . wc_price( $prices['sale'] ) . '</ins>';
            // } else {
               
            //     // store_bundle OR no discount
            //     echo wc_price( $prices['regular'] );
                
            // }
            ?>
        </span> -->

        <span class="s1-line-unit">
        <?php
        //CASE 1: VARIABLE PRODUCT & NO VARIATION SELECTED
        if ( $is_variable ) {
            // show price range ONLY (no discount here)
            echo $price_html;
        }
        //CASE 2: STORE PRODUCT DISCOUNT (SIMPLE / VARIATION SELECTED)
        elseif (
            $discount_scope === 'store_product'
            && $prices
            && (float) $prices['sale'] < (float) $prices['regular']
        ) {

            if ( empty( $item['price_hide'] ) ) {
                echo '<del>' . wc_price( $prices['regular'] ) . '</del> ';
            }

            echo '<ins>' . wc_price( $prices['sale'] ) . '</ins>';

        }
        //CASE 3: STORE BUNDLE OR NO DISCOUNT
        else {

            echo wc_price( $prices['regular'] );

        }
        ?>
        </span>

        <?php if(  $discount_scope === 'store_bundle'
                && empty( $item['price_hide'] ) && !$is_variable )  : ?>
        <strong class="s1-line-total">
            <?php
            if ( $discount_scope === 'store_bundle' ) {
                echo '<del>' . wc_price( $price * $qty ) . '</del>';
            } else {
                echo wc_price( $price * $qty );
            }
            ?>
        </strong>
        <?php endif; ?>

         </div>
        <?php endif; ?>
            </div>
                
        </div>

        <?php endforeach; ?>
        <?php
        $below = get_post_meta( $product->get_id(), '_storeone_below_text', true );
        if ( $below ) :
        ?>
            <div class="storeone-bundle-below-text">
                <?php echo wp_kses_post( wpautop( $below ) ); ?>
            </div>
        <?php endif; ?>
        </div>
        <!-- <input type="hidden" id="storeone_bundle_data" name="storeone_bundle_data"> -->
        <span class="s1-currency-template" style="display:none">
            <?php echo wc_price( 0 ); ?>
        </span>
    </div>
    <?php
    }
    public function render_bundle_hidden_input() {
    ?>
    <input type="hidden"
           id="storeone_bundle_data"
           name="storeone_bundle_data"
           value="">
    <?php
}

    public function storeone_get_bundle_item_prices( $bundle_id, $item ) {

    $product = wc_get_product( $item['id'] );
    if ( ! $product ) {
        return false;
    }

    $regular = (float) ( $product->get_regular_price() ?: $product->get_price() );
    $sale    = $regular;

    $scope = get_post_meta( $bundle_id, '_storeone_discount_scope', true );

    if ( $scope === 'store_product' ) {

        $type    = $item['discount_type'] ?? 'percent';
        $percent = floatval( $item['discount_percent'] ?? 0 );
        $fixed   = floatval( $item['discount_fixed'] ?? 0 );

        if ( $type === 'percent' && $percent > 0 ) {
            $sale -= ( $regular * $percent / 100 );
        }

        if ( $type === 'fixed' && $fixed > 0 ) {
            $sale -= $fixed;
        }
    }

    return [
        'regular' => wc_format_decimal( $regular ),
        'sale'    => wc_format_decimal( max( 0, $sale ) ),
    ];
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
     * ADD TO CART
     * ============================= */
    public function add_bundle_to_cart_item( $cart_item_data, $product_id ) {

    $product = wc_get_product( $product_id );

    
    if ( ! $product ) {
        
        return $cart_item_data;
    }

   
    if ( ! isset( $_POST['storeone_bundle_data'] ) || empty( $_POST['storeone_bundle_data'] ) ) {
        return $cart_item_data;
    }

    $bundle = json_decode( wp_unslash( $_POST['storeone_bundle_data'] ), true );
    if ( empty( $bundle['items'] ) ) return $cart_item_data;

    
    $bundle['scope'] = get_post_meta( $product_id, '_storeone_discount_scope', true ) ?: 'store_bundle';

    $cart_item_data['storeone_bundle'] = $bundle;
    
    $cart_item_data['storeone_bundle_key'] = md5( wp_json_encode( $bundle ) );

    return $cart_item_data;
   }


   public function add_cart_item_hash( $hash, $cart_item ) {
    if ( ! empty( $cart_item['storeone_bundle'] ) ) {
        return md5( $hash . serialize( $cart_item['storeone_bundle'] ) );
    }
    return $hash;
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
                if ( isset( $cart_item['data'] ) && is_object( $cart_item['data'] ) ) {
                $product = $cart_item['data'];
                $base_price = (float) get_post_meta( $product->get_id(), '_price', true );
                $product->set_price( $base_price );
            }
            continue;
        }

        if ( $scope === 'store_product' ) {

    $total = 0;

    // 🔥 bundle meta se original items lao
    $bundle_items = get_post_meta(
        $cart_item['product_id'],
        '_storeone_bundle_products',
        true
    );

    if ( empty( $bundle_items ) || ! is_array( $bundle_items ) ) {
        continue;
    }

    // index by product id
    $bundle_map = [];
    foreach ( $bundle_items as $bi ) {
        if ( ! empty( $bi['id'] ) ) {
            $bundle_map[ $bi['id'] ] = $bi;
        }
    }

    foreach ( $bundle['items'] as $item ) {

        if ( empty( $bundle_map[ $item['id'] ] ) ) continue;

        $qty = max( 1, absint( $item['qty'] ?? 1 ) );

        // ✅ SAME LOGIC AS SINGLE PAGE
        $prices = $this->storeone_get_bundle_item_prices(
            $cart_item['product_id'],
            $bundle_map[ $item['id'] ]
        );

        if ( ! $prices ) continue;

        $total += (float) $prices['sale'] * $qty;
        }
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

        $qty    = max( 1, absint( $cart_item['quantity'] ) );
        $items_html = '';

        foreach ( $bundle['items'] as $item ) {

            /* ✅ VARIATION SAFE PRODUCT LOAD */
            $product_id = ! empty( $item['variation_id'] )
                ? absint( $item['variation_id'] )
                : absint( $item['id'] );

            $product = wc_get_product( $product_id );
            if ( ! $product ) continue;

            $item_qty = max( 1, absint( $item['qty'] ?? 1 ) ) * $qty;
            $name = esc_html( $product->get_name() );

            /* ✅ VARIATION ATTRIBUTES */
            if ( ! empty( $item['variation'] ) && is_array( $item['variation'] ) ) {

                $attrs = [];

                foreach ( $item['variation'] as $key => $value ) {
                    if ( ! $value ) continue;
                    $label = wc_attribute_label( str_replace( 'attribute_', '', $key ) );
                    $attrs[] = $label . ': ' . esc_html( $value );
                }

                if ( $attrs ) {
                    $name .= ' <small>(' . implode( ', ', $attrs ) . ')</small>';
                }
            }

            if ( $include_links ) {
                $name = '<a href="' . esc_url( $product->get_permalink() ) . '">' . $name . '</a>';
            }

            $is_block_cart = function_exists( 'wc_current_theme_is_fse' ) && wc_current_theme_is_fse();

            if ( $display_type === 'bullet' ) {
                $items_html .= $is_block_cart
                    ? '• ' . $name . ' × ' . $item_qty . '<br>'
                    : '<li>' . $name . ' × ' . $item_qty . '</li>';
            } else {
                $items_html .= '<span class="s1-bundle-item">' . $name . ' × ' . $item_qty . '</span><br>';
            }
        }

        if ( $display_type === 'bullet' && ! $is_block_cart ) {
            $items_html = '<ul class="s1-bundle-cart-list">' . $items_html . '</ul>';
        }

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
   if ( $scope === 'store_product' ) {

    foreach ( $bundle['items'] as $item ) {

        $product_id = ! empty( $item['variation_id'] )
            ? absint( $item['variation_id'] )
            : absint( $item['id'] );

        $product = wc_get_product( $product_id );
        if ( ! $product ) continue;

        $qty = max( 1, absint( $item['qty'] ?? 1 ) );

        /* --------------------------------
         * ORIGINAL BUNDLE META (for discount)
         * -------------------------------- */
        $bundle_items = get_post_meta(
            $cart_item['product_id'],
            '_storeone_bundle_products',
            true
        );

        if ( empty( $bundle_items ) ) continue;

        $bundle_item = null;
        foreach ( $bundle_items as $bi ) {
            if ( (int) $bi['id'] === (int) $item['id'] ) {
                $bundle_item = $bi;
                break;
            }
        }
        if ( ! $bundle_item ) continue;

        /* --------------------------------
         * SAME PRICE LOGIC AS SINGLE PAGE
         * -------------------------------- */
        $prices = $this->storeone_get_bundle_item_prices(
            $cart_item['product_id'],
            $bundle_item
        );

        if ( ! $prices ) continue;

        $regular_line_total = (float) $prices['regular'] * $qty;
        $sale_line_total    = (float) $prices['sale'] * $qty;

        /* --------------------------------
         * PRICE HTML (DEL + INS)
         * -------------------------------- */
        if ( $sale_line_total < $regular_line_total ) {

    $price_html  = '<span class="storeone-old-price">'
        . wc_price( $regular_line_total )
        . '</span> ';

    $price_html .= '<span class="storeone-sale-price">'
        . wc_price( $sale_line_total )
        . '</span>';

} else {
    $price_html = wc_price( $sale_line_total );
}

        /* --------------------------------
         * ITEM NAME + VARIATION
         * -------------------------------- */
        $name = esc_html( $product->get_name() ) . ' × ' . $qty;

        if ( ! empty( $item['variation'] ) ) {
            $attrs = [];
            foreach ( $item['variation'] as $k => $v ) {
                if ( $v ) {
                    $attrs[] = wc_attribute_label(
                        str_replace( 'attribute_', '', $k )
                    ) . ': ' . esc_html( $v );
                }
            }
            if ( $attrs ) {
                $name .= ' <small>(' . implode( ', ', $attrs ) . ')</small>';
            }
        }

        $item_data[] = [
            'name'  => $name,
            'value' => wp_kses_post( $price_html ),
        ];
    }

    return $item_data;
  }

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
    if ( isset( $session_item['storeone_bundle_key'] ) ) {
        $cart_item['storeone_bundle_key'] = $session_item['storeone_bundle_key'];
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

