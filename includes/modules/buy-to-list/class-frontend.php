<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class StoreOne_Buy_To_List_Frontend {

    private $rules = array();

    public function __construct() {

        $settings = get_option( 'store_one_module_set', array() );

        if ( isset( $settings['buy-to-list']['rules'] ) ) {
            $this->rules = $settings['buy-to-list']['rules'];
        }

        add_action( 'wp', array( $this, 'register_hooks' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'add_inline_dynamic_css' ), 20 );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ] );
        add_shortcode( 'storeone_featured_list', array( $this, 'shortcode_render' ) );
    }

    /* --------------------------------------------------------------------
     * Assets
     * ------------------------------------------------------------------ */
    public function enqueue_assets() {

        wp_enqueue_style(
            'buy-to-list',
            STORE_ONE_PLUGIN_URL . 'assets/css/buy-to-list.css',
            [],
            STORE_ONE_VERSION
        );

       
    }

    /**
     * Register Woo hooks
     */
    public function register_hooks() {

        if ( ! is_product() || empty( $this->rules ) ) {
            return;
        }

        foreach ( $this->rules as $rule ) {

            if ( empty( $rule['status'] ) || 'active' !== $rule['status'] ) {
                continue;
            }

            $hook     = $this->get_hook_from_placement( $rule );
            $priority = isset( $rule['priority'] ) ? absint( $rule['priority'] ) : 10;

            add_action( $hook, function() use ( $rule ) {

               global $product;

               if ( ! $product instanceof WC_Product ) {
                    return;
               }

               if ( $this->rule_matches( $rule, $product ) ) {
                    $this->render_single_rule( $rule );
               }

               }, $priority );
        }
    }

    /**
     * Placement → Hook Mapping
     */
    private function get_hook_from_placement( $rule ) {

        $placement = isset( $rule['placement'] )
            ? sanitize_text_field( $rule['placement'] )
            : 'after_summary';

        switch ( $placement ) {

            case 'before_add_to_cart':
                return 'woocommerce_before_add_to_cart_button';

            case 'after_title':
                return 'woocommerce_single_product_summary';

            case 'after_add_to_cart':
                return 'woocommerce_after_add_to_cart_button';

            case 'after_summary':
            default:
                return 'woocommerce_after_single_product_summary';
        }
    }

    private function rule_matches( $rule, $product ) {

    $product_id = $product->get_id();

    /* ---------------- Trigger Type ---------------- */

    $trigger = $rule['trigger_type'] ?? 'all_products';
    if ( $trigger === 'disable' ) {
    return false; //
    }

    switch ( $trigger ) {

        case 'specific_products':
            if ( empty( $rule['products'] ) || ! in_array( $product_id, $rule['products'], true ) ) {
                return false;
            }
            break;

        case 'specific_categories':
            if ( empty( $rule['categories'] ) ) {
                return false;
            }
            $product_cats = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'ids' ] );
            if ( ! array_intersect( $rule['categories'], $product_cats ) ) {
                return false;
            }
            break;

        case 'specific_tags':
            if ( empty( $rule['tags'] ) ) {
                return false;
            }
            $product_tags = wp_get_post_terms( $product_id, 'product_tag', [ 'fields' => 'ids' ] );
            if ( ! array_intersect( $rule['tags'], $product_tags ) ) {
                return false;
            }
            break;

        case 'all_products':
        default:
            break;
    }

    /* ---------------- Exclude Products ---------------- */

    if ( ! empty( $rule['exclude_products_enabled'] ) && ! empty( $rule['exclude_products'] ) ) {
        if ( in_array( $product_id, $rule['exclude_products'], true ) ) {
            return false;
        }
    }

    /* ---------------- Exclude Categories ---------------- */

    if ( ! empty( $rule['exclude_categories_enabled'] ) && ! empty( $rule['exclude_categories'] ) ) {

        $product_cats = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'ids' ] );

        if ( array_intersect( $rule['exclude_categories'], $product_cats ) ) {
            return false;
        }
    }

    /* ---------------- Exclude Tags ---------------- */

    if ( ! empty( $rule['exclude_tags_enabled'] ) && ! empty( $rule['exclude_tags'] ) ) {

        $product_tags = wp_get_post_terms( $product_id, 'product_tag', [ 'fields' => 'ids' ] );

        if ( array_intersect( $rule['exclude_tags'], $product_tags ) ) {
            return false;
        }
    }

    /* ---------------- Exclude On Sale ---------------- */

    if ( ! empty( $rule['exclude_on_sale_enabled'] ) ) {
        if ( $product->is_on_sale() ) {
            return false;
        }
    }

    /* ---------------- User Role Condition ---------------- */

    if ( ! empty( $rule['allowed_roles'] ) ) {

        if ( ! is_user_logged_in() ) {
            return false;
        }

        $user = wp_get_current_user();

        if ( ! array_intersect( $rule['allowed_roles'], $user->roles ) ) {
            return false;
        }
    }

    return true;
    }

    public function shortcode_render( $atts ) {

    $atts = shortcode_atts(
        array(
            'id' => '',
        ),
        $atts
    );

    if ( empty( $atts['id'] ) ) {
        return '';
    }

    foreach ( $this->rules as $rule ) {

        if ( isset( $rule['flexible_id'] ) && $rule['flexible_id'] === $atts['id'] ) {

            ob_start();
            $this->render_single_rule( $rule );
            return ob_get_clean();
        }
    }

    return '';
   }


    /**
     * Render Single Rule (No Inline Style)
     */
    private function render_single_rule( $rule ) {

        if ( empty( $rule['buy_list'] ) ) {
            return;
        }

        $wrapper_id = 'storeone-btl-' . sanitize_html_class( $rule['flexible_id'] ?? uniqid() );

        ob_start();
        ?>

        <div id="<?php echo esc_attr( $wrapper_id ); ?>" class="storeone-btl-wrapper">

            <?php if ( ! empty( $rule['list_title'] ) ) : ?>
                <h3 class="storeone-btl-title">
                    <?php echo esc_html( $rule['list_title'] ); ?>
                </h3>
            <?php endif; ?>

            <ul class="storeone-btl-list">

                <?php foreach ( $rule['buy_list'] as $item ) : ?>
                    <?php if ( empty( $item['text'] ) ) continue; ?>

                    <li class="storeone-btl-item">

                        <?php if ( ! empty( $rule['icon_enabled'] ) ) : ?>

    <span class="storeone-btl-icon">

        <?php
        $icon_type = isset( $rule['icontype'] ) ? $rule['icontype'] : 'icon';

        // 1️⃣ Preset SVG Icons
        if ( 'icon' === $icon_type ) {

            echo $this->get_icon_svg( $rule['selected_icon'] ?? 'check' );

        }

        // 2️⃣ Uploaded Image
        elseif ( 'image' === $icon_type && ! empty( $rule['image_url'] ) ) {

            printf(
                '<img src="%s" alt="%s" class="storeone-btl-icon-img" />',
                esc_url( $rule['image_url'] ),
                esc_attr__( 'List Icon', 'store-one' )
            );

        }

        // 3️⃣ Custom SVG Code
        elseif ( 'custom_svg' === $icon_type && ! empty( $rule['custom_svg'] ) ) {

            echo wp_kses(
                $rule['custom_svg'],
                array(
                    'svg'  => array(
                        'xmlns' => true,
                        'width' => true,
                        'height' => true,
                        'viewBox' => true,
                        'fill' => true,
                        'stroke' => true,
                        'class' => true,
                    ),
                    'path' => array(
                        'd' => true,
                        'fill' => true,
                        'stroke' => true,
                        'stroke-width' => true,
                        'stroke-linecap' => true,
                        'stroke-linejoin' => true,
                    ),
                )
            );

        }
        ?>

    </span>

<?php endif; ?>


                        <?php if ( ! empty( $item['text'] ) ) : ?>

                    <?php if ( ! empty( $item['link_enabled'] ) && ! empty( $item['link_url'] ) ) : ?>

                        <a 
                            class="storeone-btl-text storeone-btl-link"
                            href="<?php echo esc_url( $item['link_url'] ); ?>"
                        >
                            <?php echo esc_html( $item['text'] ); ?>
                        </a>

                    <?php else : ?>

                        <span class="storeone-btl-text">
                            <?php echo esc_html( $item['text'] ); ?>
                        </span>

                    <?php endif; ?>

                <?php endif; ?>

                    </li>

                <?php endforeach; ?>

            </ul>

        </div>

        <?php

        echo apply_filters(
            'storeone_buy_to_list_output',
            ob_get_clean(),
            $rule
        );
    }

    /**
     * Dynamic CSS (No Inline Style)
     */
    public function add_inline_dynamic_css() {

        // if ( ! is_product() || empty( $this->rules ) ) {
        //     return;
        // }

        // global $product;

        // if ( ! $product instanceof WC_Product ) {
        //     $product = wc_get_product( get_the_ID() );
        // }

        // if ( ! $product ) {
        //     return;
        // }

        $css = '';

        foreach ( $this->rules as $rule ) {

            if ( empty( $rule['status'] ) || 'active' !== $rule['status'] ) {
                continue;
            }

            $css .= $this->generate_dynamic_css( $rule );
        }

        if ( ! empty( $css ) ) {
            wp_add_inline_style( 'buy-to-list', $css );
        }
    }

    /**
     * Generate Per-Rule CSS
     */
    protected function generate_dynamic_css( $rule ) {

        if ( empty( $rule['flexible_id'] ) ) {
            return '';
        }

        $id = 'storeone-btl-' . sanitize_html_class( $rule['flexible_id'] );

        $bg        = store_one_normalize_color( $rule['btl_bg_clr'] ?? '#ffffff' );
        $title     = store_one_normalize_color( $rule['btl_title_clr'] ?? '#111' );
        $list      = store_one_normalize_color( $rule['btl_list_clr'] ?? '#111' );
        $icon_bg   = store_one_normalize_color( $rule['btl_icon_bg_clr'] ?? '#fff' );
        $icon_clr  = store_one_normalize_color( $rule['btl_icon_clr'] ?? '#2563eb' );

        $css  = "#{$id} { background: {$bg}; }";
        $css .= "#{$id} .storeone-btl-title { color: {$title}; }";
        $css .= "#{$id} .storeone-btl-text { color: {$list}; }";
        $css .= "#{$id} .storeone-btl-icon { background: {$icon_bg}; color: {$icon_clr}; }";

        return $css;
    }

    /**
     * SVG Icons
     */
    private function get_icon_svg( $icon ) {
        switch ( $icon ) {
            case 'star':
                return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M12 3L14.9 8.3L21 9.2L16.5 13.6L17.8 19.8L12 16.7L6.2 19.8L7.5 13.6L3 9.2L9.1 8.3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>';

            case 'heart':
                return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M20.8 4.6C19.1 2.9 16.4 2.9 14.7 4.6L12 7.3L9.3 4.6C7.6 2.9 4.9 2.9 3.2 4.6C1.5 6.3 1.5 9 3.2 10.7L12 19.5L20.8 10.7C22.5 9 22.5 6.3 20.8 4.6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>';

            case 'bolt':
                return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M13 2L3 14H11L9 22L21 8H13L13 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>';

            case 'check':
            default:
                return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
        }
    }
}