<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$end   = $args['end'] ?? '';
$msg   = $args['msg'] ?? '';
$sold  = intval($args['sold'] ?? 0);
$remaining = intval($args['remaining'] ?? 0);
$percent = floatval($args['percent'] ?? 0);
$settings = $args['settings'] ?? [];

/* SETTINGS */
$show_msg = isset($settings['show_message']) ? $settings['show_message'] : true;
$show_bar = isset($settings['show_stock_bar']) ? $settings['show_stock_bar'] : true;

$expire_action = $settings['countdown_expire_action'] ?? 'hide';
$expire_msg = $settings['expire_message'] ?? 'Offer expired';
$time_format = $settings['time_format'] ?? 'hms';

/* PERCENT FIX */
if ($percent <= 0 && ($sold + $remaining) > 0) {
    $total = $sold + $remaining;
    $percent = ($sold / $total) * 100;
}

/* FALLBACK */
if ($percent <= 0) {
    $percent = 60;
}
?>

<div class="th-cd th-style4"
     data-end="<?php echo esc_attr($end); ?>"
     data-expire-action="<?php echo esc_attr($expire_action); ?>"
     data-expire-msg="<?php echo esc_attr($expire_msg); ?>"
     data-format="<?php echo esc_attr($time_format); ?>">

  <div class="th-inner">

    <!-- MESSAGE -->
    <?php if ($show_msg && !empty($msg)) : ?>
      <div class="th-msg">
        <?php echo esc_html($msg); ?>
      </div>
    <?php endif; ?>

    <!-- TIMER -->
    <div class="th-timer-inline">

      <?php if ($time_format === 'dhms') : ?>
        <span class="d">00</span>d&nbsp;
      <?php endif; ?>

      <span class="h">00</span>h&nbsp;
      <span class="m">00</span>m&nbsp;
      <span class="s">00</span>s

    </div>

    <!-- BAR -->
    <?php if ($show_bar) : ?>
      <div class="th-bar">
        <div class="th-fill" style="width: <?php echo esc_attr($percent); ?>%"></div>
      </div>
    <?php endif; ?>

  </div>

</div>