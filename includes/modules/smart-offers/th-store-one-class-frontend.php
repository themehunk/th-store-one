<?php
if (!defined('ABSPATH')) exit;

class Th_Store_One_Smart_Offers {

    private $rules = [];
    private $is_running = false;

    public function __construct() {

        $all = get_option('th_store_one_module_set', []);
        $this->rules = $all['smart-offers']['rules'] ?? [];

        if (empty($this->rules)) return;

        add_action('woocommerce_single_product_summary', [$this, 'render_single'], 25);
        add_action('woocommerce_cart_totals_before_order_total', [$this, 'render_cart']);

        add_action('wp_enqueue_scripts', [$this, 'assets']);

        add_filter('woocommerce_add_cart_item_data', [$this, 'add_cart_item_data'], 10, 2);

        add_action('woocommerce_before_calculate_totals', [$this, 'smart_bogo_engine'], 50);
    }

    /* ================= FRONT ================= */

    public function render_single() {

        global $product;
        if (!$product) return;

        $pid = $product->get_id();

        $valid_rules = [];

        foreach ($this->rules as $rule) {

            if (($rule['status'] ?? '') !== 'active') continue;
            if (!$this->match_rule($rule, $pid)) continue;

            $valid_rules[] = $rule;
        }

        if (empty($valid_rules)) return;

        wc_get_template(
            'smart-offer-single.php',
            ['rules' => $valid_rules],
            '',
            TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/smart-offers/templates/'
        );
    }

    public function render_cart() {

    if (WC()->cart->is_empty()) return; // 🔥 empty cart = hide

    foreach ($this->rules as $rule) {

        if (($rule['status'] ?? '') !== 'active') continue;

        $products = $rule['products'] ?? [];

        $found = false;

        if (empty($products)) {
            $found = true;
        } else {
            foreach (WC()->cart->get_cart() as $item) {
                if (in_array($item['product_id'], $products)) {
                    $found = true;
                    break;
                }
            }
        }

        if (!$found) continue;

        wc_get_template(
            'smart-offer-cart.php',
            ['rule' => $rule],
            '',
            TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/smart-offers/templates/'
        );
    }
}
    public function assets() {
     wp_enqueue_style(
          'th-smart-offer',
          TH_STORE_ONE_PLUGIN_URL . 'assets/css/smart-offer.css',
          [],
          TH_STORE_ONE_VERSION
     );

     wp_enqueue_script(
            'th-smart-offer',
            TH_STORE_ONE_PLUGIN_URL . 'assets/js/smart-offer.js',
            ['jquery'],
            TH_STORE_ONE_VERSION,
            true
        );
    }

    /* ================= MATCH ================= */

    private function match_rule($rule, $pid) {
        $products = $rule['products'] ?? [];
        return empty($products) || in_array($pid, $products);
    }

    /* ================= SAVE SELECTION ================= */

    public function add_cart_item_data($data, $product_id) {

        if (isset($_POST['th_reward'])) {

            $data['th_reward'] = intval($_POST['th_reward']);
            $data['th_rule']   = sanitize_text_field($_POST['th_rule'] ?? '');

            // prevent merge
            $data['unique_key'] = md5(microtime());
        }

        return $data;
    }

    /* ================= MAIN ENGINE ================= */

    public function smart_bogo_engine($cart) {

        if ($this->is_running) return;
        $this->is_running = true;

        if (is_admin() && !defined('DOING_AJAX')) return;
        if (empty($this->rules)) return;

        $selected_rule = $_POST['th_rule'] ?? null;

        foreach ($this->rules as $rule) {

            if (($rule['status'] ?? '') !== 'active') continue;

            // 🔥 ONLY SELECTED RULE RUN
            if ($selected_rule && ($rule['id'] ?? '') != $selected_rule) {
                continue;
            }

            $buy_qty = max(1, intval($rule['x_qty'] ?? 1));
            $get_qty = max(1, intval($rule['y_qty'] ?? 1));

            $reward_products = $rule['reward_products'] ?? [];
            if (empty($reward_products)) continue;

            $reward_id = $reward_products[0];

            /* ===== COUNT ===== */
            $trigger_qty = 0;

            foreach ($cart->get_cart() as $item) {
                if (empty($item['th_free'])) {
                    $trigger_qty += $item['quantity'];
                }
            }

            /* ===== CONDITION FAIL ===== */
            if ($trigger_qty < $buy_qty) {
                $this->remove_reward($cart, $reward_id);
                continue;
            }

            /* ===== CALCULATE ===== */
            $times = floor($trigger_qty / $buy_qty);
            $reward_qty = $times * $get_qty;

            /* ===== APPLY ===== */
            $this->apply_free_product($cart, $reward_id, $reward_qty);
        }

        $this->is_running = false;
    }

    /* ================= APPLY FREE ================= */

    private function apply_free_product($cart, $reward_id, $qty) {

        $found = false;

        foreach ($cart->get_cart() as $key => $item) {

            if ($item['product_id'] == $reward_id && !empty($item['th_free'])) {

                $found = true;

                if ($item['quantity'] != $qty) {
                    $cart->set_quantity($key, $qty);
                }

                $item['data']->set_price(0);
            }
        }

        if (!$found && $qty > 0) {

            $cart->add_to_cart($reward_id, $qty, 0, [], [
                'th_free' => true,
                'unique_key' => md5(microtime())
            ]);
        }
    }

    /* ================= REMOVE ================= */

    private function remove_reward($cart, $reward_id) {

        foreach ($cart->get_cart() as $key => $item) {

            if ($item['product_id'] == $reward_id && !empty($item['th_free'])) {
                $cart->remove_cart_item($key);
            }
        }
    }
}