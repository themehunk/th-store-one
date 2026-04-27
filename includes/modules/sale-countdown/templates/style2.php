<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$end   = $args['end'] ?? '';
$msg   = $args['msg'] ?? '';
$sold  = intval($args['sold'] ?? 0);
$remaining = intval($args['remaining'] ?? 0);
$percent = floatval($args['percent'] ?? 0);
$settings = $args['settings'] ?? [];

/* SETTINGS */
$show_msg = !empty($settings['show_message']);
$show_bar = !empty($settings['show_stock_bar']);
$expire_action = $settings['countdown_expire_action'] ?? 'hide';
$expire_msg = $settings['expire_message'] ?? 'Offer expired';
$time_format = $settings['time_format'] ?? 'hms';

/* VALIDATION */
$has_stock_data = ($sold > 0 || $remaining > 0);

/* SAFETY */
if ($percent <= 0 && $has_stock_data) {
    $total = $sold + $remaining;
    if ($total > 0) {
        $percent = ($sold / $total) * 100;
    }
}
?>

<div class="th-cd th-style2"
     data-end="<?php echo esc_attr($end); ?>"
     data-expire-action="<?php echo esc_attr($expire_action); ?>"
     data-expire-msg="<?php echo esc_attr($expire_msg); ?>"
     data-format="<?php echo esc_attr($time_format); ?>">

  <!-- INLINE ROW -->
  <div class="th-inline-wrap">

    <?php if ($show_msg && !empty($msg)) : ?>
      <span class="th-msg">
        <?php echo esc_html($msg); ?>
      </span>
    <?php endif; ?>

    <span class="th-timer-inline">

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

    <div class="th-stock-row">
      <span><?php echo esc_html($sold); ?> sold</span>
      <span><?php echo esc_html($remaining); ?> left</span>
    </div>

    <div class="th-bar">
      <div class="th-fill" style="width: <?php echo esc_attr($percent); ?>%"></div>
    </div>

  <?php endif; ?>

</div>