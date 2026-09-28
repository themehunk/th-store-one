<?php
if (! defined('ABSPATH')) {
    exit;
}

class Th_Store_One_Admin
{
    public function __construct()
    {
        add_action('admin_menu', array( $this, 'register_menu' ));
        add_action('admin_enqueue_scripts', array( $this, 'enqueue_assets' ));
        // global admin css
        add_action('admin_enqueue_scripts', array( $this, 'enqueue_admin_css' ));
        add_action('admin_init', array( $this, 'handle_upgrade_redirect' ));
        add_filter('allowed_redirect_hosts', function ($hosts) {
            $hosts[] = 'themehunk.com';
            return $hosts;
        });
    }

    public function register_menu()
    {

        add_menu_page(
            esc_html__('TH Store One', 'th-store-one'),
            esc_html__('TH Store One', 'th-store-one'),
            'manage_options',
            'th-store-one',
            array( $this, 'render_admin_page' ),
            TH_STORE_ONE_PLUGIN_URL . 'assets/images/storeone-icon.svg',
            56
        );

        // Dashboard
        add_submenu_page(
            'th-store-one',
            esc_html__('Dashboard', 'th-store-one'),
            esc_html__('Dashboard', 'th-store-one'),
            'manage_options',
            'th-store-one',
            array( $this, 'render_admin_page' )
        );

        if (class_exists('StoreOne_Pro')) {
            add_submenu_page(
                'th-store-one',
                esc_html__('License', 'th-store-one'),
                '<span class="storeone-upgrade-btn">' .
                esc_html__('License', 'th-store-one') .
                '</span>',
                'manage_options',
                'th-store-one&store_one_page=license',
                '__return_false'
            );
        }

    }

    public function render_admin_page()
    {
        if (! current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', 'th-store-one'));
        }
        ?>
		<div class="wrap store-one-wrap">
			<h1 class="screen-reader-text">
				<?php echo esc_html__('Th Store One Dashboard', 'th-store-one'); ?>
			</h1>
			<div id="store-one-admin-app" aria-label="<?php echo esc_attr__('Th Store One Dashboard', 'th-store-one'); ?>"></div>
		</div>
		<?php
    }

    public function handle_upgrade_redirect()
    {

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if (isset($_GET['page']) && 'th-store-one-upgrade' === sanitize_text_field(wp_unslash($_GET['page']))) {

            wp_safe_redirect('https://themehunk.com/storeone/?utm_campaign=free_plugin&utm_source=dashboard&utm_medium=upgrade_button');
            exit;

        }
    }

    public function enqueue_assets($hook)
    {
        if (! in_array($hook, array( 'toplevel_page_th-store-one', 'th-store-one_page_store-one' ), true)) {
            return;
        }
        $js_path  = 'build/index.js';
        $css_path = 'build/index.css';
        $css_style_path = 'build/style-index.css';


        $js_ver  = file_exists(TH_STORE_ONE_PLUGIN_DIR . $js_path) ? filemtime(TH_STORE_ONE_PLUGIN_DIR . $js_path) : TH_STORE_ONE_VERSION;
        $css_ver = file_exists(TH_STORE_ONE_PLUGIN_DIR . $css_path) ? filemtime(TH_STORE_ONE_PLUGIN_DIR . $css_path) : TH_STORE_ONE_VERSION;
        $css_path_style_var = file_exists(TH_STORE_ONE_PLUGIN_DIR . $css_style_path) ? filemtime(TH_STORE_ONE_PLUGIN_DIR . $css_style_path) : TH_STORE_ONE_VERSION;

        wp_register_script(
            'th-store-one-admin',
            TH_STORE_ONE_PLUGIN_URL . $js_path,
            array( 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n' ),
            $js_ver,
            true
        );

        wp_register_style(
            'th-store-one-admin',
            TH_STORE_ONE_PLUGIN_URL . $css_path,
            array(),
            $css_ver
        );

        wp_register_style(
            'th-store-one-admin-style',
            TH_STORE_ONE_PLUGIN_URL . $css_style_path,
            array( 'wp-components' ),
            $css_path_style_var
        );

        if (! function_exists('is_plugin_active')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $pro_installed = file_exists(
            WP_PLUGIN_DIR . '/store-one-pro/store-one-pro.php'
        );

        $pro_active = $pro_installed
    ? is_plugin_active('store-one-pro/store-one-pro.php')
    : false;

        $license_active = false;

        if ($pro_active && class_exists('StoreOnePro_License')) {
            $license_active = StoreOnePro_License::is_active();
        }

        wp_localize_script(
            'th-store-one-admin',
            'th_StoreOneAdmin',
            array(

                'restUrl' => 'th-store-one/v1/',

                // Nonce for REST security.
                'nonce'   => wp_create_nonce('wp_rest'),
                'currency_symbol' => get_woocommerce_currency_symbol(),

                'i18n'    => array(
                    'saveSuccess' => esc_html__('Settings saved successfully.', 'th-store-one'),
                    'saveError'   => esc_html__('Failed to save settings. Please try again.', 'th-store-one'),
                ),
                'homeUrl' => home_url('/'),
                'adminUrl' => admin_url(),
                'proInstalled' => $pro_installed,
        'proActive'    => $pro_active,
        'licenseActive' => $license_active,
        'searchable_custom_fields' =>
    $this->get_searchable_custom_fields(),
            )
        );

        wp_enqueue_script('th-store-one-admin');
        wp_enqueue_style('th-store-one-admin');
        wp_enqueue_style('th-store-one-admin-style');
        // Gutenberg component styles
        wp_enqueue_style('wp-components');
        wp_enqueue_style('wp-block-editor');
        wp_enqueue_style('wp-edit-blocks');
    }

    public function enqueue_admin_css()
    {

        $css_path = 'assets/css/th-storeone-admin.css';

        $css_ver = file_exists(TH_STORE_ONE_PLUGIN_DIR . $css_path)
            ? filemtime(TH_STORE_ONE_PLUGIN_DIR . $css_path)
            : TH_STORE_ONE_VERSION;

        wp_enqueue_style(
            'th-storeone-admin-menu',
            TH_STORE_ONE_PLUGIN_URL . $css_path,
            array(),
            $css_ver
        );
    }
    /**
 * Get searchable WooCommerce product custom fields.
 *
 * @return array
 */
    public function get_searchable_custom_fields()
    {

        global $wpdb;

        $custom_fields = array();

        $excluded_meta_keys = array(
            '_sku',
            '_wp_old_date',
            '_tax_status',
            '_stock_status',
            '_product_version',
            '_smooth_slider_style',
            'auctioninc_calc_method',
            'auctioninc_pack_method',
            '_thumbnail_id',
            '_product_image_gallery',
            'pdf_download',
            'slide_template',
            'cad_iframe',
            'downloads',
            'edrawings_file',
            '3d_pdf_download',
            '3d_pdf_render',
            '_original_id',
        );

        /**
         * Allow plugins to add excluded meta keys.
         */
        $excluded_meta_keys = apply_filters(
            'store_one_excluded_meta_keys',
            $excluded_meta_keys
        );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $meta_keys = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT DISTINCT meta_key
            FROM {$wpdb->postmeta} AS pm
            INNER JOIN {$wpdb->posts} AS p
                ON p.ID = pm.post_id
            WHERE p.post_type = %s
            AND pm.meta_value NOT LIKE %s
            AND pm.meta_value NOT LIKE %s
            AND pm.meta_value NOT LIKE %s
            AND pm.meta_value NOT LIKE %s
            AND pm.meta_value NOT REGEXP %s
            AND pm.meta_value NOT IN (
                '1',
                '0',
                '-1',
                'no',
                'yes',
                '[]',
                ''
            )",
                'product',
                'field_%',
                'a:%',
                '%\%\%%',
                '_oembed_%',
                '^1[0-9]{9}'
            )
        );

        if (! empty($meta_keys)) {

            foreach ($meta_keys as $meta_key) {

                if (
                    ! in_array(
                        $meta_key,
                        $excluded_meta_keys,
                        true
                    )
                ) {

                    /*
                     * Agar aapke old plugin mein
                     * tapsp_keyIsValid() ka equivalent hai
                     * to yahan use kar sakte hain.
                     */
                    if (
                        method_exists(
                            $this,
                            'store_one_key_is_valid'
                        )
                        &&
                        ! $this->store_one_key_is_valid($meta_key)
                    ) {
                        continue;
                    }

                    $custom_fields[] = array(
                        'label' => $meta_key,
                        'value' => $meta_key,
                    );
                }
            }
        }

        $custom_fields = array_reverse($custom_fields);

        return apply_filters(
            'store_one_searchable_custom_fields',
            $custom_fields
        );
    }
}
