<?php

if (!defined('ABSPATH')) {
    exit;
}

foreach ($rules as $rule) {

    $layout =
        $rule['layout_style']
        ?? 'detailed';

    $allowed_layouts = [
        'detailed',
        'minimal',
    ];

    if (
        !in_array(
            $layout,
            $allowed_layouts,
            true
        )
    ) {

        $layout = 'detailed';
    }


    $template =
        TH_STORE_ONE_PLUGIN_DIR .
        'includes/modules/smart-offers/templates/layouts/' .
        $layout .
        '.php';

    if (!file_exists($template)) {

        $template =
            TH_STORE_ONE_PLUGIN_DIR .
            'includes/modules/smart-offers/templates/layouts/detailed.php';
    }

    include $template;
}
