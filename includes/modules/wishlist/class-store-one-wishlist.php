<?php

if (! defined('ABSPATH')) {
    exit;
}

require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/wishlist/class-store-one-wishlist-data.php';
require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/wishlist/class-store-one-wishlist-install.php';
require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/wishlist/class-store-one-wishlist-ajax.php';
require_once TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/wishlist/th-store-one-class-frontend.php';

class Th_Store_One_Wishlist
{
    public function __construct($settings = array())
    {
        $this->settings = $settings;

        // Create tables if needed.
        new Th_Store_One_Wishlist_Install();

        // AJAX.
        new Th_Store_One_Wishlist_Ajax($this->settings);

        // Frontend.
        new Th_Store_One_Wishlist_Frontend($this->settings);
    }
}
