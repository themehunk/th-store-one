<?php

/**
 * Plugin Name:             Store One
 * Description:             Store One is a powerful all in one WooCommerce toolkit designed to enhance your online store with conversion focused features and advanced customization options. It helps improve product presentation, optimize the shopping experience, and simplify store management. With lightweight performance and easy setup, Store One provides essential WooCommerce enhancements to increase engagement, improve usability, and boost sales.
 * Version:                 1.1.5
 * Author:                  ThemeHunk
 * License:                 GPLv3 or later
 * License URI:             http://www.gnu.org/licenses/gpl-3.0.html
 * Author URI:              https://themehunk.com
 * Requires at least:       5.5
 * Tested up to:            7.0
 * WC requires at least:    3.2
 * WC tested up to:         10.9
 * Domain Path:             /languages
 * Text Domain:             th-store-one
 * Requires Plugins:        woocommerce
 */
if (! defined('ABSPATH')) {
    exit;
}
// ------------------ Constants ------------------.
define('TH_STORE_ONE_VERSION', '1.1.7');
define('TH_STORE_ONE_PLUGIN_FILE', __FILE__);
define('TH_STORE_ONE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('TH_STORE_ONE_PLUGIN_URL', plugin_dir_url(__FILE__));
// ------------------ Core Loader ------------------.
require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/class-store-one.php';
require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/store-one-function.php';
require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/store-one-module-loader.php';

function th_store_one_run()
{
    Th_Store_One::get_instance();
}
add_action('plugins_loaded', 'th_store_one_run');
// ------------------ HPOS Compatibility ------------------.
add_action(
    'before_woocommerce_init',
    function () {
        if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
                'custom_order_tables',
                __FILE__,
                true
            );
        }
    }
);


add_action('admin_enqueue_scripts', function () {
    wp_enqueue_media();
});
