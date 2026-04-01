<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class TH_Store_One_Product_Video_Frontend {

    public function __construct() {

        // TEMPLATE OVERRIDE
        add_filter( 'wc_get_template', [ $this, 'override_template' ], 10, 5 );

        // FRONT SCRIPT
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ] );
    }

    /* ================= TEMPLATE OVERRIDE ================= */
    public function override_template( $located, $template_name, $args, $template_path, $default_path ) {

        if ( $template_name === 'single-product/product-image.php' ) {

            $plugin_template = plugin_dir_path( __FILE__ ) . 'templates/product-image.php';

            if ( file_exists( $plugin_template ) ) {
                return $plugin_template;
            }
        }

        return $located;
    }
    

    /* ================= ENQUEUE ================= */
    public function enqueue() {

        if ( ! is_product() ) return;

        wp_enqueue_script(
            'th-store-onevideo-gallery',
            TH_STORE_ONE_PLUGIN_URL . 'assets/js/th-store-one-video.js',
            ['jquery'],
            TH_STORE_ONE_VERSION,
            true
        );

        wp_enqueue_style(
            'th-store-onevideo-gallery',
            TH_STORE_ONE_PLUGIN_URL . 'assets/css/th-store-one-video.css',
            [],
            TH_STORE_ONE_VERSION
        );
    }
}