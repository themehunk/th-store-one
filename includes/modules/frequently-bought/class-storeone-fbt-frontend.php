<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Store_One_FBT_Frontend {

    protected $option_key        = 'store_one_module_set';
    protected $active_rule       = null;
    protected $active_product_id = null;

    public function __construct() {

        // CSS + JS
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ] );

        // Single product par rule detect + placement ke hisab se hook attach
        add_action( 'woocommerce_before_single_product', [ $this, 'detect_rule_for_product' ], 1 );

        // AJAX: bundle add to cart
        add_action( 'wp_ajax_storeone_fbt_add_bundle', [ $this, 'ajax_add_bundle' ] );
        add_action( 'wp_ajax_nopriv_storeone_fbt_add_bundle', [ $this, 'ajax_add_bundle' ] );

        // Optional shortcode: [storeone_fbt id="123"]
        add_shortcode( 'storeone_fbt', [ $this, 'shortcode' ] );
    }

    /* --------------------------------------------------------------------
     * Assets
     * ------------------------------------------------------------------ */
    public function enqueue_assets() {

        wp_enqueue_style(
            'storeone-fbt',
            STORE_ONE_PLUGIN_URL . 'assets/css/storeone-fbt.css',
            [],
            STORE_ONE_VERSION
        );

        wp_enqueue_script(
            'storeone-fbt',
            STORE_ONE_PLUGIN_URL . 'assets/js/storeone-fbt.js',
            [ 'jquery' ],
            STORE_ONE_VERSION,
            true
        );

        wp_localize_script(
            'storeone-fbt',
            'StoreOneFBT',
            [
                'ajax_url'         => admin_url( 'admin-ajax.php' ),
                'nonce'            => wp_create_nonce( 'storeone_fbt_add_bundle' ),
                'currency_symbol'  => get_woocommerce_currency_symbol(),

                // Total text
                'total_single'     => __( 'Total for 1 item', 'store-one' ),
                'total_double'     => __( 'Total for 2 items', 'store-one' ),
                'total_multi'      => __( 'Total for selected items', 'store-one' ),

                // Button text (fallbacks – per-rule button_text PHP se aayega)
                'btn_single'       => __( 'Add 1 item to cart', 'store-one' ),
                'btn_double'       => __( 'Add 2 items to cart', 'store-one' ),
                'btn_multi'        => __( 'Add all selected to cart', 'store-one' ),
            ]
        );
    }

    /* --------------------------------------------------------------------
     * STEP 1: Product + Rule detect (woocommerce_before_single_product)
     * ------------------------------------------------------------------ */
    public function detect_rule_for_product() {

        if ( ! is_product() ) {
            return;
        }

        global $product;

        if ( ! $product instanceof WC_Product ) {
            $product = wc_get_product( get_the_ID() );
        }

        if ( ! $product instanceof WC_Product ) {
            return;
        }

        $product_id = $product->get_id();
        $rules      = $this->get_rules();

        if ( empty( $rules ) || ! is_array( $rules ) ) {
            return;
        }

        foreach ( $rules as $rule ) {

            if ( ! is_array( $rule ) ) {
                continue;
            }

            if ( $this->rule_matches( $rule, $product ) ) {

                $this->active_rule       = $rule;
                $this->active_product_id = $product_id;

                // Placement ke hisab se renderer hook add karo
                $this->hook_bundle_renderer( $rule );

                break;
            }
        }
    }

    /* --------------------------------------------------------------------
     * Placement -> WooCommerce hook map
     * ------------------------------------------------------------------ */
    protected function hook_bundle_renderer( $rule ) {

        $placement = $rule['placement'] ?? 'after_summary';
        $priority  = isset( $rule['priority'] ) ? absint( $rule['priority'] ) : 10;

        switch ( $placement ) {

            case 'after_title':
                // Title default priority 5, isliye 6 par
                $hook     = 'woocommerce_single_product_summary';
                $priority = 6;
                break;

            case 'before_summary':
                $hook = 'woocommerce_before_single_product_summary';
                break;

            case 'after_summary':
                $hook = 'woocommerce_after_single_product_summary';
                break;

            case 'after_tabs':
                $hook = 'woocommerce_after_single_product';
                break;

            case 'after_add_to_cart':
                $hook = 'woocommerce_after_add_to_cart_button';
                break;

            default:
                $hook = 'woocommerce_after_single_product_summary';
        }

        add_action(
            $hook,
            function() use ( $rule ) {
                $this->render_bundle_box(
                    $this->active_product_id,
                    $rule
                );
            },
            $priority
        );
    }

    /* --------------------------------------------------------------------
     * Settings + rules
     * ------------------------------------------------------------------ */
    protected function get_settings() {
        $settings = get_option( $this->option_key, [] );
        return is_array( $settings ) ? $settings : [];
    }

    protected function get_rules() {
        $settings = $this->get_settings();

        if (
            empty( $settings['frequently-bought'] ) ||
            empty( $settings['frequently-bought']['rules'] ) ||
            ! is_array( $settings['frequently-bought']['rules'] )
        ) {
            return [];
        }

        return $settings['frequently-bought']['rules'];
    }

    /* --------------------------------------------------------------------
     * Rule matching – trigger + exclude + user condition
     * ------------------------------------------------------------------ */
    protected function rule_matches( $rule, WC_Product $product ) {

        if ( ( $rule['status'] ?? '' ) !== 'active' ) {
            return false;
        }

        if ( empty( $rule['single_enabled'] ) ) {
            return false;
        }

        $product_id = $product->get_id();

        // User condition
        $user_condition = $rule['user_condition'] ?? 'all';
        if ( $user_condition === 'logged_in' && ! is_user_logged_in() ) {
            return false;
        }
        if ( $user_condition === 'guest' && is_user_logged_in() ) {
            return false;
        }

        // Trigger
        $trigger_type = $rule['trigger_type'] ?? 'all_products';

        switch ( $trigger_type ) {

            case 'specific_products':
                $ids = wp_list_pluck( $rule['products'] ?? [], 'id' );
                $ids = array_map( 'absint', $ids );
                if ( ! in_array( $product_id, $ids, true ) ) {
                    return false;
                }
                break;

            case 'specific_categories':
                $prod_cats = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'ids' ] );
                $rule_cats = wp_list_pluck( $rule['categories'] ?? [], 'id' );
                $rule_cats = array_map( 'absint', $rule_cats );
                if ( empty( array_intersect( $prod_cats, $rule_cats ) ) ) {
                    return false;
                }
                break;

            case 'specific_tags':
                $prod_tags = wp_get_post_terms( $product_id, 'product_tag', [ 'fields' => 'ids' ] );
                $rule_tags = wp_list_pluck( $rule['tags'] ?? [], 'id' );
                $rule_tags = array_map( 'absint', $rule_tags );
                if ( empty( array_intersect( $prod_tags, $rule_tags ) ) ) {
                    return false;
                }
                break;

            case 'all_products':
            default:
                // sab products allowed
                break;
        }

        // Exclude products
        if ( ! empty( $rule['exclude_products_enabled'] ) && ! empty( $rule['exclude_products'] ) ) {
            $exclude_ids = wp_list_pluck( $rule['exclude_products'], 'id' );
            $exclude_ids = array_map( 'absint', $exclude_ids );
            if ( in_array( $product_id, $exclude_ids, true ) ) {
                return false;
            }
        }

        // Exclude categories
        if ( ! empty( $rule['exclude_categories_enabled'] ) && ! empty( $rule['exclude_categories'] ) ) {
            $prod_cats    = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'ids' ] );
            $exclude_cats = wp_list_pluck( $rule['exclude_categories'], 'id' );
            $exclude_cats = array_map( 'absint', $exclude_cats );
            if ( ! empty( array_intersect( $prod_cats, $exclude_cats ) ) ) {
                return false;
            }
        }

        // Exclude tags
        if ( ! empty( $rule['exclude_tags_enabled'] ) && ! empty( $rule['exclude_tags'] ) ) {
            $prod_tags    = wp_get_post_terms( $product_id, 'product_tag', [ 'fields' => 'ids' ] );
            $exclude_tags = wp_list_pluck( $rule['exclude_tags'], 'id' );
            $exclude_tags = array_map( 'absint', $exclude_tags );
            if ( ! empty( array_intersect( $prod_tags, $exclude_tags ) ) ) {
                return false;
            }
        }

        // Exclude on sale
        if ( ! empty( $rule['exclude_on_sale_enabled'] ) && $product->is_on_sale() ) {
            return false;
        }

        return true;
    }

    /* --------------------------------------------------------------------
     * RENDER – THBT style_2 type layout (without thbt-wrapper, prefixed s1-fbt)
     * ------------------------------------------------------------------ */
    protected function render_bundle_box( $product_id, $rule ) {

        if ( ! $product_id ) {
            return;
        }

        $main = wc_get_product( $product_id );
        if ( ! $main ) {
            return;
        }

        // Bundle products
        $bundle_ids = [ $product_id ];
        $offer_raw  = $rule['offer_products'] ?? [];

        if ( ! empty( $offer_raw ) && is_array( $offer_raw ) ) {
            foreach ( $offer_raw as $item ) {
                if ( ! empty( $item['id'] ) ) {
                    $bundle_ids[] = absint( $item['id'] );
                }
            }
        }

        $bundle_ids = array_unique( array_filter( $bundle_ids ) );

        $bundle_products = [];
        foreach ( $bundle_ids as $id ) {
            $p = wc_get_product( $id );
            if ( ! $p ) {
                continue;
            }
            if ( ! $p->is_purchasable() || ! $p->is_in_stock() ) {
                continue;
            }
            $bundle_products[] = $p;
        }

        if ( count( $bundle_products ) <= 1 ) {
            return;
        }

        $bundle_title = ! empty( $rule['bundle_title'] )
            ? $rule['bundle_title']
            : __( 'Frequently Bought Together', 'store-one' );

        // Styling options
        $bg_color      = $rule['background']['color'] ?? '#ffffff';
        $border_color  = $rule['border_color'] ?? '#f9f9f9';
        $border_radius = $rule['border_radius']['Desktop'] ?? '0px';
        ?>
        <section
            class="s1-fbt-box"
            style="background-color: <?php echo esc_attr( $bg_color ); ?>;
                   border: 1px solid <?php echo esc_attr( $border_color ); ?>;
                   border-radius: <?php echo esc_attr( $border_radius ); ?>;">

            <h2 class="s1-fbt-title"><?php echo esc_html( $bundle_title ); ?></h2>

            <div class="s1-fbt-content s1-fbt-product-wrap"
                 data-id="<?php echo esc_attr( $product_id ); ?>"
                 data-s1fbt-order="0">

                <!-- Images + plus signs -->
                <div class="s1-fbt-content-one">
                    <div class="s1-fbt-product-row">
                        <?php
                        $current_index = 0;
                        foreach ( $bundle_products as $p ) {
                            $pid  = $p->get_id();
                            $type = $p->get_type();

                            if ( $current_index > 0 ) {
                                echo '<span class="s1-fbt-plus-sign" data-rel="' . esc_attr( $pid ) . '">+</span>';
                            }

                            $fbt_class = 's1-fbt-product s1-fbt-active';
                            if ( $pid === $product_id ) {
                                $fbt_class .= ' dltprd';
                            }
                            ?>
                            <div <?php wc_product_class( $fbt_class, $pid ); ?>>
                                <div class="s1-fbt-image">
                                    <?php echo wp_kses_post( $p->get_image() ); ?>
                                </div>
                            </div>
                            <?php
                            $current_index++;
                        }
                        ?>
                    </div>

                    <?php
                    // Total + button area
                    $this->render_total_wrap( $main, $rule );
                    ?>
                </div><!-- .s1-fbt-content-one -->

                <!-- Checkbox list -->
                <div class="s1-fbt-content-two s1-fbt-products">
                    <div class="s1-fbt-product-list">
                        <?php
                        foreach ( $bundle_products as $p ) {

                            $pid      = $p->get_id();
                            $ptype    = $p->get_type();
                            $is_main  = ( $pid === $product_id );
                            $is_var   = $p->is_type( 'variable' );

                            $price_value = ( ! $is_var && $p->is_in_stock() )
                                ? wc_get_price_to_display( $p )
                                : '';

                            $checked  = 'checked';
                            $disabled = $is_main ? 'disabled' : '';

                            $data_id = ( $is_var || ! $p->is_in_stock() )
                                ? 0
                                : $pid;
                            ?>
                            <div class="s1-fbt-product-list-add">
                                <label>
                                    <input
                                        id="<?php echo esc_attr( $pid ); ?>"
                                        name="product-checkbox[<?php echo esc_attr( $pid ); ?>]"
                                        value="<?php echo esc_attr( $price_value ); ?>"
                                        type="checkbox"
                                        class="s1-fbt-checkbox product-checkbox"
                                        data-name="<?php echo esc_attr( $p->get_name() ); ?>"
                                        data-price="<?php echo esc_attr( $price_value ); ?>"
                                        data-product-id="<?php echo esc_attr( $pid ); ?>"
                                        data-product-type="<?php echo esc_attr( $ptype ); ?>"
                                        data-id="<?php echo esc_attr( $data_id ); ?>"
                                        data-product-quantity="1"
                                        <?php echo $checked; ?>
                                        <?php echo $disabled; ?>
                                    />

                                    <span class="s1-fbt-product-title">
                                        <a href="<?php echo esc_url( $p->get_permalink() ); ?>">
                                            <?php echo esc_html( $p->get_name() ); ?>
                                        </a>
                                    </span>

                                    <span class="s1-fbt-product-price">
                                        <?php echo wp_kses_post( $p->get_price_html() ); ?>
                                    </span>

                                    <?php
                                    if ( $is_var ) {
                                        $this->render_variation_fields( $p );
                                    }
                                    ?>
                                </label>
                            </div>
                            <?php
                        }
                        ?>
                    </div>
                </div><!-- .s1-fbt-content-two -->
            </div><!-- .s1-fbt-content -->
        </section>
        <?php
    }

    /* --------------------------------------------------------------------
     * Variation dropdowns (THBT se port, prefixed)
     * ------------------------------------------------------------------ */
    protected function render_variation_fields( WC_Product $product ) {

        if ( ! $product->is_type( 'variable' ) ) {
            return;
        }

        $attributes           = $product->get_variation_attributes();
        $available_variations = $product->get_available_variations();

        if ( is_array( $attributes ) && count( $attributes ) > 0 ) : ?>

            <div class="variations_form"
                 data-product_id="<?php echo esc_attr( absint( $product->get_id() ) ); ?>"
                 data-product_variations="<?php echo esc_attr( htmlspecialchars( wp_json_encode( $available_variations ) ) ); ?>">

                <div class="variations s1-fbt-variation">

                    <?php foreach ( $attributes as $attribute_name => $options ) : ?>
                        <div class="variation">
                            <div class="select">
                                <?php
                                $selected = isset( $_REQUEST[ 'attribute_' . sanitize_title( $attribute_name ) ] )
                                    ? wc_clean( stripslashes( urldecode( $_REQUEST[ 'attribute_' . sanitize_title( $attribute_name ) ] ) ) )
                                    : $product->get_variation_default_attribute( $attribute_name );

                                wc_dropdown_variation_attribute_options(
                                    [
                                        'options'          => $options,
                                        'attribute'        => $attribute_name,
                                        'product'          => $product,
                                        'selected'         => $selected,
                                        'show_option_none' => sprintf(
                                            esc_html__( '%s', 'store-one' ),
                                            wc_attribute_label( $attribute_name )
                                        ),
                                    ]
                                );
                                ?>
                            </div>
                        </div>
                    <?php endforeach; ?>

                    <div class="reset">
                        <?php
                        echo apply_filters(
                            'woocommerce_reset_variations_link',
                            '<a class="reset_variations" href="#">' .
                            esc_html__( 'Clear', 'store-one' ) .
                            '</a>'
                        );
                        ?>
                    </div>

                </div><!-- .variations -->
            </div><!-- .variations_form -->

        <?php
        endif;
    }

    /* --------------------------------------------------------------------
     * Total price + button markup (THBT style, prefixed)
     * ------------------------------------------------------------------ */
    protected function render_total_wrap( WC_Product $product, $rule ) {

    // Settings
    $price_label                  = $this->get_fbt_setting($rule, 'price_label', __('Bundle price', 'store-one'));
    $one_price_label              = $this->get_fbt_setting($rule, 'one_price_label', __('Product price', 'store-one'));
    $single_only_label            = $this->get_fbt_setting($rule, 'single_only_label', '');
    $you_save_label_raw           = $this->get_fbt_setting($rule, 'you_save_label', 'You save: {amount}');
    $no_variation_text            = $this->get_fbt_setting($rule, 'no_variation_text', __('Please select an option to see your savings.', 'store-one'));
    $no_variation_no_discount     = $this->get_fbt_setting($rule, 'no_variation_no_discount_text', __('Please select an option to see the total price.', 'store-one'));
    $btn_label                    = $this->get_fbt_setting($rule, 'button_text', __('Add to cart', 'store-one'));

    // Base price
    if ( $product->get_type() !== 'variable' ) {
        $price      = wc_get_price_to_display( $product );
        $price_html = $product->get_price_html();
    } else {
        $price      = '';
        $price_html = '';
    }
    ?>

    <div class="s1-fbt-total-wrapper" 
         data-total="<?php echo esc_attr( $price ); ?>"
         data-no-var-text="<?php echo esc_attr( $no_variation_text ); ?>"
         data-no-var-nodisc-text="<?php echo esc_attr( $no_variation_no_discount ); ?>">

        <div class="s1-fbt-total-header">
            <span class="s1-fbt-total-title"><?php echo esc_html( $price_label ); ?></span>
        </div>

        <div class="s1-fbt-total-content">

            <div class="s1-fbt-one-price">
                <small><?php echo esc_html( $one_price_label ); ?>:</small>
                <strong class="s1-fbt-base-price">
                    <?php echo wp_kses_post( $price_html ); ?>
                </strong>
            </div>

            <div class="s1-fbt-saving-line">
                <span class="s1-fbt-saving-text"
                      data-template="<?php echo esc_attr( $you_save_label_raw ); ?>">
                </span>
            </div>

            <div class="s1-fbt-final-price">
                <span class="s1-fbt-total-final-amount"><?php echo wp_kses_post( $price_html ); ?></span>
            </div>

        </div>

        <div class="s1-fbt-action-box">
            <button type="submit"
                    class="button alt s1-fbt-add-button"
                    data-main-id="<?php echo esc_attr( $product->get_id() ); ?>">
                <?php echo esc_html( $btn_label ); ?>
            </button>

            <input type="hidden"
                   class="s1-fbt-selected-ids"
                   value=""
                   data-main-id="<?php echo esc_attr( $product->get_id() ); ?>">
        </div>

    </div>

     <?php
     }
     
     protected function get_fbt_setting( $rule, $key, $default = '' ) {
          return ! empty( $rule[ $key ] ) ? $rule[ $key ] : $default;
     }

    /* --------------------------------------------------------------------
     * Shortcode: [storeone_fbt id="123"]
     * ------------------------------------------------------------------ */
    public function shortcode( $atts ) {

        $atts = shortcode_atts(
            [
                'id' => 0,
            ],
            $atts,
            'storeone_fbt'
        );

        $product_id = absint( $atts['id'] );

        if ( ! $product_id && is_product() ) {
            global $product;
            if ( $product instanceof WC_Product ) {
                $product_id = $product->get_id();
            } else {
                $product_id = get_the_ID();
            }
        }

        if ( ! $product_id ) {
            return '';
        }

        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            return '';
        }

        $rules = $this->get_rules();
        if ( empty( $rules ) ) {
            return '';
        }

        $matched_rule = null;
        foreach ( $rules as $rule ) {
            if ( $this->rule_matches( $rule, $product ) ) {
                $matched_rule = $rule;
                break;
            }
        }

        if ( ! $matched_rule ) {
            return '';
        }

        ob_start();
        $this->render_bundle_box( $product_id, $matched_rule );
        return ob_get_clean();
    }

    /* --------------------------------------------------------------------
     * AJAX: Add bundle to cart (THBT style logic)
     * ------------------------------------------------------------------ */
    public function ajax_add_bundle() {

        if ( ! isset( $_POST['product_id'] ) ) {
            return;
        }

        check_ajax_referer( 'storeone_fbt_add_bundle', 'nonce' );

        if ( ! empty( $_POST['thbt_ids'] ) ) {

            if ( ! class_exists( 'WC_Form_Handler' ) || empty( $_REQUEST['thbt_ids'] ) ) {
                return;
            }

            remove_action( 'wp_loaded', [ 'WC_Form_Handler', 'add_to_cart_action' ], 20 );

            $product_ids   = explode( ',', $_REQUEST['thbt_ids'] );
            $quantity      = empty( $_POST['quantity'] ) ? 1 : wc_stock_amount( wp_unslash( $_POST['quantity'] ) );
            $variation_id  = isset( $_POST['variation_id'] ) ? wc_clean( wp_unslash( $_POST['variation_id'] ) ) : 0;
            $variation     = isset( $_POST['variation'] ) ? (array) $_POST['variation'] : [];

            foreach ( $product_ids as $product_id ) {

                $product_id     = apply_filters( 'woocommerce_add_to_cart_product_id', absint( $product_id ) );
                $adding_to_cart = wc_get_product( $product_id );

                if ( ! $adding_to_cart ) {
                    continue;
                }

                if ( $adding_to_cart->get_type() === 'simple' ) {
                    $variation_id = 0;
                    $variation    = [];
                }

                if ( $adding_to_cart && 'variation' === $adding_to_cart->get_type() ) {
                    $variation_id = $product_id;
                    $product_id   = $adding_to_cart->get_parent_id();

                    if ( empty( $variation ) ) {
                        $variation = $adding_to_cart->get_variation_attributes();
                    }
                }

                $passed_validation = apply_filters(
                    'woocommerce_add_to_cart_validation',
                    true,
                    $product_id,
                    $quantity,
                    $variation_id,
                    $variation
                );

                if ( $passed_validation && false !== WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation ) ) {

                    do_action( 'woocommerce_ajax_added_to_cart', $product_id );

                    wc_add_to_cart_message(
                        [ $product_id => $quantity ],
                        true
                    );
                }
            }

        } else {

            // Fallback: sirf ek product
            $product_id = (int) apply_filters(
                'woocommerce_add_to_cart_product_id',
                absint( $_POST['product_id'] )
            );

            $product      = wc_get_product( $product_id );
            $quantity     = empty( $_POST['quantity'] ) ? 1 : wc_stock_amount( wp_unslash( $_POST['quantity'] ) );
            $variation_id = isset( $_POST['variation_id'] ) ? wc_clean( wp_unslash( $_POST['variation_id'] ) ) : 0;
            $variation    = isset( $_POST['variation'] ) ? (array) $_POST['variation'] : [];

            if ( $product && $product->get_type() === 'simple' ) {
                $variation_id = 0;
                $variation    = [];
            }

            if ( $product && 'variation' === $product->get_type() ) {
                $variation_id = $product_id;
                $product_id   = $product->get_parent_id();

                if ( empty( $variation ) ) {
                    $variation = $product->get_variation_attributes();
                }
            }

            $passed_validation = apply_filters(
                'woocommerce_add_to_cart_validation',
                true,
                $product_id,
                $quantity,
                $variation_id,
                $variation
            );

            if ( $passed_validation && WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation ) ) {

                do_action( 'woocommerce_ajax_added_to_cart', $product_id );

                if ( 'yes' === get_option( 'woocommerce_cart_redirect_after_add' ) ) {
                    wc_add_to_cart_message(
                        [ $product_id => $quantity ],
                        true
                    );
                }
            }
        }

        WC_AJAX::get_refreshed_fragments();
        wp_die();
    }
}
