<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Th_Store_One_Inactive_Tab_Frontend {

    private $rules = [];

    public function __construct() {

        $modules = get_option('th_store_one_module_option', []);
        if ( empty($modules['inactive-tab']) ) return;

        $settings = get_option('th_store_one_module_set', []);
        if ( isset($settings['inactive-tab']['rules']) ) {
            $this->rules = $settings['inactive-tab']['rules'];
        }

        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
    }

    public function enqueue_assets() {

        if ( empty($this->rules) ) return;

        $matched_rules = [];

        foreach ($this->rules as $rule) {

            if ( empty($rule['status']) || $rule['status'] !== 'active' ) continue;

            if ( $this->rule_matches($rule) ) {
                $matched_rules[] = $this->prepare_rule($rule);
            }
        }

        if ( empty($matched_rules) ) return;

        wp_enqueue_script(
            'th-inactive-tab',
            TH_STORE_ONE_PLUGIN_URL . 'assets/js/inactive-tab.js',
            [],
            TH_STORE_ONE_VERSION,
            true
        );

        wp_localize_script('th-inactive-tab', 'thInactiveTabData', [
            'rules' => $matched_rules
        ]);
    }

    private function rule_matches($rule) {

        if (!empty($rule['devices'])) {
            $is_mobile = wp_is_mobile();
            if ($is_mobile && !in_array('mobile', $rule['devices'])) return false;
            if (!$is_mobile && !in_array('desktop', $rule['devices'])) return false;
        }

        switch ($rule['trigger_type'] ?? 'all_pages') {

            case 'all_products':
                if (!function_exists('is_product') || !is_product()) return false;
                break;

            case 'specific_products':
                if (empty($rule['products']) || !is_product($rule['products'])) return false;
                break;

            case 'specific_pages':
                if (empty($rule['pages']) || !is_page($rule['pages'])) return false;
                break;
        }

        return true;
    }

    private function prepare_rule($rule) {

    $messages = [];
    $icons    = [];

    /* ---------- FIRST: DYNAMIC / CUSTOM ---------- */
    $text = $rule['message_type'] === 'dynamic'
        ? $rule['dynamic_template']
        : $rule['custom_message'];

    $messages[] = $this->parse_message($text);
    $icons[]    = $this->get_icon($rule);

    /* ---------- THEN: ROTATION ---------- */
    if (!empty($rule['rotation_enabled']) && !empty($rule['rotation_messages'])) {

        foreach ($rule['rotation_messages'] as $item) {

            $messages[] = $this->parse_message($item['text']);
            $icons[]    = $this->get_icon($item);
        }
    }

    return [
        'messages' => $messages,
        'icons'    => $icons,
        'interval' => intval($rule['interval'] ?? 2000),
        'delay'    => intval($rule['delay'] ?? 0),
    ];
   }

    private function get_icon($item) {

    if (empty($item['icon_enabled'])) {
        return '';
    }

    /* ---------- SVG CUSTOM ---------- */
    if ($item['icontype'] === 'custom_svg' && !empty($item['custom_svg'])) {
        return $item['custom_svg'];
    }

    /* ---------- IMAGE ---------- */
    if ($item['icontype'] === 'image' && !empty($item['image_url'])) {
        return $item['image_url']; // 👈 direct URL return
    }

    /* ---------- DEFAULT ICON (EMOJI SVG) ---------- */
    if ($item['icontype'] === 'icon') {

        $map = [
            'alert' => '<svg viewBox="0 0 64 64"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="58">⚡</text></svg>',
            'cart'  => '<svg viewBox="0 0 64 64"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="58">🛍️</text></svg>',
            'fire'  => '<svg viewBox="0 0 64 64"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="58">🔥</text></svg>',
            'clock' => '<svg viewBox="0 0 64 64"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="58">⏳</text></svg>',
            'sad'   => '<svg viewBox="0 0 64 64"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="58">😢</text></svg>',
            'heart' => '<svg viewBox="0 0 64 64"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="58">❤️</text></svg>',
        ];

        return $map[$item['selected_icon']] ?? '';
    }

    return '';
}

    private function parse_message($text) {

        $cart_count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
        $cart_total = WC()->cart ? WC()->cart->get_cart_total() : '';

        $text = str_replace('{cart_count}', $cart_count, $text);
        $text = str_replace('{cart_total}', wp_strip_all_tags($cart_total), $text);

        return wp_strip_all_tags($text);
    }
}