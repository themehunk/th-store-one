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

        // Enabled modules
        $modules = Th_Store_One_Module_Loader::modules();

        wp_localize_script(
            'th-store-one-frontend',
            'thStoreOne',
            [
                'modules' => [
                    'saleNotification' => ! empty($modules['sale-notification']),
                    'stickyCart'       => ! empty($modules['sticky-cart']),
                    'buynowButton'     => ! empty($modules['buynow-button']),
                    'saleCountdown'    => ! empty($modules['sale-countdown']),
                    'buyToList'        => ! empty($modules['buy-to-list']),
                    'inactiveTab'      => ! empty($modules['inactive-tab']),
                    'productBrand'     => ! empty($modules['product-brand']),
                    'recentView'       => ! empty($modules['recent-view']),
                    'productVideo'       => ! empty($modules['product-video']),
                    'quickSocial'       => ! empty($modules['quick-social']),
                    'smartOffers'       => ! empty($modules['smart-offers']),
                    'shopableList'       => ! empty($modules['shopable-list']),
                    'thWishlist'       => ! empty($modules['th-wishlist']),

                ],

            ]
        );

    }

}
