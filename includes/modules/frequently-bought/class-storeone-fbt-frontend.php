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
        add_action( 'wp_enqueue_scripts', [ $this, 'add_inline_dynamic_css' ], 20 );
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
                // 'button_text' => $rule['button_text'] ?? __('Add {count} items to cart', 'store-one'),
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

                // break;
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
 * RENDER — choose style per-rule (store-one / s1- classnames)
 * ------------------------------------------------------------------ */
protected function render_bundle_box( $product_id, $rule ) {

    if ( ! $product_id ) {
        return;
    }

    $main = wc_get_product( $product_id );
    if ( ! $main ) {
        return;
    }

    // Bundle products (same logic as before)
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

    // Title / styling defaults (keep same keys as your rule)
    $bundle_title = ! empty( $rule['bundle_title'] )
        ? $rule['bundle_title']
        : __( 'Frequently Bought Together', 'store-one' );

    // style: read from rule (this is set by your SelectControl)
    $style = ! empty( $rule['display_style'] ) ? $rule['display_style'] : 'style_2';

    // Dispatch to actual renderer that outputs the HTML
    switch ( $style ) {
        case 'style_1':
            $this->s1_render_style_1( $product_id, $rule, $bundle_products, $bundle_title );
            break;

        case 'style_3':
            $this->s1_render_table_style( $product_id, $rule, $bundle_products, $bundle_title );
            break;

        case 'style_2':
        default:
            $this->s1_render_style_2( $product_id, $rule, $bundle_products, $bundle_title );
            break;
    }
}

/* --------------------------------------------------------------------
 * STYLE 1 (cards/grid layout) — MATCHED TO THBT STYLE_1
 * ------------------------------------------------------------------ */
private function s1_render_style_1( $product_id, $rule, $bundle_products, $bundle_title ) {
?>
<section class="s1-fbt-box style_1" data-id="<?php echo esc_attr($product_id); ?>">
    
    <h2 class="s1-fbt-title"><?php echo esc_html( $bundle_title ); ?></h2>

    <div class="s1-fbt-content s1-fbt-product-wrap" data-id="<?php echo esc_attr($product_id); ?>">

        <!-- LEFT: PRODUCT GRID -->
        <div class="s1-fbt-content-one">
            <?php
            $index = 0;
            foreach ( $bundle_products as $p ) {
                $pid = $p->get_id();

                $cls = "s1-fbt-product ";
                $cls .= ($index === 0) ? "s1-fbt-active" : "s1-fbt-inactive";
                if ( $pid === $product_id ) {
                    $cls .= " dltprd";
                }
            ?>
            <div <?php wc_product_class($cls, $pid); ?>>
                <div class="s1-fbt-image">
                    <?php echo wp_kses_post( $p->get_image() ); ?>
                </div>

                <h4 class="s1-fbt-name">
                    <a href="<?php echo esc_url( $p->get_permalink() ); ?>">
                        <?php echo esc_html( $p->get_name() ); ?>
                    </a>
                </h4>

                <div class="s1-fbt-price">
                    <?php echo wp_kses_post( $p->get_price_html() ); ?>
                </div>
            </div>
            <?php
            $index++;
            }
            ?>
        </div>

        <!-- RIGHT: CHECKBOX LIST -->
        <div class="s1-fbt-content-two s1-fbt-products">
            <div class="s1-fbt-product-list">
                <?php foreach ( $bundle_products as $p ) {
                    $pid = $p->get_id();
                    $is_var = $p->is_type("variable");
                    $price_value = (!$is_var && $p->is_in_stock()) ? wc_get_price_to_display($p) : "";
                ?>
                <div class="s1-fbt-product-list-add">
                    <label>
                        <input type="checkbox"
                            class="product-checkbox s1-fbt-checkbox"
                            data-product-id="<?php echo esc_attr($pid); ?>"
                            value="<?php echo esc_attr($price_value); ?>"
                            checked
                            <?php echo ($pid === $product_id) ? "disabled" : ""; ?>
                        >

                        <span class="s1-fbt-product-title">
                            <a href="<?php echo esc_url($p->get_permalink()); ?>">
                                <?php echo esc_html( $p->get_name() ); ?>
                            </a>
                        </span>

                        <span class="s1-fbt-product-price">
                            <?php echo wp_kses_post( $p->get_price_html() ); ?>
                        </span>

                        <?php if ($is_var) $this->render_variation_fields($p); ?>
                    </label>
                </div>
                <?php } ?>

                <?php $this->render_total_wrap( $bundle_products[0], $rule ); ?>
            </div>
        </div>

    </div>
</section>
<?php
}

/* --------------------------------------------------------------------
 * STYLE 2 (horizontal row) — MATCHED TO THBT STYLE_2
 * ------------------------------------------------------------------ */
private function s1_render_style_2( $product_id, $rule, $bundle_products, $bundle_title ) {
?>
<section class="s1-fbt-box style_2" data-id="<?php echo esc_attr($product_id); ?>">
    
    <h2 class="s1-fbt-title"><?php echo esc_html( $bundle_title ); ?></h2>

    <div class="s1-fbt-content s1-fbt-product-wrap">

        <!-- IMAGES + TOTAL -->
        <div class="s1-fbt-content-one">

            <div class="s1-fbt-product-row">
                <?php
                $i = 0;
                foreach ( $bundle_products as $p ) {
                    $pid = $p->get_id();

                    if ($i > 0) {
                        echo '<span class="s1-fbt-plus-sign">+</span>';
                    }
                ?>
                    <div class="s1-fbt-product s1-fbt-active <?php echo ($pid==$product_id?'dltprd':''); ?>">
                        <div class="s1-fbt-image">
                            <?php echo $p->get_image(); ?>
                        </div>
                    </div>
                <?php
                $i++;
                }
                ?>
            </div>

            <!-- TOTAL BOX -->
            <?php $this->render_total_wrap( $bundle_products[0], $rule ); ?>
        </div>

        <!-- CHECKBOX LIST -->
        <div class="s1-fbt-content-two">
            <div class="s1-fbt-product-list">

                <?php foreach ( $bundle_products as $p ) {
                    $pid = $p->get_id();
                    $is_var = $p->is_type("variable");
                    $price_value = (!$is_var && $p->is_in_stock()) ? wc_get_price_to_display($p) : "";
                ?>
                <div class="s1-fbt-product-list-add">
                    <label>
                        <input type="checkbox"
                               class="product-checkbox s1-fbt-checkbox"
                               value="<?php echo esc_attr($price_value); ?>"
                               checked
                               <?php echo ($pid==$product_id) ? "disabled" : ""; ?>>

                        <span class="s1-fbt-product-title">
                            <a href="<?php echo esc_url($p->get_permalink()); ?>">
                                <?php echo esc_html($p->get_name()); ?>
                            </a>
                        </span>

                        <span class="s1-fbt-product-price">
                            <?php echo $p->get_price_html(); ?>
                        </span>

                        <?php if ($p->is_type("variable")) $this->render_variation_fields($p); ?>
                    </label>
                </div>
                <?php } ?>

            </div>
        </div>

    </div>
</section>
<?php
}
/* --------------------------------------------------------------------
 * STYLE 3 (table) — s1 classes
 * ------------------------------------------------------------------ */
private function s1_render_table_style( $product_id, $rule, $bundle_products, $bundle_title ) {
    ?>
   <section class="s1-fbt-box <?php echo esc_attr($rule['display_style']); ?>"  data-id="<?php echo esc_attr($product_id); ?>" >

        <h2 class="s1-fbt-title"><?php echo esc_html( $bundle_title ); ?></h2>

        <div class="s1-fbt-content s1-fbt-product-wrap"
             data-id="<?php echo esc_attr( $product_id ); ?>"
             data-s1fbt-order="0">

            <div class="s1-fbt-content-table s1-fbt-products">
                <div class="s1-fbt-product-list">

                    <table class="s1-fbt-product-table">
                        <tbody>
                        <?php
                        foreach ( $bundle_products as $p ) {

                            if ( ! $p || ! $p->is_purchasable() || ! $p->is_in_stock() ) {
                                continue;
                            }

                            $pid = $p->get_id();
                            $is_main = ( $pid === $product_id );
                            $is_var  = $p->is_type( 'variable' );

                            $checked  = $is_main ? 'checked' : '';
                            $disabled = $is_main ? 'disabled' : '';

                            $price_value = (! $is_var && $p->is_in_stock())
                                ? wc_get_price_to_display( $p )
                                : '';
                            ?>
                            <tr class="s1-fbt-product-list-add">

                                <!-- checkbox -->
                                <td class="s1-fbt-check">
                                    <input
                                        type="checkbox"
                                        class="product-checkbox s1-fbt-checkbox"
                                        id="<?php echo esc_attr( $pid ); ?>"
                                        name="product-checkbox[<?php echo esc_attr( $pid ); ?>]"
                                        value="<?php echo esc_attr( $price_value ); ?>"
                                        data-name="<?php echo esc_attr( $p->get_name() ); ?>"
                                        data-price="<?php echo esc_attr( $price_value ); ?>"
                                        data-product-id="<?php echo esc_attr( $pid ); ?>"
                                        data-product-type="<?php echo esc_attr( $p->get_type() ); ?>"
                                        data-id="<?php echo esc_attr( $is_var ? 0 : $pid ); ?>"
                                        data-product-quantity="1"
                                        <?php echo $checked; ?>
                                        <?php echo $disabled; ?>
                                    >
                                </td>

                                <!-- image + title + variations -->
                                <td class="s1-fbt-td-title">
                                    <label>

                                        <div <?php wc_product_class( 's1-fbt-product', $pid ); ?>>
                                            <div class="s1-fbt-image">
                                                <?php echo wp_kses_post( $p->get_image() ); ?>
                                            </div>
                                        </div>

                                        <span class="s1-fbt-product-title">
                                            <a href="<?php echo esc_url( $p->get_permalink() ); ?>">
                                                <?php echo esc_html( $p->get_name() ); ?>
                                            </a>
                                        </span>

                                        <?php if ( $is_var ) { $this->render_variation_fields( $p ); } ?>

                                    </label>
                                </td>

                                <!-- price -->
                                <td class="s1-fbt-last">
                                    <span class="s1-fbt-product-price">
                                        <?php echo wp_kses_post( $p->get_price_html() ); ?>
                                    </span>
                                </td>
                            </tr>
                        <?php } ?>
                        </tbody>

                        <tfoot>
                        <tr class="s1-fbt-total-row">
                            <td></td>
                            <td></td>
                            <td class="s1-fbt-total-wrap">
                                <?php $this->render_total_wrap( wc_get_product( $product_id ), $rule ); ?>
                            </td>
                        </tr>
                        </tfoot>

                    </table>

                </div>
            </div>

        </div>
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
    // $single_only_label            = $this->get_fbt_setting($rule, 'single_only_label', '');
    $you_save_label_raw           = $this->get_fbt_setting($rule, 'you_save_label', 'You save: {amount}');
    $no_variation_text            = $this->get_fbt_setting($rule, 'no_variation_text', __('Please select an option to see your savings.', 'store-one'));
    $no_variation_no_discount     = $this->get_fbt_setting($rule, 'no_variation_no_discount_text', __('Please select an option to see the total price.', 'store-one'));
    $btn_label                    = $this->get_fbt_setting($rule, 'button_text', __('Add {count} items to cart', 'store-one'));

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
                <small><?php echo esc_html( $price_label ); ?>:</small>
                <span class="s1-fbt-total-final-amount"><?php echo wp_kses_post( $price_html ); ?></span>
            </div>

        </div>

        <div class="s1-fbt-action-box">
            <button type="submit"
            class="button alt s1-fbt-add-button"
            data-main-id="<?php echo esc_attr( $product->get_id() ); ?>"
            data-template="<?php echo esc_attr( $btn_label ); ?>">
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
       

    check_ajax_referer( 'storeone_fbt_add_bundle', 'nonce' );

    if ( empty($_POST['main_id']) ) {
        wp_send_json_error(['msg' => 'Missing main_id']);
    }

    $main_id = absint($_POST['main_id']);
    
    $selected_ids = isset($_POST['selected_ids']) ? (array) $_POST['selected_ids'] : [];

    if (empty($selected_ids)) {
        wp_send_json_error(['msg' => 'No selected products']);
    }

    foreach ($selected_ids as $pid) {

        $pid = absint($pid);
        if (!$pid) continue;

        $product = wc_get_product($pid);
        if (!$product) continue;

        // Always quantity = 1
        $quantity = 1;

        // Variable support (basic)
        $variation_id = 0;
        $variation_data = [];

        if ($product->is_type('variation')) {
            $variation_id = $pid;
            $pid = $product->get_parent_id();
            $variation_data = $product->get_variation_attributes();
        }

        WC()->cart->add_to_cart(
            $pid,
            $quantity,
            $variation_id,
            $variation_data
        );
    }

    WC_AJAX::get_refreshed_fragments();
    wp_die();
}

// dynamic css add
public function add_inline_dynamic_css() {

    if ( ! is_product() ) return;

    global $product;

    if ( ! $product instanceof WC_Product ) {
        $product = wc_get_product( get_the_ID() );
    }

    if ( ! $product ) return;

    $rules = $this->get_rules();
    if ( empty( $rules ) ) return;

    $css = '';

    foreach ( $rules as $rule ) {

        if ( $this->rule_matches( $rule, $product ) ) {

            $css .= $this->generate_dynamic_css( $rule, $product->get_id() );
        }
    }

    if ( ! empty( $css ) ) {
        wp_add_inline_style( 'storeone-fbt', $css );
    }
}

protected function generate_dynamic_css( $rule, $product_id ) {

    $id = absint($product_id);
    $title   = store_one_normalize_radius( $rule['bundel_title_clr'] ?? '#111' );
    $bg      = store_one_normalize_radius( $rule['bundel_bg_clr'] ?? '#fff' );
    $border  = store_one_normalize_radius( $rule['bundel_brd_clr'] ?? '#eee' );
    $ptitle  = store_one_normalize_radius( $rule['prd_tle_clr'] ?? '#111' );
    $pprice  = store_one_normalize_radius( $rule['prd_prc_clr'] ?? '#111' );
    $plus    = store_one_normalize_radius( $rule['bundel_plus_clr'] ?? '#888' );
    $content = store_one_normalize_radius( $rule['bundel_cnt_clr'] ?? '#111' );
    $btnbg   = store_one_normalize_radius( $rule['bundel_btn_bg'] ?? '#111' );
    $btntxt  = store_one_normalize_radius( $rule['bundel_btn_txt'] ?? '#fff' );
    $radius  = store_one_normalize_radius( $rule['border_radius'] ?? '0px' );
    return "
    .s1-fbt-box[data-id='{$id}'] {
        background: {$bg};
        border-color: {$border};
        border-radius: {$radius};
    }
    .s1-fbt-box[data-id='{$id}'] .s1-fbt-title{
        background: {$title};
        -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    }
    .s1-fbt-box[data-id='{$id}'] .s1-fbt-name,
    .s1-fbt-box[data-id='{$id}'] .s1-fbt-name a {
        color: {$ptitle};
    }
    .s1-fbt-box[data-id='{$id}'] .s1-fbt-product-title a {
        color: {$ptitle};
    }
    .s1-fbt-box[data-id='{$id}'] .s1-fbt-product-price,.s1-fbt-box[data-id='{$id}'] .s1-fbt-price {
        color: {$pprice};
    }
    .s1-fbt-box[data-id='{$id}'] .s1-fbt-plus-sign {
        color: {$plus};
    }
    .s1-fbt-box[data-id='{$id}'] .s1-fbt-total-content,
    .s1-fbt-box[data-id='{$id}'] .s1-fbt-total-title {
        color: {$content};
    }
    .s1-fbt-box[data-id='{$id}'] .s1-fbt-add-button {
        background: {$btnbg};
        color: {$btntxt};
    }
    ";
}


}