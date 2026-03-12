<?php
/**
 * Plugin Name:       Store One
 * Description:       Store One is a powerful all in one WooCommerce toolkit designed to enhance your online store with conversion focused features and advanced customization options. It helps improve product presentation, optimize the shopping experience, and simplify store management. With lightweight performance and easy setup, Store One provides essential WooCommerce enhancements to increase engagement, improve usability, and boost sales.
 * Version:           1.0.0
 * Author:                  ThemeHunk
 * License:                 GPL-2.0+
 * License URI:             http://www.gnu.org/licenses/gpl-2.0.txt
 * Author URI:              https://themehunk.com
 * Requires at least:       5.5
 * Tested up to:            6.9
 * WC requires at least:    3.2
 * WC tested up to:         9.9
 * Domain Path:             /languages
 * Text Domain:             store-one
 * Requires Plugins: woocommerce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ------------------ Constants ------------------.
define( 'STORE_ONE_VERSION', '1.0.0' );
define( 'STORE_ONE_PLUGIN_FILE', __FILE__ );
define( 'STORE_ONE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'STORE_ONE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// ------------------ Core Loader ------------------.
require_once STORE_ONE_PLUGIN_DIR . 'includes/class-store-one.php';
require_once STORE_ONE_PLUGIN_DIR . 'includes/store-one-function.php';

function store_one_run() {
	      Store_One::get_instance();
}
add_action( 'plugins_loaded', 'store_one_run');

// ------------------ HPOS Compatibility ------------------.
add_action(
	'before_woocommerce_init',
	function () {
		if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
				'custom_order_tables',
				__FILE__,
				true
			);
		}
	}
);

// ------------------ FBT Frontend Loader ------------------.
add_action(
	'init',
	function () {
		// Frontend class include + init.
		require_once STORE_ONE_PLUGIN_DIR . 'includes/modules/buy-to-list/class-frontend.php';
	     require_once STORE_ONE_PLUGIN_DIR . 'includes/modules/quick-social/class-frontend.php';
		require_once STORE_ONE_PLUGIN_DIR . 'includes/modules/product-brand/class-frontend.php';
		if ( class_exists( 'StoreOne_Buy_To_List_Frontend' ) ) {
			new StoreOne_Buy_To_List_Frontend();
		}
		if ( class_exists( 'StoreOne_Quick_Social' ) ) {
			new StoreOne_Quick_Social();
		}
		if ( class_exists( 'StoreOne_Product_Brand_Frontend' ) ) {
			new StoreOne_Product_Brand_Frontend();
		}
		
	}
);

add_action('admin_enqueue_scripts', function () {
    wp_enqueue_media();
});