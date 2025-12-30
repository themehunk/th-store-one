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
        add_action('woocommerce_admin_process_product_object',[ $this, 'save' ]);
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
        add_action( 'wp_ajax_storeone_get_product_data', [ $this, 'ajax_get_product_data' ] );
    }

    public function add_product_type( $types ) {
        $types['storeone_bundle'] = __( 'Product Bundle', 'store-one' );
        return $types;
    }

    public function add_tab( $tabs ) {
        $tabs['storeone_bundle'] = [
            'label'  => __( 'Bundled Products', 'store-one' ),
            'target' => 'storeone_bundle_product_data',
            'class'  => [ 'show_if_storeone_bundle' ],
        ];
        return $tabs;
    }

    public function render_panel() {
    global $post;

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
                        $price = $product->get_regular_price();

                        if ( $price === '' || $price === null ) {
                            $price = $product->get_price();
                        }

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

                            <a href="#" class="remove">×</a>

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
          
            <p class="form-field storeone-bundle-regular-price">
                <label><?php
                printf(
                    __( 'Regular Price (%s)', 'store-one' ),
                    get_woocommerce_currency_symbol()
                );
                ?></label>
                <input type="text" class="storeone-bundle-regular-input"
                     readonly
                    value="<?php echo esc_attr( wc_format_localized_price( $this->calculate_bundle_regular_price( $items ) ) ); ?>">
            </p>
        
            <?php

            woocommerce_wp_select( [
            'id'      => '_storeone_discount_scope',
            'label'   => __( 'Discount Scope', 'store-one' ),
            'options' => [
                'bundle'  => __( 'Bundle wide', 'store-one' ),
                'product' => __( 'Per product', 'store-one' ),
            ],
            'value'   => get_post_meta( $post->ID, '_storeone_discount_scope', true ) ?: 'bundle',
            ] );
           
            $fxdprice = get_post_meta( $post->ID, '_storeone_fixed_price', true );
            $fxdprice = $fxdprice ?: 'no';

            woocommerce_wp_select( [
                'id'      => '_storeone_fixed_price',
                'label'   => __( 'Fixed Price', 'store-one' ),
                'options' => [
                    'yes'  => __( 'Yes', 'store-one' ),
                    'no' => __( 'No', 'store-one' ),
                ],
                'value'   => $fxdprice,
                'wrapper_class'=> 'show_if_storeone_bundle_scope',
            ] );
            
            woocommerce_wp_select( [
            'id'      => '_storeone_discount_type',
            'label'   => __( 'Discount Type', 'store-one' ),
            'options' => [
                'percent' => __( 'Percentage', 'store-one' ),
                'fixed'   => __( 'Fixed Amount', 'store-one' ),
            ],
            'value'   => get_post_meta( $post->ID, '_storeone_discount_type', true ) ?: 'percent',
        ] );
            woocommerce_wp_text_input( [
            'id'    => '_storeone_discount_percent',
            'label' => __( 'Discount (%)', 'store-one' ),
            'type'  => 'number',
            'custom_attributes' => [
                'min' => '0',
                'max' => '100',
                'step'=> '0.01',
            ],
            'value' => get_post_meta( $post->ID, '_storeone_discount_percent', true ),
        ] );

            woocommerce_wp_text_input( [
                'id'                => '_storeone_discount_fixed',
                'label'             => __( 'Discount', 'store-one' ),
                'type'              => 'number',
                'custom_attributes' => [
                    'min'  => '0',
                    'max'  => '1000',
                    'step' => '1',
                ],
                'value'             => get_post_meta( $post->ID, '_storeone_discount_fixed', true ),
                'wrapper_class'     => 'show_if_storeone_discount_fixed',
               
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
        $price = $product->get_regular_price();
        if ( $price === '' ) {
            $price = $product->get_price();
        }

        $total += floatval( $price ) * $qty;
    }

    return wc_format_decimal( $total );
}



    public function save( $post_id ) {

    if ( ! $product instanceof WC_Product ) {
        return;
    }

    if ( $product->get_type() !== 'storeone_bundle' ) {
        return;
    }

    if ( isset( $_POST['_storeone_discount_scope'] ) ) {
        $product->update_meta_data(
            '_storeone_discount_scope',
            sanitize_text_field( $_POST['_storeone_discount_scope'] )
        );
    }
    
    /* ------------------------------
     * BUNDLE PRODUCTS
     * ------------------------------ */
    if ( ! empty( $_POST['_storeone_bundle_products'] ) && is_array( $_POST['_storeone_bundle_products'] ) ) {

        $items = [];

        foreach ( $_POST['_storeone_bundle_products'] as $row ) {
            if ( empty( $row['id'] ) ) continue;

            $items[] = [
                'id'  => absint( $row['id'] ),
                'qty' => max( 1, absint( $row['qty'] ?? 1 ) ),
            ];
        }

       update_meta_data( $post_id, '_storeone_bundle_products', $items );
    }
}

    /* -----------------------------------------
     * Assets
     * ----------------------------------------- */
    public function enqueue_assets( $hook ) {

        if ( $hook !== 'post.php' && $hook !== 'post-new.php' ) return;

        wp_enqueue_style(
            'storeone-bundle-admin',
            STORE_ONE_PLUGIN_URL . 'assets/css/storeone-bndle.css',
            [],
            STORE_ONE_VERSION
        );

        wp_enqueue_script(
            'storeone-bundle-admin',
            STORE_ONE_PLUGIN_URL . 'assets/js/storeone-bndle.js',
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