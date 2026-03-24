<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Th_Store_One {

	/**
	 * Single instance.
	 *
	 * @var Th_Store_One|null
	 */
	private static $instance = null;

	/**
	 * Get single instance.
	 *
	 * @return Th_Store_One
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
			require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/admin/class-store-one-admin.php';
			new Th_Store_One_Admin();
		}
		// Modules manager (option + REST).
		require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/admin/class-store-one-modules.php';
		Th_Store_One_Modules::get_instance();
		require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/admin/class-store-one-module-settings.php';
          Th_Store_One_Module_Settings::instance();
		require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/admin/class-store-one-rest.php';
          if (class_exists('Th_Store_One_REST')) {
		new Th_Store_One_REST();
		}
	}
}