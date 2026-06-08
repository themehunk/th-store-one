<?php
if (! defined('ABSPATH')) {
    exit;
}
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
$start    = (int) $args['start'];
$end      = (int) $args['end'];
$sold       = $args['sold'] ?? null;
$remaining  = $args['remaining'] ?? null;
$percent    = floatval($args['percent'] ?? 0);
$settings   = $args['settings'] ?? [];
$format = $settings['time_format'] ?? 'dhms';
$align    = $settings['alignmentArchive'] ?? 'center';

/* ================= DETECT PRODUCT DATA ================= */
$has_product_data  = ! empty($end) || ! empty($msg);
$has_product_stock = ($sold !== null && $remaining !== null);

/* ================= GLOBAL FALLBACK ================= */
if (! $has_product_data) {

    $msg = $settings['sale_message'] ?? '';

    if (! empty($settings['end_countdown_datetime'])) {
        $end = strtotime($settings['end_countdown_datetime']);
    }

    $sold = null;
    $remaining = null;
    $percent = 0;
}

/* ================= NORMALIZE END ================= */
if (! is_numeric($end) && ! empty($end)) {
    $end = strtotime($end);
}

/* ================= FLAGS ================= */
$show_msg = ! empty($settings['show_message']) && ! empty($msg);

$show_bar   = !empty($settings['enable_stock_bar']) || !empty($settings['show_stock_bar']);

/* ================= COLORS ================= */
$bg          = $settings['archive_bg_color'] ?? '#ffffff';
$text        = $settings['archive_text_color'] ?? '#d63638';
$timer_bg    = $settings['archive_timer_bg_color'] ?? '#f5f6f8';
$timer_color = $settings['archive_timer_color'] ?? '#111';
$bar_color   = $settings['archive_sold_bar_bg_color'] ?? '#d63638';

/* ================= SAFETY ================= */
if ($percent <= 0 && $has_product_stock && ($sold + $remaining) > 0) {
    $total = $sold + $remaining;
    $percent = ($sold / $total) * 100;
}
?>

<div class="th-cd th-ac th-ac3 s1-align-<?php echo esc_attr($align); ?>"
     style="background: <?php echo esc_attr($bg); ?>; color: <?php echo esc_attr($text); ?>; padding:8px; border-radius:8px;"
     data-start="<?php echo $start; ?>" 
     data-end="<?php echo $end; ?>"
     data-server-now="<?php echo esc_attr(time()); ?>"
     data-expire-action="<?php echo esc_attr($settings['countdown_expire_action'] ?? 'hide'); ?>"
     data-expire-msg="<?php echo esc_attr($settings['expire_message'] ?? 'Offer expired'); ?>"
     data-format="<?php echo esc_attr($settings['time_format'] ?? 'dhms'); ?>"
     data-text-color="<?php echo esc_attr($text); ?>">

  <!-- MESSAGE -->
  <?php if ($show_msg) : ?>
    <div class="th-msg" style="margin-bottom:8px; color: <?php echo esc_attr($text); ?>;">
      <?php echo esc_html($msg); ?>
    </div>
  <?php endif; ?>

  <!-- TIMER -->
  <?php if (! empty($end)) : ?>
    <div class="th-timer-boxes"
         style="display:flex; justify-content:<?php echo esc_attr($align); ?>; gap:12px; margin-bottom:8px;">
<?php if ($format === 'dhms') : ?>
      <div class="t-box" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
        <span class="d">00</span><small><?php esc_html_e('D', 'th-store-one'); ?></small>
      </div>
      <?php endif; ?>

      <div class="t-box" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
        <span class="h">00</span><small><?php esc_html_e('H', 'th-store-one'); ?></small>
      </div>

      <div class="t-box" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
        <span class="m">00</span><small><?php esc_html_e('M', 'th-store-one'); ?></small>
      </div>

      <div class="t-box" style="background:<?php echo esc_attr($timer_bg); ?>; color:<?php echo esc_attr($timer_color); ?>;">
        <span class="s">00</span><small><?php esc_html_e('S', 'th-store-one'); ?></small>
      </div>

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