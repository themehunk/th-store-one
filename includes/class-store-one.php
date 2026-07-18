<?php

if (! defined('ABSPATH')) {
    exit;
}

class Th_Store_One
{
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
    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Constructor.
     */
    private function __construct()
    {
        // Admin UI.
        if (is_admin()) {
            require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/admin/th-store-one-tabs.php';
            require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/admin/th-store-one-admin.php';
            new Th_Store_One_Admin();
            require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/product-video/product-video-admin.php';
            new TH_Store_One_Product_Video_Admin();
        }
        // Deactivation feedback (registers a REST route, must load outside is_admin() so it's available on REST requests too).
        require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/admin/deactivate-feedback.php';
        // Modules manager (option + REST).
        require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/admin/th-store-one-modules.php';
        Th_Store_One_Modules::get_instance();
        require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/admin/th-store-one-module-settings.php';
        Th_Store_One_Module_Settings::instance();
        require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/admin/th-store-one-rest.php';
        if (class_exists('Th_Store_One_REST')) {
            new Th_Store_One_REST();
        }
        // pluign extension api
        require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/admin/th-store-one-extension-rest.php';
        if (class_exists('Th_Store_One_Extension_REST')) {
            new Th_Store_One_Extension_REST();
        }
    }
}
