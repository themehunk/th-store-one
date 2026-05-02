<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$end   = $args['end'] ?? '';
$msg   = $args['msg'] ?? '';
$sold  = intval($args['sold'] ?? 0);
$remaining = intval($args['remaining'] ?? 0);
$percent = floatval($args['percent'] ?? 0);
$settings = $args['settings'] ?? [];
 $format = $settings['time_format'] ?? 'dhms';
 $align    = $settings['alignmentArchive'] ?? 'center';

/* ================= DETECT SOURCE ================= */
$has_product_data = !empty($end) || !empty($msg);

/* ================= GLOBAL FALLBACK ================= */
if (!$has_product_data) {

    $msg = $settings['sale_message'] ?? '';

    if (!empty($settings['end_countdown_datetime'])) {
        $end = strtotime($settings['end_countdown_datetime']);
    }

    // no fake stock
    $sold = 0;
    $remaining = 0;
    $percent = 0;
}

/* ================= FLAGS ================= */
$show_msg = !empty($settings['show_message']) && !empty($msg);
$show_bar = !empty($settings['show_stock_bar']) && ($sold > 0 || $remaining > 0);

/* ================= COLORS ================= */
$bg          = $settings['archive_bg_color'] ?? '#fff';
$text        = $settings['archive_text_color'] ?? '#d63638';
$timer_color = $settings['archive_timer_color'] ?? '#111';
$bar_color   = $settings['archive_sold_bar_bg_color'] ?? '#d63638';

/* ================= SAFETY ================= */
if ($percent <= 0 && ($sold + $remaining) > 0) {
    $total = $sold + $remaining;
    $percent = ($sold / $total) * 100;
}
?>

<div class="th-cd th-ac th-ac1 s1-align-<?php echo esc_attr($align); ?>"
     style="background: <?php echo esc_attr($bg); ?>;  ; padding:8px; border-radius:6px;"
     data-end="<?php echo esc_attr($end); ?>"
     data-expire-action="<?php echo esc_attr($settings['countdown_expire_action'] ?? 'hide'); ?>"
     data-expire-msg="<?php echo esc_attr($settings['expire_message'] ?? 'Offer expired'); ?>"
     data-format="<?php echo esc_attr($settings['time_format'] ?? 'dhms'); ?>"
     data-text-color="<?php echo esc_attr($text); ?>">

  <!-- MESSAGE -->
  <?php if ($show_msg) : ?>
    <div class="th-msg" style="font-size:14px;display:flex; justify-content:<?php echo esc_attr($align); ?>; align-items:center; gap:6px; color: <?php echo esc_attr($text); ?>;">

      <!-- ICON -->
      <span class="th-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="<?php echo esc_attr($text); ?>" stroke-width="2"/>
          <path d="M12 6v6l4 2" stroke="<?php echo esc_attr($text); ?>" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>

      <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <!-- TIMER -->
  <?php if (!empty($end)) : ?>
    <div class="th-timer-inline"
         style="color: <?php echo esc_attr($timer_color); ?>; margin-top:4px;">

      <?php if ($format === 'dhms') : ?>
    <span class="d">00</span>d :
  <?php endif; ?>
      <span class="h">00</span>h :
      <span class="m">00</span>m :
      <span class="s">00</span>s
    </div>
  <?php endif; ?>

  <!-- STOCK -->
  <?php if ($show_bar && ($args['sold']!== 0) ) : ?>
    <div class="th-stock-row" style="margin-top:4px; color: <?php echo esc_attr($text); ?>">
      <span><?php echo esc_html($sold); ?> sold</span>
      <span><?php echo esc_html($remaining); ?> left</span>
    </div>

    <div class="th-bar"
         style="margin-top:6px; height:6px; background:rgba(0,0,0,0.08); border-radius:6px; overflow:hidden;">

      <div class="th-fill"
           style="width: <?php echo esc_attr($percent); ?>%; background: <?php echo esc_attr($bar_color); ?>; height:100%; border-radius:6px;">
      </div>
    </div>
  <?php endif; ?>

</div>