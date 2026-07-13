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

$settings = $args['settings'] ?? [];
$sold  = intval($args['sold'] ?? 0);
$remaining = intval($args['remaining'] ?? 0);
$percent = floatval($args['percent'] ?? 0);


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
$show_bar   = !empty($settings['show_stock_bar']);

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

$icon = th_store_one_get_countdown_icon(
    $settings['selected_icon'] ?? 'none'
);
?>

<div class="th-cd th-ac th-ac1 s1-align-<?php echo esc_attr($align); ?>"
     style="background: <?php echo esc_attr($bg); ?>;  ; padding:8px; border-radius:6px;"
     data-start="<?php echo $start; ?>" 
     data-end="<?php echo $end; ?>"
     data-server-now="<?php echo esc_attr(time()); ?>"
     data-expire-action="<?php echo esc_attr($settings['countdown_expire_action'] ?? 'hide'); ?>"
     data-expire-msg="<?php echo esc_attr($settings['expire_message'] ?? 'Offer expired'); ?>"
     
     data-text-color="<?php echo esc_attr($text); ?>">

  <!-- MESSAGE -->
  <?php if ($show_msg) : ?>
    <div class="th-msg" style="font-size:14px;display:flex; justify-content:<?php echo esc_attr($align); ?>; align-items:center; gap:6px; color: <?php echo esc_attr($text); ?>;">

      <?php if (!empty($icon)) : ?>
        <span class="th-msg-icon"><?php echo esc_html($icon); ?></span>
    <?php endif; ?>

      <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <!-- TIMER -->
  <?php if (!empty($end)) : ?>
    <div class="th-timer-inline"
         style="color: <?php echo esc_attr($timer_color); ?>; margin-top:4px;">

      <div class="th-days-wrapper" style="display: none;">
    <span class="d">00</span>d :
  </div>
      <span class="h">00</span>h :
      <span class="m">00</span>m :
      <span class="s">00</span>s
    </div>
  <?php endif; ?>

  <!-- STOCK -->
  <?php if ($show_bar) : ?>
  

    <div class="th-bar"
         style="margin-top:6px; height:6px; background:rgba(0,0,0,0.08); border-radius:6px; overflow:hidden;">

      <div class="th-fill"
           style="width: <?php echo esc_attr($percent); ?>%; background: <?php echo esc_attr($bar_color); ?>; height:100%; border-radius:6px;">
      </div>
    </div>
  <?php endif; ?>

</div>
<?php // phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound?>