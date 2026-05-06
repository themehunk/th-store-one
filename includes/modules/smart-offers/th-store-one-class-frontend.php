<?php

if (!defined('ABSPATH')) {
    exit;
}

class Th_Store_One_Smart_Offers
{
    private $rules = [];
    private $is_running = false;

    public function __construct()
    {

        $modules = get_option(
            'th_store_one_module_option',
            []
        );

        if (empty($modules['smart-offers'])) {
            return;
        }

        $all = get_option(
            'th_store_one_module_set',
            []
        );

        $this->rules =
            $all['smart-offers']['rules'] ?? [];

        if (empty($this->rules)) {
            return;
        }

        /* =====================================================
           SINGLE
        ===================================================== */

        foreach ($this->rules as $rule) {

            if (
                ($rule['status'] ?? '')
                !== 'active'
            ) {
                continue;
            }

            $placement =
                $rule['single_placement']
                ?? 'woocommerce_after_add_to_cart_form';

            $priority = intval(
                $rule['single_priority']
                ?? 10
            );

            $hook =
                th_store_one_get_hook_from_placement(
                    $placement
                );

            if (!$hook) {
                continue;
            }

            add_action(
                $hook,
                function () use ($rule) {

                    global $product;

                    if (
                        !$product instanceof WC_Product
                    ) {
                        return;
                    }

                    if (
                        !$this->match_rule(
                            $rule,
                            $product->get_id()
                        )
                    ) {
                        return;
                    }

                    $this->render_single_rule(
                        $rule
                    );

                },
                $priority
            );
        }

        /* =====================================================
           CART
        ===================================================== */

        add_action(
            'woocommerce_cart_totals_before_order_total',
            [$this, 'render_cart']
        );

        /* =====================================================
           ASSETS
        ===================================================== */

        add_action(
            'wp_enqueue_scripts',
            [$this, 'assets']
        );

        /* =====================================================
           CART DATA
        ===================================================== */

        add_filter(
            'woocommerce_add_cart_item_data',
            [$this, 'add_cart_item_data'],
            10,
            2
        );

        /* =====================================================
           ENGINE
        ===================================================== */

        add_action(
            'woocommerce_before_calculate_totals',
            [$this, 'smart_bogo_engine'],
            50
        );

        add_filter(
            'wc_add_to_cart_message_html',
            [$this, 'offer_notice'],
            10,
            2
        );
    }

    /* =====================================================
       ASSETS
    ===================================================== */

    public function assets()
    {

        wp_enqueue_style(
            'th-smart-offer',
            TH_STORE_ONE_PLUGIN_URL .
            'assets/css/smart-offer.css',
            [],
            TH_STORE_ONE_VERSION
        );

        wp_enqueue_script(
            'th-smart-offer',
            TH_STORE_ONE_PLUGIN_URL .
            'assets/js/smart-offer.js',
            ['jquery'],
            TH_STORE_ONE_VERSION,
            true
        );
    }

    /* =====================================================
       MATCH
    ===================================================== */

    private function match_rule(
        $rule,
        $pid
    ) {

        $products = array_map(
            'intval',
            $rule['products'] ?? []
        );

        return (
            empty($products)
            || in_array($pid, $products)
        );
    }

    /* =====================================================
       SINGLE
    ===================================================== */

    public function render_single_rule($rule)
    {

        wc_get_template(
            'smart-offer-single.php',
            [
                'rules' => [$rule]
            ],
            '',
            TH_STORE_ONE_PLUGIN_DIR .
            'includes/modules/smart-offers/templates/'
        );
    }

    /* =====================================================
       CART
    ===================================================== */

    public function render_cart()
    {

        if (WC()->cart->is_empty()) {
            return;
        }

        foreach ($this->rules as $rule) {

            if (
                ($rule['status'] ?? '')
                !== 'active'
            ) {
                continue;
            }

            $products =
                array_map(
                    'intval',
                    $rule['products'] ?? []
                );

            $found = false;

            if (empty($products)) {

                $found = true;

            } else {

                foreach (
                    WC()->cart->get_cart() as $item
                ) {

                    if (

                        in_array(
                            $item['product_id'],
                            $products
                        )

                        ||

                        in_array(
                            $item['variation_id'],
                            $products
                        )
                    ) {

                        $found = true;
                        break;
                    }
                }
            }

            if (!$found) {
                continue;
            }

            wc_get_template(
                'smart-offer-cart.php',
                [
                    'rule' => $rule
                ],
                '',
                TH_STORE_ONE_PLUGIN_DIR .
                'includes/modules/smart-offers/templates/'
            );
        }
    }

    /* =====================================================
       CART DATA
    ===================================================== */

    public function add_cart_item_data(
        $data,
        $product_id
    ) {

        if (isset($_POST['th_reward'])) {

            $data['th_reward'] = intval(
                $_POST['th_reward']
            );

            $data['th_rule'] =
                sanitize_text_field(
                    $_POST['th_rule'] ?? ''
                );

            $data['th_apply_on'] =
                sanitize_text_field(
                    $_POST['th_apply_on']
                    ?? ''
                );

            $data['unique_key'] =
                md5(microtime());
        }

        return $data;
    }

    /* =====================================================
       MAIN ENGINE
    ===================================================== */

    public function smart_bogo_engine($cart)
    {

        if ($this->is_running) {
            return;
        }

        $this->is_running = true;

        if (
            is_admin()
            && !defined('DOING_AJAX')
        ) {
            return;
        }

        if (empty($this->rules)) {
            return;
        }

        /* =====================================================
           RESET PRICES
        ===================================================== */

        foreach (
            $cart->get_cart() as $item
        ) {

            if (!empty($item['th_free'])) {
                continue;
            }

            $product = $item['data'];

            $product->set_price(
                $product->get_price()
            );
        }

        /* =====================================================
           LOOP RULES
        ===================================================== */

        foreach ($this->rules as $rule) {

            if (
                ($rule['status'] ?? '')
                !== 'active'
            ) {
                continue;
            }

            $rule_id =
                $rule['flexible_id'] ?? '';

            if (!$rule_id) {
                continue;
            }

            $buy_qty = max(
                1,
                intval(
                    $rule['x_qty'] ?? 1
                )
            );

            $get_qty = max(
                1,
                intval(
                    $rule['y_qty'] ?? 1
                )
            );

            $reward_type =
                $rule['reward_type']
                ?? 'free_product';

            $apply_on =
                $rule['apply_on']
                ?? 'same_product';

            $apply_mode =
                $rule['apply_mode']
                ?? 'step';

            $trigger_products =
                array_map(
                    'intval',
                    $rule['products'] ?? []
                );

            $exclude_products =
                array_map(
                    'intval',
                    $rule['exclude_products']
                    ?? []
                );

            /* =====================================================
               EXCLUDE
            ===================================================== */

            $has_excluded = false;

            foreach (
                $cart->get_cart() as $item
            ) {

                if (

                    in_array(
                        $item['product_id'],
                        $exclude_products
                    )

                    ||

                    in_array(
                        $item['variation_id'],
                        $exclude_products
                    )
                ) {

                    $has_excluded = true;
                    break;
                }
            }

            if ($has_excluded) {
                continue;
            }

            /* =====================================================
   COUNT ONLY SELECTED RULE
===================================================== */

            $trigger_qty = 0;

            foreach (
                $cart->get_cart() as $item
            ) {

                /* RULE MUST MATCH */

                if (

                    ($item['th_rule'] ?? '')

                    !==

                    $rule_id

                ) {

                    continue;
                }

                if (

                    (
                        in_array(
                            $item['product_id'],
                            $trigger_products
                        )

                        ||

                        in_array(
                            $item['variation_id'],
                            $trigger_products
                        )
                    )

                    && empty($item['th_free'])
                ) {

                    $trigger_qty +=
                        $item['quantity'];
                }
            }

            /* =====================================================
               FAIL
            ===================================================== */

            if ($trigger_qty < $buy_qty) {

                $this->remove_reward(
                    $cart,
                    $rule_id
                );

                continue;
            }

            /* =====================================================
               TIMES
            ===================================================== */

            if (
                $apply_mode === 'once'
            ) {

                $times = 1;

            } else {

                $times = floor(
                    $trigger_qty
                    / $buy_qty
                );
            }

            /* =====================================================
               LIMIT
            ===================================================== */

            $limit = intval(
                $rule['limit_per_order']
                ?? 0
            );

            if ($limit > 0) {

                $times = min(
                    $times,
                    $limit
                );
            }

            $reward_qty =
                $times * $get_qty;

            /* =====================================================
   FREE PRODUCT
===================================================== */

            if (
                $reward_type
                === 'free_product'
            ) {

                $reward_products =
                    array_map(
                        'intval',
                        $rule['reward_products']
                        ?? []
                    );

                if (
                    empty($reward_products)
                ) {
                    continue;
                }

                $reward_id = intval(
                    $reward_products[0]
                );

                /* =====================================================
                   AUTO ADD
                ===================================================== */

                $auto_add = !empty(
                    $rule['auto_add']
                );

                /*
                IF AUTO ADD OFF
                REMOVE EXISTING FREE PRODUCT
                */

                if (!$auto_add) {

                    $this->remove_reward(
                        $cart,
                        $rule_id
                    );

                    continue;
                }

                /* =====================================================
                   APPLY FREE PRODUCT
                ===================================================== */

                $this->apply_free_product(
                    $cart,
                    $reward_id,
                    $reward_qty,
                    $rule_id
                );
            }

            /* =====================================================
               DISCOUNT
            ===================================================== */ else {

                $this->apply_discount(
                    $cart,
                    $rule,
                    $trigger_products,
                    $times
                );
            }
        }

        $this->is_running = false;
    }

    /* =====================================================
       FREE PRODUCT
    ===================================================== */

    private function apply_free_product(
        $cart,
        $reward_id,
        $qty,
        $rule_id
    ) {

        $found = false;

        foreach (
            $cart->get_cart() as $key => $item
        ) {

            if (

                (
                    $item['product_id']
                    == $reward_id

                    ||

                    $item['variation_id']
                    == $reward_id
                )

                && !empty($item['th_free'])

                && (
                    ($item['th_rule'] ?? '')
                    === $rule_id
                )
            ) {

                $found = true;

                if (
                    $item['quantity']
                    != $qty
                ) {

                    $cart->set_quantity(
                        $key,
                        $qty
                    );
                }

                $item['data']->set_price(0);
            }
        }

        if (!$found && $qty > 0) {

            $cart->add_to_cart(
                $reward_id,
                $qty,
                0,
                [],
                [

                    'th_free' => true,

                    'th_rule' => $rule_id,

                    'unique_key' =>
                        md5(microtime())
                ]
            );
        }
    }

    /* =====================================================
       DISCOUNT
    ===================================================== */

    private function apply_discount(
        $cart,
        $rule,
        $trigger_products,
        $times
    ) {

        $reward_type =
            $rule['reward_type'] ?? '';

        $discount_value = floatval(
            $rule['discount_value']
            ?? 0
        );

        $apply_on =
            $rule['apply_on']
            ?? 'same_product';

        /* =====================================================
           TARGET PRODUCTS
        ===================================================== */

        if (
            $apply_on === 'same_product'
        ) {

            $target_products =
                array_map(
                    'intval',
                    $trigger_products
                );

        } else {

            $target_products =
                array_map(
                    'intval',
                    $rule['reward_products']
                    ?? []
                );
        }

        if (empty($target_products)) {
            return;
        }

        /* =====================================================
           AUTO ADD SPECIFIC PRODUCT
        ===================================================== */

        if (

            $apply_on === 'specific_product'

            && !empty($target_products)

        ) {

            $reward_product_id = intval(
                $target_products[0]
            );

            $found = false;

            foreach (
                $cart->get_cart() as $cart_item
            ) {

                if (

                    (
                        $cart_item['product_id']
                        == $reward_product_id

                        ||

                        $cart_item['variation_id']
                        == $reward_product_id
                    )

                    && empty(
                        $cart_item['th_free']
                    )

                ) {

                    $found = true;
                    break;
                }
            }

            if (!$found) {

                $cart->add_to_cart(
                    $reward_product_id,
                    $times,
                    0,
                    [],
                    [

                        'th_discount_rule' =>
                            $rule['flexible_id'],

                        'unique_key' =>
                            md5(microtime())
                    ]
                );
            }
        }

        /* =====================================================
           APPLY DISCOUNT
        ===================================================== */

        foreach (
            $cart->get_cart() as $item
        ) {

            if (

                !in_array(
                    $item['product_id'],
                    $target_products
                )

                &&

                !in_array(
                    $item['variation_id'],
                    $target_products
                )
            ) {

                continue;
            }

            if (!empty($item['th_free'])) {
                continue;
            }

            if ($apply_on === 'specific_product') {

                if (

                    ($item['th_discount_rule']
                        ?? '')

                    !==

                    ($rule['flexible_id']
                        ?? '')
                ) {

                    continue;
                }
            }

            $product = $item['data'];

            $price = floatval(
                $product->get_price()
            );

            $new_price = $price;

            /* =====================================================
               PERCENT
            ===================================================== */

            if (
                $reward_type
                === 'discount_percent'
            ) {

                $new_price = $price - (
                    ($price * $discount_value)
                    / 100
                );
            }

            /* =====================================================
               FIXED
            ===================================================== */

            if (
                $reward_type
                === 'discount_fixed'
            ) {

                $new_price = max(
                    0,
                    $price - $discount_value
                );
            }

            $product->set_price(
                $new_price
            );
        }
    }

    /* =====================================================
       REMOVE
    ===================================================== */

    private function remove_reward(
        $cart,
        $rule_id
    ) {

        foreach (
            $cart->get_cart() as $key => $item
        ) {

            if (

                !empty($item['th_free'])

                && (
                    ($item['th_rule'] ?? '')
                    === $rule_id
                )
            ) {

                $cart->remove_cart_item(
                    $key
                );
            }
        }
    }

    /* =====================================================
   OFFER NOTICE
===================================================== */

    public function offer_notice(
        $message,
        $products
    ) {

        if (empty($_POST['th_rule'])) {
            return $message;
        }

        $rule_id = sanitize_text_field(
            $_POST['th_rule']
        );

        if (!$rule_id) {
            return $message;
        }

        $matched_rule = null;

        foreach ($this->rules as $rule) {

            if (

                ($rule['flexible_id'] ?? '')

                ===

                $rule_id

            ) {

                $matched_rule = $rule;
                break;
            }
        }

        if (!$matched_rule) {
            return $message;
        }

        $reward_type =
            $matched_rule['reward_type']
            ?? '';

        $discount =
            floatval(
                $matched_rule['discount_value']
                ?? 0
            );

        $reward_products =
            $matched_rule['reward_products']
            ?? [];

        $offer_message = '';

        /* =====================================================
           FREE PRODUCT
        ===================================================== */

        if (

            $reward_type
            === 'free_product'

            && !empty($reward_products)

        ) {

            $reward_product = wc_get_product(
                $reward_products[0]
            );

            if ($reward_product) {

                $offer_message = sprintf(
                    'Offer Applied: %s added FREE!',
                    $reward_product->get_name()
                );
            }
        }

        /* =====================================================
           PERCENT
        ===================================================== */ elseif (

            $reward_type
            === 'discount_percent'

        ) {

            $offer_message = sprintf(
                'Offer Applied: %s%% discount activated!',
                $discount
            );
        }

        /* =====================================================
           FIXED
        ===================================================== */ elseif (

            $reward_type
            === 'discount_fixed'

        ) {

            $offer_message = sprintf(
                'Offer Applied: %s discount activated!',
                wc_price($discount)
            );
        }

        return $message . $offer_message;
    }
}
