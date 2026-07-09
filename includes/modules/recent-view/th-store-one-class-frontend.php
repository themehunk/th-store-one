<?php
if (!defined('ABSPATH')) {
    exit;
}

class Th_Store_One_Recent_View
{
    private $settings = [];
    private static $rendered = [];

    public function __construct($settings = [])
    {

        $this->settings = $settings;

        if (empty($this->settings)) {
            return;
        }

        add_action('wp', [$this, 'track_product']);
        add_action('wp_enqueue_scripts', [$this, 'assets']);

        $priority = $this->settings['priority'] ?? 20;


        if (empty($this->settings['manual_mode'])) {

            if (isset($this->settings['show_pages']['single']) && $this->settings['show_pages']['single']) {
                add_action('woocommerce_after_single_product_summary', [$this, 'render'], $priority);
            }

            if (isset($this->settings['show_pages']['cart']) && $this->settings['show_pages']['cart']) {
                add_action('woocommerce_after_cart', [$this, 'render'], $priority);
            }
            if (isset($this->settings['show_pages']['checkout']) && $this->settings['show_pages']['checkout']) {
                add_action('woocommerce_after_checkout_form', [$this, 'render'], $priority);
            }
            // cart checkout inject recent view in block mode
            add_filter('render_block', [$this, 'inject_into_blocks'], 10, 2);
        }

        add_shortcode('th_store_one_recent_view', [$this, 'shortcode']);
    }

    /* -------------------------
     * TRACK PRODUCTS
     * ------------------------- */
    public function track_product()
    {

        if (! is_product()) {
            return;
        }

        global $post;

        $viewed = isset($_COOKIE['th_recent_view'])
            ? explode(
                '|',
                sanitize_text_field(
                    wp_unslash($_COOKIE['th_recent_view'])
                )
            )
            : [];

        $viewed = array_map('intval', $viewed);

        $viewed = array_diff($viewed, [ $post->ID ]);

        array_unshift($viewed, $post->ID);

        $viewed = array_slice($viewed, 0, 20);

        setcookie(
            'th_recent_view',
            implode('|', $viewed),
            time() + (3600 * 24 * 7),
            COOKIEPATH,
            COOKIE_DOMAIN
        );
    }

    /* -------------------------
     * GET PRODUCTS
     * ------------------------- */
    private function get_products()
    {

        if (empty($_COOKIE['th_recent_view'])) {
            return [];
        }

        $recent_view = sanitize_text_field(
            wp_unslash($_COOKIE['th_recent_view'])
        );

        $ids = array_filter(
            array_map(
                'intval',
                explode('|', $recent_view)
            )
        );

        if (is_product()) {

            $current_id = get_queried_object_id();

            $ids = array_diff($ids, [ $current_id ]);
        }

        if (empty($ids)) {
            return [];
        }

        $order_by = $this->settings['order_by'] ?? 'recent';

        // ORDER LOGIC
        switch ($order_by) {

            case 'random':
                $orderby = 'rand';
                break;

            case 'title':
                $orderby = 'title';
                break;

            case 'modified-date':
                $orderby = 'modified';
                break;

            case 'recent':
            default:
                // cookie order (last viewed first)
                $orderby = 'post__in';
                break;
        }

        return wc_get_products(
            [
                'limit'   => intval($this->settings['products'] ?? 6),
                'include' => $ids,
                'orderby' => $orderby,
                'order'   => ('title' === $order_by) ? 'ASC' : 'DESC',
            ]
        );
    }
    /* -------------------------
     * SET LOOP COLUMNS (LOGIC FIX)
     * ------------------------- */
    public function set_loop_columns()
    {
        return intval($this->settings['columns'] ?? 3);
    }

    /* -------------------------
     * FIX CLASS (columns-x)
     * ------------------------- */
    public function fix_loop_columns_class($html)
    {

        $columns = intval($this->settings['columns'] ?? 3);

        $html = preg_replace('/columns-\d+/', '', $html);

        $html = str_replace(
            'class="products',
            'class="products columns-' . $columns,
            $html
        );

        return $html;
    }

    /* -------------------------
     * RENDER
     * ------------------------- */
    public function render()
    {

        $page = 'default';
        if (is_product()) {
            $page = 'single';
        }
        if (is_cart()) {
            $page = 'cart';
        }
        if (is_checkout()) {
            $page = 'checkout';
        }

        if (isset(self::$rendered[$page])) {
            return;
        }
        self::$rendered[$page] = true;

        $products = $this->get_products();
        if (empty($products)) {
            return;
        }

        $s = $this->settings;

        $is_slider = !empty($s['slider']['enabled']);
        $gap       = intval($s['columns_gap'] ?? 15);

        ?>

        <div class="th-recent-view-wrap woocommerce <?php echo $is_slider ? 'is-slider' : 'is-grid'; ?>"
             style="--th-gap:<?php echo esc_attr($gap); ?>px;">

            <?php if (empty($s['hide_title'])) : ?>
                <<?php echo esc_attr($s['title_tag'] ?? 'h2'); ?>
                    class="th-recent-title"
                    style="color:<?php echo esc_attr($s['title_color'] ?? '#111'); ?>">
                    <?php echo esc_html($s['title'] ?? 'Recently Viewed'); ?>
                </<?php echo esc_attr($s['title_tag'] ?? 'h2'); ?>>
            <?php endif; ?>
            <?php if ($is_slider) : ?>
                <!-- SLIDER -->
                <div class="swiper th-recent-slider"
     data-slides="<?php echo esc_attr($s['slider']['slides'] ?? 3); ?>"
     data-autoplay="<?php echo !empty($s['slider']['autoplay']) ? 'true' : 'false'; ?>"
     data-nav="<?php echo !empty($s['slider']['navigation']) ? 'true' : 'false'; ?>"
     data-gap="<?php echo esc_attr($s['columns_gap'] ?? 15); ?>">

    <div class="swiper-wrapper">

        <?php foreach ($products as $product) :

            global $post;
            $post_object = get_post($product->get_id());
            $GLOBALS['post'] = $post_object;
            setup_postdata($post_object);
            wc_setup_product_data($post_object);
            ?>

            <div class="swiper-slide">
                <ul class="products columns-1">
                    <?php wc_get_template_part('content', 'product'); ?>
                </ul>
            </div>

        <?php endforeach;
                wp_reset_postdata(); ?>

    </div>

    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>

</div>
            <?php else : ?>
                <!-- GRID -->
                <div class="th-recent-products">
               <?php
               // phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
               global $woocommerce_loop;

                $woocommerce_loop = [
                    'loop'    => 0,
                    'columns' => intval($this->settings['columns'] ?? 3),
                ];
                // phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound

                woocommerce_product_loop_start();

                foreach ($products as $product) :

                    $post_object = get_post($product->get_id());
                    $GLOBALS['post'] = $post_object;
                    setup_postdata($post_object);

                    wc_get_template_part('content', 'product');

                endforeach;

                wp_reset_postdata();

                woocommerce_product_loop_end();
                ?>

               </div>

            <?php endif; ?>

        </div>

        <?php
    }

    /* -------------------------
     * SHORTCODE
     * ------------------------- */
    public function shortcode()
    {
        remove_action('woocommerce_after_single_product_summary', [$this, 'render'], $this->settings['priority'] ?? 20);
        ob_start();
        $this->render();
        return ob_get_clean();
    }

    public function inject_into_blocks($content, $block)
    {

        if (empty($block['blockName']) || empty($content)) {
            return $content;
        }

        static $injected = false;
        if ($injected) {
            return $content;
        }

        $block_name = $block['blockName'];

        //SETTINGS CONDITION
        $show_cart     = !empty($this->settings['show_pages']['cart']);
        $show_checkout = !empty($this->settings['show_pages']['checkout']);

        if (
            ($block_name === 'woocommerce/cart' && !$show_cart) ||
            ($block_name === 'woocommerce/checkout' && !$show_checkout)
        ) {
            return $content;
        }

        // only target blocks
        if (!in_array($block_name, ['woocommerce/cart', 'woocommerce/checkout'], true)) {
            return $content;
        }

        $products = $this->get_products();
        if (empty($products)) {
            return $content;
        }

        ob_start();
        $this->render();
        $recent_html = ob_get_clean();

        if (empty($recent_html)) {
            return $content;
        }

        $inject_html = '<div class="th-recent-view-injected" 
        style="margin-top:30px; clear:both; width:100%;">
        ' . $recent_html . '
    </div>';

        $injected = true;

        return $content . $inject_html;
    }
    /* -------------------------
     * ASSETS
     * ------------------------- */
    public function assets()
    {

        if (!is_product() && !is_cart() && !is_checkout()) {
            return;
        }

        wp_enqueue_style(
            'th-recent-view',
            TH_STORE_ONE_PLUGIN_URL . 'assets/css/recent-view.css',
            [],
            TH_STORE_ONE_VERSION
        );

        if (!empty($this->settings['slider']['enabled'])) {
            wp_enqueue_style(
                'swiper-css',
                TH_STORE_ONE_PLUGIN_URL . 'assets/css/swiper/swiper-bundle.min.css',
                array(),
                TH_STORE_ONE_VERSION
            );

            wp_enqueue_script(
                'swiper-js',
                TH_STORE_ONE_PLUGIN_URL . 'assets/js/swiper/swiper-bundle.min.js',
                array(),
                TH_STORE_ONE_VERSION,
                true
            );
            wp_enqueue_script(
                'recent-view-js',
                TH_STORE_ONE_PLUGIN_URL . 'assets/js/recent-view.js',
                array(),
                TH_STORE_ONE_VERSION,
                true
            );
        }
    }
}

new Th_Store_One_Recent_View();
