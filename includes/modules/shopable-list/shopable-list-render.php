<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Block themes run do_shortcode() on the template before do_blocks(), so the
 * core/shortcode block receives the already rendered markup and wpautop()s it,
 * injecting <p>/<br> tags that break the grid and popup. Skip autop for it.
 */
add_filter('pre_render_block', function ($pre_render, $parsed_block) {
    if (
        null === $pre_render &&
        isset($parsed_block['blockName'], $parsed_block['innerHTML']) &&
        'core/shortcode' === $parsed_block['blockName'] &&
        false !== strpos($parsed_block['innerHTML'], 'th-shopable-list-wrap')
    ) {
        return trim($parsed_block['innerHTML']);
    }

    return $pre_render;
}, 10, 2);

if (
    class_exists('StoreOnePro_License') &&
    StoreOnePro_License::is_active()
) {
    include STORE_ONE_PRO_PLUGIN_DIR .
    'includes/modules/shopable-list/th-store-one-class-frontend.php';
    return;
}
// Lite render
include TH_STORE_ONE_PLUGIN_DIR .'includes/modules/shopable-list/shopable-video.php';
