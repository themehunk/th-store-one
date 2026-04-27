<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Th_Store_One_Sale_Countdown_Frontend {

    private $settings = [];

    public function __construct() {

        $all = get_option('th_store_one_module_set', []);
        $this->settings = $all['sale-countdown'] ?? [];

        add_action('wp', [$this, 'init']);
        add_action('wp_enqueue_scripts', [$this, 'assets']);
    }

    public function assets() {

        wp_enqueue_style(
            'th-countdown',
            TH_STORE_ONE_PLUGIN_URL . 'assets/css/countdown.css'
        );

        wp_enqueue_script(
            'th-countdown',
            TH_STORE_ONE_PLUGIN_URL . 'assets/js/countdown.js',
            [],
            null,
            true
        );
    }

    public function init() {

        if (empty($this->settings)) return;

        if (!empty($this->settings['show_on_single'])) {
            add_action(
                $this->settings['single_placement'],
                [$this, 'render'],
                intval($this->settings['single_priority'] ?? 10)
            );
        }

        if (!empty($this->settings['show_on_archive'])) {
            add_action(
                $this->map_archive($this->settings['archive_position']),
                [$this, 'render'],
                10
            );
        }
    }

    public function render() {

        global $product;
        if (!$product) return;

        $data = $this->get_data($product);

        if (!$data['enable']) return;

        $style = $this->get_style();



        wc_get_template(
            "{$style}.php",
            $data,
            '',
            TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/sale-countdown/templates/'
        );
    }

    private function get_style() {

        if (is_product()) {
            return $this->settings['sale_countdown_style'] ?? '1';
        }

        return $this->settings['sale_countdown_archive_style'] ?? '3';
    }

    private function get_data($product) {

        $global = $this->settings;
        $pid = $product->get_id();

        /* PRODUCT */
        $enable = get_post_meta($pid, '_th_countdown_enable', true);
        $start  = get_post_meta($pid, '_th_countdown_start', true);
        $end    = get_post_meta($pid, '_th_countdown_end', true);
        $msg    = get_post_meta($pid, '_th_countdown_msg', true);
        $total  = get_post_meta($pid, '_th_discount_qty', true);
        $sold   = get_post_meta($pid, '_th_sold_qty', true);

        /* VARIATION */
        if ($product->is_type('variation')) {
            $vid = $product->get_id();

            $start = get_post_meta($vid, '_th_countdown_start', true) ?: $start;
            $end   = get_post_meta($vid, '_th_countdown_end', true) ?: $end;
            $msg   = get_post_meta($vid, '_th_countdown_msg', true) ?: $msg;
        }

        /* GLOBAL */
        $start = $start ?: strtotime($global['start_datetime'] ?? '');
        $end   = $end   ?: strtotime($global['end_datetime'] ?? '');
        $msg   = $msg   ?: ($global['sale_message'] ?? '');

        /* ENABLE */
        $enable = ($enable === 'yes') || !empty($global['enable_countdown']);

        if (!empty($global['show_on_discounted']) && !$product->is_on_sale()) {
            $enable = false;
        }

        /* PROGRESS */
        $total = max(1, intval($total));
        $sold  = intval($sold);
        $percent = min(100, ($sold / $total) * 100);

        return [
            'enable' => $enable,
            'start' => $start,
            'end' => $end,
            'msg' => $msg,
            'percent' => $percent,
            'sold' => $sold,
            'remaining' => max(0, $total - $sold),
            'settings' => $global
        ];
    }

    private function map_archive($pos) {

        return [
            'after_title' => 'woocommerce_shop_loop_item_title',
            'after_price' => 'woocommerce_after_shop_loop_item_title',
            'after_add_to_cart' => 'woocommerce_after_shop_loop_item'
        ][$pos] ?? 'woocommerce_after_shop_loop_item_title';
    }
}