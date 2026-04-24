<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/* ================= REGISTER MODULE ================= */
add_filter('th_store_one_modules', function($modules){

    $modules['sale-countdown'] = [
        'title' => esc_html__('Sale Countdown', 'th-store-one'),
        'render' => function($post){
            do_action('th_store_one_countdown_panel', $post);
        }
    ];

    return $modules;

}, 10);


/* ================= UI ================= */
add_action('th_store_one_countdown_panel', function($post){

    $product = function_exists('wc_get_product') ? wc_get_product($post->ID) : null;
    $is_variable = $product && $product->is_type('variable');

    $enable = get_post_meta($post->ID, '_th_countdown_enable', true);
    $start  = get_post_meta($post->ID, '_th_countdown_start', true);
    $end    = get_post_meta($post->ID, '_th_countdown_end', true);
    $msg    = get_post_meta($post->ID, '_th_countdown_msg', true);

    $discount = get_post_meta($post->ID, '_th_discount_qty', true);
    $sold     = get_post_meta($post->ID, '_th_sold_qty', true);
    $global   = get_post_meta($post->ID, '_th_variation_global', true);

    $now = current_time('timestamp');

$start_val = $start ? date('Y-m-d H:i', $start) : date('Y-m-d H:i', $now);
$end_val   = $end ? date('Y-m-d H:i', $end) : date('Y-m-d H:i', strtotime('+1 day', $now));
?>

<div class="th-box th-s1-countdown">

    <div class="th-field">
    <label><?php esc_html_e('Enable Countdown', 'th-store-one'); ?></label>

    <div class="th-toggle-wrap">
        <label class="th-switch">
            <input type="checkbox"
                name="th_countdown_enable"
                value="yes"
                <?php checked($enable,'yes'); ?>>
            <span class="th-slider"></span>
        </label>
    </div>
    </div>
    <!-- GLOBAL OPTION -->
   <?php if($is_variable): ?>
   <div class="th-field">
    <label><?php esc_html_e('Apply to all variations', 'th-store-one'); ?><?php echo function_exists('wc_help_tip') ? wc_help_tip('Same countdown will be used for all variations') : ''; ?></label>
    <div class="th-toggle-wrap">
        <label class="th-switch">
            <input type="checkbox"
                name="th_variation_global"
                value="yes"
                <?php checked($global,'yes'); ?>>
            <span class="th-slider"></span>
        </label>
    </div>
</div>
<?php endif; ?>
    <!-- DATES -->
    <div style="display:flex; gap:15px;">
        <div class="th-field">
            <label><?php esc_html_e('Start Date', 'th-store-one'); ?></label>
            <input type="text" class="th-datetime" name="th_countdown_start"
                value="<?php echo esc_attr($start_val); ?>">
        </div>
        <div class="th-field">
            <label><?php esc_html_e('End Date', 'th-store-one'); ?></label>
            <input type="text" class="th-datetime" name="th_countdown_end"
                value="<?php echo esc_attr($end_val); ?>">
        </div>
    </div>
    
    <!-- QTY -->
    <div style="display:flex; gap:15px;">
        <div class="th-field">
            <label>
                <?php esc_html_e('Discount Qty', 'th-store-one'); ?>
                <?php echo function_exists('wc_help_tip') ? wc_help_tip('Discount stock amount') : ''; ?>
            </label>
            <input type="number" name="th_discount_qty"
                value="<?php echo esc_attr($discount); ?>">
        </div>
        <div class="th-field">
            <label>
                <?php esc_html_e('Sold Qty', 'th-store-one'); ?>
                <?php echo function_exists('wc_help_tip') ? wc_help_tip('Already sold items') : ''; ?>
            </label>
            <input type="number" name="th_sold_qty"
                value="<?php echo esc_attr($sold); ?>">
        </div>
    </div>
    <!-- MESSAGE -->
    <div class="th-field">
        <label><?php esc_html_e('Message', 'th-store-one'); ?></label>
        <input type="text" name="th_countdown_msg"
            value="<?php echo esc_attr($msg); ?>"
            placeholder="Hurry! Offer ends soon">
    </div>
</div>

<?php
});


/* ================= SAVE ================= */
add_action('save_post_product', function($post_id){

    if (
        ! isset($_POST['th_store_one_nonce']) ||
        ! wp_verify_nonce($_POST['th_store_one_nonce'], 'th_store_one_save')
    ) return;

    if ( defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) return;

    update_post_meta($post_id, '_th_countdown_enable',
        isset($_POST['th_countdown_enable']) ? 'yes' : 'no'
    );

    $start = sanitize_text_field($_POST['th_countdown_start'] ?? '');
    $end   = sanitize_text_field($_POST['th_countdown_end'] ?? '');

    update_post_meta($post_id, '_th_countdown_start', $start ? strtotime($start) : '');
    update_post_meta($post_id, '_th_countdown_end', $end ? strtotime($end) : '');

    update_post_meta($post_id, '_th_countdown_msg',
        sanitize_text_field($_POST['th_countdown_msg'] ?? '')
    );

    update_post_meta($post_id, '_th_discount_qty',
        intval($_POST['th_discount_qty'] ?? 0)
    );

    update_post_meta($post_id, '_th_sold_qty',
        intval($_POST['th_sold_qty'] ?? 0)
    );

    update_post_meta($post_id, '_th_variation_global',
        isset($_POST['th_variation_global']) ? 'yes' : 'no'
    );
});


/* ================= VARIATION FIELDS ================= */
add_action('woocommerce_product_after_variable_attributes', function($loop, $variation_data, $variation){

    $vid = $variation->ID;

    $discount = get_post_meta($vid, '_th_discount_qty', true);
    $sold     = get_post_meta($vid, '_th_sold_qty', true);

    $start = get_post_meta($vid, '_th_countdown_start', true);
    $end   = get_post_meta($vid, '_th_countdown_end', true);
    $msg   = get_post_meta($vid, '_th_countdown_msg', true);

    $now = current_time('timestamp');

$start_val = $start ? date('Y-m-d H:i', $start) : date('Y-m-d H:i', $now);
$end_val   = $end ? date('Y-m-d H:i', $end) : date('Y-m-d H:i', strtotime('+1 day', $now));
?>

<div class="th-variation-box" style="margin-top:10px; padding:12px; border:1px solid #ddd; border-radius:6px;">

    <p><strong><?php esc_html_e('Countdown Settings', 'th-store-one'); ?></strong></p>

    <!-- DATE -->
    <div style="display:flex; gap:10px;">
        <p class="form-row form-row-first">
            <label>
                <?php esc_html_e('Start Date', 'th-store-one'); ?>
                <?php echo function_exists('wc_help_tip') ? wc_help_tip('Countdown start time') : ''; ?>
            </label>
            <input type="text"
                class="th-datetime"
                name="th_countdown_start_var[<?php echo $loop; ?>]"
                value="<?php echo esc_attr($start_val); ?>">
        </p>

        <p class="form-row form-row-last">
            <label>
                <?php esc_html_e('End Date', 'th-store-one'); ?>
                <?php echo function_exists('wc_help_tip') ? wc_help_tip('Countdown end time') : ''; ?>
            </label>
            <input type="text"
                class="th-datetime"
                name="th_countdown_end_var[<?php echo $loop; ?>]"
                value="<?php echo esc_attr($end_val); ?>">
        </p>
    </div>

    <!-- MESSAGE -->
    <p class="form-row form-row-full">
        <label>
            <?php esc_html_e('Message', 'th-store-one'); ?>
        </label>
        <input type="text"
            name="th_countdown_msg_var[<?php echo $loop; ?>]"
            value="<?php echo esc_attr($msg); ?>"
            placeholder="Hurry! Offer ends soon">
    </p>

    <!-- QTY -->
    <div style="display:flex; gap:10px;">
        <p class="form-row form-row-first">
            <label>
                <?php esc_html_e('Discount Qty', 'th-store-one'); ?>
                <?php echo function_exists('wc_help_tip') ? wc_help_tip('Discount stock amount') : ''; ?>
            </label>
            <input type="number"
                class="th_discount_qty"
                name="th_discount_qty_var[<?php echo $loop; ?>]"
                value="<?php echo esc_attr($discount); ?>">
        </p>

        <p class="form-row form-row-last">
            <label>
                <?php esc_html_e('Sold Qty', 'th-store-one'); ?>
                <?php echo function_exists('wc_help_tip') ? wc_help_tip('Already sold items') : ''; ?>
            </label>
            <input type="number"
                class="th_sold_qty"
                name="th_sold_qty_var[<?php echo $loop; ?>]"
                value="<?php echo esc_attr($sold); ?>">
        </p>
    </div>

</div>

<?php
}, 10, 3);


/* ================= VARIATION SAVE ================= */
add_action('woocommerce_save_product_variation', function($variation_id, $loop){

    $start = sanitize_text_field($_POST['th_countdown_start_var'][$loop] ?? '');
    $end   = sanitize_text_field($_POST['th_countdown_end_var'][$loop] ?? '');

    update_post_meta($variation_id, '_th_countdown_start', $start ? strtotime($start) : '');
    update_post_meta($variation_id, '_th_countdown_end', $end ? strtotime($end) : '');

    update_post_meta($variation_id, '_th_countdown_msg',
        sanitize_text_field($_POST['th_countdown_msg_var'][$loop] ?? '')
    );

    update_post_meta($variation_id, '_th_discount_qty',
        intval($_POST['th_discount_qty_var'][$loop] ?? 0)
    );

    update_post_meta($variation_id, '_th_sold_qty',
        intval($_POST['th_sold_qty_var'][$loop] ?? 0)
    );

}, 10, 2);


/* ================= ENQUEUE ================= */
add_action('admin_enqueue_scripts', function($hook){

    global $post;

    if ($hook !== 'post.php' && $hook !== 'post-new.php') return;
    if (isset($post) && $post->post_type !== 'product') return;

    wp_enqueue_script('jquery-ui-datepicker');

    wp_enqueue_script(
        'th-timepicker',
        TH_STORE_ONE_PLUGIN_URL . '/assets/js/datetimepicker/timepicker.js',
        ['jquery','jquery-ui-datepicker'],
        '1.6.3',
        true
    );

    wp_enqueue_style(
        'th-timepicker-css',
        TH_STORE_ONE_PLUGIN_URL . '/assets/css/datetimepicker/timepicker.css'
    );

    wp_enqueue_script(
        'th-countdown-admin',
        TH_STORE_ONE_PLUGIN_URL . '/assets/js/th-store-sale-countdown-admin.js',
        ['jquery','th-timepicker'],
        '1.0',
        true
    );
});