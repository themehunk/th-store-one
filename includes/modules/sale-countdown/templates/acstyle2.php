<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$end        = $args['end'] ?? '';
$msg        = $args['msg'] ?? '';
$sold       = $args['sold'] ?? null;
$remaining  = $args['remaining'] ?? null;
$percent    = floatval($args['percent'] ?? 0);
$settings   = $args['settings'] ?? [];
$format = $settings['time_format'] ?? 'dhms';

/* ================= DETECT PRODUCT DATA ================= */
$has_product_data  = !empty($end) || !empty($msg);
$has_product_stock = ($sold !== null && $remaining !== null);

/* ================= GLOBAL FALLBACK ================= */
if ( ! $has_product_data ) {

    $msg = $settings['sale_message'] ?? '';

    if ( ! empty($settings['end_countdown_datetime']) ) {
        $end = strtotime($settings['end_countdown_datetime']);
    }

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

/* ================= COLORS (same as React) ================= */
$bg          = $settings['archive_bg_color'] ?? '#f5f6f8';
$text        = $settings['archive_text_color'] ?? '#111';
$timer_bg    = $settings['archive_timer_bg_color'] ?? '#fff';
$timer_color = $settings['archive_timer_color'] ?? '#111';
$bar_color   = $settings['archive_sold_bar_bg_color'] ?? '#d63638';

/* ================= SAFETY ================= */
if ( $percent <= 0 && $has_product_stock && ($sold + $remaining) > 0 ) {
    $total = $sold + $remaining;
    $percent = ($sold / $total) * 100;
}
?>

<div class="th-cd th-ac th-ac2"
     style="background: <?php echo esc_attr($bg); ?>; color: <?php echo esc_attr($text); ?>; padding:8px; border-radius:6px;"
     data-end="<?php echo esc_attr($end); ?>"
     data-expire-action="<?php echo esc_attr($settings['countdown_expire_action'] ?? 'hide'); ?>"
     data-expire-msg="<?php echo esc_attr($settings['expire_message'] ?? 'Offer expired'); ?>"
     data-format="<?php echo esc_attr($settings['time_format'] ?? 'dhms'); ?>"
     data-text-color="<?php echo esc_attr($text); ?>">

  <!-- MESSAGE -->
  <?php if ( $show_msg ) : ?>
    <div class="th-msg" style="color: <?php echo esc_attr($text); ?>; margin-bottom:6px;">
      <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <!-- TIMER -->
  <?php if ( ! empty($end) ) : ?>
    <div class="th-timer-circles" style="display:flex; gap:8px; justify-content:center;">
<?php if ($format === 'dhms') : ?>
      <div class="t-box" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
        <span class="d">00</span><small>D</small>
      </div>
      <?php endif; ?>

      <div class="t-box" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
        <span class="h">00</span><small>H</small>
      </div>

      <div class="t-box" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
        <span class="m">00</span><small>M</small>
      </div>

      <div class="t-box" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
        <span class="s">00</span><small>S</small>
      </div>

    </div>
  <?php endif; ?>

  <!-- STOCK -->
  <?php if ($show_bar && ($args['sold']!== 0) ) : ?>
    <div class="th-stock-row" style="margin-top:6px; color: <?php echo esc_attr($text); ?>">
      <span><?php echo esc_html($sold); ?> <?php esc_html_e('sold', 'th-store-one'); ?></span>
      <span><?php echo esc_html($remaining); ?> <?php esc_html_e('left', 'th-store-one'); ?></span>
    </div>

    <div class="th-bar"
         style="margin-top:6px; height:6px; background:rgba(0,0,0,0.08); border-radius:6px; overflow:hidden;">
      
      <div class="th-fill"
           style="width: <?php echo esc_attr($percent); ?>%; background: <?php echo esc_attr($bar_color); ?>; height:100%; border-radius:6px;">
      </div>
    </div>
  <?php endif; ?>

</div>