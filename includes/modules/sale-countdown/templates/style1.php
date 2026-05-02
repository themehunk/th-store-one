<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$end   = $args['end'] ?? '';
$msg   = $args['msg'] ?? '';
$sold  = intval($args['sold'] ?? 0);
$remaining = intval($args['remaining'] ?? 0);
$percent = floatval($args['percent'] ?? 0);
$settings = $args['settings'] ?? [];

/* SETTINGS FLAGS */
$align    = $settings['alignmentSingle'] ?? 'center';
$show_msg = !empty($settings['show_message']);
$show_bar = !empty($settings['show_stock_bar']);

/*COLORS (same as React) */

$bg          = $settings['single_bg_color'] ?? '#111';
$text        = $settings['single_text_color'] ?? '#facc15';
$timer_bg    = $settings['single_timer_bg_color'] ?? '#222';
$timer_color = $settings['single_timer_color'] ?? '#fff';
$bar_color   = $settings['single_sold_bar_bg_color'] ?? 'linear-gradient(90deg, #22c55e, #f97316)';

/* SAFETY */
if ($percent <= 0 && ($sold + $remaining) > 0) {
    $total = $sold + $remaining;
    $percent = ($sold / $total) * 100;
}
?>

<div class="th-cd th-style1 s1-align-<?php echo esc_attr($align); ?>"
     data-end="<?php echo esc_attr($end); ?>"
     data-expire-action="<?php echo esc_attr($settings['countdown_expire_action'] ?? 'hide'); ?>"
     data-expire-msg="<?php echo esc_attr($settings['expire_message'] ?? 'Offer expired'); ?>"
     data-format="<?php echo esc_attr($settings['time_format'] ?? 'dhms'); ?>"
     style="background: <?php echo esc_attr($bg); ?>; color: <?php echo esc_attr($text); ?>;">

  <!-- MESSAGE -->
  <?php if ($show_msg && !empty($msg)) : ?>
    <div class="th-msg" style="color: <?php echo esc_attr($text); ?>;">
      <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <!-- TIMER -->
  <div class="th-timer-box">
    <div class="t-item" style="background: <?php echo esc_attr($timer_bg); ?>; color: <?php echo esc_attr($timer_color); ?>;">
      <span class="d">00</span>
      <small style="color: <?php echo esc_attr($timer_color); ?>;">DAYS</small>
    </div>
    <div class="t-item" style="background: <?php echo esc_attr($timer_bg); ?>; color: <?php echo esc_attr($timer_color); ?>;">
      <span class="h">00</span>
      <small style="color: <?php echo esc_attr($timer_color); ?>;">HRS</small>
    </div>
    <div class="t-item" style="background: <?php echo esc_attr($timer_bg); ?>; color: <?php echo esc_attr($timer_color); ?>;">
      <span class="m">00</span>
      <small style="color: <?php echo esc_attr($timer_color); ?>;">MIN</small>
    </div>
    <div class="t-item" style="background: <?php echo esc_attr($timer_bg); ?>; color: <?php echo esc_attr($timer_color); ?>;">
      <span class="s">00</span>
      <small style="color: <?php echo esc_attr($timer_color); ?>;">SEC</small>
    </div>
  </div>

  <!-- STOCK ROW (only if bar enabled) -->
  <?php if ($show_bar) : ?>
    <div class="th-stock-row">
      <span style="color: <?php echo esc_attr($text); ?>;">
        <?php echo esc_html($sold); ?> sold
      </span>
      <span style="color: <?php echo esc_attr($text); ?>;">
        <?php echo esc_html($remaining); ?> left
      </span>
    </div>
  <?php endif; ?>

  <!-- PROGRESS BAR -->
  <?php if ($show_bar) : ?>
    <div class="th-bar">
      <div class="th-fill" style="width: <?php echo esc_attr($percent); ?>%; background: <?php echo esc_attr($bar_color); ?>;"></div>
    </div>
  <?php endif; ?>

</div>