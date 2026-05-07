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
            3
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
        wp_localize_script(
            'th-smart-offer',
            'thSmartOffer',
            [
        'currency_symbol' => get_woocommerce_currency_symbol(),
        'currency'        => get_woocommerce_currency(),
        'price_format'    => get_woocommerce_price_format(),
        'decimals'        => wc_get_price_decimals(),
        'decimal_sep'     => wc_get_price_decimal_separator(),
        'thousand_sep'    => wc_get_price_thousand_separator(),
        'select_variation_text' => __(
            'Choose variation options to view this offer',
            'th-store-one'
        ),

        'select_options_text' => __(
            'Select Options',
            'th-store-one'
        ),
    ]
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

        if (empty($products)) {
            return true;
        }

        /* SIMPLE */

        if (in_array($pid, $products)) {
            return true;
        }

        /* VARIATION PARENT */

        $parent_id = wp_get_post_parent_id($pid);

        if (
            $parent_id
            && in_array($parent_id, $products)
        ) {

            return true;
        }

        return false;
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
        $product_id,
        $variation_id = 0
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

            /* VARIABLE SUPPORT */

            $data['th_variation_id'] =
                intval($variation_id);

            $data['unique_key'] =
                md5(
                    microtime() .
                    rand()
                );
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
                $product->get_regular_price()
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
           FIXED CART DISCOUNT
        ===================================================== */

        if (
            $reward_type
            === 'discount_fixed_cart'
        ) {

            $discount = $discount_value * $times;

            $label = !empty($rule['offer_heading'])
    ? wp_strip_all_tags($rule['offer_heading'])
    : __('Smart Offer Discount', 'th-store-one');

            $label = str_replace(
                ['{x}', '{y}', '{discount}'],
                [
                    intval($rule['x_qty'] ?? 1),
                    intval($rule['y_qty'] ?? 1),
                    wc_price($discount_value)
                ],
                $label
            );

            $cart->add_fee(
                $label,
                -$discount
            );

            return;
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
                $product->get_sale_price()
        ? $product->get_sale_price()
        : $product->get_regular_price()
            );

            if (!$price) {

                $price = floatval(
                    $product->get_price()
                );
            }

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
               FIXED PRODUCT
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
       VALIDATE OFFER
    ===================================================== */

        $buy_qty = max(
            1,
            intval(
                $matched_rule['x_qty']
                ?? 1
            )
        );

        $cart_qty = 0;

        foreach (
            WC()->cart->get_cart() as $item
        ) {

            if (

                ($item['th_rule'] ?? '')

                ===

                $rule_id

            ) {

                $cart_qty +=
                    $item['quantity'];
            }
        }

        /* OFFER NOT QUALIFIED */

        if ($cart_qty < $buy_qty) {
            return $message;
        }

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
        } elseif (

            $reward_type
            === 'discount_fixed_cart'

        ) {

            $offer_message = sprintf(
                'Offer Applied: %s discount activated!',
                wc_price($discount)
            );
        }

        return $message . $offer_message;
    }
}
