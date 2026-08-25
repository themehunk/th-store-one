<?php

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Wishlist Frontend.
 */
class Th_Store_One_Wishlist_Frontend
{
    /**
     * Settings.
     *
     * @var array
     */
    private $settings = array();

    /**
     * Constructor.
     *
     * @param array $settings Module settings.
     */
    public function __construct($settings)
    {
        $this->settings = $settings;



        add_action('wp', array( $this, 'init' ));
        add_action(
            'wp_enqueue_scripts',
            array( $this, 'enqueue_assets' )
        );
        add_action(
            'wp_footer',
            array( $this, 'render_footer' )
        );

        add_action(
            'wp_ajax_store_one_remove_product_from_wishlist',
            array($this, 'ajax_remove_product_from_wishlist')
        );

        add_action(
            'wp_ajax_nopriv_store_one_remove_product_from_wishlist',
            array($this, 'ajax_remove_product_from_wishlist')
        );
    }

    /**
     * Init.
     *
     * @return void
     */
    public function init()
    {
        $this->register_shortcodes();
        $this->register_shop_hooks();
        $this->register_single_hooks();
    }

    /**
    * Enqueue assets.
    *
    * @return void
    */
    public function enqueue_assets()
    {

        $wishlist_page_id = ! empty($this->settings['thwl_page_id'])
            ? absint($this->settings['thwl_page_id'])
            : 0;

        wp_localize_script(
            'th-store-one-frontend',
            'storeOneWishlist',
            array(
                'ajax_url'              => admin_url('admin-ajax.php'),

                'add_nonce'            => wp_create_nonce('store-one-add-nonce'),
                'remove_nonce'         => wp_create_nonce('store-one-remove-nonce'),
                'update_qty_nonce'     => wp_create_nonce('store-one-update-qty-nonce'),
                'add_all_nonce'        => wp_create_nonce('store-one-add-all-nonce'),
                'redirect_nonce'       => wp_create_nonce('store-one-wishlist-redirect-nonce'),

                'wishlist_page_url'    => $wishlist_page_id
                    ? get_permalink($wishlist_page_id)
                    : '',

                'cart_url'             => wc_get_cart_url(),

                'redirect_to_cart'     => ! empty($this->settings['thw_redirect_to_cart']),

                'icon_style'           => $this->settings['thw_button_display_style']
                    ?? 'icon_text',

                'browse_icon'          => $this->settings['th_wishlist_brws_icon']
                    ?? 'heart-filled',

                'i18n_added'           => $this->settings['thw_browse_wishlist_text']
                    ?? __('Wishlist', 'th-store-one'),

                'i18n_error'           => __(
                    'An error occurred. Please try again.',
                    'th-store-one'
                ),

                'i18n_empty_wishlist'  => __(
                    'Your wishlist is currently empty.',
                    'th-store-one'
                ),
                'remove_on_second_click' => ! empty(
                    $this->settings['thw_remove_on_second_click']
                ),

               'remove_tooltip_text' => $this->settings['thw_remove_tooltip_text']
    ?? __('Removed from Wishlist', 'th-store-one'),
            )
        );
    }

    private function register_shortcodes()
    {

        /**
         * ---------------------------------------
         * Store One Shortcodes
         * ---------------------------------------
         */
        add_shortcode(
            'th_store_one_wishlist_button',
            array( $this, 'simple_shortcode' )
        );
        add_shortcode(
            'th_store_one_add_to_wishlist',
            array( $this, 'flexible_shortcode' )
        );

        /**
         * ---------------------------------------
         * TH Wishlist Compatibility
         * ---------------------------------------
         */
        remove_shortcode('thwl_wishlist_button');
        add_shortcode(
            'thwl_wishlist_button',
            array( $this, 'simple_shortcode' )
        );

        remove_shortcode('thwl_add_to_wishlist');
        add_shortcode(
            'thwl_add_to_wishlist',
            array( $this, 'flexible_shortcode' )
        );

        // wishlist table

        add_shortcode(
            'th_store_one_wishlist',
            array($this,'wishlist_shortcode')
        );

        remove_shortcode('thwl_wishlist');

        add_shortcode(
            'thwl_wishlist',
            array($this,'wishlist_shortcode')
        );


    }
    /**
     * Register shop hooks.
     *
     * @return void
     */
    private function register_shop_hooks()
    {
        if (empty($this->settings['thw_show_in_loop'])) {
            return;
        }

        add_action(
            $this->get_archive_hook(
                $this->settings['thw_in_loop_position'] ?? 'after_crt_btn'
            ),
            array( $this, 'render_archive_button' ),
            20
        );
    }

    /**
     * Register single hooks.
     *
     * @return void
     */
    private function register_single_hooks()
    {

        if (empty($this->settings['thw_show_in_product'])) {
            return;
        }

        $hook = th_store_one_get_hook_from_placement(
            $this->settings['thw_in_single_position']
                ?? 'woocommerce_after_add_to_cart_button'
        );

        $priority = absint(
            $this->settings['thw_in_single_priority'] ?? 10
        );

        add_action(
            'woocommerce_after_add_to_cart_button',
            array( $this, 'render_single_button' ),
            10
        );
    }

    public static function remove_single_button()
    {

        $hooks = array(
            'woocommerce_single_product_summary',
            'woocommerce_before_add_to_cart_form',
            'woocommerce_after_add_to_cart_form',
            'woocommerce_product_meta_start',
            'woocommerce_product_meta_end',
            'woocommerce_after_single_product_summary',
            'woocommerce_before_add_to_cart_button',
            'woocommerce_after_add_to_cart_button',
        );

        foreach ($hooks as $hook) {
            remove_action(
                $hook,
                array( self::instance(), 'render_single_button' ),
                10
            );

            remove_action(
                $hook,
                array( self::instance(), 'render_single_button' ),
                20
            );

            remove_action(
                $hook,
                array( self::instance(), 'render_single_button' ),
                30
            );

            remove_action(
                $hook,
                array( self::instance(), 'render_single_button' ),
                35
            );
        }
    }

    /**
      * Get archive hook.
      *
      * @param string $position Button position.
      * @return string
      */
    private function get_archive_hook($position)
    {
        $hooks = array(
            'before_img'     => 'woocommerce_before_shop_loop_item_title',
            'after_img'      => 'woocommerce_before_shop_loop_item_title',
            'before_title'   => 'woocommerce_shop_loop_item_title',
            'after_title'    => 'woocommerce_shop_loop_item_title',
            'before_price'   => 'woocommerce_after_shop_loop_item_title',
            'after_price'    => 'woocommerce_after_shop_loop_item_title',
            'before_crt_btn' => 'woocommerce_after_shop_loop_item',
            'after_crt_btn'  => 'woocommerce_after_shop_loop_item',
        );

        return $hooks[ $position ] ?? 'woocommerce_after_shop_loop_item';
    }

    public function render_single_button()
    {
        $this->simple_shortcode();
    }

    public function render_archive_button()
    {
        $this->simple_shortcode();
    }

    public function simple_shortcode($atts = array())
    {

        global $product;

        $default_product_id = (
            isset($product) && $product instanceof WC_Product
        ) ? $product->get_id() : '';

        $atts = shortcode_atts(
            array(
                'product_id'      => $default_product_id,

                // Text.
                'add_text'        => $this->settings['thw_add_to_wishlist_text'] ?? __('Add to Wishlist', 'th-store-one'),
                'browse_text'     => $this->settings['thw_browse_wishlist_text'] ?? __('Browse Wishlist', 'th-store-one'),

                // Display.
                'display_style'   => $this->settings['thw_button_display_style'] ?? 'icon_text',

                // Icons.
                'add_icon'        => '',
                'add_browse_icon' => '',

                // Style.
                'theme_style'     => '',
                'custom_class'    => '',
            ),
            $atts,
            'thwl_add_to_wishlist'
        );

        $product = wc_get_product(absint($atts['product_id']));

        if (! $product instanceof WC_Product) {
            return '';
        }

        // Variation ID.
        $variation_id = $product->is_type('variation')
            ? $product->get_id()
            : 0;

        // Default icons.
        if (empty($atts['add_icon'])) {
            $atts['add_icon'] = $this->settings['thw_wishlist_add_icon'] ?? 'heart-outline';
        }

        if (empty($atts['add_browse_icon'])) {
            $atts['add_browse_icon'] = $this->settings['th_wishlist_brws_icon'] ?? 'heart-filled';
        }

        // Theme style compatibility.
        if ('' === $atts['theme_style']) {
            $atts['theme_style'] = ! empty($this->settings['thw_btn_style_theme']);
        } else {
            $atts['theme_style'] = in_array(
                strtolower($atts['theme_style']),
                array( '1', 'yes', 'true' ),
                true
            );
        }

        /**
         * Login required.
         */
        $atts['login_required'] = (
            ! is_user_logged_in()
            && ! empty($this->settings['thw_require_login'])
        );

        /**
         * Wishlist state.
         */
        if (class_exists('Th_Store_One_Wishlist_Data_Pro_Data')) {

            $wishlist_id = isset($_GET['wishlist_id'])
                ? absint($_GET['wishlist_id'])
                : 0;

            if ($wishlist_id) {
                $wishlist = Th_Store_One_Wishlist_Data_Pro_Data::get_wishlist_by_id($wishlist_id);
            } else {
                $wishlist = Th_Store_One_Wishlist_Data::get_or_create_wishlist();
            }

        } else {

            $wishlist = Th_Store_One_Wishlist_Data::get_or_create_wishlist();

        }

        if (class_exists('Th_Store_One_Wishlist_Data_Pro_Data')) {

            $in_wishlist = Th_Store_One_Wishlist_Data_Pro_Data::is_product_in_any_wishlist(
                $product->get_id(),
                $variation_id,
                get_current_user_id()
            );

        } else {

            $in_wishlist = $wishlist
                ? Th_Store_One_Wishlist_Data::is_product_in_wishlist(
                    $wishlist->id,
                    $product->get_id(),
                    $variation_id
                )
                : false;
        }

        $atts['variation_id'] = $variation_id;
        $atts['in_wishlist']   = $in_wishlist;

        // Prepare variables for HTML rendering
        $text = $in_wishlist
            ? $atts['browse_text']
            : $atts['add_text'];

        $icon = $in_wishlist
            ? $atts['add_browse_icon']
            : $atts['add_icon'];

        $display = $atts['display_style'];

        $theme_class = ! empty($atts['theme_style'])
            ? 'thw-btn-theme-style'
            : 'thw-btn-custom-style';

        $wrap_class = (is_product() && ! doing_action('woocommerce_after_shop_loop_item'))
            ? 'th-wishlist-single'
            : 'th-wishlist-loop';

        $wrapper_classes = array(
            's1-th-wislist thw-add-to-wishlist-button-wrap',
            'th-theme-action',
            $theme_class,
            $wrap_class,
        );

        $button_classes = array(
            'thw-add-to-wishlist-button',
        );

        switch ($display) {
            case 'icon':
                $button_classes[] = 'th-icon';
                break;

            case 'icon_text':
                $button_classes[] = 'th-icon-text';
                break;

            case 'text':
                $button_classes[] = 'th-text';
                break;

            case 'icon_only_no_style':
                $button_classes[] = 'no-style';
                break;
        }

        if ($in_wishlist) {
            $button_classes[] = 'in-wishlist';
        }

        if (! empty($atts['login_required'])) {
            $button_classes[] = 'thw-login-required';
        }

        if (! empty($atts['custom_class'])) {
            $button_classes[] = $atts['custom_class'];
        }

        $multi_enabled = apply_filters(
            'store_one_wishlist_multi_enabled',
            false
        );

        if ($multi_enabled && ! $in_wishlist) {
            $button_classes[] = 'create-multi';
        }

        $button_style = '';
        $icon_style   = '';

        if (empty($atts['theme_style'])) {

            $button_styles = array();

            if (! empty($this->settings['thw_wishlist_btn_bg_color'])) {
                $button_styles[] = 'background:' . sanitize_text_field($this->settings['thw_wishlist_btn_bg_color']);
            }

            if (! empty($this->settings['thw_wishlist_btn_txt_color'])) {
                $button_styles[] = 'color:' . sanitize_text_field($this->settings['thw_wishlist_btn_txt_color']);
            }

            $button_style = implode(';', $button_styles);
            $icon_styles = array();

            if (! empty($this->settings['thw_wishlist_add_icon_color'])) {
                $icon_styles[] = '--icon-color:' . sanitize_text_field($this->settings['thw_wishlist_add_icon_color']);
            }

            if (! empty($this->settings['thw_redirect_wishlist_page_icon_size'])) {
                $size = absint($this->settings['thw_redirect_wishlist_page_icon_size']);

                $icon_styles[] = '--svg-width:' . $size . 'px';
                $icon_styles[] = '--svg-height:' . $size . 'px';
                $icon_styles[] = '--svg-font-size:' . $size . 'px';
            }

            $icon_style = implode(';', $icon_styles);
        }

        ?>

    <div class="<?php echo esc_attr(implode(' ', $wrapper_classes)); ?>">
        <a
            href="#"
            class="<?php echo esc_attr(implode(' ', $button_classes)); ?>"
            style="<?php echo esc_attr($button_style); ?>"
            role="button"
            aria-label="<?php echo esc_attr($text); ?>"

            data-product-id="<?php echo esc_attr($product->get_id()); ?>"
            data-variation-id="<?php echo esc_attr($atts['variation_id']); ?>"

            data-add-text="<?php echo esc_attr($atts['add_text']); ?>"
            data-browse-text="<?php echo esc_attr($atts['browse_text']); ?>"

            data-add-icon="<?php echo esc_attr($atts['add_icon']); ?>"
            data-browse-icon="<?php echo esc_attr($atts['add_browse_icon']); ?>"

            data-display-style="<?php echo esc_attr($display); ?>"
            data-tooltip="<?php echo esc_attr($text); ?>"
            data-login-required="<?php echo esc_attr((int) $atts['login_required']); ?>"
            data-in-wishlist="<?php echo esc_attr((int) $in_wishlist); ?>"
            data-enable-tooltip="<?php echo esc_attr(
                ! empty($this->settings['thw_btn_tooltip'])
            ); ?>"
            data-remove-on-second-click="<?php echo esc_attr(
                ! empty($this->settings['thw_remove_on_second_click']) ? '1' : '0'
            ); ?>"
        >
            <?php if (in_array($display, array( 'icon', 'icon_text', 'icon_only_no_style' ), true)) : ?>
                <span class="thw-icon" style="<?php echo esc_attr($icon_style); ?>">
                    <?php echo $this->get_button_icon($icon); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped?>
                </span>
            <?php endif; ?>

            <?php if ('icon' !== $display && 'icon_only_no_style' !== $display) : ?>
                <span class="thw-to-add-text">
                    <?php echo esc_html($text); ?>
                </span>
            <?php endif; ?>
        </a>
    </div>

    <?php

    }

    public function flexible_shortcode($atts = array())
    {

        global $product;

        $default_product_id = (
            isset($product) &&
            $product instanceof WC_Product
        ) ? $product->get_id() : '';
        $raw_atts = $atts;
        $atts = shortcode_atts(
            array(

                /*
                 * Product
                 */
                'product_id' => $default_product_id,

                /*
                 * Text
                 */
                'add_text' => '',
                'browse_text' => '',

                /*
                 * Display
                 */
                'display_style' => '',

                /*
                 * Icons
                 */
                'add_icon' => '',
                'add_browse_icon' => '',

                /*
                 * Style
                 */
                'theme_style' => '',
                'custom_class' => '',

            ),
            $atts,
            'th_store_one_add_to_wishlist'
        );

        $product = wc_get_product(
            absint($atts['product_id'])
        );

        if (! $product instanceof WC_Product) {
            return '';
        }

        $variation_id = $product->is_type('variation')
            ? $product->get_id()
            : 0;

        /*
         * Text fallback.
         */
        if (! array_key_exists('add_text', $raw_atts)) {
            $atts['add_text'] =
                $this->settings['thw_add_to_wishlist_text']
                ?? __('Add to Wishlist', 'th-store-one');
        } elseif (is_null($raw_atts['add_text'])) {
            $atts['add_text'] = "";
        }

        if (! array_key_exists('browse_text', $raw_atts)) {
            $atts['browse_text'] =
                $this->settings['thw_browse_wishlist_text']
                ?? __('Browse Wishlist', 'th-store-one');
        } elseif (is_null($raw_atts['browse_text'])) {
            $atts['browse_text'] = "";
        }

        /*
         * IMPORTANT
         *
         * Agar shortcode me display_style pass nahi hua
         * to icon_text default use hoga.
         *
         * Backend setting yaha ignore hogi.
         */

        if ('' === $atts['display_style']) {

            $atts['display_style'] = 'icon_text';

        }
        /*
          * Icon fallback.
          */

        if ('' === $atts['add_icon']) {

            $atts['add_icon'] =
                $this->settings['thw_wishlist_add_icon']
                ?? 'heart-outline';

        }

        if ('' === $atts['add_browse_icon']) {

            $atts['add_browse_icon'] =
                $this->settings['th_wishlist_brws_icon']
                ?? 'heart-filled';

        }

        /*
         * Theme style.
         */

        if ('' === $atts['theme_style']) {

            $atts['theme_style'] = ! empty(
                $this->settings['thw_btn_style_theme']
            );

        } else {

            $atts['theme_style'] = in_array(
                strtolower($atts['theme_style']),
                array( '1', 'true', 'yes' ),
                true
            );

        }

        /*
         * Login required.
         */

        $atts['login_required'] = (
            ! is_user_logged_in()
            && ! empty($this->settings['thw_require_login'])
        );

        /*
         * Wishlist state.
         *
         * TODO:
         * Replace with Store One wishlist logic.
         */

        if (class_exists('Th_Store_One_Wishlist_Data_Pro_Data')) {

            $wishlist_id = isset($_GET['wishlist_id'])
            ? absint($_GET['wishlist_id'])
            : '';

            if ($wishlist_id) {
                $wishlist = Th_Store_One_Wishlist_Data_Pro_Data::get_wishlist_by_id($wishlist_id);
            } else {
                $wishlist = null;
            }

            $in_wishlist = Th_Store_One_Wishlist_Data_Pro_Data::is_product_in_any_wishlist(
                $product->get_id(),
                $variation_id,
                get_current_user_id()
            );

        } else {

            $wishlist = Th_Store_One_Wishlist_Data::get_or_create_wishlist();

            $in_wishlist = $wishlist
                ? Th_Store_One_Wishlist_Data::is_product_in_wishlist(
                    $wishlist->id,
                    $product->get_id(),
                    $variation_id
                )
                : false;
        }

        $atts['variation_id'] = $variation_id;
        $atts['in_wishlist']  = $in_wishlist;
        /*
         * Render.
         */

        return $this->render_button(
            $product,
            $atts
        );
    }

    /**
 * Render wishlist button.
 *
 * @param WC_Product|null $product Product object.
 * @param array           $args    Override settings.
 * @return string
 */
    private function render_button($product = null, $args = array())
    {

        if (! $product instanceof WC_Product) {
            global $product;
        }

        if (! $product instanceof WC_Product) {
            return '';
        }

        $args = wp_parse_args(
            $args,
            array(
                'add_text'        => __('Add to Wishlist', 'th-store-one'),
                'browse_text'     => __('Browse Wishlist', 'th-store-one'),
                'display_style'   => 'icon_text',
                'add_icon'        => 'heart-outline',
                'add_browse_icon' => 'heart-filled',
                'custom_class'    => '',
                'theme_style'     => false,

                'variation_id'    => 0,
                'in_wishlist'     => false,
                'login_required'  => false,
            )
        );

        $in_wishlist = ! empty($args['in_wishlist']);

        $text = $in_wishlist
            ? $args['browse_text']
            : $args['add_text'];

        $icon = $in_wishlist
    ? $args['add_browse_icon']
    : $args['add_icon'];

        $display = $args['display_style'];


        $theme_class = ! empty($args['theme_style'])
            ? 'thw-btn-theme-style'
            : 'thw-btn-custom-style';

        $wrap_class = (is_product() && ! doing_action('woocommerce_after_shop_loop_item'))
            ? 'th-wishlist-single'
            : 'th-wishlist-loop';

        $wrapper_classes = array(
            's1-th-wislist thw-add-to-wishlist-button-wrap',
            'th-theme-action',
            $theme_class,
            $wrap_class,
        );

        $button_classes = array(
            'thw-add-to-wishlist-button'
        );

        switch ($display) {

            case 'icon':
                $button_classes[] = 'th-icon';
                break;

            case 'icon_text':
                $button_classes[] = 'th-icon-text';
                break;

            case 'text':
                $button_classes[] = 'th-text';
                break;

            case 'icon_only_no_style':
                $button_classes[] = 'no-style';
                break;
        }

        if ($in_wishlist) {
            $button_classes[] = 'in-wishlist';
        }

        if (! empty($args['login_required'])) {
            $button_classes[] = 'thw-login-required';
        }

        if (! empty($args['custom_class'])) {
            $button_classes[] = $args['custom_class'];
        }

        $multi_enabled = apply_filters(
            'store_one_wishlist_multi_enabled',
            false
        );

        if ($multi_enabled && ! $in_wishlist) {
            $button_classes[] = 'create-multi';
        }

        ob_start();
        ?>

    <div class="<?php echo esc_attr(implode(' ', $wrapper_classes)); ?>">

        <a
            href="#"
            class="<?php echo esc_attr(implode(' ', $button_classes)); ?>"
            role="button"
            aria-label="<?php echo esc_attr($text); ?>"

            data-product-id="<?php echo esc_attr($product->get_id()); ?>"
            data-variation-id="<?php echo esc_attr($args['variation_id']); ?>"

            data-add-text="<?php echo esc_attr($args['add_text']); ?>"
            data-browse-text="<?php echo esc_attr($args['browse_text']); ?>"

            data-add-icon="<?php echo esc_attr($args['add_icon']); ?>"
            data-browse-icon="<?php echo esc_attr($args['add_browse_icon']); ?>"

            data-display-style="<?php echo esc_attr($display); ?>"
            data-tooltip="<?php echo esc_attr($text); ?>"
            data-login-required="<?php echo esc_attr((int) $args['login_required']); ?>"
            data-in-wishlist="<?php echo esc_attr((int) $in_wishlist); ?>"
            data-enable-tooltip="<?php echo esc_attr(
                ! empty($this->settings['thw_btn_tooltip'])
            ); ?>"
            data-remove-on-second-click="<?php echo esc_attr(
                ! empty($this->settings['thw_remove_on_second_click']) ? '1' : '0'
            ); ?>"
        >

            <?php if (in_array($display, array( 'icon', 'icon_text', 'icon_only_no_style' ), true)) : ?>

                <span class="thw-icon">
                    <?php
                                   echo $this->get_button_icon($icon);// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                ?>
                </span>

            <?php endif; ?>

            <?php if ('icon' !== $display && 'icon_only_no_style' !== $display) : ?>

                <span class="thw-to-add-text">
                    <?php echo esc_html($text); ?>
                </span>

            <?php endif; ?>

        </a>

    </div>

    <?php

    return ob_get_clean();
    }
    /**
      * Get wishlist button icon.
      *
      * @param string $icon Icon ID.
      * @return string
      */
    private function get_button_icon($icon)
    {
        $icons = array(
            'heart-outline' => '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>',
            'heart-filled'  => '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>',
            'star-outline'  => '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21L12 17.77L5.82 21L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>',
            'star-filled'   => '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21L12 17.77L5.82 21L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>',
            'bookmark-outline' => '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M6.32 2.577c2.83-.33 5.66-.33 8.49 0 1.497.174 2.57 1.46 2.57 2.93V21l-6.165-3.583-7.165 3.583V5.507c0-1.47 1.073-2.756 2.57-2.93Z"/></svg>',
            'bookmark-filled'  => '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"/></svg>',
        );

        $allowed_svg = array(
            'svg'  => array(
                'class'        => true,
                'width'        => true,
                'height'       => true,
                'viewbox'      => true,
                'fill'         => true,
                'stroke'       => true,
                'stroke-width' => true,
                'xmlns'        => true,
            ),
            'path' => array(
                'd'               => true,
                'fill'            => true,
                'stroke'          => true,
                'stroke-width'    => true,
                'stroke-linecap'  => true,
                'stroke-linejoin' => true,
                'fill-rule'       => true,
                'clip-rule'       => true,
            ),
        );

        if (! isset($icons[$icon])) {

            if (false !== strpos((string) $icon, 'favorite')) {
                $icon = 'heart-filled';
            } else {
                $icon = 'heart-outline';
            }
        }


        return function_exists('wp_kses') ? wp_kses($icons[ $icon ], $allowed_svg) : $icons[ $icon ];
    }

    /**
 * Wishlist Page Shortcode.
 *
 * Examples:
 *
 * [th_store_one_wishlist]
 * [th_store_one_wishlist layout="modern"]
 * [th_store_one_wishlist layout="traditional"]
 * [th_store_one_wishlist layout="classic"]
 *
 * Compatible:
 * [thwl_wishlist]
 *
 * @param array $atts Shortcode attributes.
 * @return string
 */
    public function wishlist_shortcode($atts = array())
    {



        $atts = shortcode_atts(
            array(

                /**
                 * Layout
                 *
                 * Empty = Store One setting use karega.
                 */
                'layout' => '',

                /**
                 * Wishlist ID
                 *
                 * Future use.
                 */
                'wishlist_id' => '',

                /**
                 * Show Header
                 */
                'show_header' => '',

                /**
                 * Show Share Button
                 */
                'show_share' => '',

                /**
                 * Custom Class
                 */
                'class' => '',

            ),
            $atts,
            'th_store_one_wishlist'
        );

        /*
         * Layout fallback
         *
         * Shortcode > Settings
         */
        if (empty($atts['layout'])) {
            $atts['layout'] = $this->settings['wishlist_table_style'] ?? 'classic';
        }

        /*
         * Header fallback
         */
        if ('' === $atts['show_header']) {
            $atts['show_header'] = true;
        } else {
            $atts['show_header'] = filter_var(
                $atts['show_header'],
                FILTER_VALIDATE_BOOLEAN
            );
        }

        /*
         * Share fallback
         */
        if ('' === $atts['show_share']) {
            $atts['show_share'] = ! empty(
                $this->settings['thw_show_social_share']
            );
        } else {
            $atts['show_share'] = filter_var(
                $atts['show_share'],
                FILTER_VALIDATE_BOOLEAN
            );
        }

        /*
        * Wishlist ID fallback.
        */
        if (empty($atts['wishlist_id'])) {

            if (class_exists('Th_Store_One_Wishlist_Data_Pro_Data')) {

                $atts['wishlist_id'] = isset($_GET['wishlist_id'])
                    ? absint($_GET['wishlist_id'])
                    : 0;

            } else {

                $wishlist = Th_Store_One_Wishlist_Data::get_or_create_wishlist();

                $atts['wishlist_id'] = $wishlist
                    ? absint($wishlist->id)
                    : 0;

            }
        }

        /*
         * Render Table
         */
        return $this->render_table($atts);
    }

    /**
     * Render wishlist table.
     *
     * @param array $args Shortcode / render arguments.
     * @return string
     */
    private function render_table($args = array())
    {

        /*
         * Layout
         *
         * Shortcode > Settings
         */
        $layout = ! empty($args['layout'])
            ? sanitize_key($args['layout'])
            : ($this->settings['wishlist_table_style'] ?? 'classic');
        /*
        * Wishlist
        */
        if (class_exists('Th_Store_One_Wishlist_Data_Pro_Data') && ! empty($args['wishlist_id'])) {

            $wishlist = Th_Store_One_Wishlist_Data_Pro_Data::get_wishlist_by_id(
                absint($args['wishlist_id'])
            );

        } else {

            $wishlist = Th_Store_One_Wishlist_Data::get_or_create_wishlist();

        }

        if (! $wishlist) {
            return '';
        }

        /*
         * Wishlist Items
         */
        $items = Th_Store_One_Wishlist_Data::get_wishlist_items(
            $wishlist->id
        );

        /*
         * Common data passed to template.
         */
        $data = array(
            'settings' => $this->settings,
            'wishlist' => $wishlist,
            'items'    => $items,
            'args'     => $args,
        );

        /*
         * Template
         */
        switch ($layout) {

            case 'modern':
                $template = TH_STORE_ONE_PLUGIN_DIR .
                    'includes/modules/wishlist/templates/modern.php';
                break;

            case 'minimal':
                $template = TH_STORE_ONE_PLUGIN_DIR .
                    'includes/modules/wishlist/templates/traditional.php';
                break;

            case 'classic':
            default:
                $template = TH_STORE_ONE_PLUGIN_DIR .
                    'includes/modules/wishlist/templates/classic.php';
                break;
        }

        /*
         * Template not found.
         */
        if (! file_exists($template)) {
            return '';
        }

        /*
         * Make variables available inside template.
         */
        extract($data, EXTR_SKIP);

        ob_start();

        include $template;

        return ob_get_clean();
    }

    /**
     * Render social share links.
     *
     * @param object $wishlist Wishlist object.
     * @return string
     */
    private function render_social_share_links($wishlist)
    {

        if (
            empty($this->settings['thw_show_social_share']) ||
            empty($wishlist) ||
            empty($wishlist->wishlist_token)
        ) {
            return '';
        }



        $wishlist_page_id = ! empty($this->settings['thwl_page_id'])
            ? absint($this->settings['thwl_page_id'])
            : '';

        if (! $wishlist_page_id) {
            return '';
        }

        $share_url = add_query_arg(
            array(
                'wishlist_token'  => $wishlist->wishlist_token,
                'wishlist_action' => 'view',
            ),
            get_permalink($wishlist_page_id)
        );

        $encoded_url   = rawurlencode($share_url);
        $encoded_title = rawurlencode(
            __('My Wishlist', 'th-store-one')
        );


        ?>

    <div class="thwl-social-share">

        <span class="thwl-social-title">
            <?php esc_html_e('Share:', 'th-store-one'); ?>
        </span>

        <a
            href="<?php echo esc_url('https://www.facebook.com/sharer/sharer.php?u=' . $encoded_url); ?>"
            target="_blank"
            rel="noopener"
            class="thwl-share-facebook"
            title="<?php esc_attr_e('Facebook', 'th-store-one'); ?>"
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/>
</svg>
        </a>

        <a
            href="<?php echo esc_url('https://twitter.com/intent/tweet?url=' . $encoded_url . '&text=' . $encoded_title); ?>"
            target="_blank"
            rel="noopener"
            class="thwl-share-twitter"
            title="<?php esc_attr_e('X', 'th-store-one'); ?>"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.901 1H22.58l-8.04 9.19L24 23h-7.406l-5.8-7.584L4.16 23H.48l8.6-9.83L0 1h7.594l5.243 6.932L18.901 1Zm-1.29 19.8h2.04L6.47 3.1H4.28L17.61 20.8Z"/>
</svg>
        </a>

        <a
            href="<?php echo esc_url('https://api.whatsapp.com/send?text=' . $encoded_title . '%20' . $encoded_url); ?>"
            target="_blank"
            rel="noopener"
            class="thwl-share-whatsapp"
            title="<?php esc_attr_e('WhatsApp', 'th-store-one'); ?>"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.85 11.85 0 0 0 12.04 0C5.4 0 0 5.4 0 12.04c0 2.12.55 4.2 1.6 6.04L0 24l6.09-1.58a12.04 12.04 0 0 0 5.95 1.52h.01C18.69 23.94 24 18.63 24 12c0-3.2-1.25-6.21-3.48-8.52ZM12.05 21.9a9.9 9.9 0 0 1-5.04-1.37l-.36-.21-3.61.94.96-3.52-.23-.37a9.86 9.86 0 1 1 8.28 4.53Zm5.42-7.39c-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.24-.25-.6-.5-.52-.68-.53h-.58c-.2 0-.53.08-.8.38-.28.3-1.06 1.03-1.06 2.52s1.09 2.93 1.24 3.13c.15.2 2.14 3.27 5.18 4.58.72.31 1.29.49 1.73.63.73.23 1.39.2 1.91.12.58-.09 1.79-.73 2.04-1.43.25-.7.25-1.31.18-1.43-.08-.13-.28-.2-.58-.35Z"/>
</svg>
        </a>

        <a
            href="<?php echo esc_url('https://pinterest.com/pin/create/button/?url=' . $encoded_url); ?>"
            target="_blank"
            rel="noopener"
            class="thwl-share-pinterest"
            title="<?php esc_attr_e('Pinterest', 'th-store-one'); ?>"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 4.92 2.98 9.15 7.23 10.98-.1-.93-.18-2.37.04-3.39.2-.87 1.3-5.53 1.3-5.53s-.33-.66-.33-1.63c0-1.53.89-2.67 2-2.67.94 0 1.39.7 1.39 1.55 0 .94-.6 2.35-.91 3.65-.26 1.09.55 1.98 1.62 1.98 1.95 0 3.45-2.06 3.45-5.03 0-2.63-1.89-4.47-4.59-4.47-3.13 0-4.97 2.35-4.97 4.78 0 .95.37 1.97.82 2.53.09.11.1.21.08.33-.09.36-.29 1.1-.33 1.25-.05.2-.17.25-.38.15-1.43-.67-2.32-2.78-2.32-4.47 0-3.64 2.65-6.99 7.65-6.99 4.02 0 7.14 2.87 7.14 6.71 0 4-2.52 7.22-6.02 7.22-1.17 0-2.28-.61-2.66-1.34l-.72 2.73c-.26.99-.97 2.23-1.45 2.99A12 12 0 1 0 12 0Z"/>
</svg>
        </a>

        <a
            href="<?php echo esc_url('mailto:?subject=' . $encoded_title . '&body=' . $encoded_url); ?>"
            class="thwl-share-email"
            title="<?php esc_attr_e('Email', 'th-store-one'); ?>"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2-8 5L4 6h16Zm0 12H4V8l8 5 8-5v10Z"/>
</svg>
        </a>

        <a
            href="#"
            class="thwl-copy-link"
            data-url="<?php echo esc_attr($share_url); ?>"
            title="<?php esc_attr_e('Copy Link', 'th-store-one'); ?>"
        >
            <span class="dashicons dashicons-admin-links"></span>
        </a>

    </div>

    <?php


    }

    /**
 * Render Add to Cart button.
 *
 * @param WC_Product $product Product object.
 * @param object     $item    Wishlist item.
 * @return void
 */
    private function render_add_to_cart_button($product, $item)
    {

        if (! $product->is_purchasable() || ! $product->is_in_stock()) {
            ?>
        <span class="thwl-cart-disabled">
            <?php esc_html_e('Unavailable', 'th-store-one'); ?>
        </span>
        <?php
            return;
        }

        if (! empty($this->settings['thw_redirect_to_cart'])) {
            ?>

        <button
            type="button"
            class="button thwl-cart-btn thwl-add-to-cart-manage"
            data-product-id="<?php echo esc_attr($product->get_id()); ?>"
            data-item-id="<?php echo esc_attr($item->id); ?>"
            data-quantity="<?php echo esc_attr($item->quantity); ?>"
        >
            <?php esc_html_e('Add to Cart', 'th-store-one'); ?>
        </button>

        <?php
        } else {
            ?>

        <button
            href="<?php echo esc_url('?add-to-cart=' . $product->get_id()); ?>"
            class="button thwl-cart-btn ajax_add_to_cart add_to_cart_button"
            data-product_id="<?php echo esc_attr($product->get_id()); ?>"
            data-product_sku="<?php echo esc_attr($product->get_sku()); ?>"
            data-quantity="<?php echo esc_attr($item->quantity); ?>"
            rel="nofollow"
        >
        <?php esc_html_e('Add to Cart', 'th-store-one'); ?>
        </button>
        <?php
        }
    }

    public function render_footer()
    {
        do_action(
            'store_one_wishlist_footer',
            $this->settings
        );
    }

    public function ajax_remove_product_from_wishlist()
    {
        check_ajax_referer(
            'store-one-remove-nonce',
            'nonce'
        );

        $product_id = isset($_POST['product_id'])
            ? absint($_POST['product_id'])
            : 0;

        $variation_id = isset($_POST['variation_id'])
            ? absint($_POST['variation_id'])
            : 0;

        if (! $product_id) {
            wp_send_json_error(
                array(
                    'message' => __(
                        'Invalid product.',
                        'th-store-one'
                    ),
                ),
                400
            );
        }

        $user_id = get_current_user_id();

        $guest_token = isset($_COOKIE['thwl_guest_uniqid'])
            ? sanitize_text_field(
                wp_unslash($_COOKIE['thwl_guest_uniqid'])
            )
            : '';

        $removed = false;

        /*
         * ---------------------------------------------------------
         * Pro Multi Wishlist.
         * ---------------------------------------------------------
         *
         * If Pro data class exists, check all user's wishlists.
         */
        if (class_exists('Th_Store_One_Wishlist_Data_Pro_Data')) {

            $wishlists = is_user_logged_in()
                ? Th_Store_One_Wishlist_Data_Pro_Data::get_user_wishlists(
                    $user_id
                )
                : Th_Store_One_Wishlist_Data_Pro_Data::get_guest_wishlists();

            foreach ($wishlists as $wishlist) {

                $items = Th_Store_One_Wishlist_Data::get_wishlist_items(
                    (int) $wishlist->id
                );

                if (empty($items)) {
                    continue;
                }

                foreach ($items as $item) {

                    if (
                        (int) $item->product_id !== $product_id
                        || (int) $item->variation_id !== $variation_id
                    ) {
                        continue;
                    }

                    $result = Th_Store_One_Wishlist_Data::remove_item(
                        (int) $item->id,
                        $user_id,
                        $guest_token
                    );

                    if ($result) {
                        $removed = true;
                    }
                }
            }

        } else {

            /*
             * -----------------------------------------------------
             * Lite Wishlist.
             * -----------------------------------------------------
             */
            $wishlist = Th_Store_One_Wishlist_Data::get_or_create_wishlist();

            if (! $wishlist) {
                wp_send_json_error(
                    array(
                        'message' => __(
                            'Wishlist not found.',
                            'th-store-one'
                        ),
                    ),
                    404
                );
            }

            $items = Th_Store_One_Wishlist_Data::get_wishlist_items(
                $wishlist->id
            );

            foreach ($items as $item) {

                if (
                    (int) $item->product_id !== $product_id
                    || (int) $item->variation_id !== $variation_id
                ) {
                    continue;
                }

                $removed = Th_Store_One_Wishlist_Data::remove_item(
                    (int) $item->id,
                    $user_id,
                    $guest_token
                );

                if ($removed) {
                    break;
                }
            }
        }

        if ($removed) {
            wp_send_json_success(
                array(
                    'message' => __(
                        'Removed from Wishlist',
                        'th-store-one'
                    ),
                )
            );
        }

        wp_send_json_error(
            array(
                'message' => __(
                    'Product was not found in the wishlist.',
                    'th-store-one'
                ),
            ),
            404
        );
    }

    public static function remove_product_from_all_wishlists(
        $product_id,
        $variation_id = 0,
        $user_id = 0
    ) {
        global $wpdb;

        $product_id   = absint($product_id);
        $variation_id = absint($variation_id);
        $user_id      = absint($user_id);

        if (! $product_id) {
            return false;
        }

        /*
         * Get all wishlists for current user.
         */
        if ($user_id) {
            $wishlists = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT id
                FROM {$wpdb->prefix}thwl_wishlists
                WHERE user_id = %d",
                    $user_id
                )
            );
        } else {
            $guest_token = isset($_COOKIE['thwl_guest_uniqid'])
                ? sanitize_text_field(
                    wp_unslash($_COOKIE['thwl_guest_uniqid'])
                )
                : '';

            if (empty($guest_token)) {
                return false;
            }

            $wishlists = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT id
                FROM {$wpdb->prefix}thwl_wishlists
                WHERE session_id = %s",
                    $guest_token
                )
            );
        }

        if (empty($wishlists)) {
            return false;
        }

        $removed = false;

        foreach ($wishlists as $wishlist) {

            $items = self::get_wishlist_items(
                (int) $wishlist->id
            );

            if (empty($items)) {
                continue;
            }

            foreach ($items as $item) {

                if (
                    (int) $item->product_id !== $product_id
                    || (int) $item->variation_id !== $variation_id
                ) {
                    continue;
                }

                if (
                    self::remove_item(
                        (int) $item->id,
                        $user_id
                    )
                ) {
                    $removed = true;
                }
            }
        }

        return $removed;
    }
}
