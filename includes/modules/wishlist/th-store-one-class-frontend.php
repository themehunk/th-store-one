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
    public function __construct($settings = array())
    {
        $this->settings = $settings;

        add_action('wp', array( $this, 'init' ));
        add_action(
            'wp_enqueue_scripts',
            array( $this, 'enqueue_assets' )
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
                ?? 'woocommerce_single_product_summary'
        );

        $priority = absint(
            $this->settings['thw_in_single_priority'] ?? 10
        );

        add_action(
            $hook,
            array( $this, 'render_single_button' ),
            $priority
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
        $wishlist    = null;
        $in_wishlist = false;

        /*
        Example:
        $wishlist = Th_Store_One_Wishlist_Data::get_or_create_wishlist();
        $in_wishlist = $wishlist
            ? Th_Store_One_Wishlist_Data::is_product_in_wishlist(
                $wishlist->id,
                $product->get_id(),
                $variation_id
            )
            : false;
        */

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

        // Direct Output Buffering Start

        ?>

    <div class="<?php echo esc_attr(implode(' ', $wrapper_classes)); ?>">
        <a
            href="#"
            class="<?php echo esc_attr(implode(' ', $button_classes)); ?>"
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
        >
            <?php if (in_array($display, array( 'icon', 'icon_text', 'icon_only_no_style' ), true)) : ?>
                <span class="thw-icon">
                    <?php echo $this->get_button_icon($icon); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped?>
                </span>
            <?php endif; ?>

            <?php if ('icon' !== $display && 'icon_only_no_style' !== $display) : ?>
                <span class="thw-button-text">
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

        if ('' === $atts['add_text']) {

            $atts['add_text'] =
                $this->settings['thw_add_to_wishlist_text']
                ?? __('Add to Wishlist', 'th-store-one');

        }

        if ('' === $atts['browse_text']) {

            $atts['browse_text'] =
                $this->settings['thw_browse_wishlist_text']
                ?? __('Browse Wishlist', 'th-store-one');

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

        $wishlist = null;

        $in_wishlist = false;

        /*
        Example:

        $wishlist = Th_Store_One_Wishlist_Data::get_or_create_wishlist();

        $in_wishlist = $wishlist
            ? Th_Store_One_Wishlist_Data::is_product_in_wishlist(
                $wishlist->id,
                $product->get_id(),
                $variation_id
            )
            : false;
        */

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

        if (! empty($args['login_required'])) {
            $button_classes[] = 'thw-login-required';
        }

        if (! empty($args['custom_class'])) {
            $button_classes[] = $args['custom_class'];
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
        >

            <?php if (in_array($display, array( 'icon', 'icon_text', 'icon_only_no_style' ), true)) : ?>

                <span class="thw-icon">
                    <?php
                        echo $this->get_button_icon($icon); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                ?>
                </span>

            <?php endif; ?>

            <?php if ('icon' !== $display && 'icon_only_no_style' !== $display) : ?>

                <span class="thw-button-text">
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

        if (empty($icons[ $icon ])) {
            return '';
        }


        return function_exists('wp_kses') ? wp_kses($icons[ $icon ], $allowed_svg) : $icons[ $icon ];
    }
}
