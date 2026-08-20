<?php

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Handles Import from Old TH Wishlist Settings
 */
class TH_StoreOne_Old_Plugin_Importer
{
    /**
     * Constructor
     */
    public function __construct()
    {
        add_action('rest_api_init', array( $this, 'register_rest_routes' ));
    }

    /**
     * Register REST API Routes
     */
    public function register_rest_routes()
    {

        // Check if old data exists
        register_rest_route('th-store-one/v1', '/check-old-option', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'check_old_option' ),
            'permission_callback' => '__return_true',
        ));

        // Import Old Data
        register_rest_route('th-store-one/v1', '/module/th-wishlist/import-old', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'import_old_data' ),
            'permission_callback' => array( $this, 'permission_callback' ),
        ));

        // Import Old Cart Data
        register_rest_route(
            'th-store-one/v1',
            '/module/th-cart/import-old',
            array(
                'methods'             => 'POST',
                'callback'            => array($this, 'import_old_cart_data'),
                'permission_callback' => array($this, 'permission_callback'),
            )
        );
    }

    /**
     * Permission Check
     */
    public function permission_callback()
    {
        return current_user_can('manage_options');
    }

    /**
     * Check Old Option Data.
     *
     * @param WP_REST_Request $request Request.
     *
     * @return array
     */
    public function check_old_option($request)
    {
        $option = sanitize_text_field(
            $request->get_param('option')
        );

        if (empty($option)) {
            return array(
                'has_data' => false,
            );
        }

        /*
         * Old option => Store One module.
         */
        $module_map = array(
            'thwl_settings' => 'th-wishlist',

            // TH All In One Woo Cart.
            'taiowc'         => 'th-cart',
            'taiowcp'        => 'th-cart',
        );

        $module = $module_map[$option] ?? '';

        /*
         * Already imported.
         */
        if ($module && $this->is_module_imported($module)) {
            return array(
                'has_data' => false,
            );
        }

        $data = get_option($option, array());

        return array(
            'has_data' => ! empty($data),
        );
    }

    private function mark_module_imported($module)
    {
        $imported = get_option(
            'th_store_one_imported_modules',
            array()
        );

        if (! is_array($imported)) {
            $imported = array();
        }

        if (! in_array($module, $imported, true)) {
            $imported[] = $module;
        }

        update_option(
            'th_store_one_imported_modules',
            $imported
        );
    }

    private function is_module_imported($module)
    {
        $imported = get_option('th_store_one_imported_modules', array());

        if (! is_array($imported)) {
            $imported = array();
        }

        return in_array($module, $imported, true);
    }

    public function import_old_data($request)
    {
        $old = get_option('thwl_settings', array());

        if (empty($old)) {
            return array(
                'success' => false,
                'message' => 'No old data found in thwl_settings',
            );
        }

        // Map old settings + fill missing keys with defaults
        $new_settings = array(
            'thwl_page_id'                         => $old['thwl_page_id'] ?? '',
            'thw_require_login'                    => ! empty($old['thw_require_login']),
            'thw_button_display_style'             => $old['thw_button_display_style'] ?? 'icon_text',
            'thw_add_to_wishlist_text'             => $old['thw_add_to_wishlist_text'] ?? 'Add to Wishlist',
            'thw_browse_wishlist_text'             => $old['thw_browse_wishlist_text'] ?? 'Browse Wishlist',
            'thw_btn_style_theme'                  => ! empty($old['thw_btn_style_theme']),
            'thw_show_in_loop'                     => ! empty($old['thw_show_in_loop']),
            'thw_in_loop_position'                 => $old['thw_in_loop_position'] ?? 'after_crt_btn',
            'thw_show_in_product'                  => ! empty($old['thw_show_in_product']),
            'thw_in_single_position'               => $old['thw_in_single_position'] ?? 'after_crt_btn',
            'thw_in_single_priority'               => $old['thw_in_single_priority'] ?? '10',
            'thw_redirect_to_cart'                 => ! empty($old['thw_redirect_to_cart']),
            'thw_show_social_share'                => ! empty($old['thw_show_social_share']),
            'thw_redirect_wishlist_page'           => ! empty($old['thw_redirect_wishlist_page']),
            'thw_wishlist_add_icon'                => $old['th_wishlist_add_icon'] ?? $old['thw_wishlist_add_icon'] ?? 'heart-outline',
            'th_wishlist_brws_icon'                => $old['th_wishlist_brws_icon'] ?? 'heart-filled',
            'use_shortcode'                        => true,
            'use_shortcode_btn'                    => true,
            'use_shortcode_redirect'               => true,

            // Style
            'thw_wishlist_add_icon_color'          => $old['th_wishlist_add_icon_color'] ?? '#111',
            'thw_wishlist_btn_bg_color'            => $old['th_wishlist_btn_bg_color'] ?? '#6a4df5',
            'thw_wishlist_btn_txt_color'           => $old['th_wishlist_btn_txt_color'] ?? '#fff',
            'thw_redirect_wishlist_page_icon_size' => $old['thw_redirect_wishlist_page_icon_size'] ?? '24',
            'thw_wishlist_table_bg_color'          => $old['th_wishlist_table_bg_color'] ?? '#fff',
            'thw_wishlist_table_brd_color'         => $old['th_wishlist_table_brd_color'] ?? '#eee',
            'thw_wishlist_table_txt_color'         => $old['th_wishlist_table_txt_color'] ?? '#111',
            'wishlist_table_style'                 => $old['thwl_wishlist_page_layout'] ?? 'classic',
        );

        $all = get_option('th_store_one_module_set', array());

        if (! is_array($all)) {
            $all = array();
        }

        $all['th-wishlist'] = $new_settings;

        update_option('th_store_one_module_set', $all);

        /*
        * Mark Wishlist as imported.
        */
        $this->mark_module_imported('th-wishlist');

        return array(
            'success'  => true,
            'settings' => $new_settings,
            'message'  => 'Old TH Wishlist settings imported successfully!',
        );
    }

    /**
     * Get Old Cart Settings.
     *
     * Pro settings have priority over Lite settings.
     *
     * Pro:
     * taiowcp_options
     *
     * Lite:
     * taiowc_options
     *
     * @return array
     */
    private function get_old_cart_settings()
    {
        /*
         * Pro Cart Settings.
         */
        $pro_settings = get_option(
            'taiowcp',
            array()
        );


        /*
         * Lite Cart Settings.
         */
        $lite_settings = get_option(
            'taiowc',
            array()
        );


        /*
         * Make sure both values are arrays.
         */
        $pro_settings = is_array($pro_settings)
            ? $pro_settings
            : array();

        $lite_settings = is_array($lite_settings)
            ? $lite_settings
            : array();


        /*
         * Lite is the base.
         * Pro overrides Lite when the same key exists.
         */
        return array_merge(
            $lite_settings,
            $pro_settings
        );
    }


    /**
     * Import Old TH All In One Woo Cart Settings.
     *
     * @param WP_REST_Request $request Request.
     *
     * @return array
     */
    public function import_old_cart_data($request)
    {
        /*
         * Get old Cart settings.
         *
         * Pro has priority over Lite.
         */
        $old = $this->get_old_cart_settings();


        if (empty($old)) {
            return array(
                'success' => false,
                'message' => 'No old Cart settings found in taiowc_options or taiowcp_options.',
            );
        }


        /*
         * Map old Cart settings
         * + fill missing keys with Store One defaults.
         */
        $new_settings = array(

            /*
             * General.
             */
            'taiowc_show_cart'             => $old['taiowc_show_cart'] ?? true,
            'taiowc_cart_open'             => $old['taiowc_cart_open'] ?? 'simple-open',
            'taiowc_cart_visibility'       => $old['taiowc_cart_visibility'] ?? true,
            'taiowc_show_ai_suggestion'    => $old['taiowc_show_ai_suggestion'] ?? false,
            'taiowc_ai_suggestion_heading' => $old['taiowc_ai_suggestion_heading']
                ?? '✨ AI Product Suggestions',

            'taiowc_icon_url'              => $old['taiowc_icon_url'] ?? '',


            /*
             * Cart Content.
             */
            'taiowc_show_prd_img'          => $old['taiowc_show_prd_img'] ?? true,
            'taiowc_show_prd_title'        => $old['taiowc_show_prd_title'] ?? true,
            'taiowc_show_prd_price'        => $old['taiowc_show_prd_price'] ?? true,
            'taiowc_show_prd_quantity'     => $old['taiowc_show_prd_quantity'] ?? true,
            'taiowc_show_prd_rating'       => $old['taiowc_show_prd_rating'] ?? true,


            /*
             * Visibility.
             */
            'taiowc_hide_cart_page'        => $old['taiowc_hide_cart_page'] ?? true,
            'taiowc_hide_checkout_page'    => $old['taiowc_hide_checkout_page'] ?? true,
            'taiowc_hide_shop_page'        => $old['taiowc_hide_shop_page'] ?? false,
            'taiowc_hide_account_page'     => $old['taiowc_hide_account_page'] ?? true,
            'taiowc_hide_single_page'      => $old['taiowc_hide_single_page'] ?? false,
            'taiowc_hide_home_page'        => $old['taiowc_hide_home_page'] ?? false,
            'taiowc_hide_blog_page'        => $old['taiowc_hide_blog_page'] ?? false,


            /*
             * Coupon / Shipping.
             */
            'taiowc_show_coupon'           => $old['taiowc_show_coupon'] ?? false,
            'taiowc_show_shipping'         => $old['taiowc_show_shipping'] ?? false,
            'taiowc_show_shipping_bar'     => $old['taiowc_show_shipping_bar'] ?? false,


            /*
             * Menu Cart.
             */
            'taiowc_show_price'            => $old['taiowc_show_price'] ?? true,
            'taiowc_show_quantity'         => $old['taiowc_show_quantity'] ?? true,
            'taiowc_price_font_size'       => $old['taiowc_price_font_size'] ?? 14,
            'taiowc_icon_size'             => $old['taiowc_icon_size'] ?? 24,

            'taiowc_bg_color'              => $old['taiowc_bg_color'] ?? '',
            'taiowc_price_color'           => $old['taiowc_price_color'] ?? '#111',
            'taiowc_quantity_bg'           => $old['taiowc_quantity_bg'] ?? '#111',
            'taiowc_quantity_color'        => $old['taiowc_quantity_color'] ?? '#fff',
            'taiowc_icon_color'            => $old['taiowc_icon_color'] ?? '#111',


            /*
             * Fixed / Floating Cart.
             */
            'taiowc_cart_style'            => $old['taiowc_cart_style'] ?? 'style-1',
            'taiowc_fixed_show_quantity'   => $old['taiowc_fixed_show_quantity'] ?? true,
            'taiowc_fixed_position'        => $old['taiowc_fixed_position'] ?? 'fxd-right',
            'taiowc_fixed_right'           => $old['taiowc_fixed_right'] ?? 29,
            'taiowc_fixed_left'            => $old['taiowc_fixed_left'] ?? 29,
            'taiowc_fixed_bottom'          => $old['taiowc_fixed_bottom'] ?? 36,
            'taiowc_fixed_icon_size'       => $old['taiowc_fixed_icon_size'] ?? 24,
            'taiowc_fixed_radius'          => $old['taiowc_fixed_radius'] ?? 100,

            'taiowc_fixed_bg'              => $old['taiowc_fixed_bg'] ?? '#ffffff70',
            'taiowc_fixed_icon_color'      => $old['taiowc_fixed_icon_color'] ?? '#111',
            'taiowc_fixed_price_color'     => $old['taiowc_fixed_price_color'] ?? '#111',
            'taiowc_fixed_quantity_bg'     => $old['taiowc_fixed_quantity_bg'] ?? '#111',
            'taiowc_fixed_quantity_color'  => $old['taiowc_fixed_quantity_color'] ?? '#fff',


            /*
             * Cart Panel.
             */
            'taiowc_cart_pan_icon_shw'     => $old['taiowc_cart_pan_icon_shw'] ?? true,
            'taiowc_cart_effect'            => $old['taiowc_cart_effect'] ?? 'taiowc-slide-right',
            'taiowc_cart_hd'                => $old['taiowc_cart_hd'] ?? 'Your Cart',
            'taiowc_cart_item_order'        => $old['taiowc_cart_item_order'] ?? 'prd_first',
            'taiowc_empty_cart_txt'         => $old['taiowc_empty_cart_txt'] ?? 'Start Shopping',
            'taiowc_empty_cart_url'         => $old['taiowc_empty_cart_url'] ?? '',
            'taiowc_cart_pan_cart_shw'      => $old['taiowc_cart_pan_cart_shw'] ?? true,

            'taiowc_icontype'               => $old['taiowc_icontype'] ?? 'icon',
            'taiowc_custom_svg'             => $old['taiowc_custom_svg'] ?? '',
            'taiowc_image_url'              => $old['taiowc_image_url'] ?? '',
            'taiowc_cart_icon'              => $old['taiowc_cart_icon'] ?? 'icon-1',


            /*
             * Cart Header Colors.
             */
            'taiowc_cart_pan_hdr_bg_clr'    => $old['taiowc_cart_pan_hdr_bg_clr'] ?? '#ffffff',
            'taiowc_cart_pan_hd_clr'        => $old['taiowc_cart_pan_hd_clr'] ?? '#111111',
            'taiowc_cart_pan_icon_clr'      => $old['taiowc_cart_pan_icon_clr'] ?? '#111111',
            'taiowc_cart_pan_cls_clr'       => $old['taiowc_cart_pan_cls_clr'] ?? '#666666',


            /*
             * Cart Content Colors.
             */
            'taiowc_cart_pan_bg_clr'        => $old['taiowc_cart_pan_bg_clr'] ?? '#fafafa',
            'taiowc_cart_pan_prd_bg_clr'    => $old['taiowc_cart_pan_prd_bg_clr'] ?? '#ffffff',
            'taiowc_cart_pan_prd_tle_clr'   => $old['taiowc_cart_pan_prd_tle_clr'] ?? '#111111',
            'taiowc_cart_pan_prd_txt_clr'   => $old['taiowc_cart_pan_prd_txt_clr'] ?? '#666666',
            'taiowc_cart_pan_prd_brd_clr'   => $old['taiowc_cart_pan_prd_brd_clr'] ?? '#e9e9e9',
            'taiowc_cart_pan_prd_rat_clr'   => $old['taiowc_cart_pan_prd_rat_clr'] ?? '#ffb400',
            'taiowc_cart_pan_prd_dlt_clr'   => $old['taiowc_cart_pan_prd_dlt_clr'] ?? '#999999',


            /*
             * Cart Order.
             */
            'taiowc_cart_pan_pay_bg_clr'      => $old['taiowc_cart_pan_pay_bg_clr'] ?? '#ffffff',
            'taiowc_cart_pan_pay_txt_clr'     => $old['taiowc_cart_pan_pay_txt_clr'] ?? '#111111',
            'taiowc_cart_pan_pay_hd_bg_clr'   => $old['taiowc_cart_pan_pay_hd_bg_clr'] ?? '#f7f7f7',
            'taiowc_cart_pan_pay_hd_clr'      => $old['taiowc_cart_pan_pay_hd_clr'] ?? '#111111',
            'taiowc_cart_pan_pay_link_clr'    => $old['taiowc_cart_pan_pay_link_clr'] ?? '#111111',
            'taiowc_cart_pan_pay_btn_bg_clr'  => $old['taiowc_cart_pan_pay_btn_bg_clr'] ?? '#111111',
            'taiowc_cart_pan_pay_btn_clr'     => $old['taiowc_cart_pan_pay_btn_clr'] ?? '#ffffff',
            'taiowc_cart_pan_pay_cart_bg_clr' => $old['taiowc_cart_pan_pay_cart_bg_clr'] ?? '#ffffff',
            'taiowc_cart_pan_pay_cart_clr'    => $old['taiowc_cart_pan_pay_cart_clr'] ?? '#111111',


            /*
             * Free Shipping.
             */
            'taiowc_shipping_bg'              => $old['taiowc_shipping_bg'] ?? '#f8f5ed',
            'taiowc_shipping_track'           => $old['taiowc_shipping_track'] ?? '#e5e5e5',
            'taiowc_shipping_fill'            => $old['taiowc_shipping_fill'] ?? '#22591f',
            'taiowc_shipping_icon_bg'         => $old['taiowc_shipping_icon_bg'] ?? '#ffffff',
            'taiowc_shipping_icon_border'     => $old['taiowc_shipping_icon_border'] ?? '#38b44a',
            'taiowc_shipping_text'            => $old['taiowc_shipping_text'] ?? '#333333',
            'taiowc_shipping_amount'          => $old['taiowc_shipping_amount'] ?? '#111111',


            /*
             * Mobile.
             */
            'taiowcp_dsble_mnu_crt'            => $old['taiowcp_dsble_mnu_crt'] ?? false,
            'taiowcp_dsble_mnu_crt_qnty'       => $old['taiowcp_dsble_mnu_crt_qnty'] ?? false,
            'taiowcp_dsble_mnu_crt_price'      => $old['taiowcp_dsble_mnu_crt_price'] ?? false,

            'taiowcp_dsble_fxd_crt'            => $old['taiowcp_dsble_fxd_crt'] ?? false,
            'taiowcp_dsble_fxd_crt_qnty'       => $old['taiowcp_dsble_fxd_crt_qnty'] ?? false,
            'taiowcp_fxd_cart_mobile_position' => $old['taiowcp_fxd_cart_mobile_position'] ?? '',

            'taiowcp_cart_mobile_effect'      => $old['taiowcp_cart_mobile_effect'] ?? 'mobiletopslide',
            'taiowcp_dsble_mob_rel_prd_crt'    => $old['taiowcp_dsble_mob_rel_prd_crt'] ?? false,
            'taiowcp_dsble_mob_ship'            => $old['taiowcp_dsble_mob_ship'] ?? false,
            'taiowcp_dsble_mob_coupan'          => $old['taiowcp_dsble_mob_coupan'] ?? false,
        );


        /*
         * Get existing Store One module settings.
         */
        $all = get_option(
            'th_store_one_module_set',
            array()
        );


        if (! is_array($all)) {
            $all = array();
        }


        /*
         * Save Cart settings.
         */
        $all['th-cart'] = $new_settings;


        update_option(
            'th_store_one_module_set',
            $all
        );

        /*
        * Mark Cart as imported.
        */
        $this->mark_module_imported('th-cart');


        return array(
            'success'  => true,
            'settings' => $new_settings,
            'message'  => 'Old TH All In One Woo Cart settings imported successfully!',
        );
    }
}

// Initialize the class
new TH_StoreOne_Old_Plugin_Importer();
