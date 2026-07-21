<?php

if (! defined('ABSPATH')) {
    exit;
}

class Th_Store_One_Assets
{
    public function __construct()
    {
        add_action('wp_enqueue_scripts', [ $this, 'frontend_assets' ]);

    }

    /**
     * Frontend Assets
     */
    public function frontend_assets()
    {

        $asset_file = TH_STORE_ONE_PLUGIN_DIR . 'build/frontend.asset.php';

        if (! file_exists($asset_file)) {
            return;
        }

        $asset = include $asset_file;

        wp_enqueue_style(
            'th-store-one-frontend',
            TH_STORE_ONE_PLUGIN_URL . 'build/style-frontend.css',
            [],
            filemtime(TH_STORE_ONE_PLUGIN_DIR . 'build/style-frontend.css')
        );

        wp_enqueue_script(
            'th-store-one-frontend',
            TH_STORE_ONE_PLUGIN_URL . 'build/frontend.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

    }


}
