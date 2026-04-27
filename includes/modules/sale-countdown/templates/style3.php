<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$end   = $args['end'] ?? '';
$msg   = $args['msg'] ?? '';
$settings = $args['settings'] ?? [];

/* SETTINGS */
$show_msg = !empty($settings['show_message']);
$expire_action = $settings['countdown_expire_action'] ?? 'hide';
$expire_msg = $settings['expire_message'] ?? 'Offer expired';
$time_format = $settings['time_format'] ?? 'hms';
?>

<div class="th-cd th-style3"
     data-end="<?php echo esc_attr($end); ?>"
     data-expire-action="<?php echo esc_attr($expire_action); ?>"
     data-expire-msg="<?php echo esc_attr($expire_msg); ?>"
     data-format="<?php echo esc_attr($time_format); ?>">

  <!-- MESSAGE -->
  <?php if ($show_msg && !empty($msg)) : ?>
    <div class="th-msg">
      <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <!-- TIMER BOX -->
  <div class="th-box-timer">

    <?php if ($time_format === 'dhms') : ?>
      <div class="t-card">
        <span class="d">00</span>
        <span class="label">DAYS</span>
      </div>
    <?php endif; ?>

    <div class="t-card">
      <span class="h">00</span>
      <span class="label">HRS</span>
    </div>

    <div class="t-card">
      <span class="m">00</span>
      <span class="label">MIN</span>
    </div>

    <div class="t-card">
      <span class="s">00</span>
      <span class="label">SEC</span>
    </div>

  </div>

</div>