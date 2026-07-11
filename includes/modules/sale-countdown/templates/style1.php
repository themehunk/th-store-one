<?php
if (! defined('ABSPATH')) {
    exit;
}

if (empty($args['start']) || empty($args['end'])) {
    return;
}

$start    = (int) $args['start'];
$end      = (int) $args['end'];
$msg      = $args['msg'] ?? '';
$percent  = floatval($args['percent'] ?? 100);
$settings = $args['settings'] ?? [];

/* SETTINGS */
$align      = $settings['alignmentSingle'] ?? 'center';
$show_msg   = !empty($settings['show_message']);
$show_bar   = !empty($settings['show_stock_bar']);


/* COLORS */
$bg          = $settings['single_bg_color'] ?? '#111';
$text        = $settings['single_text_color'] ?? '#facc15';
$timer_bg    = $settings['single_timer_bg_color'] ?? '#222';
$timer_color = $settings['single_timer_color'] ?? '#fff';
$bar_color   = $settings['single_sold_bar_bg_color'] ?? 'linear-gradient(90deg, #22c55e, #f97316)';

/* PADDING */
$padding = $settings['cnt_padding'] ?? [];

$pad_top = th_store_one_with_unit(
    $padding['top'] ?? '0px'
);

$pad_right = th_store_one_with_unit(
    $padding['right'] ?? '0px'
);

$pad_bottom = th_store_one_with_unit(
    $padding['bottom'] ?? '0px'
);

$pad_left = th_store_one_with_unit(
    $padding['left'] ?? '0px'
);

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

<div class="th-cd th-style1 s1-align-<?php echo esc_attr($align); ?>"
     data-start="<?php echo $start; ?>" 
     data-end="<?php echo $end; ?>"
     data-server-now="<?php echo esc_attr(time()); ?>"
     data-expire-action="<?php echo esc_attr($settings['countdown_expire_action'] ?? 'hide'); ?>"
     data-expire-msg="<?php echo esc_attr($settings['expire_message'] ?? 'Offer expired'); ?>"
     style="background: <?php echo esc_attr($bg); ?>; color: <?php echo esc_attr($text); ?>; <?php echo esc_attr($border_css); ?>; padding: <?php echo esc_attr("$pad_top $pad_right $pad_bottom $pad_left"); ?>;">

  <?php if ($show_msg && $msg) : ?>
    <div class="th-msg" style="color: <?php echo esc_attr($text); ?>;">
      <?php if (!empty($icon)) : ?>
        <span class="th-msg-icon"><?php echo esc_html($icon); ?></span>
    <?php endif; ?> <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <div class="th-timer-box">
    <div class="th-days-wrapper" style="display: none;">
    <div class="t-item" style="background: <?php echo esc_attr($timer_bg); ?>; color: <?php echo esc_attr($timer_color); ?>;">
      <span class="d">00</span><small style="color: <?php echo esc_attr($timer_color); ?>;">DAYS</small>
    </div>
    <div class="dotes" style="background: <?php echo esc_attr($timer_bg); ?>;">:</div>
  </div>
    <div class="t-item" style="background: <?php echo esc_attr($timer_bg); ?>; color: <?php echo esc_attr($timer_color); ?>;">
      <span class="h">00</span><small style="color: <?php echo esc_attr($timer_color); ?>;">HRS</small>
    </div>
    <div class="dotes" style="background: <?php echo esc_attr($timer_bg); ?>;">:</div>
    <div class="t-item" style="background: <?php echo esc_attr($timer_bg); ?>; color: <?php echo esc_attr($timer_color); ?>;">
      <span class="m">00</span><small style="color: <?php echo esc_attr($timer_color); ?>;">MIN</small>
    </div>
    <div class="dotes" style="background: <?php echo esc_attr($timer_bg); ?>;">:</div>
    <div class="t-item" style="background: <?php echo esc_attr($timer_bg); ?>; color: <?php echo esc_attr($timer_color); ?>;">
      <span class="s">00</span><small style="color: <?php echo esc_attr($timer_color); ?>;">SEC</small>
    </div>
  </div>

  <?php if ($show_bar) : ?>
    <div class="th-bar">
      <div class="th-fill" style="width: <?php echo esc_attr($percent); ?>%; background: <?php echo $bar_color; ?>;"></div>
    </div>
  <?php endif; ?>

</div>