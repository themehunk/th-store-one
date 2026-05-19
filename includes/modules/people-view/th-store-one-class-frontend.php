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

        add_action(
            'wp_ajax_th_update_people_view',
            array( $this, 'ajax_update_people_view' )
        );

        add_action(
            'wp_ajax_nopriv_th_update_people_view',
            array( $this, 'ajax_update_people_view' )
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

        wp_enqueue_script(
            'th-people-view',
            TH_STORE_ONE_PLUGIN_URL . 'assets/js/people-view.js',
            array( 'jquery' ),
            TH_STORE_ONE_VERSION,
            true
        );

        wp_localize_script(
            'th-people-view',
            'thPeopleView',
            array(
                'ajaxurl' => admin_url('admin-ajax.php'),
            )
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

        $interval = 15;

        if (
            isset($rule['view_mode']) &&
            'fake' === $rule['view_mode']
        ) {

            $interval = absint(
                $rule['fake_view']['update_interval'] ?? 20
            );

        } else {

            $interval = absint(
                $rule['real_view']['refresh_rate'] ?? 15
            );
        }

        $count = $this->generate_viewer_count($rule, $product);

        $message = $this->generate_message($rule, $count);

        ?>

        <div
            id="<?php echo esc_attr($wrapper_id); ?>"
            class="th-people-view-wrapper layout-<?php echo esc_attr($rule['layout_style'] ?? 'pill'); ?>"
            data-product-id="<?php echo esc_attr($product->get_id()); ?>"
    data-rule-id="<?php echo esc_attr($rule['flexible_id']); ?>"
    data-interval="<?php echo esc_attr($interval); ?>"
        >

            <?php if (! empty($rule['icon_enable'])) : ?>

                <span class="th-people-view-icon">
                    <?php echo $this->get_icon_svg($rule['icon_type'] ?? 'eye'); ?>
                </span>

            <?php endif; ?>

            <span class="th-people-view-message" style="font-weight: 600;">
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

        /* =====================================================
         * PRODUCT ID
        ===================================================== */
        $product_id = $product->get_id();

        /* =====================================================
         * REAL VIEWER MODE
        ===================================================== */
        if ('real' === $mode) {

            $real_settings = $rule['real_view'] ?? [];

            $enable_guest     = ! empty($real_settings['enable_guest']);
            $enable_loggedin  = ! empty($real_settings['enable_loggedin']);
            $session_timeout  = absint($real_settings['session_timeout'] ?? 3);
            $refresh_rate     = absint($real_settings['refresh_rate'] ?? 15);
            $bot_filter       = ! empty($real_settings['bot_filter']);

            /* ------------------------------
             * BOT FILTER
            ------------------------------ */
            if ($bot_filter) {

                $user_agent = isset($_SERVER['HTTP_USER_AGENT'])
                    ? strtolower(wp_unslash($_SERVER['HTTP_USER_AGENT']))
                    : '';

                $bots = array(
                    'bot',
                    'crawl',
                    'slurp',
                    'spider',
                    'facebook',
                    'google',
                    'bing',
                    'yandex',
                );

                foreach ($bots as $bot) {

                    if (false !== strpos($user_agent, $bot)) {
                        return 0;
                    }
                }
            }

            /* ------------------------------
             * USER TYPE CHECK
            ------------------------------ */
            $is_logged_in = is_user_logged_in();

            if ($is_logged_in && ! $enable_loggedin) {
                return 0;
            }

            if (! $is_logged_in && ! $enable_guest) {
                return 0;
            }

            /* ------------------------------
             * VIEWER SESSION
            ------------------------------ */
            $user_key = '';

            if ($is_logged_in) {

                $user_key = 'user_' . get_current_user_id();

            } else {

                $user_ip = isset($_SERVER['REMOTE_ADDR'])
                    ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR']))
                    : 'guest';

                $user_key = 'guest_' . md5($user_ip);
            }

            $viewer_key = 'th_people_viewer_' . $product_id . '_' . $user_key;

            /* ------------------------------
             * ACTIVE VIEWERS
            ------------------------------ */
            $active_viewers = get_transient('th_people_view_' . $product_id);

            if (! is_array($active_viewers)) {
                $active_viewers = array();
            }

            /* ------------------------------
             * ADD / REFRESH VIEWER
            ------------------------------ */
            $active_viewers[ $viewer_key ] = time();

            /* ------------------------------
             * REMOVE EXPIRED VIEWERS
            ------------------------------ */
            foreach ($active_viewers as $key => $timestamp) {

                if ((time() - $timestamp) > ($session_timeout * 60)) {
                    unset($active_viewers[ $key ]);
                }
            }

            /* ------------------------------
             * SAVE VIEWERS
            ------------------------------ */
            set_transient(
                'th_people_view_' . $product_id,
                $active_viewers,
                $refresh_rate
            );

            return count($active_viewers);
        }

        /* =====================================================
         * FAKE VIEWER MODE
        ===================================================== */
        if ('fake' === $mode) {

            $fake_settings = $rule['fake_view'] ?? [];

            $min                  = absint($fake_settings['min'] ?? 3);
            $max                  = absint($fake_settings['max'] ?? 18);
            $default_count        = absint($fake_settings['default_count'] ?? 8);
            $randomize            = $fake_settings['randomize'] ?? 'session';
            $update_interval      = absint($fake_settings['update_interval'] ?? 20);
            $smooth_fluctuation   = ! empty($fake_settings['smooth_fluctuation']);
            $spike_enable         = ! empty($fake_settings['spike_enable']);
            $spike_chance         = absint($fake_settings['spike_chance'] ?? 20);

            /* SAFETY */
            if ($min > $max) {
                $temp = $min;
                $min  = $max;
                $max  = $temp;
            }

            $transient_key = 'th_fake_people_view_' . $product_id;

            $count = get_transient($transient_key);

            /* ------------------------------
             * DEFAULT VALUE
            ------------------------------ */
            if (false === $count) {

                if ($default_count >= $min && $default_count <= $max) {

                    $count = $default_count;

                } else {

                    $count = rand($min, $max);
                }
            }

            /* ------------------------------
             * RANDOMIZE MODE
            ------------------------------ */

            if ('page_load' === $randomize) {

                $count = rand($min, $max);
            }

            /* ------------------------------
             * SMOOTH FLUCTUATION
            ------------------------------ */
            if ($smooth_fluctuation) {

                $change = rand(-2, 2);

                $count = $count + $change;

                if ($count < $min) {
                    $count = $min;
                }

                if ($count > $max) {
                    $count = $max;
                }
            }

            /* ------------------------------
             * SPIKE EFFECT
            ------------------------------ */
            if ($spike_enable) {

                $chance = rand(1, 100);

                if ($chance <= $spike_chance) {

                    $spike = rand(3, 10);

                    $count = $count + $spike;

                    if ($count > $max) {
                        $count = $max;
                    }
                }
            }

            /* ------------------------------
             * SAVE COUNT
            ------------------------------ */
            set_transient(
                $transient_key,
                $count,
                $update_interval
            );

            return absint($count);
        }

        return 0;
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

            case 'group':

                return '<svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 509.421 509.421"
            fill="none"
          >
            <path
              opacity="0.6"
              fill="currentColor"
              d="M409.421,251.348V123.073c-35.366,0-64.139,28.772-64.139,64.138
        S374.055,251.348,409.421,251.348z"
            />

            <path
              opacity="0.6"
              fill="currentColor"
              d="M473.56,187.211c0-35.366-28.772-64.138-64.139-64.138v128.275
        C444.788,251.348,473.56,222.576,473.56,187.211z"
            />

            <path
              opacity="0.6"
              fill="currentColor"
              d="M509.421,366.348c0-55.14-44.859-100-100-100
        c-28.619,0-55.206,12.071-73.879,32.602
        c26.098,21.11,43.814,52.191,47.288,87.398h126.591V366.348z"
            />

            <path
              opacity="0.6"
              fill="currentColor"
              d="M173.879,298.95c-18.673-20.53-45.26-32.602-73.879-32.602
        c-55.14,0-100,44.86-100,100v20h126.59
        C130.065,351.141,147.781,320.06,173.879,298.95z"
            />

            <path
              opacity="0.6"
              fill="currentColor"
              d="M100,251.348V123.073c-35.366,0-64.138,28.772-64.138,64.138
        S64.634,251.348,100,251.348z"
            />

            <path
              opacity="0.6"
              fill="currentColor"
              d="M164.138,187.211c0-35.366-28.772-64.138-64.138-64.138v128.275
        C135.366,251.348,164.138,222.576,164.138,187.211z"
            />

            <path
              
              fill="currentColor"
              d="M335.542,298.95c-22.114-17.888-50.242-28.619-80.832-28.619v148.76
        h128.75v-20c0-4.3-0.216-8.55-0.63-12.742
        C379.356,351.141,361.64,320.06,335.542,298.95z"
            />

            <path
              fill="currentColor"
              d="M334.71,170.331c0-44.11-35.89-80-80-80v160
        C298.82,250.331,334.71,214.451,334.71,170.331z"
            />

            <path
              fill="currentColor"
              d="M173.879,298.95c-26.098,21.11-43.814,52.191-47.289,87.398
        c-0.414,4.193-0.63,8.443-0.63,12.742v20h128.75v-148.76
        C224.121,270.331,195.993,281.062,173.879,298.95z"
            />

            <path
              fill="currentColor"
              d="M254.71,250.331v-160c-44.11,0-80,35.89-80,80
        C174.71,214.451,210.6,250.331,254.71,250.331z"
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

    /* =====================================================
 * AJAX UPDATE
===================================================== */

    public function ajax_update_people_view()
    {

        $product_id = absint($_POST['product_id'] ?? 0);
        $rule_id    = sanitize_text_field($_POST['rule_id'] ?? '');

        if (! $product_id || empty($rule_id)) {
            wp_send_json_error();
        }

        $product = wc_get_product($product_id);

        if (! $product) {
            wp_send_json_error();
        }

        foreach ($this->rules as $rule) {

            if (
                isset($rule['flexible_id']) &&
                $rule['flexible_id'] === $rule_id
            ) {

                $interval = 15;

                if (
                    isset($rule['view_mode']) &&
                    'fake' === $rule['view_mode']
                ) {

                    $interval = absint(
                        $rule['fake_view']['update_interval'] ?? 20
                    );

                } else {

                    $interval = absint(
                        $rule['real_view']['refresh_rate'] ?? 15
                    );
                }

                $count = $this->generate_viewer_count(
                    $rule,
                    $product
                );

                $message = $this->generate_message(
                    $rule,
                    $count
                );

                wp_send_json_success(
                    array(
                        'count'   => $count,
                        'message' => $message,
                    )
                );
            }
        }

        wp_send_json_error();
    }
}
