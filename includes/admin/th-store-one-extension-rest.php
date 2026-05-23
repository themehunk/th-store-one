<?php

if (! defined('ABSPATH')) {
    exit;
}

class Th_Store_One_Extension_REST
{
    private $namespace = 'th-store-one/v1';

    public function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    private function get_extensions()
    {
        return [
            'th-advanced-search' => [
                'name'         => 'TH Advanced Search',
                'description'  => __('Instant AJAX product search with live suggestions, typo correction and advanced WooCommerce filtering.', 'th-store-one'),
                'lite_file'    => 'th-advance-product-search/th-advance-product-search.php',
                'pro_file'     => 'th-advance-product-search-pro/th-advance-product-search-pro.php',
                'lite_slug'    => 'th-advance-product-search',
                'pro_slug'     => 'th-advance-product-search-pro',
                'lite_admin_url'    => admin_url('admin.php?page=th-advance-product-search'),
                'pro_admin_url'     => admin_url('admin.php?page=th-advance-product-search-pro'),
                'icon'         => 'https://ps.w.org/th-advance-product-search/assets/icon-256x256.gif?rev=3498764',
            ],
            'th-advanced-cart' => [
                'name'         => 'TH Advanced Cart',
                'description'  => __('Enhance the shopping cart experience with advanced features like real-time updates, item customization, and improved checkout flow.', 'th-store-one'),
                'lite_file'    => 'th-all-in-one-woo-cart/th-all-in-one-woo-cart.php',
                'pro_file'     => 'th-all-in-one-woo-cart-pro/th-all-in-one-woo-cart-pro.php',
                'lite_slug'    => 'th-all-in-one-woo-cart',
                'pro_slug'     => 'th-all-in-one-woo-cart-pro',
                'lite_admin_url'    => admin_url('admin.php?page=taiowc'),
                'pro_admin_url'     => admin_url('admin.php?page=taiowcp'),
                'icon'         => 'https://ps.w.org/th-all-in-one-woo-cart/assets/icon-128x128.gif?rev=3324764',
            ],
        ];
    }

    public function register_routes()
    {
        register_rest_route($this->namespace, '/extensions', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [$this, 'get_status'],
            'permission_callback' => fn () => current_user_can('manage_options'),
        ]);

        register_rest_route($this->namespace, '/extensions/action', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [$this, 'extension_action'],
            'permission_callback' => fn () => current_user_can('install_plugins'),
        ]);
    }

    /**
     * Smart Lite + Pro Status Logic
     */
    public function get_status()
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';
        wp_clean_plugins_cache(true);
        $all_plugins = get_plugins();

        $response = [];

        foreach ($this->get_extensions() as $key => $ext) {

            $lite_file = $ext['lite_file'];
            $pro_file  = $ext['pro_file'] ?? null;

            $lite_installed = isset($all_plugins[$lite_file]);
            $lite_active    = $lite_installed && is_plugin_active($lite_file);

            $pro_installed  = $pro_file && isset($all_plugins[$pro_file]);
            $pro_active     = $pro_installed && is_plugin_active($pro_file);

            $icon = $ext['icon'] ?? '';
            $type = 'lite';
            $display_name = $ext['name'];
            $plugin_file  = $lite_file;
            $slug         = $ext['lite_slug'];
            $admin_url    = $ext['lite_admin_url'];   // Default Lite

            // === Priority Logic ===
            if ($pro_installed) {
                $type         = 'pro';
                $display_name = $ext['name'] . ' Pro';
                $plugin_file  = $pro_file;
                $slug         = $ext['pro_slug'];
                $admin_url    = $ext['pro_admin_url'];     // ← Pro Admin URL

                $active = $pro_active;
            } else {
                $active = $lite_active;
            }

            $installed = isset($all_plugins[$plugin_file]);
            $version   = $installed ? ($all_plugins[$plugin_file]['Version'] ?? '') : '';

            // Icon Logic
            if (!$installed && !empty($slug)) {
                if (function_exists('plugins_api')) {
                    $api = plugins_api('plugin_information', [
                        'slug'   => $slug,
                        'fields' => ['icons' => true],
                    ]);

                    if (!is_wp_error($api) && !empty($api->icons)) {
                        $icon = $api->icons['2x'] ?? $api->icons['1x'] ?? $icon;
                    }
                }
            }

            $response[$key] = [
                'key'            => $key,
                'name'           => $display_name,
                'description'    => $ext['description'],
                'installed'      => $installed,
                'active'         => $active,
                'status'         => $active ? 'active' : ($installed ? 'installed' : 'not_installed'),
                'version'        => $version,
                'admin_url'      => $admin_url,                    // ← Dynamic URL
                'icon'           => $icon,
                'type'           => $type,
                'is_pro_active'  => $pro_active,
                'has_pro'        => (bool) $pro_installed,
                'lite_active'    => $lite_active,
                'pro_installed'  => $pro_installed,
                'pro_active'     => $pro_active,
            ];
        }

        return rest_ensure_response($response);
    }

    /**
     * Install / Activate with Smart Lite ↔ Pro Switching
     */
    public function extension_action(WP_REST_Request $request)
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';
        include_once ABSPATH . 'wp-admin/includes/file.php';
        include_once ABSPATH . 'wp-admin/includes/misc.php';
        include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        include_once ABSPATH . 'wp-admin/includes/plugin-install.php';

        $extension_key = sanitize_text_field($request->get_param('extension'));

        $extensions = $this->get_extensions();
        if (!isset($extensions[$extension_key])) {
            return new WP_Error('extension_not_found', __('Extension not found.', 'th-store-one'), ['status' => 404]);
        }

        $ext = $extensions[$extension_key];

        $pro_file = $ext['pro_file'] ?? null;
        $use_pro  = $pro_file && file_exists(WP_PLUGIN_DIR . '/' . $pro_file);

        $plugin_file = $use_pro ? $pro_file : $ext['lite_file'];
        $slug        = $use_pro ? $ext['pro_slug'] : $ext['lite_slug'];

        // === Install ===
        if (!file_exists(WP_PLUGIN_DIR . '/' . $plugin_file)) {
            $plugin_info = plugins_api('plugin_information', ['slug' => $slug]);

            if (is_wp_error($plugin_info)) {
                return new WP_Error('plugin_not_found', __('Plugin could not be found.', 'th-store-one'), ['status' => 404]);
            }

            $upgrader = new Plugin_Upgrader(new Automatic_Upgrader_Skin());
            $result   = $upgrader->install($plugin_info->download_link);

            if (!$result || is_wp_error($result)) {
                return new WP_Error('install_failed', __('Plugin installation failed.', 'th-store-one'), ['status' => 500]);
            }
        }

        // === Activate + Lite Deactivate ===
        if (!is_plugin_active($plugin_file)) {
            // Agar Pro activate ho raha hai aur Lite active hai to Lite deactivate kar do
            if ($use_pro && is_plugin_active($ext['lite_file'])) {
                deactivate_plugins($ext['lite_file'], true);
            }

            $activation = activate_plugin($plugin_file, '', false, true);

            if (is_wp_error($activation)) {
                return new WP_Error('activation_failed', $activation->get_error_message(), ['status' => 500]);
            }
        }

        wp_clean_plugins_cache(true);

        return rest_ensure_response([
    'success'   => true,
    'installed' => true,
    'active'    => true,
    'message'   => $use_pro
        ? __('Pro version activated successfully.', 'th-store-one')
        : __('Extension installed and activated successfully.', 'th-store-one'),
    'admin_url' => $use_pro ? $ext['pro_admin_url'] : $ext['lite_admin_url'],  // ← Dynamic
    'type'      => $use_pro ? 'pro' : 'lite',
]);
    }
}
