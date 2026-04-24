<?php
if (!defined('ABSPATH')) exit;

class Th_Store_One_Buy_Now_Frontend {

    private $settings = [];

    public function __construct() {
        $modules = get_option('th_store_one_module_option', []);
        if (empty($modules['buynow-button'])) return;
        $all = get_option('th_store_one_module_set', []);
        $this->settings = $all['buynow-button'] ?? [];
        $s = $this->settings;
        if (empty($this->settings)) return;
        // SHOP PAGE
        if (!empty($s['enable_shop_page'])) {
            add_action(
                $this->get_archive_hook($s['archive_position']),
                [$this, 'render_archive'],
                20
            );
        }
        // SINGLE PAGE (USE YOUR FUNCTION)
        if (!empty($s['enable_single_page'])) {
            $single_priority = $s['single_priority'] ?? 10;
            $hook = th_store_one_get_hook_from_placement(
                $s['single_placement'] ?? ''
            );

            add_action(
                $hook,
                [$this, 'render_single'],
                $s['single_priority'] ?? 10
            );
        }

        add_action('wp_enqueue_scripts', [$this, 'assets']);
        add_filter('woocommerce_add_to_cart_validation', [$this, 'handle_buy_now_cart'], 1, 3);
        add_filter('woocommerce_add_to_cart_redirect', [$this, 'redirect']);
       
        // shortcode support
        add_shortcode('th_store_one_shop_buy_now', [$this, 'shortcode_archive']);
        add_shortcode('th_store_one_single_buy_now', [$this, 'shortcode_single']);

        add_action('wp', [$this, 'maybe_hide_cart_button']);
    }

    
    public function assets() {

    // load only when needed (performance best practice)
    if (!is_product() && !is_shop() && !is_product_category()) {
        return;
    }

    // CSS
    wp_enqueue_style(
        'th-buy-now',
        TH_STORE_ONE_PLUGIN_URL . 'assets/css/buy-now.css',
        [],
        TH_STORE_ONE_VERSION
    );

    // JS
    wp_enqueue_script(
        'th-buy-now-js',
        TH_STORE_ONE_PLUGIN_URL . 'assets/js/buy-now.js',
        ['jquery'],
        TH_STORE_ONE_VERSION,
        true
    );

    // pass settings to JS (optional but powerful)
    wp_localize_script(
        'th-buy-now-js',
        'thBuyNow',
        [
            'ajax_url' => admin_url('admin-ajax.php'),
        ]
    );
   }
    /* -------------------------
     * ARCHIVE HOOK MAP
     * ------------------------- */
    private function get_archive_hook($pos) {
        return match($pos) {
            'after_title' => 'woocommerce_shop_loop_item_title',
            'after_rating' => 'woocommerce_after_shop_loop_item_title',
            'after_price' => 'woocommerce_after_shop_loop_item_title',
            'before_add_to_cart' => 'woocommerce_before_shop_loop_item_title',
            'after_add_to_cart' => 'woocommerce_after_shop_loop_item',
            default => 'woocommerce_after_shop_loop_item'
        };
    }

    /* -------------------------
     * VISIBILITY LOGIC
     * ------------------------- */
    private function is_allowed($product, $type = 'archive') {

        $s = $this->settings;

        $trigger = $type === 'archive'
            ? ($s['trigger_type'] ?? 'all_products')
            : ($s['single_trigger_type'] ?? 'all_products');

        // disable
        if ($trigger === 'disable') return false;

        // product type
        if (!empty($s['product_types'])) {
            if (!in_array($product->get_type(), $s['product_types'])) {
                return false;
            }
        }

        // include
        if ($trigger === 'specific_products') {
            $list = $type === 'archive' ? ($s['products'] ?? []) : ($s['single_products'] ?? []);
            if (!in_array($product->get_id(), $list)) return false;
        }

        if ($trigger === 'specific_categories') {
            $cats = wc_get_product_term_ids($product->get_id(), 'product_cat');
            $list = $type === 'archive' ? ($s['categories'] ?? []) : ($s['single_categories'] ?? []);
            if (!array_intersect($cats, $list)) return false;
        }

        // exclude
        if (!empty($s['exclude_products_enabled']) && in_array($product->get_id(), ($s['exclude_products'] ?? []))) return false;

        if (!empty($s['exclude_categories_enabled'])) {
            $cats = wc_get_product_term_ids($product->get_id(), 'product_cat');
            if (array_intersect($cats, ($s['exclude_categories'] ?? []))) return false;
        }

        return true;
    }

    /* -------------------------
     * ARCHIVE RENDER
     * ------------------------- */
    public function render_archive() {

        global $product;
        if (!$product) return;
        // allow on shop + related + upsell
        if (!is_shop() && !is_product() && !is_product_category()) return;
        $s = $this->settings;
        if (!$this->is_allowed($product, 'archive')) return;
        if (!empty($s['hide_shop_add_to_cart_button'])) {
            remove_action('woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart', 10);
        }
        $this->button_html($product, 'archive');
    }

    /* -------------------------
     * SINGLE RENDER
     * ------------------------- */
    public function render_single() {

        global $product;
        if (!$product) return;

        $s = $this->settings;

        if (!$this->is_allowed($product, 'single')) return;

       $this->button_html($product, 'single');
    }
    public function maybe_hide_cart_button() {

        if (!is_product()) return;

        if (!empty($this->settings['hide_single_add_to_cart_button'])) {

            remove_action(
                'woocommerce_single_product_summary',
                'woocommerce_template_single_add_to_cart',
                30
            );

            // Add Buy Now in same position
            add_action(
                'woocommerce_single_product_summary',
                [$this, 'render_single'],
                30
            );
        }
    }
    /* -------------------------
     * SHORTCODES
     * ------------------------- */
    public function shortcode_archive() {
        if (!is_product()) return '';
        global $product;
        return $this->is_allowed($product, 'archive')
            ? $this->button_html($product, 'archive')
            : '';
    }

    public function shortcode_single() {
        if (!is_product()) return '';
        global $product;
        return $this->is_allowed($product, 'single')
            ? $this->button_html($product, 'single')
            : '';
    }

   private function button_html($product, $type) {

    $s = $this->settings;

    $is_variable = $product->is_type('variable');

    $text = $type === 'archive'
        ? ($s['archive_btn_text'] ?? 'Buy Now')
        : ($s['single_btn_text'] ?? 'Buy Now');

    $qty = ($type === 'archive')
        ? ($s['archive_default_quantity'] ?? 1)
        : 1;


     $btn = $this->get_button_style();

    $is_block_theme = function_exists('wp_is_block_theme') && wp_is_block_theme();
    $is_theme_style = isset($s['btn_style']) && $s['btn_style'] === 'default_btn_style';

    if ($is_block_theme && $is_theme_style) {

        // Always add base class
        $btn['class'] .= ' wp-element-button';

        // Only for archive
        if ($type === 'archive') {
            $btn['class'] .= ' wp-block-button__link';
        }
    }
    //ARCHIVE + VARIABLE → redirect to product page
    if ($type === 'archive' && $is_variable) {

        $product_url = get_permalink($product->get_id());

        ?>
      <div class="th-buy-now-form s1-<?php echo esc_attr($type); ?>">
        <a href="<?php echo esc_url($product_url); ?>"
            class="<?php echo esc_attr($btn['class']); ?>"
            <?php if (!empty($btn['style'])) : ?>
                style="<?php echo esc_attr($btn['style']); ?>"
            <?php endif; ?>
            >
            <?php echo esc_html($text); ?>
            </a>
            </div>
        <?php
        return;
    }

    ?>

    <!--NORMAL BUY NOW FORM -->
    <?php if ($type === 'single' && $is_variable): ?>

    <button type="button"
    class="<?php echo esc_attr($btn['class'] . ' th-buy-now-single disabled'); ?>"
    disabled
    <?php if (!empty($btn['style'])) : ?>
        style="<?php echo esc_attr($btn['style']); ?>"
    <?php endif; ?>
    >
    <?php echo esc_html($text); ?>
    </button>

    <?php else: ?>

    <form class="th-buy-now-form s1-<?php echo esc_attr($type); ?>" method="post">
        <input type="hidden" name="add-to-cart" value="<?php echo esc_attr($product->get_id()); ?>">
        <input type="hidden" name="th_buy_now" value="1">
        <input type="hidden" name="quantity" value="<?php echo esc_attr($qty); ?>">

        <button type="submit"
    class="<?php echo esc_attr($btn['class']); ?>"
    <?php if (!empty($btn['style'])) : ?>
        style="<?php echo esc_attr($btn['style']); ?>"
    <?php endif; ?>
>
    <?php echo esc_html($text); ?>
</button>
    </form>

    <?php endif; ?>
    <?php
    }

    /* -------------------------
     * REDIRECT
     * ------------------------- */
    public function redirect($url) {

        if (!isset($_REQUEST['th_buy_now'])) return $url;

        $s = $this->settings;

        if ($s['action'] === 'redirect_cart') {
            return wc_get_cart_url();
        }

        if ($s['action'] === 'redirect_custom') {
            return esc_url($s['custom_page_url']);
        }

        return wc_get_checkout_url();
    }

    public function handle_buy_now_cart($passed, $product_id, $quantity) {

    if (!isset($_REQUEST['th_buy_now'])) {
        return $passed;
    }

    $s = $this->settings;

    if (empty($s['reset_cart_before_buy_now'])) {
        return $passed;
    }

    if (!function_exists('WC') || !WC()->cart) {
        return $passed;
    }

    WC()->cart->empty_cart();

    return $passed;
    }


    private function get_button_style() {

    $s = $this->settings;

    // default class (WooCommerce compatible)
    $classes = ['th-buy-now-btn', 'button'];
    $style   = '';

    // Only apply custom styles if enabled
    if (!empty($s['btn_style']) && $s['btn_style'] === 'custom_btn_style') {

        $classes[] = 'th-buy-now-custom';

        $padding = $s['btn_padding'] ?? [];
        $border  = $s['btn_border'] ?? [];

        //Normalize values using your helper functions
        $bg_color   = th_store_one_normalize_color($s['btn_bg_clr'] ?? '');
        $text_color = th_store_one_normalize_color($s['btn_text_clr'] ?? '');

        $pad_top    = th_store_one_with_unit($padding['top'] ?? '10px');
        $pad_right  = th_store_one_with_unit($padding['right'] ?? '15px');
        $pad_bottom = th_store_one_with_unit($padding['bottom'] ?? '10px');
        $pad_left   = th_store_one_with_unit($padding['left'] ?? '15px');

        $border_top    = th_store_one_with_unit($border['width']['top'] ?? '1px');
        $border_right  = th_store_one_with_unit($border['width']['right'] ?? '1px');
        $border_bottom = th_store_one_with_unit($border['width']['bottom'] ?? '1px');
        $border_left   = th_store_one_with_unit($border['width']['left'] ?? '1px');

        $radius_top    = th_store_one_normalize_radius($border['radius']['top'] ?? '0px');
        $radius_right  = th_store_one_normalize_radius($border['radius']['right'] ?? '0px');
        $radius_bottom = th_store_one_normalize_radius($border['radius']['bottom'] ?? '0px');
        $radius_left   = th_store_one_normalize_radius($border['radius']['left'] ?? '0px');

        $border_style = $border['style'] ?? 'solid';
        $border_color = th_store_one_normalize_color($border['color'] ?? '#e5e7eb');

        //Final style string
        $style = "
            background: {$bg_color};
            color: {$text_color};

            padding: {$pad_top} {$pad_right} {$pad_bottom} {$pad_left};

            border-style: {$border_style};
            border-color: {$border_color};
            border-width: {$border_top} {$border_right} {$border_bottom} {$border_left};

            border-radius: {$radius_top} {$radius_right} {$radius_bottom} {$radius_left};
        ";
    }

    return [
        'class' => implode(' ', $classes),
        'style' => trim($style),
    ];
}
}