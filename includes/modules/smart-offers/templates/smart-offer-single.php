<?php
if (!defined('ABSPATH')) {
    exit;
}

$product = wc_get_product(get_the_ID());
if (!$product) {
    return;
}


$regular_price = floatval($product->get_regular_price());
$sale_price    = floatval($product->get_sale_price());

/* VARIABLE PRODUCT HANDLING */
if ($product->is_type('variable')) {
    $default_attributes = $product->get_default_attributes();
    $variation_id = 0;
    if (!empty($default_attributes)) {
        $variation_data = wc_get_matching_product_variation($product, $default_attributes);
        if ($variation_data) {
            $variation_id = $variation_data;
        }
    }
    if ($variation_id) {
        $variation = wc_get_product($variation_id);
        if ($variation) {
            $regular_price = floatval($variation->get_regular_price());
            $sale_price    = floatval($variation->get_sale_price());
        }
    }
    if (!$regular_price) {
        $prices = $product->get_variation_prices(true);
        if (!empty($prices['regular_price'])) {
            $regular_price = floatval(current($prices['regular_price']));
        }
        if (!empty($prices['sale_price'])) {
            $sale_price = floatval(current($prices['sale_price']));
        }
    }
}

$base_display_price = !empty($sale_price) ? $sale_price : $regular_price;
?>

<?php
$auto_selected = false;

if (!empty($rules) && is_array($rules)) {
    foreach ($rules as $rule) {
        // 1. Check status
        if (($rule['status'] ?? '') !== 'active') {
            continue;
        }
        $layout = $rule['offer_style'] ?? 'detailed';

        if ($layout == 'style1') {
            $template = TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/smart-offers/templates/layouts/detailed.php';
        } else {
            $template = TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/smart-offers/templates/layouts/minimal.php';
        }

        if (!file_exists($template)) {
            $template = TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/smart-offers/templates/layouts/detailed.php';
        }

        // Is include se variables aur safe calculation arrays dynamic layouts ke andar securely transfer ho jayenge
        include $template;
    }
}
?>