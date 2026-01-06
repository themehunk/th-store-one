<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/* -----------------------------------------
 * Product Class
 * ----------------------------------------- */
if ( class_exists('WC_Product') && ! class_exists('WC_Product_StoreOne_Bundle') ) {
    class WC_Product_StoreOne_Bundle extends WC_Product {
        public function get_type() {
            return 'storeone_bundle';
        }
    }
}

class Store_One_BNDLP_Admin {

    public function __construct() {

    add_filter( 'product_type_selector', [ $this, 'add_product_type' ] );
    add_filter( 'woocommerce_product_data_tabs', [ $this, 'add_tab' ] );
    add_action( 'woocommerce_product_data_panels', [ $this, 'render_panel' ] );

    
    add_filter(
        'woocommerce_product_class',
        function ( $classname, $product_type ) {
            if ( $product_type === 'storeone_bundle' ) {
                return 'WC_Product_StoreOne_Bundle';
            }
            return $classname;
        },
        10,
        2
    );

    // ✅ ONLY THIS HOOK
    add_action(
        'woocommerce_process_product_meta_storeone_bundle',
        [ $this, 'store_one_save' ]
    );

    add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
    add_action( 'wp_ajax_storeone_get_product_data', [ $this, 'ajax_get_product_data' ] );
}


    public function add_product_type( $types ) {
        $types['storeone_bundle'] = __( 'Product Bundle', 'store-one' );
        return $types;
    }

    public function add_tab( $tabs ) {
        // ✅ GENERAL TAB SHOW FOR BUNDLE
        if ( isset( $tabs['general']['class'] ) ) {
        $tabs['general']['class'][] = 'show_if_storeone_bundle';
    }
        $tabs['storeone_bundle'] = [
            'label'  => __( 'Bundled Products', 'store-one' ),
            'target' => 'storeone_bundle_product_data',
            'class'  => [ 'show_if_storeone_bundle' ],
        ];
        return $tabs;
    }

    public function render_panel() {
    global $post, $product_object;
    if ( ! is_a( $product_object, 'WC_Product' ) ) {
    $product_object = wc_get_product($post->ID);
    }

    $items      = (array) get_post_meta( $post->ID, '_storeone_bundle_products', true );
    $has_items  = ! empty( $items );
    ?>
    <div id="storeone_bundle_product_data" class="panel woocommerce_options_panel hidden">

        <!-- Unified Bundle Box -->
        <div class="storeone-bundle-box">

            <!-- SEARCH -->
            <p class="form-field storeone-bundle-search-field">
                <label><?php _e( 'Bundled Products', 'store-one' ); ?></label>
                <select
                    class="wc-product-search storeone-bundle-search"
                    style="width:100%;"
                    data-action="woocommerce_json_search_products_and_variations"
                    data-placeholder="<?php esc_attr_e( 'Search for products or variations…', 'store-one' ); ?>">
                </select>
            </p>

            <!-- SELECTED (render only if items exist) -->
            <div class="storeone-bundle-selected-wrap"
                 <?php if ( ! $has_items ) echo 'style="display:none;"'; ?>>
                 <p class="form-field storeone-bundle-search-field">
                 <label><?php _e( 'Selected Products', 'store-one' ); ?></label>
                 </p>

                <ul class="storeone-bundle-selected">
                    <?php
                    foreach ( $items as $item ) :
                        $pid = absint( $item['id'] ?? 0 );
                        $qty = max( 1, absint( $item['qty'] ?? 1 ) );
                        if ( ! $pid ) continue;

                        $product = wc_get_product( $pid );
                        $price = $product->get_price();

                        $price = floatval( $price );
                        if ( ! $product ) continue;
                    ?>
                        <li class="bundle-item" data-id="<?php echo esc_attr( $pid ); ?>">
                            <span class="drag">☰</span>

                            <input type="number"
                                   class="qty"
                                   min="1"
                                   value="<?php echo esc_attr( $qty ); ?>">

                            <img src="<?php echo esc_url(
                                wp_get_attachment_image_url(
                                    $product->get_image_id(),
                                    'thumbnail'
                                )
                            ); ?>">

                            <a href="<?php echo esc_url( get_edit_post_link( $pid ) ); ?>"
                               target="_blank"
                               class="title">
                                <?php echo wp_kses_post( $product->get_formatted_name() ); ?>
                            </a>

                           <span class="bundle-price" data-price="<?php echo esc_attr($price); ?>">
                                <?php echo wc_price( $product->get_price() ); ?>
                            </span>

                            <span class="type">
                                <?php echo $product->is_type( 'variation' ) ? 'variation' : 'simple'; ?>
                            </span>

                           

                            <!-- Settings toggle -->
                            
                           <?php $this->render_bundle_item_settings( $pid, $item );?>
                           
                            <!-- Required hidden inputs for save -->
                            <input type="hidden"
                                   name="_storeone_bundle_products[<?php echo esc_attr( $pid ); ?>][id]"
                                   value="<?php echo esc_attr( $pid ); ?>">

                            <input type="hidden"
                                   class="qty-hidden"
                                   name="_storeone_bundle_products[<?php echo esc_attr( $pid ); ?>][qty]"
                                   value="<?php echo esc_attr( $qty ); ?>">
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
            </div>

            <?php 
            $scope          = get_post_meta( $post->ID, '_storeone_discount_scope', true ) ?: 'store_bundle';
            /* -----------------------------
            * Discount Scope
            * ----------------------------- */
            woocommerce_wp_select( [
                'id'      => '_storeone_discount_scope',
                'label'   => __( 'Discount Scope', 'store-one' ),
                'options' => [
                    'store_bundle'  => __( 'Bundle wide', 'store-one' ),
                    'store_product' => __( 'Per product', 'store-one' ),
                ],
                'value' => $scope,
            ] );?>
          
            <p class="form-field storeone-bundle-regular-price">
    <label>
        <?php
        printf(
            __( 'Regular Price (%s)', 'store-one' ),
            get_woocommerce_currency_symbol()
        );
        ?>
    </label>

    <input type="text"
        name="_storeone_bundle_regular_price"
        class="storeone-bundle-regular-input"
        data-auto="<?php echo esc_attr( $this->calculate_bundle_regular_price( $items ) ); ?>"
        data-manual="0"
        value="<?php echo esc_attr(
            wc_format_localized_price(
                $this->calculate_bundle_regular_price( $items )
            )
        ); ?>"
        >
</p>
  
<?php

$discount_type  = get_post_meta( $post->ID, '_storeone_discount_type', true ) ?: 'percent';


/* -----------------------------
 * Discount Type
 * ----------------------------- */
woocommerce_wp_select( [
    'id'      => '_storeone_discount_type',
    'label'   => __( 'Discount Type', 'store-one' ),
    'class'   => 's1-discount-type s1-discount-type-global',
    'options' => [
        'percent' => __( 'Percentage', 'store-one' ),
        'fixed'   => __( 'Fixed Amount', 'store-one' ),
    ],
    'value' => $discount_type,
] );

/* -----------------------------
 * Discount Percent
 * ----------------------------- */
woocommerce_wp_text_input( [
    'id'                => '_storeone_discount_percent',
    'label'             => __( 'Discount (%)', 'store-one' ),
    'type'              => 'number',
    'custom_attributes' => [
        'step' => '0.01',
        'min'  => '0',
        'max'  => '100',
    ],
    'value' => get_post_meta( $post->ID, '_storeone_discount_percent', true ),
] );
/* -----------------------------
 * Discount Fixed Amount
 * ----------------------------- */
woocommerce_wp_text_input( [
    'id'                => '_storeone_discount_fixed',
    'label'             => __( 'Discount Amount', 'store-one' ),
    'type'              => 'number',
    'custom_attributes' => [
        'step' => '1',
        'min'  => '0',
    ],
    'value'         => get_post_meta( $post->ID, '_storeone_discount_fixed', true ),
    'wrapper_class'=> 'show_if_storeone_discount_fixed',
] );

woocommerce_wp_text_input( [
    'id'                => '_storeone_min_qty',
    'label'             => __( 'Minimum Quantity', 'store-one' ),
    'type'              => 'number',
    'custom_attributes' => [
        'min'  => '0',
        'step' => '1',
    ],
    'value' => get_post_meta( $post->ID, '_storeone_min_qty', true ) ?: 0,
    'desc_tip' => true,
    'description' => __( 'Minimum quantity required for bundle.', 'store-one' ),
] );
woocommerce_wp_text_input( [
    'id'                => '_storeone_max_qty',
    'label'             => __( 'Maximum Quantity', 'store-one' ),
    'type'              => 'number',
    'custom_attributes' => [
        'min'  => '0',
        'step' => '1',
    ],
    'value' => get_post_meta( $post->ID, '_storeone_max_qty', true )?:0,
    'desc_tip' => true,
    'description' => __( 'Maximum quantity allowed for bundle.', 'store-one' ),
] );
woocommerce_wp_textarea_input( [
    'id'          => '_storeone_above_text',
    'label'       => __( 'Above Bundle Text', 'store-one' ),
    'placeholder' => __( 'Text shown above bundle products', 'store-one' ),
    'value'       => get_post_meta( $post->ID, '_storeone_above_text', true ),
    'desc_tip'    => true,
    'description' => __( 'This text will appear above the bundle box.', 'store-one' ),
] );
woocommerce_wp_textarea_input( [
    'id'          => '_storeone_below_text',
    'label'       => __( 'Below Bundle Text', 'store-one' ),
    'placeholder' => __( 'Text shown below bundle products', 'store-one' ),
    'value'       => get_post_meta( $post->ID, '_storeone_below_text', true ),
    'desc_tip'    => true,
    'description' => __( 'This text will appear below the bundle box.', 'store-one' ),
] );

?>
    </div>
    <?php
}

private function calculate_bundle_regular_price( $items ) {

    $total = 0;

    foreach ( $items as $item ) {

        $product_id = absint( $item['id'] ?? 0 );
        if ( ! $product_id ) continue;

        $product = wc_get_product( $product_id );
        if ( ! $product ) continue;

        $qty = max( 1, absint( $item['qty'] ?? 1 ) );

        // Prefer regular price, fallback to price
        $price = $product->get_price();
        

        $total += floatval( $price ) * $qty;
    }

    return wc_format_decimal( $total );
}


private function render_bundle_item_settings( $pid, $item = [] ) {
    ?>
    <button type="button" class="bundle-item-settings-toggle">
     <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="drag-handle s1-icon"><path d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.8787 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.8787 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.8787 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.8787 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
    </button>
    <a href="#" class="remove"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="s1-icon s1-icon-danger"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg></a>
    
    <div class="bundle-item-settings">
        <!-- Per Product Settings -->
        <div class="bundle-settings-per-product" data-pid="<?php echo esc_attr( $pid ); ?>">

    <!-- Optional -->
    <p class="form-field">
        <label>
            <input type="checkbox"
                   class="s1-optional-toggle"
                   name="_storeone_bundle_products[<?php echo esc_attr( $pid ); ?>][optional]"
                   value="1"
                   <?php checked( $item['optional'] ?? '', 1 ); ?>>
            <?php _e( 'Optional', 'store-one' ); ?>
        </label>

        <span class="description">
            <?php _e( 'User can choose whether to include this product in the bundle.', 'store-one' ); ?>
        </span>
    </p>

    <!-- Allow Quantity -->
    <p class="form-field">
        <label>
            <input type="checkbox"
                   class="s1-qty-toggle"
                   name="_storeone_bundle_products[<?php echo esc_attr( $pid ); ?>][allow_change_quantity]"
                   value="1"
                   <?php checked( $item['allow_change_quantity'] ?? '', 1 ); ?>>
            <?php _e( 'Quantity', 'store-one' ); ?>
        </label>

        <span class="description">
            <?php _e( 'If enabled, the user will be able to set their desired quantity.', 'store-one' ); ?>
        </span>
    </p>

    <!-- Min quantity -->
    <p class="form-field s1-qty-field">
        <label><?php _e( 'Min quantity', 'store-one' ); ?></label>
        <input type="number"
               class="short"
               min="0"
               step="1"
               name="_storeone_bundle_products[<?php echo esc_attr( $pid ); ?>][min_qty]"
               value="<?php echo esc_attr( $item['min_qty'] ?? 0 ); ?>">
    </p>

    <!-- Max quantity -->
    <p class="form-field s1-qty-field">
        <label><?php _e( 'Max quantity', 'store-one' ); ?></label>
        <input type="number"
               class="short"
               min="0"
               step="1"
               name="_storeone_bundle_products[<?php echo esc_attr( $pid ); ?>][max_qty]"
               value="<?php echo esc_attr( $item['max_qty'] ?? 0 ); ?>">
    </p>

    <!-- Discount type -->
    <p class="form-field">
        <label><?php _e( 'Discount Type', 'store-one' ); ?></label>
        <select class="s1-discount-type"
                name="_storeone_bundle_products[<?php echo esc_attr( $pid ); ?>][discount_type]">
            <option value="percent" <?php selected( $item['discount_type'] ?? '', 'percent' ); ?>>
                <?php _e( 'Percentage', 'store-one' ); ?>
            </option>
            <option value="fixed" <?php selected( $item['discount_type'] ?? '', 'fixed' ); ?>>
                <?php _e( 'Fixed', 'store-one' ); ?>
            </option>
        </select>
    </p>

    <!-- Discount percent -->
    <p class="form-field s1-discount-percent">
        <label><?php _e( 'Discount (%)', 'store-one' ); ?></label>
        <span class="s1-discount-wrap">
            <input type="number"
                   class="short"
                   step="0.01"
                   min="0"
                   max="100"
                   name="_storeone_bundle_products[<?php echo esc_attr( $pid ); ?>][discount_percent]"
                   value="<?php echo esc_attr( $item['discount_percent'] ?? '' ); ?>">
            <span class="s1-unit">%</span>
        </span>
    </p>

    <!-- Discount fixed -->
    <p class="form-field s1-discount-fixed">
        <label><?php printf( __( 'Discount (%s)', 'store-one' ), get_woocommerce_currency_symbol() ); ?></label>
        <span class="s1-discount-wrap">
            <input type="number"
                   class="short"
                   step="1"
                   min="0"
                   name="_storeone_bundle_products[<?php echo esc_attr( $pid ); ?>][discount_fixed]"
                   value="<?php echo esc_attr( $item['discount_fixed'] ?? '' ); ?>">
            <span class="s1-unit"><?php echo esc_html( get_woocommerce_currency_symbol() ); ?></span>
        </span>
    </p>
     </div>
        <!-- Bundle Wide Settings -->
        <div class="bundle-settings-bundle">
           
        </div>

    </div>
    <?php
    }

    private function update_bundle_wc_prices( $post_id ) {

    // Only bundle product
    $product = wc_get_product( $post_id );
    if ( ! $product || $product->get_type() !== 'storeone_bundle' ) {
        return;
    }

    // Only bundle-wide discount
    $scope = get_post_meta( $post_id, '_storeone_discount_scope', true );
    if ( $scope !== 'store_bundle' ) {
        return;
    }

    // 🔥 READ ADMIN REGULAR PRICE INPUT
    if ( isset($_POST['_storeone_bundle_regular_price']) && $_POST['_storeone_bundle_regular_price'] !== '' ) {

        $regular_total = wc_format_decimal( $_POST['_storeone_bundle_regular_price'] );

    } else {

        // 🔁 FALLBACK AUTO CALCULATION
        $items = (array) get_post_meta( $post_id, '_storeone_bundle_products', true );
        if ( empty( $items ) ) return;

        $regular_total = 0;

        foreach ( $items as $item ) {

            $pid = absint( $item['id'] ?? 0 );
            if ( ! $pid ) continue;

            $p = wc_get_product( $pid );
            if ( ! $p ) continue;

            $qty = max( 1, absint( $item['qty'] ?? 1 ) );

            $price = $p->get_regular_price();
            if ( $price === '' ) {
                $price = $p->get_price();
            }

            $regular_total += floatval( $price ) * $qty;
        }

        $regular_total = wc_format_decimal( $regular_total );
    }

    /* -----------------------------
     * APPLY BUNDLE DISCOUNT
     * ----------------------------- */
    $type    = get_post_meta( $post_id, '_storeone_discount_type', true ) ?: 'percent';
    $percent = floatval( get_post_meta( $post_id, '_storeone_discount_percent', true ) );
    $fixed   = floatval( get_post_meta( $post_id, '_storeone_discount_fixed', true ) );

    $sale_price = $regular_total;

    if ( $type === 'percent' && $percent > 0 ) {
        $sale_price = $regular_total - ( $regular_total * $percent / 100 );
    }

    if ( $type === 'fixed' && $fixed > 0 ) {
        $sale_price = $regular_total - $fixed;
    }

    $sale_price = max( 0, wc_format_decimal( $sale_price ) );

    /* -----------------------------
     * SAVE WC PRICE META
     * ----------------------------- */
    update_post_meta( $post_id, '_regular_price', $regular_total );

    if ( $sale_price < $regular_total ) {
        update_post_meta( $post_id, '_sale_price', $sale_price );
        update_post_meta( $post_id, '_price', $sale_price );
    } else {
        delete_post_meta( $post_id, '_sale_price' );
        update_post_meta( $post_id, '_price', $regular_total );
    }
}


    public function store_one_save( $post_id ) {

    if ( empty( $post_id ) ) return;

    $fields = [
        '_storeone_discount_scope',
        '_storeone_discount_type',
        '_storeone_discount_percent',
        '_storeone_discount_fixed',
        // Quantity fields
        '_storeone_min_qty',
        '_storeone_max_qty',
        // Text areas
        '_storeone_above_text',
        '_storeone_below_text',
    ];

    foreach ( $fields as $key ) {
        if ( isset( $_POST[$key] ) ) {
            update_post_meta(
                $post_id,
                $key,
                sanitize_text_field( $_POST[$key] )
            );
        }
    }

    // 🔥 READ BUNDLE REGULAR PRICE (AUTO OR MANUAL)
        $bundle_regular = null;

        if ( isset($_POST['_storeone_bundle_regular_price']) && $_POST['_storeone_bundle_regular_price'] !== '' ) {
            $bundle_regular = wc_format_decimal( $_POST['_storeone_bundle_regular_price'] );
        }

    // Bundle products
    if ( isset($_POST['_storeone_bundle_products']) && is_array($_POST['_storeone_bundle_products']) ) {
        $items = [];
        foreach ( $_POST['_storeone_bundle_products'] as $row ) {
            if ( empty($row['id']) ) continue;
            $items[] = [
                'id'  => absint($row['id']),
                'qty' => max(1, absint($row['qty'] ?? 1)),
                // ✅ Optional product
                'optional' => isset( $row['optional'] ) ? 1 : 0,
                // ✅ Quantity settings
                'allow_change_quantity' => isset( $row['allow_change_quantity'] ) ? 1 : 0,
                'min_qty'               => absint( $row['min_qty'] ?? 0 ),
                'max_qty'               => absint( $row['max_qty'] ?? 0 ),
                // ✅ Discount settings
                'discount_type'    => sanitize_text_field( $row['discount_type'] ?? 'percent' ),
                'discount_percent' => floatval( $row['discount_percent'] ?? 0 ),
                'discount_fixed'   => floatval( $row['discount_fixed'] ?? 0 ),
            ];
        }
        update_post_meta( $post_id, '_storeone_bundle_products', $items );
        } else {
            update_post_meta( $post_id, '_storeone_bundle_products', [] );
        }
        $this->update_bundle_wc_prices( $post_id );
    }


    /* -----------------------------------------
     * Assets
     * ----------------------------------------- */
    public function enqueue_assets( $hook ) {

        if ( $hook !== 'post.php' && $hook !== 'post-new.php' ) return;

        wp_enqueue_style(
            'storeone-bundle-admin',
            STORE_ONE_PLUGIN_URL . 'assets/css/bundle-admin.css',
            [],
            STORE_ONE_VERSION
        );

        wp_enqueue_script(
            'storeone-bundle-admin',
            STORE_ONE_PLUGIN_URL . 'assets/js/bundle-admin.js',
            ['jquery','select2','jquery-ui-sortable'],
            STORE_ONE_VERSION,
            true
        );

        wp_localize_script( 'storeone-bundle-admin', 'StoreOneBundle', [
            'ajax' => admin_url('admin-ajax.php'),
            'nonce'=> wp_create_nonce('storeone_bundle_nonce'),
        ]);
    }

    /* -----------------------------------------
     * AJAX: Product Data
     * ----------------------------------------- */
    public function ajax_get_product_data() {

    check_ajax_referer( 'storeone_bundle_nonce', 'nonce' );

    $product = wc_get_product( absint($_POST['id']) );
    if ( ! $product ) wp_send_json_error();

    $price = $product->get_regular_price();
    if ( $price === '' || $price === null ) {
        $price = $product->get_price();
    }

    $price = floatval( $price );

    wp_send_json_success([
        'id'            => $product->get_id(),
        'title'         => $product->get_formatted_name(),
        'price_html'    => wc_price( $price ),   // display
        'regular_price' => (float) $price,       // 🔥 numeric
        'image'         => wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ),
        'edit'          => get_edit_post_link( $product->get_id() ),
        'type'          => $product->is_type('variation') ? 'variation' : 'simple',
    ]);
}

}

new Store_One_BNDLP_Admin();