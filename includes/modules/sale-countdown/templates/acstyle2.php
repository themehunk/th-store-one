<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$end        = $args['end'] ?? '';
$msg        = $args['msg'] ?? '';
$sold       = $args['sold'] ?? null;
$remaining  = $args['remaining'] ?? null;
$percent    = floatval($args['percent'] ?? 0);
$settings   = $args['settings'] ?? [];

/* ================= DETECT PRODUCT DATA ================= */
$has_product_data  = !empty($end) || !empty($msg);
$has_product_stock = ($sold !== null && $remaining !== null);

/* ================= GLOBAL FALLBACK ================= */
if ( ! $has_product_data ) {

    $msg = $settings['sale_message'] ?? '';

    if ( ! empty($settings['end_countdown_datetime']) ) {
        $end = strtotime($settings['end_countdown_datetime']);
    }

    // don't fake stock
    $sold = null;
    $remaining = null;
    $percent = 0;
}

/* ================= NORMALIZE END ================= */
if ( ! is_numeric($end) && ! empty($end) ) {
    $end = strtotime($end);
}

/* ================= FLAGS ================= */
$show_msg = ! empty($settings['show_message']) && ! empty($msg);

$show_bar = (
    ! empty($settings['show_stock_bar']) &&
    $has_product_stock &&
    ($sold > 0 || $remaining > 0)
);

/* ================= SAFETY ================= */
if ( $percent <= 0 && $has_product_stock && ($sold + $remaining) > 0 ) {
    $total = $sold + $remaining;
    $percent = ($sold / $total) * 100;
}
?>

<div class="th-cd th-ac th-ac2"
     data-end="<?php echo esc_attr($end); ?>"
     data-expire-action="<?php echo esc_attr($settings['countdown_expire_action'] ?? 'hide'); ?>"
     data-expire-msg="<?php echo esc_attr($settings['expire_message'] ?? 'Offer expired'); ?>"
     data-format="<?php echo esc_attr($settings['time_format'] ?? 'dhms'); ?>">

  <!-- MESSAGE -->
  <?php if ( $show_msg ) : ?>
    <div class="th-msg">
      <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <!-- TIMER -->
  <?php if ( ! empty($end) ) : ?>
    <div class="th-timer-circles">
      <div class="t-box"><span class="d">00</span><small>D</small></div>
      <div class="t-box"><span class="h">00</span><small>H</small></div>
      <div class="t-box"><span class="m">00</span><small>M</small></div>
      <div class="t-box"><span class="s">00</span><small>S</small></div>
    </div>
  <?php endif; ?>

  <!-- STOCK -->
  <?php if ( $show_bar && ($args['sold']!== 0) ) : ?>
    <div class="th-stock-row">
      <span><?php echo esc_html($sold); ?> <?php esc_html_e('sold', 'th-store-one'); ?></span>
      <span><?php echo esc_html($remaining); ?> <?php esc_html_e('left', 'th-store-one'); ?></span>
    </div>

    <div class="th-bar">
      <div class="th-fill" style="width: <?php echo esc_attr($percent); ?>%"></div>
    </div>
  <?php endif; ?>

</div>