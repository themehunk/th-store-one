<?php

/**
 * Variation Swatches - Store One.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Main Variation Swatches module.
 */
class TH_Store_One_Variation_Swatches_Frontend
{
    /**
     * Module settings.
     *
     * @var array
     */
    private $settings = array();

    /**
     * Frontend instance.
     *
     * @var TH_Store_One_Variation_Swatches_Frontend_Render
     */
    private $frontend;

    /**
     * Backend instance.
     *
     * @var TH_Store_One_Variation_Swatches_Backend
     */
    private $backend;

    /**
     * Constructor.
     *
     * @param array $settings Module settings.
     */
    public function __construct($settings = array())
    {

        $this->settings = is_array($settings)
            ? $settings
            : array();

        $this->load_files();

        $this->init_classes();
    }

    /**
     * Load frontend and backend classes.
     *
     * @return void
     */
    private function load_files()
    {

        $module_dir = trailingslashit(__DIR__);

        $frontend_file = $module_dir . 'class-variation-swatches-frontend.php';
        $backend_file  = $module_dir . 'class-variation-swatches-backend.php';

        if (file_exists($frontend_file)) {
            require_once $frontend_file;
        }

        if (file_exists($backend_file)) {
            require_once $backend_file;
        }
    }

    /**
     * Initialize frontend and backend.
     *
     * @return void
     */
    private function init_classes()
    {

        if (
            class_exists(
                'TH_Store_One_Variation_Swatches_Frontend_Render'
            )
        ) {
            $this->frontend =
                new TH_Store_One_Variation_Swatches_Frontend_Render(
                    $this->settings
                );
        }

        if (
            class_exists(
                'TH_Store_One_Variation_Swatches_Backend'
            )
        ) {
            $this->backend =
                new TH_Store_One_Variation_Swatches_Backend(
                    $this->settings
                );
        }
    }
}
