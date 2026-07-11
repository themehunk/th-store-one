<?php
if (! defined('ABSPATH')) {
    exit;
}

$settings = $args['settings'] ?? [];

$align = $settings['alignmentSingle'] ?? 'center';

$bg          = $settings['single_bg_color'] ?? '#faeceb';
$text        = $settings['single_text_color'] ?? '#333';
$timer_color = $settings['single_timer_color'] ?? '#ef4444';

$padding = $settings['cnt_padding'] ?? [];

$pad_top    = th_store_one_with_unit($padding['top'] ?? '20px');
$pad_right  = th_store_one_with_unit($padding['right'] ?? '20px');
$pad_bottom = th_store_one_with_unit($padding['bottom'] ?? '20px');
$pad_left   = th_store_one_with_unit($padding['left'] ?? '20px');

$border = $settings['border'] ?? [];
$bw = $border['width'] ?? [];
$br = $border['radius'] ?? [];

$border_style = $border['style'] ?? 'solid';
$border_color = $border['color'] ?? 'transparent';

$border_css = sprintf(
    'border-style:%s;
     border-color:%s;
     border-top-width:%s;
     border-right-width:%s;
     border-bottom-width:%s;
     border-left-width:%s;
     border-top-left-radius:%s;
     border-top-right-radius:%s;
     border-bottom-right-radius:%s;
     border-bottom-left-radius:%s;',
    esc_attr($border_style),
    esc_attr($border_color),
    esc_attr($bw['top'] ?? '0px'),
    esc_attr($bw['right'] ?? '0px'),
    esc_attr($bw['bottom'] ?? '0px'),
    esc_attr($bw['left'] ?? '0px'),
    esc_attr($br['top'] ?? '0px'),
    esc_attr($br['right'] ?? '0px'),
    esc_attr($br['bottom'] ?? '0px'),
    esc_attr($br['left'] ?? '0px')
);

$msg = $settings['sale_message'] ?? 'Hurry Up! Sale ends in:';

$icon_map = [
    'none'     => '',
    'gift'     => '🎁',
    'fire'     => '🔥',
    'flash'    => '⚡',
    'save'     => '💰',
    'discount' => '🏷️',
    'bogo'     => '🎉',
    'rocket'   => '🚀',
    'star'     => '⭐',
    'trophy'   => '🏆',
    'gem'      => '💎',
    'crown'    => '👑',
    'cart'     => '🛍️',
    'ribbon'   => '🎀',
    'star2'    => '🌟',
    'magic'    => '🪄',
    'money'    => '💸',
    'package'  => '📦',
    'clover'   => '🍀',
    'party'    => '🥳',
    'dart'     => '🎯',
    'clock'    => '⏳',
    'sad'      => '😢',
    'heart'    => '❤️',
];

$selected_icon = $settings['selected_icon'] ?? 'none';
$icon = $icon_map[$selected_icon] ?? '';

?>

<div
    class="th-cd th-style5"
    data-start="<?php echo esc_attr($args['start'] ?? 0); ?>"
    data-end="<?php echo esc_attr($args['end'] ?? 0); ?>"
    data-server-now="<?php echo esc_attr(time()); ?>"
    data-expire-action="<?php echo esc_attr($settings['countdown_expire_action'] ?? 'hide'); ?>"
    data-expire-msg="<?php echo esc_attr($settings['expire_message'] ?? 'Offer expired'); ?>"
    style="
        background: <?php echo esc_attr($bg); ?>;
        color: <?php echo esc_attr($text); ?>;
        text-align: <?php echo esc_attr($align); ?>;
        <?php echo esc_attr($border_css); ?>;
        padding: <?php echo esc_attr("$pad_top $pad_right $pad_bottom $pad_left"); ?>;
    "
>
    <div
        class="s1-style5-title"
        style="color: <?php echo esc_attr($text); ?>; "
    >
       <?php if (!empty($icon)) : ?>
        <span class="th-msg-icon"><?php echo esc_html($icon); ?></span>
    <?php endif; ?> <?php echo esc_html($msg); ?>
    </div>

    <div
        class="s1-style5-timer"
        style="
            color: <?php echo esc_attr($timer_color); ?>;
            justify-content: <?php echo esc_attr($align); ?>;
        "
    >
        <span class="num d">00</span>
        <span class="label">days</span>

        <span class="colon">:</span>

        <span class="num h">00</span>
        <span class="label">hours</span>

        <span class="colon">:</span>

        <span class="num m">00</span>
        <span class="label">mins</span>

        <span class="colon">:</span>

        <span class="num s">00</span>
        <span class="label">secs</span>
    </div>
</div>