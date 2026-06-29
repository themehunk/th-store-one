<?php

if (!defined('ABSPATH')) {
    exit;
}

if (
    class_exists('StoreOnePro_License') &&
    StoreOnePro_License::is_active()
) {
    include STORE_ONE_PRO_PLUGIN_DIR .
    'includes/modules/smart-offers/th-store-one-class-frontend.php';
    return;
}
// Lite render
include TH_STORE_ONE_PLUGIN_DIR .'includes/modules/smart-offers/bogo.php';
