<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Th_Store_One_Stock_Scarcity_Frontend {

    private $rules = [];

    public function __construct() {

        $settings = get_option('th_store_one_module_set', []);
        if ( isset($settings['stock-scarcity']['rules']) ) {
            $this->rules = $settings['stock-scarcity']['rules'];
        }

        add_action('wp', [$this, 'init_hooks']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
    }

    /* ---------- ASSETS ---------- */
    public function enqueue_assets() {

        wp_enqueue_style(
            'th-stock-scarcity',
            TH_STORE_ONE_PLUGIN_URL . 'assets/css/stock-scarcity.css',
            [],
            TH_STORE_ONE_VERSION
        );

        wp_enqueue_script(
            'th-stock-scarcity',
            TH_STORE_ONE_PLUGIN_URL . 'assets/js/stock-scarcity.js',
            [],
            TH_STORE_ONE_VERSION,
            true
        );
    }

    /* ---------- HOOKS ---------- */
    public function init_hooks() {

        if ( empty($this->rules) ) return;

        foreach ($this->rules as $rule) {

            if ( empty($rule['status']) || $rule['status'] !== 'active' ) continue;

            /* SINGLE */
            if ( !empty($rule['enable_single_page']) ) {
                add_action(
                    $rule['single_placement'],
                    function() use ($rule) {
                        $this->render($rule);
                    },
                    intval($rule['single_priority'] ?? 10)
                );
            }

            /* SHOP */
            if ( !empty($rule['enable_shop_page']) ) {
                add_action(
                    $this->map_shop_hook($rule['shop_position']),
                    function() use ($rule) {
                        $this->render($rule);
                    },
                    10
                );
            }
        }
    }

    /* ---------- RENDER ---------- */
    private function render($rule) {

        global $product;
        if (!$product instanceof WC_Product) return;

        $stock = $this->get_stock($product, $rule);
        if ($stock <= 0) return;

        $sold  = $this->get_sold($product, $rule);
        $percent = $this->get_percentage($stock, $product, $rule);

        /* COLORS */
        $msg_color = $rule['message_clr'] ?? '#111';
        $highlight = $rule['highlight_clr'] ?? '#111';

        /* GRADIENT */
        $start = $rule['bar_strt_clr'] ?? '#7c3aed';
        $end   = $rule['bar_end_clr'] ?? '#d1d5db';


        /*DYNAMIC MESSAGE */
        $message = $this->get_dynamic_message($rule, $stock, $sold);

        /* HIGHLIGHT */
        $message = str_replace(
            ['{stock}', '{sold}'],
            [
                '<span class="th-stock-highlight">'.$stock.'</span>',
                '<span class="th-sold-highlight">'.$sold.'</span>'
            ],
            $message
        );
        ?>
        <div class="th-stock"
            data-stock="<?php echo esc_attr($stock); ?>"
            data-max="<?php echo esc_attr($rule['max_stock'] ?? 20); ?>"
            data-mode="<?php echo esc_attr($rule['stock_mode']); ?>"
            data-auto="<?php echo !empty($rule['fake_stock']['auto_decrease']) ? 'true' : 'false'; ?>"
            data-blink="<?php echo !empty($rule['low_stock_effect']['enable']) ? 'true' : 'false'; ?>"
          data-blink-th="<?php echo esc_attr($rule['low_stock_effect']['threshold'] ?? 5); ?>"
          data-color="<?php echo !empty($rule['color_change']['enable']) ? 'true' : 'false'; ?>"
          data-low-color="<?php echo esc_attr($rule['color_change']['low_color'] ?? '#ef4444'); ?>"
          data-med-color="<?php echo esc_attr($rule['color_change']['medium_color'] ?? '#f59e0b'); ?>"
          data-high-color="<?php echo esc_attr($rule['color_change']['high_color'] ?? '#4f46e5'); ?>"
        >

            <!-- MESSAGE -->
            <div class="th-stock-msg" style="color: <?php echo esc_attr($msg_color); ?>; font-size: <?php echo esc_attr($rule['font_size'] ?? 16); ?>px;"">
                <?php echo wp_kses_post($message); ?>
            </div>

            <!-- BAR -->
            <?php if (!empty($rule['show_progress'])): ?>
                <div class="th-stock-bar" style="background: <?php echo esc_attr($end); ?>; height: <?php echo esc_attr($rule['bar_height'] ?? 12); ?>px;">
                    <div class="th-stock-fill"
                        style="width: <?php echo esc_attr($percent); ?>%;
                               background: <?php echo esc_attr($start); ?>;">
                    </div>
                </div>
            <?php endif; ?>

            <!-- HIGHLIGHT STYLE -->
            <style>
                .th-stock-highlight {
                    color: <?php echo esc_attr($highlight); ?>;
                    font-weight: 600;
                }
                .th-sold-highlight {
                    color: <?php echo esc_attr($highlight); ?>;
                    font-weight: 600;
                }
            </style>

        </div>
        <?php
    }

    /* ---------- DYNAMIC MESSAGE ---------- */
    private function get_dynamic_message($rule, $stock, $sold) {

        if (empty($rule['dynamic_message']['enable'])) {
            return $rule['message'];
        }

        $low_th = intval($rule['dynamic_message']['low_threshold'] ?? 5);
        $med_th = intval($rule['dynamic_message']['medium_threshold'] ?? 10);

        if ($stock <= $low_th) {
            return $rule['dynamic_message']['low_msg'];
        }

        if ($stock <= $med_th) {
            return $rule['dynamic_message']['medium_msg'];
        }

        return $rule['dynamic_message']['high_msg'];
    }

    /* ---------- STOCK ---------- */
    private function get_stock($product, $rule) {

        if ($rule['stock_mode'] === 'fake') {
            return rand(
                intval($rule['fake_stock']['min']),
                intval($rule['fake_stock']['max'])
            );
        }

        $stock = intval($product->get_stock_quantity());

        if (!empty($rule['real_stock']['threshold']) && $stock > $rule['real_stock']['threshold']) {
            return 0;
        }

        return $stock;
    }

    /* ---------- SOLD ---------- */
    private function get_sold($product, $rule) {

        if (empty($rule['sold']['enable'])) return 0;

        if ($rule['sold']['source'] === 'fake') {
            return rand(
                intval($rule['sold']['fake']['min']),
                intval($rule['sold']['fake']['max'])
            );
        }

        return $product->get_total_sales();
    }

    /* ---------- PERCENT ---------- */
    private function get_percentage($stock, $product, $rule) {

        if ($rule['stock_mode'] === 'fake') {
            $max = intval($rule['max_stock'] ?? 20);
            return min(100, ($stock / $max) * 100);
        }

        $total = $product->get_total_sales() + $product->get_stock_quantity();
        if ($total <= 0) return 0;

        return min(100, ($stock / $total) * 100);
    }

    /* ---------- HOOK MAP ---------- */
    private function map_shop_hook($pos) {
        return [
            'after_title' => 'woocommerce_shop_loop_item_title',
            'after_price' => 'woocommerce_after_shop_loop_item_title',
            'after_add_to_cart' => 'woocommerce_after_shop_loop_item'
        ][$pos] ?? 'woocommerce_after_shop_loop_item';
    }
}