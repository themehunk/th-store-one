<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$end   = $args['end'] ?? '';
$msg   = $args['msg'] ?? '';
$sold  = $args['sold'] ?? 0;
$remaining = $args['remaining'] ?? 0;
$percent = floatval($args['percent'] ?? 0);
$settings = $args['settings'] ?? [];

/* ================= DETECT SOURCE ================= */
$has_product_data = !empty($end) || !empty($msg);

/* ================= GLOBAL FALLBACK ================= */
if (!$has_product_data) {

    // message fallback
    $msg = $settings['sale_message'] ?? '';

    // end fallback
    if (!empty($settings['end_countdown_datetime'])) {
        $end = strtotime($settings['end_countdown_datetime']);
    }

    //DO NOT fake stock if not set
    $sold = 0;
    $remaining = 0;
    $percent = 0;
}

/* ================= FLAGS ================= */
$show_msg = !empty($settings['show_message']) && !empty($msg);
$show_bar = !empty($settings['show_stock_bar']) && $has_product_data;

/* ================= SAFETY ================= */
if ($percent <= 0 && ($sold + $remaining) > 0) {
    $total = $sold + $remaining;
    $percent = ($sold / $total) * 100;
}
?>

<div class="th-cd th-ac th-ac1"
     data-end="<?php echo esc_attr($end); ?>"
     data-expire-action="<?php echo esc_attr($settings['countdown_expire_action'] ?? 'hide'); ?>"
     data-expire-msg="<?php echo esc_attr($settings['expire_message'] ?? 'Offer expired'); ?>"
     data-format="<?php echo esc_attr($settings['time_format'] ?? 'dhms'); ?>">

  <!-- MESSAGE -->
  <?php if ($show_msg) : ?>
    <div class="th-msg">
      <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <!-- TIMER -->
  <?php if (!empty($end)) : ?>
    <div class="th-timer-inline">
      <span class="d">00</span>d :
      <span class="h">00</span>h :
      <span class="m">00</span>m :
      <span class="s">00</span>s
    </div>
  <?php endif; 
?>
  <!-- STOCK (ONLY IF PRODUCT DATA EXISTS) -->
  <?php if ($show_bar && ($args['sold']!== 0) ) : ?>
    <div class="th-stock-row">
      <span><?php echo esc_html($sold); ?> sold</span>
      <span><?php echo esc_html($remaining); ?> left</span>
    </div>

    <div class="th-bar">
      <div class="th-fill" style="width: <?php echo esc_attr($percent); ?>%"></div>
    </div>
  <?php endif; ?>

</div>