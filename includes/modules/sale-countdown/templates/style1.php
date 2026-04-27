<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$end   = $args['end'] ?? '';
$msg   = $args['msg'] ?? '';
$sold  = intval($args['sold'] ?? 0);
$remaining = intval($args['remaining'] ?? 0);
$percent = floatval($args['percent'] ?? 0);
$settings = $args['settings'] ?? [];

/* SETTINGS FLAGS */
$show_msg = !empty($settings['show_message']);
$show_bar = !empty($settings['show_stock_bar']);

/* SAFETY */
if ($percent <= 0 && ($sold + $remaining) > 0) {
    $total = $sold + $remaining;
    $percent = ($sold / $total) * 100;
}
?>

<div class="th-cd th-style1" class="th-cd th-style1"
     data-end="<?php echo esc_attr($end); ?>"
     data-expire-action="<?php echo esc_attr($settings['countdown_expire_action'] ?? 'hide'); ?>"
     data-expire-msg="<?php echo esc_attr($settings['expire_message'] ?? 'Offer expired'); ?>"
     data-format="<?php echo esc_attr($settings['time_format'] ?? 'dhms'); ?>">

  <!-- MESSAGE -->
  <?php if ($show_msg && !empty($msg)) : ?>
    <div class="th-msg">
      <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <!-- TIMER -->
  <div class="th-timer-box">
    <div class="t-item"><span class="d">00</span><small>DAYS</small></div>
    <div class="t-item"><span class="h">00</span><small>HRS</small></div>
    <div class="t-item"><span class="m">00</span><small>MIN</small></div>
    <div class="t-item"><span class="s">00</span><small>SEC</small></div>
  </div>

  <!-- STOCK ROW (only if bar enabled) -->
  <?php if ($show_bar) : ?>
    <div class="th-stock-row">
      <span><?php echo esc_html($sold); ?> sold</span>
      <span><?php echo esc_html($remaining); ?> left</span>
    </div>
  <?php endif; ?>

  <!-- PROGRESS BAR -->
  <?php if ($show_bar) : ?>
    <div class="th-bar">
      <div class="th-fill" style="width: <?php echo esc_attr($percent); ?>%"></div>
    </div>
  <?php endif; ?>

</div>