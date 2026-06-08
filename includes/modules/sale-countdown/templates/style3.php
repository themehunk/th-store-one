<?php
if (! defined('ABSPATH')) {
    exit;
}
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
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
$format     = $settings['time_format'] ?? 'dhms';

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
$timer_bg    = $settings['single_timer_bg_color'] ?? '#222';
$timer_color = $settings['single_timer_color'] ?? '#fff';
$bar_color   = $settings['single_sold_bar_bg_color'] ?? '#ef4444';

/* VALIDATION */

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

<div class="th-cd th-style3 s1-align-<?php echo esc_attr($align); ?>"
     style="background: <?php echo esc_attr($bg); ?>; color: <?php echo esc_attr($text); ?>; padding:20px; border-radius:8px; <?php echo esc_attr($border_css); ?>;"
     data-start="<?php echo $start; ?>" 
     data-end="<?php echo $end; ?>"
     data-server-now="<?php echo esc_attr(time()); ?>"
     data-expire-action="<?php echo esc_attr($expire_action); ?>"
     data-expire-msg="<?php echo esc_attr($expire_msg); ?>"
     data-format="<?php echo esc_attr($time_format); ?>">

  <!-- MESSAGE -->
  <?php if ($show_msg && !empty($msg)) : ?>
    <div class="th-msg" style="color: <?php echo esc_attr($text); ?>;">
      <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <!-- TIMER BOX -->
  <div class="th-box-timer" style="display:flex; justify-content:center; gap:12px; margin-bottom:20px;">

    <?php if ($time_format === 'dhms') : ?>
      <div class="t-card" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
        <span class="d">00</span>
        <small class="label">DAYS</small>
      </div>
    <?php endif; ?>

    <div class="t-card" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
      <span class="h">00</span>
      <small class="label">HRS</small>
    </div>

    <div class="t-card" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
      <span class="m">00</span>
      <small class="label">MIN</small>
    </div>

    <div class="t-card" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
      <span class="s">00</span>
      <small class="label">SEC</small>
    </div>

  </div>

  <!-- STOCK BAR -->
  <?php if ($show_bar) : ?>

    <div class="th-bar"
         style="margin:auto; height:8px; width:60%; background:rgba(0,0,0,0.08); border-radius:6px; overflow:hidden;">
      
      <div class="th-fill"
           style="width: <?php echo esc_attr($percent); ?>%; height:100%; background: <?php echo esc_attr($bar_color); ?>; border-radius:6px;">
      </div>
    </div>

  <?php endif; ?>

</div>
<?php // phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound?>