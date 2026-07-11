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
$show_bar   = !empty($settings['enable_stock_bar']) || !empty($settings['show_stock_bar']);


/* COLORS & STYLES */
$bg          = $settings['single_bg_color'] ?? '#fff';
$text        = $settings['single_text_color'] ?? '#111';
$timer_bg    = $settings['single_timer_bg_color'] ?? 'transparent';
$timer_color = $settings['single_timer_color'] ?? '#111';
$bar_color   = $settings['single_sold_bar_bg_color'] ?? '#4c6fff';

// Size Compact (64px) Calculation
$radius = 26;
$stroke = 2.5;
$normalizedRadius = $radius - $stroke / 2;
$circumference = $normalizedRadius * 2 * M_PI; // Approx 155.5
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

<div class="th-cd s4-style s4-align-<?php echo esc_attr($align); ?>"
     data-start="<?php echo $start; ?>" 
     data-end="<?php echo $end; ?>"
     data-server-now="<?php echo esc_attr(time()); ?>"
     
     data-expire-action="<?php echo esc_attr($settings['countdown_expire_action'] ?? 'hide'); ?>"
     data-expire-msg="<?php echo esc_attr($settings['expire_message'] ?? 'Offer expired'); ?>"
     style="background: <?php echo esc_attr($bg); ?>; color: <?php echo esc_attr($text); ?>;  <?php echo esc_attr($border_css); ?>; padding: <?php echo esc_attr("$pad_top $pad_right $pad_bottom $pad_left"); ?>;">

  <?php if ($show_msg && $msg) : ?>
    <div class="s4-message" style="color: <?php echo esc_attr($text); ?>; margin-bottom: 14px; font-size: 14px; font-weight: 500;">
       <?php if (!empty($icon)) : ?>
        <span class="th-msg-icon"><?php echo esc_html($icon); ?></span>
    <?php endif; ?> <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <div class="s4-timer-wrap">
    
    <div class="th-days-wrapper" style="display: none;">
      <div class="s4-circle-item">
        <div class="s4-svg-wrapper">
          <svg width="64" height="64" class="s4-countdown-svg">
            <circle cx="32" cy="32" r="<?php echo $normalizedRadius; ?>" stroke="<?php echo esc_attr($bar_color); ?>" stroke-width="<?php echo $stroke; ?>" opacity="0.12" fill="<?php echo esc_attr($timer_bg); ?>" />
            <circle cx="32" cy="32" r="<?php echo $normalizedRadius; ?>" stroke="<?php echo esc_attr($bar_color); ?>" stroke-width="<?php echo $stroke; ?>" fill="none" stroke-linecap="round" stroke-dasharray="<?php echo $circumference; ?>" stroke-dashoffset="0" transform="rotate(-90 32 32)" class="s4-circle-progress th-days-circle" />
            <text x="50%" y="42%" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="600" fill="<?php echo esc_attr($timer_color); ?>" class="s4-timer-number d">00</text>
            <text x="50%" y="65%" text-anchor="middle" dominant-baseline="middle" font-size="7.5" font-weight="500" fill="<?php echo esc_attr($timer_color); ?>" class="s4-timer-label-inside">DAYS</text>
          </svg>
        </div>
      </div>
  </div>

    <div class="s4-circle-item">
      <div class="s4-svg-wrapper">
        <svg width="64" height="64" class="s4-countdown-svg">
          <circle cx="32" cy="32" r="<?php echo $normalizedRadius; ?>" stroke="<?php echo esc_attr($bar_color); ?>" stroke-width="<?php echo $stroke; ?>" opacity="0.12" fill="<?php echo esc_attr($timer_bg); ?>" />
          <circle cx="32" cy="32" r="<?php echo $normalizedRadius; ?>" stroke="<?php echo esc_attr($bar_color); ?>" stroke-width="<?php echo $stroke; ?>" fill="none" stroke-linecap="round" stroke-dasharray="<?php echo $circumference; ?>" stroke-dashoffset="0" transform="rotate(-90 32 32)" class="s4-circle-progress th-hours-circle" />
          <text x="50%" y="42%" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="600" fill="<?php echo esc_attr($timer_color); ?>" class="s4-timer-number h">00</text>
          <text x="50%" y="65%" text-anchor="middle" dominant-baseline="middle" font-size="7.5" font-weight="500" fill="<?php echo esc_attr($timer_color); ?>" class="s4-timer-label-inside">HOURS</text>
        </svg>
      </div>
    </div>

    <div class="s4-circle-item">
      <div class="s4-svg-wrapper">
        <svg width="64" height="64" class="s4-countdown-svg">
          <circle cx="32" cy="32" r="<?php echo $normalizedRadius; ?>" stroke="<?php echo esc_attr($bar_color); ?>" stroke-width="<?php echo $stroke; ?>" opacity="0.12" fill="<?php echo esc_attr($timer_bg); ?>" />
          <circle cx="32" cy="32" r="<?php echo $normalizedRadius; ?>" stroke="<?php echo esc_attr($bar_color); ?>" stroke-width="<?php echo $stroke; ?>" fill="none" stroke-linecap="round" stroke-dasharray="<?php echo $circumference; ?>" stroke-dashoffset="0" transform="rotate(-90 32 32)" class="s4-circle-progress th-minutes-circle" />
          <text x="50%" y="42%" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="600" fill="<?php echo esc_attr($timer_color); ?>" class="s4-timer-number m">00</text>
          <text x="50%" y="65%" text-anchor="middle" dominant-baseline="middle" font-size="7.5" font-weight="500" fill="<?php echo esc_attr($timer_color); ?>" class="s4-timer-label-inside">MINS</text>
        </svg>
      </div>
    </div>

    <div class="s4-circle-item">
      <div class="s4-svg-wrapper">
        <svg width="64" height="64" class="s4-countdown-svg">
          <circle cx="32" cy="32" r="<?php echo $normalizedRadius; ?>" stroke="<?php echo esc_attr($bar_color); ?>" stroke-width="<?php echo $stroke; ?>" opacity="0.12" fill="<?php echo esc_attr($timer_bg); ?>" />
          <circle cx="32" cy="32" r="<?php echo $normalizedRadius; ?>" stroke="<?php echo esc_attr($bar_color); ?>" stroke-width="<?php echo $stroke; ?>" fill="none" stroke-linecap="round" stroke-dasharray="<?php echo $circumference; ?>" stroke-dashoffset="0" transform="rotate(-90 32 32)" class="s4-circle-progress th-seconds-circle" />
          <text x="50%" y="42%" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="600" fill="<?php echo esc_attr($timer_color); ?>" class="s4-timer-number s">00</text>
          <text x="50%" y="65%" text-anchor="middle" dominant-baseline="middle" font-size="7.5" font-weight="500" fill="<?php echo esc_attr($timer_color); ?>" class="s4-timer-label-inside">SECS</text>
        </svg>
      </div>
    </div>

  </div>


</div>