<?php
/**
 * Plugin Name:       Store One
 * Description:       Central dashboard for Store One modules (Woo Search, Cart, Frequently Bought, etc.)
 * Version:           1.0.3
 * Author:            themehunk
 * Author URI:        https://www.themehunk.com
 * License:           GPLv2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       store-one
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * WC requires at least: 3.0
 * WC tested up to:   8.9
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ------------------ Constants ------------------.
define( 'STORE_ONE_VERSION', '1.0.70' );
define( 'STORE_ONE_PLUGIN_FILE', __FILE__ );
define( 'STORE_ONE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'STORE_ONE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// ------------------ Core Loader ------------------.
require_once STORE_ONE_PLUGIN_DIR . 'includes/class-store-one.php';
require_once STORE_ONE_PLUGIN_DIR . 'includes/store-one-function.php';

function store_one_run() {
	      Store_One::get_instance();
}
add_action( 'plugins_loaded', 'store_one_run' );

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
		require_once STORE_ONE_PLUGIN_DIR . 'includes/modules/frequently-bought/class-frontend.php';
		require_once STORE_ONE_PLUGIN_DIR . 'includes/modules/bundle-product/class-bundle-extended.php';
		require_once STORE_ONE_PLUGIN_DIR . 'includes/modules/bundle-product/class-frontend.php';
		require_once STORE_ONE_PLUGIN_DIR . 'includes/modules/buy-to-list/class-frontend.php';
	     require_once STORE_ONE_PLUGIN_DIR . 'includes/modules/quick-social/class-frontend.php';
		require_once STORE_ONE_PLUGIN_DIR . 'includes/modules/product-brand/class-frontend.php';

		if ( class_exists( 'Store_One_FBT_Frontend' ) ) {
			new Store_One_FBT_Frontend();
		}
		if ( class_exists( 'StoreOne_Bundle_Frontend' ) ) {
			StoreOne_Bundle_Frontend::instance();
		}
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