<?php

if (!defined('ABSPATH')) {
    exit;
}
class Th_Store_One_Module_Loader
{
    private static $modules = null;
    private static $settings = null;


    public static function modules()
    {
        if (self::$modules === null) {
            self::$modules = get_option('th_store_one_module_option', []);


            if (!is_array(self::$modules)) {
                self::$modules = [];
            }
        }

        return self::$modules;
    }


    public static function settings()
    {
        if (self::$settings === null) {
            self::$settings = get_option('th_store_one_module_set', []);


            if (!is_array(self::$settings)) {
                self::$settings = [];
            }
        }

        return self::$settings;
    }


    public static function module_enabled($id)
    {
        $modules = self::modules();
        return !empty($modules[$id]);
    }


    public static function module_settings($id)
    {
        $settings = self::settings();
        return $settings[$id] ?? [];
    }


    public static function load()
    {

        $enabled_modules = self::modules();
        $all_settings    = self::settings();


        if (empty($enabled_modules)) {
            return;
        }


        $modules = [
            'buy-to-list' => [
                'file'  => 'includes/modules/buy-to-list/th-store-one-class-frontend.php',
                'class' => 'Th_Store_One_Buy_To_List_Frontend',
            ],
            'quick-social' => [
                'file'  => 'includes/modules/quick-social/th-store-one-class-frontend.php',
                'class' => 'Th_Store_One_Quick_Social',
            ],
            'product-brand' => [
                'file'  => 'includes/modules/product-brand/th-store-one-class-frontend.php',
                'class' => 'Th_Store_One_Product_Brand_Frontend',
            ],
            'product-video' => [
                'file'  => 'includes/modules/product-video/th-store-one-class-frontend.php',
                'class' => 'TH_Store_One_Product_Video_Frontend',
            ],
            'sale-notification' => [
                'file'  => 'includes/modules/sale-notification/th-store-one-class-frontend.php',
                'class' => 'Th_Store_One_Sale_Notification_Frontend',
            ],
            'sticky-cart' => [
                'file'  => 'includes/modules/sticky-cart/th-store-one-class-frontend.php',
                'class' => 'Th_Store_One_Sticky_Cart_Frontend',
            ],
            'buynow-button' => [
                'file'  => 'includes/modules/buynow-button/th-store-one-class-frontend.php',
                'class' => 'Th_Store_One_Buy_Now_Frontend',
            ],
            'sale-countdown' => [
                'file'  => 'includes/modules/sale-countdown/th-store-one-class-frontend.php',
                'class' => 'Th_Store_One_Sale_Countdown_Frontend',
            ],
            'recent-view' => [
                'file'  => 'includes/modules/recent-view/th-store-one-class-frontend.php',
                'class' => 'Th_Store_One_Recent_View',
            ],
            'inactive-tab' => [
                'file'  => 'includes/modules/Inactive-tab/th-store-one-class-frontend.php',
                'class' => 'Th_Store_One_Inactive_Tab_Frontend',
            ],
            'smart-offers' => [
                'file'  => 'includes/modules/smart-offers/smart-offer-render.php',
                'class' => 'Th_Store_One_Smart_Offers',
            ],
            'shopable-list' => [
                'file'  => 'includes/modules/shopable-list/shopable-list-render.php',
                'class' => 'Th_Store_One_Shopable_List',
            ],
            'th-wishlist' => [
                'file'  => 'includes/modules/wishlist/class-store-one-wishlist.php',
                'class' => 'Th_Store_One_Wishlist',
            ],
            'th-cart' => [
                'file'  => 'includes/modules/cart/class-store-one-cart.php',
                'class' => 'Th_Store_One_Cart',
            ],
            'th-variationswatches' => [
                'file'  => 'includes/modules/variation-swatches/th-store-one-class-frontend.php',
                'class' => 'TH_Store_One_Variation_Swatches_Frontend',
            ],
        ];


        foreach ($modules as $id => $module) {


            if (empty($enabled_modules[$id])) {
                continue;
            }


            $file = TH_STORE_ONE_PLUGIN_DIR . $module['file'];


            if (!file_exists($file)) {
                continue;
            }


            require_once $file;


            if (class_exists($module['class'])) {
                $settings = $all_settings[$id] ?? [];
                new $module['class']($settings);
            }
        }
    }
}
add_action('init', ['Th_Store_One_Module_Loader', 'load']);
