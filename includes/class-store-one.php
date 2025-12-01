<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Store_One {

	/**
	 * Single instance.
	 *
	 * @var Store_One|null
	 */
	private static $instance = null;

	/**
	 * Get single instance.
	 *
	 * @return Store_One
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {

		// Admin UI.
		if ( is_admin() ) {
			require_once STORE_ONE_PLUGIN_DIR . 'includes/class-store-one-admin.php';
			new Store_One_Admin();
		}

		// Modules manager (option + REST).
		require_once STORE_ONE_PLUGIN_DIR . 'includes/class-store-one-modules.php';
		Store_One_Modules::get_instance();

		require_once STORE_ONE_PLUGIN_DIR . 'includes/class-store-one-module-settings.php';
          Store_One_Module_Settings::instance();

		require_once STORE_ONE_PLUGIN_DIR . 'includes/class-store-one-rest.php';
           if (class_exists('Store_One_REST')) {
			new Store_One_REST();
		}
	}
}
