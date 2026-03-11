<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class StoreOne_FBT_Frontend {

    protected $option_key        = 'store_one_module_set';
    protected $active_rule       = null;
    protected $active_product_id = null;

    public function __construct() {

        $modules = get_option('store_one_module_option', []);

        if ( empty($modules['frequently-bought']) ) {
                return;
        }

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
        // Required for variable products
        wp_enqueue_script( 'wc-add-to-cart-variation' );

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
// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
        global $product;

        if ( ! $product instanceof WC_Product ) {
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
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

        $hook = store_one_get_hook_from_placement( $placement );

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

        // -----------------------------
        // USER CONDITION
        // -----------------------------

        $user_condition = $rule['user_condition'] ?? 'all';

        $current_user = wp_get_current_user();
        $current_id   = get_current_user_id();
        $user_roles   = (array) $current_user->roles;

        /* =========================
        * ALL USERS MODE
        * ========================= */

        if ( $user_condition === 'all' ) {

            if ( ! empty( $rule['exclude_enabled'] ) ) {

                // Exclude roles
                if ( ! empty( $rule['exclude_roles'] ) ) {

                    if ( array_intersect( $user_roles, $rule['exclude_roles'] ) ) {
                        return false;
                    }

                }

                // Exclude users
                if ( ! empty( $rule['exclude_users'] ) ) {

                    if ( in_array( $current_id, $rule['exclude_users'] ) ) {
                        return false;
                    }

                }

            }

        }

        /* =========================
        * ROLE MODE
        * ========================= */

        if ( $user_condition === 'roles' ) {

            $allowed_roles = $rule['allowed_roles'] ?? [];

            if ( empty( array_intersect( $user_roles, $allowed_roles ) ) ) {
                return false;
            }

            // exclude specific users
            if ( ! empty( $rule['exclude_users_enabled'] ) ) {

                if ( in_array( $current_id, $rule['exclude_users'] ?? [] ) ) {
                    return false;
                }

            }

        }
        /* =========================
        * USERS MODE
        * ========================= */

        if ( $user_condition === 'users' ) {

            if ( ! in_array( $current_id, $rule['allowed_users'] ?? [] ) ) {
                return false;
            }

        }

        // Trigger
        $trigger_type = $rule['trigger_type'] ?? 'all_products';

       

        switch ( $trigger_type ) {

            case 'specific_products':
                $ids = $this->get_ids( $rule['products'] ?? [] );
                if ( ! in_array( $product_id, $ids, true ) ) {
                    return false;
                }
                break;

            case 'specific_categories':
                $prod_cats = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'ids' ] );
                $rule_cats = $this->get_ids( $rule['categories'] ?? [] );
                if ( empty( array_intersect( $prod_cats, $rule_cats ) ) ) {
                    return false;
                }
                break;

            case 'specific_tags':
                $prod_tags = wp_get_post_terms( $product_id, 'product_tag', [ 'fields' => 'ids' ] );
                $rule_tags = $this->get_ids( $rule['tags'] ?? [] );
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
            $exclude_ids = $this->get_ids( $rule['exclude_products'] ?? [] );
            if ( in_array( $product_id, $exclude_ids, true ) ) {
                return false;
            }
        }

        // Exclude categories
        if ( ! empty( $rule['exclude_categories_enabled'] ) && ! empty( $rule['exclude_categories'] ) ) {
            $prod_cats    = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'ids' ] );
           $exclude_cats = $this->get_ids( $rule['exclude_categories'] ?? [] );
            if ( ! empty( array_intersect( $prod_cats, $exclude_cats ) ) ) {
                return false;
            }
        }

        // Exclude tags
        if ( ! empty( $rule['exclude_tags_enabled'] ) && ! empty( $rule['exclude_tags'] ) ) {
            $prod_tags    = wp_get_post_terms( $product_id, 'product_tag', [ 'fields' => 'ids' ] );
            $exclude_tags = $this->get_ids( $rule['exclude_tags'] ?? [] );
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

    private function get_ids( $items ) {

    if ( empty( $items ) ) {
        return [];
    }

    // Agar structure [{id:18}] hai
    if ( is_array( $items ) && isset( $items[0]['id'] ) ) {
        $items = wp_list_pluck( $items, 'id' );
    }

    return array_map( 'absint', $items );
}
/* --------------------------------------------------------------------
 * RENDER — choose style per-rule (store-one / s1- classnames)
 * ------------------------------------------------------------------ */
protected function render_bundle_box( $product_id, $rule ) {

    if ( ! $product_id ) return;

    $main = wc_get_product( $product_id );
    if ( ! $main ) return;

    // MAIN PRODUCT
    $bundle_ids = [ absint( $product_id ) ];

    // OFFER PRODUCTS (IDs only)
    $offer_raw = $rule['offer_products'] ?? [];

    if ( is_array( $offer_raw ) ) {
        foreach ( $offer_raw as $id ) {
            $bundle_ids[] = absint( $id );
        }
    }

    $bundle_ids = array_unique( array_filter( $bundle_ids ) );


    $bundle_products = [];

    foreach ( $bundle_ids as $id ) {
        $p = wc_get_product( $id );
        if ( ! $p ) continue;
        if ( ! $p->is_purchasable() || ! $p->is_in_stock() ) continue;
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
 * STYLE 1 (cards layout) — FIXED & STABLE
 * ------------------------------------------------------------------ */
private function s1_render_style_1( $product_id, $rule, $bundle_products, $bundle_title ) {
?>
<section class="s1-fbt-box style_1" data-rule-id="<?php echo esc_attr( $rule['flexible_id']); ?>" data-id="<?php echo esc_attr( $product_id ); ?>">
    <h2 class="s1-fbt-title"><?php echo esc_html( $bundle_title ); ?></h2>

    <div class="s1-fbt-content-wrap" data-id="<?php echo esc_attr( $product_id ); ?>">
        <div class="s1-fbt-cards-row">
            <?php
            $index = 0;

            foreach ( $bundle_products as $p ) :

                $pid    = $p->get_id();
                $is_var = $p->is_type( 'variable' );

                //FIX: price_val properly defined
                $price_val = '';
                if ( ! $is_var && $p->is_in_stock() ) {
                    $price_val = wc_get_price_to_display( $p );
                }

                // Card classes
                $cls  = 's1-fbt-card-holder s1-fbt-product ';
                $cls .= ( $index === 0 ) ? 's1-fbt-active ' : '';
                if ( $pid === $product_id ) {
                    $cls .= 'dltprd ';
                }
            ?>

            <div <?php wc_product_class( $cls, $pid ); ?>>

                <?php if ( $index > 0 ) : ?>
                    <div class="s1-fbt-plus-wrap">
                        <span class="s1-fbt-plus-floating">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                 viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" stroke-width="3"
                                 stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 12h14"></path>
                                <path d="M12 5v14"></path>
                            </svg>
                        </span>
                    </div>
                <?php endif; ?>

                <div class="s1-fbt-card">
                    <label class="s1-fbt-check-wrap <?php echo ( $index === 0 ) ? 'is-checked' : ''; ?>">
                        <input
                            type="checkbox"
                            class="product-checkbox s1-fbt-checkbox s1-fbt-card-checkbox"
                            data-product-id="<?php echo esc_attr( $pid ); ?>"
                            value="<?php echo esc_attr( $price_val ); ?>"
                            <?php checked( true ); ?>
                            <?php disabled( $pid === $product_id ); ?>
                        >
                        <span class="s1-fbt-check-ui">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                 viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" stroke-width="3"
                                 stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 6 9 17l-5-5"></path>
                            </svg>
                        </span>
                    </label>

                    <div class="s1-fbt-image">
                        <?php echo wp_kses_post( $p->get_image() ); ?>
                    </div>

                    <h4 class="s1-fbt-card-title">
                        <a href="<?php echo esc_url( $p->get_permalink() ); ?>">
                            <?php echo esc_html( $p->get_name() ); ?>
                        </a>
                    </h4>

                    <div class="s1-fbt-card-price">
                        <?php echo wp_kses_post( $p->get_price_html() ); ?>
                    </div>
                </div>
            </div>

            <?php
                $index++;
            endforeach;
            ?>
        </div>

        <?php
        $this->render_style1_total_wrap(
            $bundle_products[0],
            $rule,
            $bundle_products
        );
        ?>
    </div>
</section>
<?php
}

/* --------------------------------------------------------------------
 * STYLE 1 — Total + summary + button (JS compatible)
 * ------------------------------------------------------------------ */
protected function render_style1_total_wrap( WC_Product $main_product, $rule, $bundle_products ) {

    $price_label     = $this->get_fbt_setting( $rule, 'price_label', __('Bundle Total', 'store-one') );
    $btn_label       = $this->get_fbt_setting( $rule, 'button_text', __('Add Bundle to Cart', 'store-one') );
    $one_price_label = $this->get_fbt_setting( $rule, 'one_price_label', __('{count} items selected', 'store-one') );
    $you_save_tpl    = $this->get_fbt_setting( $rule, 'you_save_label', 'You save: {amount}' );

    $base_price = '';
    if ( $main_product->get_type() !== 'variable' ) {
        $base_price = wc_get_price_to_display( $main_product );
    }
?>
<div class="s1-fbt-summary"
     data-base-price="<?php echo esc_attr( $base_price ); ?>"
     data-one-pricelabel="<?php echo esc_attr( $one_price_label ); ?>"
     data-save-template="<?php echo esc_attr( $you_save_tpl ); ?>">

    <div class="s1-fbt-footer-wrap-1">

        <div class="s1-fbt-bundle-wrap">
            <div class="s1-fbt-summary-label"><?php echo esc_html( $price_label ); ?>:</div>
            <div class="s1-fbt-summary-price s1-fbt-total-final-amount">
                <?php echo wp_kses_post( wc_price( $base_price ) ); ?>
            </div>
            <span class="s1-fbt-summary-count">
                <?php echo count( $bundle_products ); ?> items selected
            </span>
        </div>

        <div class="s1-fbt-bundle-list-wrap">
            <ul class="s1-fbt-checklist">
                <?php foreach ( $bundle_products as $p ) :

                    
                    $pid = $p->get_id();
                   
                    $is_var = $p->is_type( 'variable' );

                    $price_val = ( ! $is_var && $p->is_in_stock() )
                        ? wc_get_price_to_display( $p )
                        : '';
                ?>
                <li>
                    <label class="s1-title-wrap s1-fbt-row">

                        <input type="checkbox"
                               class="product-checkbox s1-fbt-checkbox"
                               data-product-id="<?php echo esc_attr( $pid ); ?>"
                               
                               value="<?php echo esc_attr( $price_val ); ?>"
                               checked>

                        <span class="s1-name"><?php echo esc_html( $p->get_name() ); ?></span>
                        <div class="s1-price-wrap">
                        <span class="s1-price">
                            <span class="s1-price-html">
                                <?php echo wp_kses_post( $p->get_price_html() ); ?>
                            </span>
                        </span>

                        <?php if ( $is_var ) : ?>
                            <div class="s1-variation-wrap">
                                <?php $this->render_variation_fields( $p ); ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    </label>
                </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </div>

    <div class="s1-fbt-footer-wrap-2">
        <button class="s1-fbt-add-btn s1-fbt-add-button"
                data-main-id="<?php echo esc_attr( $main_product->get_id() ); ?>">
            <?php echo esc_html( $btn_label ); ?>
        </button>

        <input type="hidden"
               class="s1-fbt-selected-ids"
               data-main-id="<?php echo esc_attr( $main_product->get_id() ); ?>"
               value="">
    </div>

</div>
<?php
}
/* --------------------------------------------------------------------
 * STYLE 2 (horizontal row) — MATCHED TO THBT STYLE_2
 * ------------------------------------------------------------------ */
private function s1_render_style_2( $product_id, $rule, $bundle_products, $bundle_title ) {
?>
<section class="s1-fbt-box style_2" data-rule-id="<?php echo esc_attr( $rule['flexible_id']); ?>" data-id="<?php echo esc_attr($product_id); ?>">
    
    <h2 class="s1-fbt-title"><?php echo esc_html( $bundle_title ); ?></h2>

    <div class="s1-fbt-style2-wrap">
    <div class="s1-fbt-style2-left">
        <div class="s1-fbt-equation">
            <?php
            $index = 0;
            $total_products = count( $bundle_products );
            foreach ( $bundle_products as $p ) {
            ?>
            <div class="s1-fbt-eq-item" data-product-id="<?php echo esc_attr( $p->get_id() ); ?>">
                <div class="s1-fbt-eq-img">
                    <?php echo wp_kses_post( $p->get_image() ); ?>
                </div>
                <?php if ( $index < $total_products - 1 ) : ?>
           <span class="s1-fbt-plus" >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus text-white" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span>
            <?php endif; ?>
            </div>
            <?php $index++;
            }?>
        </div>

        <ul class="s1-fbt-checklist">
            <?php
            $index = 0;
            $total_products = count( $bundle_products );
            foreach ( $bundle_products as $p ) {
                $is_var   = $p->is_type( 'variable' );
                        $price_val = ( ! $is_var && $p->is_in_stock() )
                            ? wc_get_price_to_display( $p )
                            : '';
            ?>
            <li>
                <div class="s1-title-wrap">
                    <label class="s1-fbt-check-wrap <?php echo ($index === 0) ? 'is-checked' : ''; ?>">
                    <input
                        type="checkbox"
                        class="product-checkbox s1-fbt-checkbox s1-fbt-card-checkbox"
                        data-product-id="<?php echo esc_attr( $p->get_id() ); ?>"
                        value="<?php echo esc_attr( $price_val ); ?>"
                        <?php checked( true ); ?>
                        <?php disabled( $p->get_id() === $product_id ); ?>
                    >

                    <span class="s1-check-icon">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            width="14" height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                    </span>
                </label>
                    <span class="s1-name"><a href="<?php echo esc_url( $p->get_permalink() ); ?>">
                        <?php echo esc_html( $p->get_name() ); ?>
                    </a></span>
                    <span class="s1-price"> 
                        <?php echo wp_kses_post( $p->get_price_html() ); ?>

                </span>
                <?php if ( $is_var ) $this->render_variation_fields( $p ); ?>
                </div>
            </li>
            <?php $index++;
            }?>
        </ul>
    </div>
    <?php
    $this->render_style2_total_wrap(
        $bundle_products[0], // main product
        $rule,
        $bundle_products
    );
    ?>
</section>
<?php
}

/* --------------------------------------------------------------------
 * STYLE 2 — Total box + button (JS compatible)
 * ------------------------------------------------------------------ */
protected function render_style2_total_wrap( WC_Product $main_product, $rule, $bundle_products ) {

    $price_label  = $this->get_fbt_setting( $rule, 'price_label', __('Bundle price', 'store-one') );
    $btn_label    = $this->get_fbt_setting( $rule, 'button_text', __('Add Bundle to Cart', 'store-one') );
    $one_price_label  = $this->get_fbt_setting( $rule, 'one_price_label', __('{count} items selected', 'store-one') );
    // Base price (main product)
    $base_price = '';
    if ( $main_product->get_type() !== 'variable' ) {
        $base_price = wc_get_price_to_display( $main_product );
    }
    ?>

    <div class="s1-fbt-style2-right">

        <div class="s1-fbt-total-box"
             data-base-price="<?php echo esc_attr( $base_price ); ?>"
             data-one-pricelabel="<?php echo esc_attr( $one_price_label ); ?>">

            <!-- TOTAL COUNT -->
            <div class="s1-total-text s1-fbt-total-title">
                <span>
                    <?php echo count( $bundle_products ); ?> items selected
                </span>
                
            </div>

            <!-- ORIGINAL PRICE -->
            <div class="s1-total-text original">
                <span><?php esc_html_e('Original price:', 'store-one'); ?></span>
                <del class="s1-fbt-original-price">
                     <?php echo wp_kses_post( wc_price( $base_price ) ); ?>
                </del>
            </div>

            <!-- BUNDLE PRICE -->
            <div class="s1-total-price">
                <span><?php echo esc_html( $price_label ); ?>:</span>
                <strong class="s1-fbt-total-final-amount">
                    <?php echo wp_kses_post( wc_price( $base_price ) ); ?>
                </strong>
            </div>

            <!-- ADD TO CART -->
            <button class="s1-fbt-add-btn s1-fbt-add-button"
                    data-main-id="<?php echo esc_attr( $main_product->get_id() ); ?>">
                <?php echo esc_html( $btn_label ); ?>
            </button>

            <!-- SELECTED IDS (JS FILLS THIS) -->
            <input type="hidden"
                   class="s1-fbt-selected-ids"
                   data-main-id="<?php echo esc_attr( $main_product->get_id() ); ?>"
                   value="">
        </div>

    </div>

    <?php
}

/* --------------------------------------------------------------------
 * STYLE 3 (table) — s1 classes
 * ------------------------------------------------------------------ */
private function s1_render_table_style( $product_id, $rule, $bundle_products, $bundle_title ) {
    ?>
   <section class="s1-fbt-box style_3"  data-rule-id="<?php echo esc_attr( $rule['flexible_id']); ?>" data-id="<?php echo esc_attr($product_id); ?>" >

        <h2 class="s1-fbt-title"><?php echo esc_html( $bundle_title ); ?></h2>

       <div class="s1-fbt-flex-list">
        <?php
            $index = 0;
            $total_products = count( $bundle_products );
            foreach ( $bundle_products as $p ) {
                $is_var   = $p->is_type( 'variable' );
                        $price_val = ( ! $is_var && $p->is_in_stock() )
                            ? wc_get_price_to_display( $p )
                            : '';
                if ( $p->is_in_stock() ) {
                if ( $p->is_type( 'variable' ) ) {
                        $price_val = wc_get_price_to_display( $p, [
                            'price' => $p->get_variation_price( 'min' )
                        ] );
                    } else {
                        $price_val = wc_get_price_to_display( $p );
                    }

                } else {
                    $price_val = 0;
                }
            ?>
        <div class="s1-fbt-flex-item">
            <label class="s1-fbt-check-wrap <?php echo ($index === 0) ? 'is-checked' : ''; ?>">
                    <input
                        type="checkbox"
                        class="product-checkbox s1-fbt-checkbox s1-fbt-card-checkbox"
                        data-product-id="<?php echo esc_attr( $p->get_id() ); ?>"
                        value="<?php echo esc_attr( $price_val ); ?>"
                        <?php checked( true ); ?>
                        <?php disabled( $p->get_id() === $product_id ); ?>
                    >

                    <span class="s1-check-icon">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            width="14" height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                    </span>
                </label>
            <div class="s1-fbt-thumb"><?php echo wp_kses_post( $p->get_image() ); ?></div>
            <div class="s1-fbt-content">
            <div class="s1-fbt-info"><a class="s1-fbt-product-title" href="<?php echo esc_url( $p->get_permalink() ); ?>">
                        <?php echo esc_html( $p->get_name() ); ?>
                    </a></div>
            <div class="s1-fbt-price">
                <?php echo wp_kses_post( $p->get_price_html() ); ?>
           </div>
           
            </div>
             <?php if ( $is_var ) $this->render_variation_fields( $p ); ?>
           
        </div>
        <?php 
        $index++;
            }?>
            <?php
    $this->render_style3_total_wrap(
        wc_get_product( $product_id ),
        $rule,
        $bundle_products
    );
    ?>
       </div>
    </section>
    <?php
}
/* --------------------------------------------------------------------
 * STYLE 3 — Total price + button markup
 * ------------------------------------------------------------------ */
protected function render_style3_total_wrap( WC_Product $product, $rule, $bundle_products ) {

    // Settings
    $price_label      = $this->get_fbt_setting(
        $rule,
        'price_label',
        __( 'Total price', 'store-one' )
    );

    $add_btn_text     = $this->get_fbt_setting(
        $rule,
        'add_all_text',
        __( 'Add All to Cart', 'store-one' )
    );
    $one_price_label  = $this->get_fbt_setting( $rule, 'one_price_label', __('{count} items selected', 'store-one') );
    // Initial counts
    $total_items = count( $bundle_products );

    ?>
    <div class="s1-fbt-total-bar" data-base-price="<?php echo esc_attr( wc_get_price_to_display( $product ) ); ?>" data-one-pricelabel="<?php echo esc_attr( $one_price_label ); ?>">

        <div class="s1-fbt-total-left">
            <span class="s1-total-label">
            <?php echo esc_html( str_replace('{count}', count($bundle_products), $one_price_label) ); ?>
        </span>

            <div class="s1-fbt-total-price">
                <strong class="s1-fbt-total-final-amount">
                    <?php echo wp_kses_post( wc_price( 0 ) ); ?>
                </strong>

                <del class="s1-fbt-total-compare-amount" style="display:none;">
                    <?php echo wp_kses_post( wc_price( 0 ) ); ?>
                </del>
            </div>
        </div>

        <button
            class="s1-fbt-add-btn s1-fbt-add-bundle"
            data-main-id="<?php echo esc_attr( $product->get_id() ); ?>"
        >
            <?php echo esc_html( $add_btn_text ); ?>
        </button>

        <input
            type="hidden"
            class="s1-fbt-selected-ids"
            data-main-id="<?php echo esc_attr( $product->get_id() ); ?>"
            value=""
        />

    </div>
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
$attr_key = 'attribute_' . sanitize_title( $attribute_name );
/**
 * We are using $_GET for display purposes, not for updating database, 
 * so we can safely ignore Nonce Verification here.
 */
// phpcs:ignore WordPress.Security.NonceVerification.Recommended
$request_val = isset( $_GET[ $attr_key ] ) ? sanitize_text_field( wp_unslash( $_GET[ $attr_key ] ) ) : '';

$selected = $request_val ?: $product->get_variation_default_attribute( $attribute_name );

                                    wc_dropdown_variation_attribute_options(
                                    [
                                        'options'          => $options,
                                        'attribute'        => $attribute_name,
                                        'product'          => $product,
                                        'selected'         => $selected,
                                        'show_option_none' => wc_attribute_label( $attribute_name ),
                                    ]
                                );
                                ?>
                            </div>
                        </div>
                    <?php endforeach; ?>

                    <div class="reset">
                        <?php
                       
                        echo wp_kses_post(
                            
                            apply_filters(
                                // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
                                'woocommerce_reset_variations_link',
                                '<a class="reset_variations" href="#">' .
                                esc_html__( 'Clear', 'store-one' ) .
                                '</a>'
                            )
                        );
                        ?>
                    </div>

                </div><!-- .variations -->
            </div><!-- .variations_form -->

        <?php
        endif;
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
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
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

    public function ajax_add_bundle() {

    check_ajax_referer( 'storeone_fbt_add_bundle', 'nonce' );

    if ( empty($_POST['items']) || ! is_array($_POST['items']) ) {
        wp_send_json_error();
    }
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
    $items = isset($_POST['items']) ? wp_unslash($_POST['items']) : [];

    foreach ( $items as $item ) {

        $product_id   = isset($item['product_id']) ? absint($item['product_id']) : 0;
        $variation_id = isset($item['variation_id']) ? absint($item['variation_id']) : 0;
        $quantity     = 1;

        if ( ! $product_id ) {
            continue;
        }

        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            continue;
        }

        /* =====================================
         * CASE 1: VARIATION ID EXPLICITLY SENT
         * ===================================== */
        if ( $variation_id ) {

            $variation = wc_get_product( $variation_id );
            if ( ! $variation || ! $variation->is_type('variation') ) {
                continue;
            }

            $product_id = $variation->get_parent_id();
            $variation  = $variation->get_variation_attributes();
        }

        /* =====================================
         * CASE 2: PRODUCT ITSELF IS VARIATION
         * (THBT STYLE FALLBACK)
         * ===================================== */
        if ( $product->is_type('variation') ) {

            $variation_id = $product_id;
            $product_id   = $product->get_parent_id();
            $variation    = $product->get_variation_attributes();
        }

        /* =====================================
         * ADD TO CART (SINGLE ENTRY POINT)
         * ===================================== */
        $bundle_items = get_post_meta( $product_id, '_storeone_bundle_products', true );

        $cart_item_data = [];

        if ( ! empty( $bundle_items ) && is_array( $bundle_items ) ) {

            $items = [];

            foreach ( $bundle_items as $bi ) {

                if ( empty( $bi['id'] ) ) continue;

                $items[] = [
                    'id'  => absint( $bi['id'] ),
                    'qty' => max( 1, absint( $bi['qty'] ?? 1 ) ),
                ];
            }

            if ( ! empty( $items ) ) {

                $bundle_data = [
                    'items' => $items,
                    'scope' => get_post_meta(
                        $product_id,
                        '_storeone_discount_scope',
                        true
                    ) ?: 'store_bundle',
                ];

                $cart_item_data['storeone_bundle'] = $bundle_data;
                $cart_item_data['storeone_bundle_key'] = md5( wp_json_encode( $bundle_data ) );
            }
        }
       
        $passed = apply_filters(
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
            'woocommerce_add_to_cart_validation',
            true,
            $product_id,
            $quantity,
            $variation_id,
            $variation ?? []
        );

        if ( $passed ) {

            WC()->cart->add_to_cart(
                $product_id,
                $quantity,
                $variation_id,
                $variation ?? [],
                $cart_item_data
            );
        }
    }

    WC()->cart->maybe_set_cart_cookies();
    WC_AJAX::get_refreshed_fragments();
    wp_die();
}
// dynamic css add
public function add_inline_dynamic_css() {

    if ( ! is_product() ) return;
    // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
    global $product;

    if ( ! $product instanceof WC_Product ) {
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
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

    $id      = $rule['flexible_id'];
    $title   = storeone_normalize_color( $rule['bundel_title_clr'] );
    $bg      = storeone_normalize_color( $rule['bundel_bg_clr'] );
    $border  = storeone_normalize_color( $rule['bundel_brd_clr'] );
    $oborder  = storeone_normalize_color( $rule['outer_brd_clr'] );
    $bundel_tle_brd_clr  = storeone_normalize_color( $rule['bundel_tle_brd_clr']);
    $ptitle  = storeone_normalize_color( $rule['prd_tle_clr']);
    $pprice  = storeone_normalize_color( $rule['prd_prc_clr']);
    
    $bundel_chk_clr  = storeone_normalize_color( $rule['bundel_chk_clr']);
    $bundel_chk_bg_clr  = storeone_normalize_color( $rule['bundel_chk_bg_clr']);
    $plus    = storeone_normalize_color( $rule['bundel_plus_clr']);
    $plusbg    = storeone_normalize_color( $rule['bundel_plus_bg_clr']);
    $content = storeone_normalize_color( $rule['bundel_cnt_clr']);
    
    $btnbg   = storeone_normalize_color( $rule['bundel_btn_bg']);
    $btntxt  = storeone_normalize_color( $rule['bundel_btn_txt']);
    $radius  = storeone_normalize_radius( $rule['border_radius']);
    return "
    .s1-fbt-box[data-rule-id='{$id}'],
    section.s1-fbt-box.style_3[data-rule-id='{$id}'] {
        background: {$bg};
        border: 1px solid {$oborder};
        border-radius: {$radius};
    }
    .s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-title{
        background: {$title};
        -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    }
    .style_1.s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-title{
        border-color: {$bundel_tle_brd_clr};
    }
    .s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-card-title,
    .s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-card-title a,
    .style_1.s1-fbt-box[data-rule-id='{$id}'] .s1-title-wrap .s1-name,
    .style_2.s1-fbt-box[data-rule-id='{$id}'] .s1-title-wrap .s1-name, 
    .style_2.s1-fbt-box[data-rule-id='{$id}'] .s1-title-wrap .s1-name a,
    .style_3.s1-fbt-box[data-id='{$id}'] .s1-fbt-product-title {
        color: {$ptitle};
    }
    .s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-product-title a {
        color: {$ptitle};
    }
   
    .s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-card-price,
    .s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-card-price .price,
    .style_1.s1-fbt-box[data-rule-id='{$id}'] .s1-price,
    .s1-fbt-box[data-rule-id='{$id}'].style_1 .s1-fbt-summary-price,
    .s1-fbt-box[data-rule-id='{$id}'].style_2 .s1-price,  
    .s1-fbt-box[data-rule-id='{$id}'].style_2 .s1-price .price, 
    .s1-fbt-box[data-rule-id='{$id}'].style_1 .s1-price .price,
    .s1-fbt-box[data-rule-id='{$id}'].style_2 .s1-fbt-total-final-amount,
    .style_3.s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-price,
    .style_3.s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-total-final-amount {
        color: {$pprice}!important;
    }
    .style_1.s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-plus-floating,
    .style_2.s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-plus{
        color: {$plus};
        background: {$plusbg};
    }
   .style_1.s1-fbt-box[data-id='{$id}'] .s1-fbt-check-wrap input:checked + .s1-fbt-check-ui{
        background: {$bundel_chk_bg_clr};
        color: {$bundel_chk_clr};
    }
    .style_2.s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-checkbox:checked + .s1-check-icon,
    .style_3.s1-fbt-box[data-rule-id='{$id}'] .s1-fbt-checkbox:checked + .s1-check-icon{
        background: {$bundel_chk_bg_clr};
        color: {$bundel_chk_clr};
        border-color: {$bundel_chk_bg_clr};
    }
    .s1-fbt-box.style_1[data-rule-id='{$id}'] .s1-fbt-summary,
    .s1-fbt-box.style_2[data-rule-id='{$id}'] .s1-fbt-total-box,
    .s1-fbt-box.style_2[data-rule-id='{$id}'] .s1-total-text{
        color: {$content};
    }
    .s1-fbt-box.style_1[data-rule-id='{$id}'] .s1-fbt-summary-label,
    .s1-fbt-box.style_3[data-rule-id='{$id}'] .s1-total-label{
    color: {$content};
    }
    .s1-fbt-box.style_1[data-rule-id='{$id}'] .s1-fbt-add-button,
    .s1-fbt-box.style_1[data-rule-id='{$id}'] .added_to_cart,
    .style_2[data-rule-id='{$id}'] .s1-fbt-add-btn, .style_2[data-rule-id='{$id}'] .added_to_cart,
    .style_3[data-rule-id='{$id}'] .s1-fbt-add-btn, .style_3[data-rule-id='{$id}'] .added_to_cart{
        background: {$btnbg};
        color: {$btntxt};
    }
    .style_2[data-rule-id='{$id}'] .s1-fbt-style2-right{
        border-color: {$bundel_tle_brd_clr};
    }
    .style_3[data-rule-id='{$id}'] .s1-fbt-flex-item{
        border-color: {$border};
        border-radius: {$radius};
    }";
 }

}