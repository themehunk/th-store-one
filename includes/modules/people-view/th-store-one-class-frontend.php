<?php
if (! defined('ABSPATH')) {
    exit;
}

class Th_Store_One_People_View_Frontend
{
    private $rules = array();

    public function __construct()
    {

        $modules = get_option('th_store_one_module_option', array());

        if (empty($modules['people-view'])) {
            return;
        }

        $settings = get_option('th_store_one_module_set', array());

        if (isset($settings['people-view']['rules'])) {
            $this->rules = $settings['people-view']['rules'];
        }

        add_action('wp', array( $this, 'register_hooks' ));

        add_action(
            'wp_enqueue_scripts',
            array( $this, 'enqueue_assets' )
        );

        add_action(
            'wp_enqueue_scripts',
            array( $this, 'add_inline_dynamic_css' ),
            20
        );

        add_shortcode(
            'th_store_one_people_view',
            array( $this, 'shortcode_render' )
        );
    }

    /* =====================================================
     * Assets
    ===================================================== */

    public function enqueue_assets()
    {

        wp_enqueue_style(
            'th-people-view',
            TH_STORE_ONE_PLUGIN_URL . 'assets/css/people-view.css',
            array(),
            TH_STORE_ONE_VERSION
        );
    }

    /* =====================================================
     * Register Hooks
    ===================================================== */

    public function register_hooks()
    {

        if (empty($this->rules)) {
            return;
        }

        foreach ($this->rules as $rule) {

            if (empty($rule['status']) || 'active' !== $rule['status']) {
                continue;
            }

            /* Single Product */

            if (! empty($rule['enable_single_page'])) {

                $placement = $rule['single_placement'] ?? 'woocommerce_after_add_to_cart_form';

                $priority = isset($rule['single_priority'])
                    ? absint($rule['single_priority'])
                    : 10;

                add_action(
                    $placement,
                    function () use ($rule) {

                        global $product;

                        if (! $product instanceof WC_Product) {
                            return;
                        }

                        if ($this->rule_matches($rule, $product)) {
                            $this->render_single_rule($rule, $product);
                        }
                    },
                    $priority
                );
            }

            /* Shop / Archive */

            if (! empty($rule['enable_shop_page'])) {

                $archive_hook = $this->get_archive_hook(
                    $rule['shop_position'] ?? 'after_price'
                );

                add_action(
                    $archive_hook,
                    function () use ($rule) {

                        global $product;

                        if (! $product instanceof WC_Product) {
                            return;
                        }

                        if ($this->rule_matches($rule, $product)) {
                            $this->render_single_rule($rule, $product);
                        }
                    },
                    10
                );
            }
        }
    }

    /* =====================================================
     * Rule Matching
    ===================================================== */

    private function rule_matches($rule, $product)
    {

        $product_id = $product->get_id();

        $trigger = $rule['trigger_type'] ?? 'all_products';

        switch ($trigger) {

            case 'specific_products':

                if (
                    empty($rule['products']) ||
                    ! in_array($product_id, $rule['products'], true)
                ) {
                    return false;
                }

                break;

            case 'specific_categories':

                if (empty($rule['categories'])) {
                    return false;
                }

                $product_cats = wp_get_post_terms(
                    $product_id,
                    'product_cat',
                    array( 'fields' => 'ids' )
                );

                if (! array_intersect($rule['categories'], $product_cats)) {
                    return false;
                }

                break;
        }

        /* Exclude Products */

        if (
            ! empty($rule['exclude_products_enabled']) &&
            ! empty($rule['exclude_products'])
        ) {
            if (in_array($product_id, $rule['exclude_products'], true)) {
                return false;
            }
        }

        /* Exclude Categories */

        if (
            ! empty($rule['exclude_categories_enabled']) &&
            ! empty($rule['exclude_categories'])
        ) {
            $product_cats = wp_get_post_terms(
                $product_id,
                'product_cat',
                array( 'fields' => 'ids' )
            );

            if (array_intersect($rule['exclude_categories'], $product_cats)) {
                return false;
            }
        }

        /* Out Of Stock */

        if (
            ! empty($rule['hide_outofstock']) &&
            ! $product->is_in_stock()
        ) {
            return false;
        }

        return true;
    }

    /* =====================================================
     * Render Rule
    ===================================================== */

    private function render_single_rule($rule, $product)
    {

        $wrapper_id = 'th-people-view-' . sanitize_html_class(
            $rule['flexible_id'] ?? uniqid()
        );

        $count = $this->generate_viewer_count($rule, $product);

        $message = $this->generate_message($rule, $count);

        ?>

        <div
            id="<?php echo esc_attr($wrapper_id); ?>"
            class="th-people-view-wrapper layout-<?php echo esc_attr($rule['layout_style'] ?? 'pill'); ?>"
        >

            <?php if (! empty($rule['icon_enable'])) : ?>

                <span class="th-people-view-icon">
                    <?php echo $this->get_icon_svg($rule['icon_type'] ?? 'eye'); ?>
                </span>

            <?php endif; ?>

            <span class="th-people-view-message">
                <?php echo wp_kses_post($message); ?>
            </span>

        </div>

        <?php
    }

    /* =====================================================
     * Generate Viewer Count
    ===================================================== */

    private function generate_viewer_count($rule, $product)
    {

        $mode = $rule['view_mode'] ?? 'real';

        if ('fake' === $mode) {

            $min = absint($rule['fake_view']['min'] ?? 3);
            $max = absint($rule['fake_view']['max'] ?? 15);

            return rand($min, $max);
        }

        /* Real Viewer Logic */

        $product_id = $product->get_id();

        $transient_key = 'th_people_view_' . $product_id;

        $count = get_transient($transient_key);

        if (false === $count) {
            $count = rand(1, 8);
        }

        return absint($count);
    }

    /* =====================================================
     * Dynamic Message
    ===================================================== */

    private function generate_message($rule, $count)
    {

        $message = $rule['message'] ?? '{count} people are viewing this product';

        if (! empty($rule['dynamic_message_enable'])) {

            $dynamic = $rule['dynamic_message'] ?? array();

            if ($count <= absint($dynamic['low_threshold'] ?? 5)) {

                $message = $dynamic['low_msg'] ?? $message;

            } elseif ($count <= absint($dynamic['medium_threshold'] ?? 15)) {

                $message = $dynamic['medium_msg'] ?? $message;

            } else {

                $message = $dynamic['high_msg'] ?? $message;
            }
        }

        return str_replace(
            '{count}',
            '<strong class="th-people-view-count">' . absint($count) . '</strong>',
            $message
        );
    }

    /* =====================================================
     * Archive Hook
    ===================================================== */

    private function get_archive_hook($position)
    {

        switch ($position) {

            case 'after_title':
                return 'woocommerce_shop_loop_item_title';

            case 'before_add_to_cart':
                return 'woocommerce_after_shop_loop_item';

            case 'after_add_to_cart':
                return 'woocommerce_after_shop_loop_item';

            case 'after_price':
            default:
                return 'woocommerce_after_shop_loop_item_title';
        }
    }

    /* =====================================================
     * Dynamic CSS
    ===================================================== */

    public function add_inline_dynamic_css()
    {

        $css = '';

        foreach ($this->rules as $rule) {

            if (empty($rule['status']) || 'active' !== $rule['status']) {
                continue;
            }

            $css .= $this->generate_dynamic_css($rule);
        }

        if (! empty($css)) {
            wp_add_inline_style('th-people-view', $css);
        }
    }

    protected function generate_dynamic_css($rule)
    {

        if (empty($rule['flexible_id'])) {
            return '';
        }

        $id = 'th-people-view-' . sanitize_html_class(
            $rule['flexible_id']
        );

        $bg = $rule['bg_color'] ?? '#FFF7D6';
        $border = $rule['border_color'] ?? '#FACC15';
        $text = $rule['text_color'] ?? '#111827';
        $icon = $rule['icon_color'] ?? '#D97706';

        $font_size = absint($rule['font_size'] ?? 14);
        $radius = absint($rule['border_radius'] ?? 30);

        $padding_y = absint($rule['padding_y'] ?? 10);
        $padding_x = absint($rule['padding_x'] ?? 14);

        $css = "#{$id}{";
        $css .= "background:{$bg};";
        $css .= "border:1px solid {$border};";
        $css .= "color:{$text};";
        $css .= "border-radius:{$radius}px;";
        $css .= "padding:{$padding_y}px {$padding_x}px;";
        $css .= "font-size:{$font_size}px;";
        $css .= "}";

        $css .= "#{$id} .th-people-view-icon{";
        $css .= "color:{$icon};";
        $css .= "}";

        return $css;
    }

    /* =====================================================
     * Shortcode
    ===================================================== */

    public function shortcode_render($atts)
    {

        $atts = shortcode_atts(
            array(
                'id' => '',
            ),
            $atts
        );

        if (empty($atts['id'])) {
            return '';
        }

        foreach ($this->rules as $rule) {

            if (
                isset($rule['flexible_id']) &&
                $rule['flexible_id'] === $atts['id']
            ) {
                global $product;

                ob_start();

                $this->render_single_rule($rule, $product);

                return ob_get_clean();
            }
        }

        return '';
    }

    /* =====================================================
     * SVG Icons
    ===================================================== */

    private function get_icon_svg($icon)
    {

        switch ($icon) {

            case 'users':

                return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M4 19C4.8 16.8 6.8 15.5 9 15.5C11.2 15.5 13.2 16.8 14 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14.5 18C15 16.7 16.2 16 17.5 16C18.8 16 20 16.7 20.5 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>';

            case 'fire':

                return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3C13.5 6 17 8 17 13C17 16.3 14.8 19 12 19C9.2 19 7 16.3 7 13C7 10 8.5 8 10 6C10.5 8 11.5 9 13 10C13.2 7.5 12.8 5.5 12 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>';

            case 'live':

                return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />

        <circle cx="12" cy="12" r="2" fill="currentColor" />

        <path
          d="M5 5L8 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M19 5L16 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>';

            case 'eye':
            default:

                return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M2 12C3.8 7.5 7.5 5 12 5C16.5 5 20.2 7.5 22 12C20.2 16.5 16.5 19 12 19C7.5 19 3.8 16.5 2 12Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>';
        }
    }
}
