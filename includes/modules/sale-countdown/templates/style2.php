<?php
if (! defined('ABSPATH')) {
    exit;
}
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
$end   = $args['end'] ?? '';
$msg   = $args['msg'] ?? '';
$sold  = intval($args['sold'] ?? 0);
$remaining = intval($args['remaining'] ?? 0);
$percent = floatval($args['percent'] ?? 0);
$settings = $args['settings'] ?? [];

/* SETTINGS */
$align          = $settings['alignmentSingle'] ?? 'center';
$show_msg = !empty($settings['show_message']);
$show_bar = !empty($settings['show_stock_bar']);
$expire_action = $settings['countdown_expire_action'] ?? 'hide';
$expire_msg = $settings['expire_message'] ?? 'Offer expired';
$time_format = $settings['time_format'] ?? 'hms';

/*COLORS (same as React) */
$bg          = $settings['single_bg_color'] ?? '#ffffff';
$text        = $settings['single_text_color'] ?? '#111';
$timer_color = $settings['single_timer_color'] ?? '#111';
$bar_color   = $settings['single_sold_bar_bg_color'] ?? '#ef4444';

/* VALIDATION */
$has_stock_data = ($sold > 0 || $remaining > 0);

/* SAFETY */
if ($percent <= 0 && $has_stock_data) {
    $total = $sold + $remaining;
    if ($total > 0) {
        $percent = ($sold / $total) * 100;
    }
}
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

?>

<div class="th-cd th-style2 s1-align-<?php echo esc_attr($align); ?>"
     style="background: <?php echo esc_attr($bg); ?>; color: <?php echo esc_attr($text); ?>; padding:10px; <?php echo esc_attr($border_css); ?>"
     data-end="<?php echo esc_attr($end); ?>"
     data-expire-action="<?php echo esc_attr($expire_action); ?>"
     data-expire-msg="<?php echo esc_attr($expire_msg); ?>"
     data-format="<?php echo esc_attr($time_format); ?>"
     >

  <!-- INLINE ROW -->
  <div class="th-inline-wrap" style="display:flex; align-items:center;  gap:8px; font-size:13px;">

    <!-- MESSAGE + ICON -->
    <?php if ($show_msg && !empty($msg)) : ?>
      <span class="th-msg" style="display:flex; align-items:center; gap:6px; color: <?php echo esc_attr($text); ?>;">

        <!-- ICON -->
        <span class="th-icon" style="display:flex;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="<?php echo esc_attr($text); ?>" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="<?php echo esc_attr($text); ?>" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>

        <?php echo esc_html($msg); ?>
      </span>
    <?php endif; ?>

    <!-- TIMER -->
    <span class="th-timer-inline" style="font-weight:600; color: <?php echo esc_attr($timer_color); ?>;">

      <?php if ($time_format === 'dhms') : ?>
        <span class="d">00</span><span class="sep">:</span>
      <?php endif; ?>

      <span class="h">00</span>
      <span class="sep">:</span>
      <span class="m">00</span>
      <span class="sep">:</span>
      <span class="s">00</span>
    </span>

  </div>

  <!-- STOCK BAR -->
  <?php if ($show_bar && $has_stock_data) : ?>

    <div class="th-bar"
         style="margin:8px auto 0; height:6px; width:200px; background:rgba(0,0,0,0.08); border-radius:6px; overflow:hidden;">
      
      <div class="th-fill"
           style="width: <?php echo esc_attr($percent); ?>%; height:100%; background: <?php echo esc_attr($bar_color); ?>; border-radius:6px;">
      </div>
    </div>

    <!-- STOCK TEXT -->
    <div style="font-size:14px; margin-top:4px; opacity:0.7; text-align:<?php echo esc_attr($align); ?>; color: <?php echo esc_attr($text); ?>">
      <?php echo esc_html($sold); ?> sold • <?php echo esc_html($remaining); ?> left
    </div>

  <?php endif; ?>

</div>
<?php // phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound?>