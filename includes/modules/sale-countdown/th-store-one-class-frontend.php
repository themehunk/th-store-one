<?php

if (! defined('ABSPATH')) {
    exit;
}

class Th_Store_One_Sale_Countdown_Frontend
{
    private $settings = [];

    public function __construct($settings = [])
    {
        $this->settings = $settings;
        add_action('wp', [$this, 'init']);
        add_action('wp_enqueue_scripts', [$this, 'assets']);
    }

    public function assets()
    {
        wp_enqueue_style(
            'th-countdown',
            TH_STORE_ONE_PLUGIN_URL . 'assets/css/countdown.css',
            [],
            TH_STORE_ONE_VERSION
        );

        wp_enqueue_script(
            'th-countdown',
            TH_STORE_ONE_PLUGIN_URL . 'assets/js/countdown.js',
            [],
            TH_STORE_ONE_VERSION,
            true
        );
    }

    public function init()
    {
        if (empty($this->settings)) {
            return;
        }


        if (!empty($this->settings['show_on_single'])) {
            $placement = $this->settings['single_placement'] ?? '';
            $priority  = intval($this->settings['single_priority'] ?? 10);

            if (function_exists('th_store_one_get_hook_from_placement')) {
                $hook = th_store_one_get_hook_from_placement($placement);
            } else {
                $hook = $placement;
            }


            add_action($hook, function () {
                global $product, $post;


                if (is_product() && is_object($post) && is_object($product)) {
                    if ((int)$product->get_id() !== (int)get_queried_object_id()) {

                        if (!empty($this->settings['show_on_archive'])) {
                            $this->render('archive');
                        }
                        return;
                    }
                }
                $this->render('single');
            }, $priority);
        }

        // Archive/Shop Page Placement Logic
        if (!empty($this->settings['show_on_archive'])) {
            $archive_pos = $this->settings['archive_position'] ?? '';
            add_action($this->map_shop_hook($archive_pos), function () {
                $this->render('archive');
            }, 10);
        }
    }

    public function render($context = '')
    {
        global $product;
        if (!$product) {
            return;
        }

        // Only run if product is on sale
        if (!$product->is_on_sale()) {
            return;
        }

        $data = $this->get_data($product);
        if (!$data['enable']) {
            return;
        }

        // Context check perfect template style assigning
        if ($context === 'single') {
            $style = $this->settings['sale_countdown_style'] ?? 'style1';
        } elseif ($context === 'archive') {
            $style = $this->settings['sale_countdown_archive_style'] ?? 'acstyle1';
        } else {
            // Context fall-back mechanism
            $style = is_product() ? ($this->settings['sale_countdown_style'] ?? 'style1') : ($this->settings['sale_countdown_archive_style'] ?? 'acstyle1');
        }

        // Settings validity check before inclusion
        if ($context === 'single' && empty($this->settings['show_on_single'])) {
            return;
        }
        if ($context === 'archive' && empty($this->settings['show_on_archive'])) {
            return;
        }

        wc_get_template(
            "{$style}.php",
            $data,
            '',
            TH_STORE_ONE_PLUGIN_DIR . 'includes/modules/sale-countdown/templates/'
        );
    }

    private function get_style()
    {
        if (is_product()) {
            return $this->settings['sale_countdown_style'] ?? 'style1';
        }
        return $this->settings['sale_countdown_archive_style'] ?? 'acstyle1';
    }

    private function get_data($product)
    {
        $global = $this->settings;

        $start_str = $global['start_datetime'] ?? '';
        $end_str   = $global['end_datetime'] ?? '';

        if (empty($end_str)) {
            return ['enable' => false];
        }

        $msg = $global['sale_message'] ?? 'Hurry! Offer ends soon';

        try {

            $timezone = wp_timezone();

            // WP timezone ka current datetime
            $now = new DateTime('now', $timezone);

            // Start date empty ho to current WP time use karo
            if (empty($start_str)) {
                $start = time();
            } else {
                $start_dt = new DateTime($start_str, $timezone);
                $start    = $start_dt->getTimestamp();
            }

            // End date
            $end_dt = new DateTime($end_str, $timezone);
            $end    = $end_dt->getTimestamp();

        } catch (Exception $e) {

            return ['enable' => false];
        }

        if ($end <= $start) {
            return ['enable' => false];
        }

        return [
            'enable'   => true,
            'start'    => (int) $start,
            'end'      => (int) $end,
            'msg'      => $msg,
            'percent'  => 100,
            'settings' => $global,
        ];
    }

    private function map_shop_hook($pos)
    {
        $hooks = [
            'after_title'        => 'woocommerce_shop_loop_item_title',
            'after_rating'       => 'woocommerce_after_shop_loop_item_title',
            'after_price'        => 'woocommerce_after_shop_loop_item_title',
            'before_add_to_cart' => 'woocommerce_after_shop_loop_item_title',
            'after_add_to_cart'  => 'woocommerce_after_shop_loop_item',
        ];
        return $hooks[$pos] ?? 'woocommerce_after_shop_loop_item';
    }
}
