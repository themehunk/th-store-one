<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Th_StoreOne_Product_Brand_Frontend {

    private $rules = array();

    public function __construct() {

    $modules = get_option('th_store_one_module_option', []);

        if ( empty($modules['product-brand']) ) {
                return;
        } 

        $settings = get_option( 'th_store_one_module_set', array() );

        if ( isset( $settings['product-brand']['rules'] ) ) {
            $this->rules = $settings['product-brand']['rules'];
        }

        add_action( 'wp', array( $this, 'register_hooks' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'add_inline_dynamic_css' ), 20 );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ] );
        add_shortcode( 'th_store_one_featured_list', array( $this, 'shortcode_render' ) );
    }

    /* --------------------------------------------------------------------
     * Assets
     * ------------------------------------------------------------------ */
    public function enqueue_assets() {

        wp_enqueue_style( 
            'th-product-brand',
            TH_STORE_ONE_PLUGIN_URL . 'assets/css/product-brand.css',
            [],
            TH_STORE_ONE_VERSION
        );
        wp_enqueue_style(
            'swiper-css',
            TH_STORE_ONE_PLUGIN_URL . 'assets/css/swiper/swiper-bundle.min.css',
            array(),
            '11'
        );

        wp_enqueue_script(
            'swiper-js',
           TH_STORE_ONE_PLUGIN_URL . 'assets/js/swiper/swiper-bundle.min.js',
            array(),
            '11',
            true
        );
        wp_enqueue_script(
            'th-store-trust-badges',
           TH_STORE_ONE_PLUGIN_URL . 'assets/js/th-store-trust-badges.js',
            array(),
            TH_STORE_ONE_VERSION,
            false
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

        $placement = $rule['placement'] ?? 'after_summary';
        $priority  = isset( $rule['priority'] ) ? absint( $rule['priority'] ) : 10;

        $hook = th_store_one_get_hook_from_placement( $placement );
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

    if ( empty( $rule['brand_list'] ) || ! is_array( $rule['brand_list'] ) ) {
        return;
    }

    $wrapper_id = 'storeone-product-brand-' . sanitize_html_class( $rule['flexible_id'] ?? uniqid() );

    ?>
    <div id="<?php echo esc_attr( $wrapper_id ); ?>" 
         class="storeone-product-brand-wrapper <?php echo ! empty($rule['black_image_enabled']) ? 's1-bw-mode' : ''; ?>"">

        <?php if ( ! empty( $rule['list_title'] ) ) : ?>
            <h3 class="storeone-product-brand-title">
                <?php echo esc_html( $rule['list_title'] ); ?>
            </h3>
        <?php endif; ?>

        <?php if ( ! empty( $rule['slider']['enabled'] ) ) : ?>

<div 
    class="storeone-product-brand-swiper swiper"
    data-slides="<?php echo esc_attr( $rule['slider']['slides'] ?? 4 ); ?>"
    data-autoplay="<?php echo ! empty($rule['slider']['autoplay']) ? 'true' : 'false'; ?>"
    data-nav="<?php echo ! empty($rule['slider']['navigation']) ? 'true' : 'false'; ?>"
    data-gap="<?php echo esc_attr( $rule['image_gap'] ?? 15 ); ?>"
>

    <div class="swiper-wrapper">

        <?php foreach ( $rule['brand_list'] as $item ) : ?>

            <?php if ( empty( $item['image_url'] ) ) continue; ?>

            <div class="swiper-slide">

                <div class="storeone-product-brand-item">

                    <?php if ( ! empty( $item['link_enabled'] ) && ! empty( $item['link_url'] ) ) : ?>
                        <a href="<?php echo esc_url( $item['link_url'] ); ?>" target="_blank">
                    <?php endif; ?>

                    <img 
                        src="<?php echo esc_url( $item['image_url'] ); ?>" 
                        style="max-width:<?php echo esc_attr( $rule['max_width'] ?? 100 ); ?>px;"
                    />

                    <?php if ( ! empty( $item['link_enabled'] ) ) : ?>
                        </a>
                    <?php endif; ?>

                </div>

            </div>

        <?php endforeach; ?>

    </div>

    <?php if ( ! empty( $rule['slider']['navigation'] ) ) : ?>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
    <?php endif; ?>

</div>

<?php else : ?>

        <ul class="storeone-product-brand-list">

            <?php foreach ( $rule['brand_list'] as $item ) : ?>

                <?php if ( empty( $item['image_url'] ) ) continue; ?>

                <li class="storeone-product-brand-item">

                    <?php if ( ! empty( $item['link_enabled'] ) && ! empty( $item['link_url'] ) ) : ?>

                        <a href="<?php echo esc_url( $item['link_url'] ); ?>" 
                           target="_blank" 
                           rel="noopener noreferrer">
                            <?php echo sprintf(
                        '<img src="%s" alt="" style="max-width:%spx;height:auto;object-fit:contain;" />',
                        esc_url( $item['image_url'] ),
                        esc_attr( $rule['max_width'] ?? 100 )
                    ); ?>
                        </a>

                    <?php else : ?>

                        <?php echo sprintf(
                        '<img src="%s" alt="" style="max-width:%spx;height:auto;object-fit:contain;" />',
                        esc_url( $item['image_url'] ),
                        esc_attr( $rule['max_width'] ?? 100 )
                    ); ?>

                    <?php endif; ?>

                </li>

            <?php endforeach; ?>

        </ul>
<?php  endif;?>
    </div>
    <?php
   }

    /**
     * Dynamic CSS (No Inline Style)
     */
    public function add_inline_dynamic_css() {

        $css = '';

        foreach ( $this->rules as $rule ) {

            if ( empty( $rule['status'] ) || 'active' !== $rule['status'] ) {
                continue;
            }

            $css .= $this->generate_dynamic_css( $rule );
        }

        if ( ! empty( $css ) ) {
            wp_add_inline_style( 'th-product-brand', $css );
        }
    }

    /**
     * Generate Per-Rule CSS
     */
    protected function generate_dynamic_css( $rule ) {

    if ( empty( $rule['flexible_id'] ) ) {
        return '';
    }

    $id = 'storeone-product-brand-' . sanitize_html_class( $rule['flexible_id'] );

    $bg        = $rule['btl_bg_clr'] ?? '#ffffff';
    $title     = $rule['btl_title_clr'] ?? '#111';
    $gap       = $rule['image_gap'] ?? 15;
    $margin_t  = $rule['margin_top'] ?? 10;
    $margin_b  = $rule['margin_bottom'] ?? 10;

    $border = $rule['border'] ?? [];
    $bw = $border['width'] ?? [];
    $br = $border['radius'] ?? [];
    $border_style = $border['style'] ?? 'solid';
    $border_color = $border['color'] ?? '#eee';
    $css  = "#{$id} { margin-top: {$margin_t}px; margin-bottom: {$margin_b}px; }";
    $css .= "#{$id}.storeone-product-brand-wrapper .swiper-slide .storeone-product-brand-item,#{$id}.storeone-product-brand-wrapper .storeone-product-brand-item{ background: {$bg}; }";
    $css .= "#{$id} .storeone-product-brand-title { color: {$title}; }";
    $css .= "#{$id} .storeone-product-brand-list { gap: {$gap}; }";
    $css .= "#{$id} .storeone-product-brand-list .storeone-product-brand-item,#{$id}.storeone-product-brand-wrapper .swiper-slide .storeone-product-brand-item{
        border-style: {$border_style};
        border-color: {$border_color};
        border-top-width: " . ($bw['top'] ?? '0px') . ";
        border-right-width: " . ($bw['right'] ?? '0px') . ";
        border-bottom-width: " . ($bw['bottom'] ?? '0px') . ";
        border-left-width: " . ($bw['left'] ?? '0px') . ";
        border-top-left-radius: " . ($br['top'] ?? '0px') . ";
        border-top-right-radius: " . ($br['right'] ?? '0px') . ";
        border-bottom-right-radius: " . ($br['bottom'] ?? '0px') . ";
        border-bottom-left-radius: " . ($br['left'] ?? '0px') . ";
    }";
    return $css;
}
 
}