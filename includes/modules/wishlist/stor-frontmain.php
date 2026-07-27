<?php

if (! defined('ABSPATH')) {
    exit;
}

class Th_Store_One_Wishlist_Frontend
{
    /**
     * Module settings.
     *
     * @var array
     */
    private $settings = [];

    /**
     * Prevent duplicate asset loading.
     *
     * @var bool
     */
    private static $assets_loaded = false;

    /**
     * Constructor.
     */
    public function __construct($settings = [])
    {
        $this->settings = $settings;

        add_action('wp', [$this, 'init']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
    }

    /**
     * Initialize frontend.
     */
    public function init()
    {
        if (empty($this->settings)) {
            return;
        }

        $this->register_shortcodes();

        $this->register_shop_hooks();

        $this->register_single_hooks();

        $this->register_ajax_hooks();
    }

    /**
     * Register assets.
     */
    public function enqueue_assets()
    {
        if (self::$assets_loaded) {
            return;
        }

        self::$assets_loaded = true;

        //    wp_enqueue_style(
        //        'store-one-wishlist',
        //        TH_STORE_ONE_PLUGIN_URL . 'assets/css/wishlist.css',
        //        [],
        //        TH_STORE_ONE_VERSION
        //    );

        //    wp_enqueue_script(
        //        'store-one-wishlist',
        //        TH_STORE_ONE_PLUGIN_URL . 'assets/js/wishlist.js',
        //        ['jquery'],
        //        TH_STORE_ONE_VERSION,
        //        true
        //    );

        wp_localize_script(
            'store-one-wishlist',
            'thStoreOneWishlist',
            [
                'ajax_url' => admin_url('admin-ajax.php'),

                'add_nonce' => wp_create_nonce('thwl-add-nonce'),

                'remove_nonce' => wp_create_nonce('thwl-remove-nonce'),

                'update_nonce' => wp_create_nonce('thwl-update-qty-nonce'),

                'add_all_nonce' => wp_create_nonce('thwl-add-all-nonce'),

                'redirect_nonce' => wp_create_nonce('thwl_wishlist_redirect_nonce'),
            ]
        );
    }

    /**
     * Register all shortcodes.
     */
    private function register_shortcodes()
    {
        add_shortcode(
            'th_store_one_wishlist_button',
            [$this, 'button_shortcode']
        );

        add_shortcode(
            'th_store_one_wishlist_page',
            [$this, 'page_shortcode']
        );

        add_shortcode(
            'th_store_one_wishlist_redirect',
            [$this, 'redirect_shortcode']
        );
    }

    /**
     * Register archive hooks.
     */
    private function register_shop_hooks()
    {
        if (empty($this->settings['thw_show_in_loop'])) {
            return;
        }

        $hook = $this->get_archive_hook(
            $this->settings['thw_in_loop_position'] ?? 'after_crt_btn'
        );

        add_action(
            $hook,
            [$this, 'render_archive_button'],
            20
        );
    }

    /**
     * Register single hooks.
     */
    private function register_single_hooks()
    {
        if (empty($this->settings['thw_show_in_product'])) {
            return;
        }

        $placement = $this->settings['thw_in_single_position'] ?? 'after_crt_btn';

        $priority = absint(
            $this->settings['thw_in_single_priority'] ?? 10
        );

        $hook = function_exists('th_store_one_get_hook_from_placement')
            ? th_store_one_get_hook_from_placement($placement)
            : $placement;

        add_action(
            $hook,
            [$this, 'render_single_button'],
            $priority
        );
    }

    /**
     * Register ajax.
     */
    private function register_ajax_hooks()
    {
        add_action(
            'wp_ajax_thwl_add_to_wishlist',
            [$this, 'ajax_add_to_wishlist']
        );

        add_action(
            'wp_ajax_nopriv_thwl_add_to_wishlist',
            [$this, 'ajax_add_to_wishlist']
        );

        add_action(
            'wp_ajax_thwl_remove_from_wishlist',
            [$this, 'ajax_remove_from_wishlist']
        );

        add_action(
            'wp_ajax_thwl_update_item_quantity',
            [$this, 'ajax_update_quantity']
        );

        add_action(
            'wp_ajax_thwl_add_all_to_cart',
            [$this, 'ajax_add_all_to_cart']
        );

        add_action(
            'wp_ajax_nopriv_thwl_add_all_to_cart',
            [$this, 'ajax_add_all_to_cart']
        );

        add_action(
            'wp_ajax_thwl_add_to_cart_and_manage',
            [$this, 'ajax_add_to_cart_and_manage']
        );

        add_action(
            'wp_ajax_nopriv_thwl_add_to_cart_and_manage',
            [$this, 'ajax_add_to_cart_and_manage']
        );
    }

    /**
     * Shop hook mapper.
     */
    private function get_archive_hook($position)
    {
        $hooks = [
            'after_title'        => 'woocommerce_shop_loop_item_title',
            'after_rating'       => 'woocommerce_after_shop_loop_item_title',
            'after_price'        => 'woocommerce_after_shop_loop_item_title',
            'before_add_to_cart' => 'woocommerce_after_shop_loop_item_title',
            'after_add_to_cart'  => 'woocommerce_after_shop_loop_item',
            'on_top'             => 'woocommerce_before_shop_loop_item',
        ];

        return $hooks[$position] ?? 'woocommerce_after_shop_loop_item';
    }

    /**
 * Render button on archive.
 */
    public function render_archive_button()
    {
        echo $this->render_button();
    }

    /**
     * Render button on single product.
     */
    public function render_single_button()
    {
        echo $this->render_button();
    }

    /**
     * Wishlist Button Shortcode
     *
     * [th_store_one_wishlist_button]
     */
    public function button_shortcode($atts = [])
    {
        global $product;

        if (! $product instanceof WC_Product) {
            return '';
        }

        return $this->render_button($product);
    }

    /**
     * Redirect Icon Shortcode
     *
     * [th_store_one_wishlist_redirect]
     */
    public function redirect_shortcode($atts = [])
    {
        $page_id = absint($this->settings['thwl_page_id'] ?? 0);

        if (! $page_id) {
            return '';
        }

        $url = get_permalink($page_id);

        if (! $url) {
            return '';
        }

        $icon = $this->get_wishlist_icon(
            $this->settings['th_wishlist_brws_icon'] ?? 'heart-filled'
        );

        ob_start();
        ?>

    <a class="th-store-one-wishlist-link"
       href="<?php echo esc_url($url); ?>">

        <?php echo wp_kses_post($icon); ?>

    </a>

    <?php
        return ob_get_clean();
    }

    /**
     * Common Button Renderer.
     */
    private function render_button($product = null)
    {
        if (! $product) {
            global $product;
        }

        if (! $product instanceof WC_Product) {
            return '';
        }

        $product_id = $product->get_id();

        $variation_id = $product->is_type('variation')
            ? $product->get_id()
            : 0;

        $wishlist = THWL_Data::get_or_create_wishlist();

        $in_wishlist = false;

        if ($wishlist) {

            $in_wishlist = THWL_Data::is_product_in_wishlist(
                $wishlist->id,
                $product_id,
                $variation_id
            );
        }

        $text = $in_wishlist
            ? ($this->settings['thw_browse_wishlist_text'] ?? __('Browse Wishlist', 'th-store-one'))
            : ($this->settings['thw_add_to_wishlist_text'] ?? __('Add to Wishlist', 'th-store-one'));

        $display = $this->settings['thw_button_display_style'] ?? 'icon_text';

        $icon_key = $in_wishlist
            ? ($this->settings['th_wishlist_brws_icon'] ?? 'heart-filled')
            : ($this->settings['thw_wishlist_add_icon'] ?? 'heart-outline');

        $icon = $this->get_wishlist_icon($icon_key);

        $classes = [
            'th-store-one-wishlist-btn',
        ];

        if ($in_wishlist) {
            $classes[] = 'in-wishlist';
        }

        if (! empty($display)) {
            $classes[] = $display;
        }

        ob_start();

        ?>

    <div class="th-store-one-wishlist-wrap">

        <a href="#"
           class="<?php echo esc_attr(implode(' ', $classes)); ?>"
           data-product-id="<?php echo esc_attr($product_id); ?>"
           data-variation-id="<?php echo esc_attr($variation_id); ?>">

            <?php
                if ($display !== 'text') {
                    echo wp_kses_post($icon);
                }

        if ($display !== 'icon' && $display !== 'icon_only_no_style') {
            ?>
                <span class="th-store-one-wishlist-text">
                    <?php echo esc_html($text); ?>
                </span>
                <?php
        }
        ?>

        </a>

    </div>

    <?php

    return ob_get_clean();
    }

    /**
     * Wishlist icon helper.
     */
    private function get_wishlist_icon($icon)
    {
        $icons = thwl_get_wishlist_icons_svg();

        if (isset($icons[$icon])) {
            return $icons[$icon]['svg'];
        }

        return '';
    }
    /**
 * Wishlist Page Shortcode
 *
 * [th_store_one_wishlist_page]
 */
    public function page_shortcode()
    {
        $wishlist = null;

        $wishlist_token = isset($_GET['wishlist_token'])
            ? sanitize_text_field(wp_unslash($_GET['wishlist_token']))
            : '';

        $wishlist_action = isset($_GET['wishlist_action'])
            ? sanitize_text_field(wp_unslash($_GET['wishlist_action']))
            : '';

        $nonce = isset($_GET['wishlist_nonce'])
            ? sanitize_text_field(wp_unslash($_GET['wishlist_nonce']))
            : '';

        $is_view_only = ($wishlist_action === 'view');

        /**
         * Shared Wishlist
         */
        if (! empty($wishlist_token)) {

            if (! $is_view_only) {

                if (! wp_verify_nonce($nonce, 'thwl_wishlist_nonce_action')) {
                    return '';
                }

                if (! current_user_can('manage_options')) {
                    return '';
                }
            }

            $shared = THWL_Data::get_wishlist_by_token($wishlist_token);

            if (! $shared) {

                return '<p>' .
                    esc_html__('Wishlist not found.', 'th-store-one') .
                    '</p>';
            }

            $is_owner = is_user_logged_in()
                && (int) $shared->user_id === get_current_user_id();

            if (
                $shared->privacy === 'private'
                && ! $is_owner
                && ! current_user_can('manage_options')
            ) {

                return '<p>' .
                    esc_html__(
                        'This wishlist is private.',
                        'th-store-one'
                    ) .
                    '</p>';
            }

            $wishlist = $shared;

        } else {

            /**
             * Current User Wishlist
             */
            $wishlist = THWL_Data::get_or_create_wishlist();
        }

        if (! $wishlist) {

            return '<p>' .
                esc_html__(
                    'Wishlist not found.',
                    'th-store-one'
                ) .
                '</p>';
        }

        /**
         * Wishlist Items
         */
        $items = THWL_Data::get_wishlist_items($wishlist->id);

        /**
         * Table Columns
         */
        $columns = ! empty($this->settings['th_wishlist_table_columns'])
            ? $this->settings['th_wishlist_table_columns']
            : [
                'thumbnail',
                'name',
                'price',
                'stock',
                'quantity',
                'add_to_cart',
                'remove',
            ];

        /**
         * Theme Style
         */
        $theme_class =
            ! empty($this->settings['thw_btn_style_theme'])
                ? 'thw-table-theme-style'
                : 'thw-table-custom-style';

        ob_start();

        ?>

    <div class="th-store-one-wishlist-page <?php echo esc_attr($theme_class); ?>">

        <form class="th-store-one-wishlist-form">

            <table class="th-store-one-wishlist-table">

                <thead>

                    <tr>

                    <?php echo wp_kses_post($this->render_table_header($columns, $is_view_only)); ?>

                    </tr>

                </thead>

                <tbody>

                    <?php
echo wp_kses_post(
    $this->render_table_rows(
        $items,
        $columns,
        $wishlist,
        $is_view_only
    )
);
        ?>
                </tbody>

            </table>

        </form>

        <?php echo wp_kses_post($this->render_footer_actions($wishlist, $items, $is_view_only)); ?>

    </div>

    <?php

    return ob_get_clean();
    }
    /**
 * Render wishlist table header.
 *
 * @param array $columns      Table columns.
 * @param bool  $is_view_only Whether wishlist is view only.
 * @return string
 */
    private function render_table_header($columns, $is_view_only = false)
    {
        $default_labels = [
            'checkbox'    => '<input type="checkbox" class="thwl-select-all" />',
            'thumbnail'   => __('Image', 'th-store-one'),
            'name'        => __('Product', 'th-store-one'),
            'price'       => __('Price', 'th-store-one'),
            'stock'       => __('Stock', 'th-store-one'),
            'quantity'    => __('Quantity', 'th-store-one'),
            'add_to_cart' => __('Add to Cart', 'th-store-one'),
            'date'        => __('Date', 'th-store-one'),
            'remove'      => __('Remove', 'th-store-one'),
        ];

        $saved_labels = $this->settings['th_wishlist_table_column_labels'] ?? [];

        $output = '';

        foreach ($columns as $column) {

            if (
                ! is_user_logged_in() &&
                in_array($column, ['checkbox', 'quantity', 'remove'], true)
            ) {
                continue;
            }

            if ($is_view_only && 'remove' === $column) {
                continue;
            }

            if (! isset($default_labels[$column])) {
                continue;
            }

            $output .= '<th class="product-' . esc_attr($column) . '">';

            if ('checkbox' === $column) {
                $output .= $default_labels['checkbox'];
            } else {
                $label = $saved_labels[$column] ?? $default_labels[$column];
                $output .= esc_html($label);
            }

            $output .= '</th>';
        }

        return $output;
    }

    /**
 * Render wishlist rows.
 *
 * @param array $items Wishlist items.
 * @param array $columns Columns.
 * @param object $wishlist Wishlist object.
 * @param bool $is_view_only View only mode.
 * @return string
 */
    private function render_table_rows(
        $items,
        $columns,
        $wishlist,
        $is_view_only = false
    ) {

        if (empty($items)) {

            return sprintf(
                '<tr><td colspan="%d">%s</td></tr>',
                count($columns),
                esc_html__(
                    'Your wishlist is empty.',
                    'th-store-one'
                )
            );
        }

        $output = '';

        foreach ($items as $item) {

            $output .= $this->render_table_row(
                $item,
                $columns,
                $wishlist,
                $is_view_only
            );
        }

        return $output;
    }
    /**
 * Render single wishlist row.
 *
 * @param object $item Wishlist item.
 * @param array $columns Columns.
 * @param object $wishlist Wishlist.
 * @param bool $is_view_only View only.
 * @return string
 */
    private function render_table_row(
        $item,
        $columns,
        $wishlist,
        $is_view_only = false
    ) {

        $product = $this->get_product_from_item($item);

        if (! $product) {
            return '';
        }

        $product_id = $product->get_id();

        ob_start();

        ?>

    <tr
        class="thwl-row"
        data-product-id="<?php echo esc_attr($product_id); ?>"
    >

        <?php

            foreach ($columns as $column) {

                ?>

            <td class="product-<?php echo esc_attr($column); ?>">

                <?php
                    /**
                     * Part 3D
                     * Every column renderer
                     * will come here.
                     */

                    do_action(
                        'th_store_one_wishlist_column',
                        $column,
                        $item,
                        $product,
                        $wishlist,
                        $is_view_only
                    );

                ?>

            </td>

            <?php
            }

        ?>

    </tr>

    <?php

    return ob_get_clean();
    }
    /**
 * Get product object.
 *
 * @param object $item Wishlist item.
 * @return WC_Product|false
 */
    private function get_product_from_item($item)
    {
        if (! empty($item->variation_id)) {

            $product = wc_get_product(
                absint($item->variation_id)
            );

            if ($product) {
                return $product;
            }
        }

        if (! empty($item->product_id)) {

            return wc_get_product(
                absint($item->product_id)
            );
        }

        return false;
    }

    /**
 * Render wishlist footer actions.
 *
 * @param object $wishlist     Wishlist object.
 * @param array  $items        Wishlist items.
 * @param bool   $is_view_only View only mode.
 * @return string
 */
    private function render_footer_actions(
        $wishlist,
        $items,
        $is_view_only = false
    ) {

        if (empty($items)) {
            return '';
        }

        ob_start();

        ?>

    <div class="th-store-one-wishlist-footer">

        <div class="th-store-one-wishlist-actions">

            <?php
                /**
                 * Bulk actions.
                 *
                 * Example:
                 * - Add selected to cart
                 * - Remove selected
                 */
                do_action(
                    'th_store_one_wishlist_footer_actions',
                    $wishlist,
                    $items,
                    $is_view_only
                );
        ?>

        </div>

        <div class="th-store-one-wishlist-share">

            <?php
        /**
         * Social share buttons.
         */
        do_action(
            'th_store_one_wishlist_social_share',
            $wishlist,
            $is_view_only
        );
        ?>

        </div>

    </div>

    <?php

    return ob_get_clean();
    }
}
