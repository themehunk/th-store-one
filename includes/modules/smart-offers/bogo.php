<?php

if (!defined('ABSPATH')) {
    exit;
}

class Th_Store_One_Smart_Offers
{
    private $rules = [];
    private $is_running = false;
    private $is_adding_gift = false;

    public function __construct()
    {
        $this->settings = Th_Store_One_Module_Loader::module_settings('smart-offers');
        $this->rules = $this->settings['rules'] ?? [];

        if (empty($this->rules)) {
            return;
        }

        /* =====================================================
           SINGLE PRODUCT PAGE INJECTION
        ===================================================== */
        foreach ($this->rules as $rule) {
            if (($rule['status'] ?? '') !== 'active') {
                continue;
            }

            $placement = $rule['single_placement'] ?? 'woocommerce_after_add_to_cart_form';
            $priority  = intval($rule['single_priority'] ?? 10);
            $hook      = th_store_one_get_hook_from_placement($placement);

            if (!$hook) {
                continue;
            }

            add_action($hook, function () use ($rule) {
                global $product;
                if (!$product instanceof WC_Product) {
                    return;
                }

                if (!$this->match_trigger_condition($rule, $product)) {
                    return;
                }

                $this->render_single_rule($rule);
            }, $priority);
        }

        /* =====================================================
           CART & ENGINE HOOKS
        ===================================================== */
        add_action('woocommerce_cart_totals_before_order_total', [$this, 'render_cart']);
        add_action('wp_enqueue_scripts', [$this, 'assets']);

        // Form Data Capture
        add_filter('woocommerce_add_cart_item_data', [$this, 'add_cart_item_data'], 10, 3);

        // STYLE REAL-TIME AUTO ADD HANDLER
        add_action('woocommerce_cart_loaded_from_session', [$this, 'smart_offers_auto_gift_handler'], 10);
        add_action('woocommerce_check_cart_items', [$this, 'smart_offers_auto_gift_handler'], 10);

        // Main engine running on totals calculation (Prices overriding engine)
        add_action('woocommerce_before_calculate_totals', [$this, 'smart_offers_engine'], 50);
        add_filter('wc_add_to_cart_message_html', [$this, 'offer_notice'], 10, 2);
        add_filter('woocommerce_get_item_data', [$this, 'display_offer_label'], 10, 2);
    }

    public function assets()
    {
        wp_enqueue_style('th-smart-offer', TH_STORE_ONE_PLUGIN_URL . 'assets/css/smart-offer.css', [], TH_STORE_ONE_VERSION);
        wp_enqueue_script('th-smart-offer', TH_STORE_ONE_PLUGIN_URL . 'assets/js/smart-offer.js', ['jquery'], TH_STORE_ONE_VERSION, true);
        wp_localize_script('th-smart-offer', 'thSmartOffer', [
            'currency_symbol'       => get_woocommerce_currency_symbol(),
            'currency'              => get_woocommerce_currency(),
            'price_format'          => get_woocommerce_price_format(),
            'decimals'              => wc_get_price_decimals(),
            'decimal_sep'           => wc_get_price_decimal_separator(),
            'thousand_sep'          => wc_get_price_thousand_separator(),
            'select_variation_text' => __('Choose variation options to view this offer', 'th-store-one'),
            'select_options_text'   => __('Select Options', 'th-store-one'),
        ]);
    }

    /* =====================================================
       1. TRIGGER CONDITION MATCH
    ===================================================== */
    private function match_trigger_condition($rule, $product)
    {
        if (!$product) {
            return false;
        }

        $rule_type = $rule['rule_type'] ?? 'bogo';
        $pid       = $product->get_id();
        $parent_id = $product->get_parent_id();
        $check_id  = $parent_id ? $parent_id : $pid;

        $get_clean_ids = function ($field_data) {
            if (empty($field_data) || !is_array($field_data)) {
                return [];
            }
            if (isset($field_data[0]) && is_array($field_data[0]) && isset($field_data[0]['id'])) {
                return array_map('intval', array_column($field_data, 'id'));
            }
            return array_map('intval', $field_data);
        };

        // --- CASE 1: BOGO RULES ---
        if ($rule_type === 'bogo') {
            $trigger_type    = $rule['bogo_trigger'] ?? 'bogo_allproduct';
            $exclude_enabled = !empty($rule['exclude_bogo_products_enabled']);
            $exclude_products = $get_clean_ids($rule['exclude_bogo_products'] ?? []);

            if ($exclude_enabled && (in_array($pid, $exclude_products) || in_array($parent_id, $exclude_products))) {
                return false;
            }

            if ($trigger_type === 'bogo_allproduct') {
                return true;
            }
            if ($trigger_type === 'bogo_specificproduct') {
                return in_array($pid, $get_clean_ids($rule['bogo_product'] ?? [])) || in_array($parent_id, $get_clean_ids($rule['bogo_product'] ?? []));
            }
            if ($trigger_type === 'bogo_category') {
                return (bool) array_intersect(wc_get_product_term_ids($check_id, 'product_cat'), $get_clean_ids($rule['bogo_categories'] ?? []));
            }
            if ($trigger_type === 'bogo_tag') {
                return (bool) array_intersect(wc_get_product_term_ids($check_id, 'product_tag'), $get_clean_ids($rule['bogo_tags'] ?? []));
            }
        }



        return false;
    }


    /* =====================================================
       3. AUTOMATIC SEPARATE ITEM INJECTION ENGINE
    ===================================================== */
    public function smart_offers_auto_gift_handler()
    {
        if ($this->is_adding_gift || (is_admin() && !defined('DOING_AJAX'))) {
            return;
        }

        $cart = WC()->cart;
        if (!$cart) {
            return;
        }

        $this->is_adding_gift = true;
        $current_cart = $cart->get_cart();
        $trigger_counts = [];

        foreach ($current_cart as $key => $item) {
            if (!empty($item['th_is_free_gift'])) {
                continue;
            }

            if (empty($item['th_rule'])) {
                continue;
            }

            foreach ($this->rules as $rule) {
                $rule_id = $rule['flexible_id'] ?? '';
                if (($item['th_rule'] ?? '') !== $rule_id) {
                    continue;
                }

                if ($this->match_trigger_condition($rule, $item['data'])) {
                    if (!isset($trigger_counts[$rule_id])) {
                        $trigger_counts[$rule_id] = [
                            'qty'          => 0,
                            'prod_id'      => $item['product_id'],
                            'variation_id' => $item['variation_id'],
                            'variation'    => $item['variation'] ?? []
                        ];
                    }
                    $trigger_counts[$rule_id]['qty'] += $item['quantity'];
                }
            }
        }

        foreach ($this->rules as $rule) {
            if (($rule['status'] ?? '') !== 'active') {
                continue;
            }

            $rule_id   = $rule['flexible_id'] ?? '';
            $rule_type = $rule['rule_type'] ?? 'bogo';

            if (!isset($trigger_counts[$rule_id]) || $trigger_counts[$rule_id]['qty'] <= 0) {
                foreach ($cart->get_cart() as $cart_key => $cart_item) {
                    if (!empty($cart_item['th_is_free_gift']) && ($cart_item['th_rule'] ?? '') === $rule_id) {
                        $cart->remove_cart_item($cart_key);
                    }
                }
                continue;
            }

            $data = $trigger_counts[$rule_id];

            // --- CASE A: BOGO CALCULATION ---
            if ($rule_type === 'bogo') {
                $apply_mode = $rule['apply_mode'] ?? 'repeat';
                if ($apply_mode === 'once') {
                    $gift_qty = 1;
                } else {
                    $gift_qty = floor($data['qty']);
                }
                $gift_key = $this->get_existing_gift_key($rule_id, $data['prod_id'], $data['variation_id']);

                if ($gift_key !== false) {
                    $cart->set_quantity($gift_key, $gift_qty, false);
                } else {
                    $cart->add_to_cart($data['prod_id'], $gift_qty, $data['variation_id'], $data['variation'], [
                        'th_is_free_gift' => 'yes',
                        'th_rule_type'    => 'bogo',
                        'th_rule'         => $rule_id,
                        'th_offer_label'  => $this->get_offer_cart_label($rule),
                        'unique_key'      => md5($rule_id . '_' . $data['prod_id'] . '_' . $data['variation_id']),
                    ]);
                }
            }

        }

        $this->is_adding_gift = false;
    }

    private function get_existing_gift_key($rule_id, $product_id, $variation_id = 0)
    {
        foreach (WC()->cart->get_cart() as $key => $item) {
            if (
                !empty($item['th_is_free_gift']) &&
                ($item['th_rule'] ?? '') === $rule_id &&
                intval($item['product_id']) === intval($product_id) &&
                intval($item['variation_id']) === intval($variation_id)
            ) {
                return $key;
            }
        }
        return false;
    }

    /* =====================================================
       4. CORE PRICING CALCULATION ENGINE (FIXED MAP UPDATED)
    ===================================================== */
    public function smart_offers_engine($cart)
    {
        if ($this->is_running || (is_admin() && !defined('DOING_AJAX'))) {
            return;
        }

        $this->is_running = true;

        // Reset baseline default prices
        foreach ($cart->get_cart() as $item) {
            if (!empty($item['th_is_free_gift'])) {
                continue;
            }

            $product = $item['data'];
            $base_price = $product->get_sale_price()
                ? floatval($product->get_sale_price())
                : floatval($product->get_regular_price());

            $product->set_price($base_price);
        }

        foreach ($this->rules as $rule) {
            if (($rule['status'] ?? '') !== 'active') {
                continue;
            }

            $rule_type    = $rule['rule_type'] ?? 'bogo';
            $reward_type  = $rule['reward_type'] ?? 'free_product';
            $rule_id      = $rule['flexible_id'] ?? '';
            $discount_val = floatval($rule['discount_value'] ?? 0);
            $apply_on     = $rule['apply_on'] ?? 'regular_price';

            // --- PROCESS BOGO SYSTEM SEPARATE LINE ITEMS ---
            if ($rule_type === 'bogo') {
                foreach ($cart->get_cart() as $item) {
                    if (!empty($item['th_is_free_gift']) && $item['th_rule_type'] === 'bogo' && $item['th_rule'] === $rule_id) {
                        $item['data']->set_price(0);
                    }
                }
            }

        }

        $this->is_running = false;
    }



    /* =====================================================
       UTILITIES & TEMPLATE INJECTIONS
    ===================================================== */
    public function render_single_rule($rule)
    {
        wc_get_template('smart-offer-single.php', ['rules' => [$rule]], '', TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/smart-offers/templates/');
    }

    public function render_cart()
    {
        if (WC()->cart->is_empty()) {
            return;
        }

        foreach ($this->rules as $rule) {
            if (($rule['status'] ?? '') !== 'active') {
                continue;
            }

            $found = false;
            foreach (WC()->cart->get_cart() as $item) {
                if ($this->match_trigger_condition($rule, $item['data'])) {
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                continue;
            }

            wc_get_template('smart-offer-cart.php', ['rule' => $rule], '', TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/smart-offers/templates/');
        }
    }

    public function add_cart_item_data($data, $product_id, $variation_id = 0)
    {
        if (!isset($_POST['th_rule'])) {
            return $data;
        }
        $rule_id   = sanitize_text_field($_POST['th_rule']);
        $rule_type = sanitize_text_field($_POST['th_rule_type'] ?? '');
        $data['th_reward']    = intval($_POST['th_reward'] ?? 0);
        $data['th_rule']      = $rule_id;
        $data['th_rule_type'] = $rule_type;


        return $data;
    }

    private function get_offer_cart_label($rule)
    {
        if (!is_array($rule)) {
            return 'Dynamic Discount';
        }

        $rule_type = $rule['rule_type'] ?? '';

        if ($rule_type === 'bogo') {
            $text = $rule['crt_page_bogo_text'] ?? '{BOGO} SMART OFFER';
            return str_replace('{BOGO}', 'BOGO', $text);
        }


    }

    public function display_offer_label($item_data, $cart_item)
    {
        if (empty($cart_item['th_offer_label'])) {
            return $item_data;
        }

        $item_data[] = [
            'name'  => __('Offer', 'th-store-one'),
            'value' => $cart_item['th_offer_label'],
        ];

        return $item_data;
    }

    public function offer_notice($message, $products)
    {
        if (empty($_POST['th_rule'])) {
            return $message;
        }
        return $message . sprintf('<div class="th-offer-notice-msg">%s</div>', __('Offer Applied!', 'th-store-one'));
    }
}
