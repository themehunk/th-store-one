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
                'name'        => 'TH Advanced Search',
                'description' => __('Instant AJAX product search with live suggestions, typo correction and advanced WooCommerce filtering.', 'th-store-one'),
                'plugin_file' => 'th-advance-product-search/th-advance-product-search.php',
                'slug'        => 'th-advance-product-search',
                'admin_url'   => admin_url('admin.php?page=th-advance-product-search'),
                'icon'        => 'https://ps.w.org/th-advance-product-search/assets/icon-256x256.gif?rev=3498764', // Will be fetched dynamically if not installed
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

    public function get_status()
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';

        wp_clean_plugins_cache(true);
        $all_plugins = get_plugins();

        $response = [];

        foreach ($this->get_extensions() as $key => $ext) {

            $plugin_file = $ext['plugin_file'];

            $installed = isset($all_plugins[$plugin_file]);
            $active    = $installed && is_plugin_active($plugin_file);
            $version   = $installed ? ($all_plugins[$plugin_file]['Version'] ?? '') : '';

            // ==================== ICON LOGIC (Fixed) ====================
            $icon = $ext['icon'] ?? '';   // Default custom icon jo aapne diya hai

            // Agar plugin NOT installed hai to WordPress.org se fresh icon fetch karo
            if (!$installed && !empty($ext['slug'])) {
                if (function_exists('plugins_api')) {
                    $api = plugins_api('plugin_information', [
                        'slug'   => $ext['slug'],
                        'fields' => ['icons' => true],
                    ]);

                    if (!is_wp_error($api) && !empty($api->icons)) {
                        $icon = $api->icons['2x'] ?? $api->icons['1x'] ?? $icon;
                    }
                }
            }

            $response[$key] = [
                'name'        => $ext['name'],
                'description' => $ext['description'],
                'installed'   => $installed,
                'active'      => $active,
                'status'      => $active ? 'active' : ($installed ? 'installed' : 'not_installed'),
                'version'     => $version,
                'admin_url'   => $ext['admin_url'],
                'icon'        => $icon,
            ];
        }

        return rest_ensure_response($response);
    }

    /**
     * Install / Activate Extension
     */
    public function extension_action(WP_REST_Request $request)
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';
        include_once ABSPATH . 'wp-admin/includes/file.php';
        include_once ABSPATH . 'wp-admin/includes/misc.php';
        include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        include_once ABSPATH . 'wp-admin/includes/plugin-install.php';

        $extension_id = sanitize_text_field($request->get_param('extension'));

        $extensions = $this->get_extensions();

        if (!isset($extensions[$extension_id])) {
            return new WP_Error('extension_not_found', __('Extension not found.', 'th-store-one'), ['status' => 404]);
        }

        $plugin_file = $extensions[$extension_id]['plugin_file'];
        $slug        = $extensions[$extension_id]['slug'];

        // Install
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

        // Activate
        if (!is_plugin_active($plugin_file)) {
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
            'message'   => __('Extension installed and activated successfully.', 'th-store-one'),
            'admin_url' => $extensions[$extension_id]['admin_url'],
        ]);
    }
}
