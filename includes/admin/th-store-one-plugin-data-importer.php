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
    }

    /**
     * Permission Check
     */
    public function permission_callback()
    {
        return current_user_can('manage_options');
    }

    /**
     * Check Old Option Data
     */
    public function check_old_option($request)
    {
        $option = sanitize_text_field($request->get_param('option'));
        $data   = get_option($option);

        return array(
            'has_data' => ! empty($data)
        );
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

        return array(
            'success'  => true,
            'settings' => $new_settings,
            'message'  => 'Old TH Wishlist settings imported successfully!',
        );
    }
}

// Initialize the class
new TH_StoreOne_Old_Plugin_Importer();
