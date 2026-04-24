<?php
if (!defined('ABSPATH')) exit;

class Th_Store_One_Sale_Notification_Frontend {

    private $rules = [];

    public function __construct() {

        $modules = get_option('th_store_one_module_option', []);
        if (empty($modules['sale-notification'])) return;

        $all = get_option('th_store_one_module_set', []);
        $this->rules = $all['sale-notification']['rules'] ?? [];

        if (empty($this->rules)) return;

        add_action('wp_footer', [$this, 'render']);
        add_action('wp_enqueue_scripts', [$this, 'assets']);
    }

    public function assets() {

        wp_enqueue_style(
            'th-sales-notify',
            TH_STORE_ONE_PLUGIN_URL . 'assets/css/sales-notify.css',
            [],
            TH_STORE_ONE_VERSION
        );

        wp_enqueue_script(
            'th-sales-notify',
            TH_STORE_ONE_PLUGIN_URL . 'assets/js/sales-notify.js',
            [],
            TH_STORE_ONE_VERSION,
            true
        );
    }

    public function render() {?>

        <div id="th-sale-notify-root">

        <?php foreach ($this->rules as $rule) {

            if (($rule['status'] ?? '') !== 'active') continue;

            if (!$this->match_rule($rule)) continue;

            $this->render_rule($rule);
        }?>

        </div>

    <?php }

    /* ================= RULE MATCH ================= */

    private function match_rule($rule) {

       /* DEVICE */
       if (!empty($rule['devices'])) {

          $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

          // detect mobile
          $is_mobile = wp_is_mobile();

          // detect tablet (basic UA check)
          $is_tablet = (
               stripos($user_agent, 'ipad') !== false ||
               stripos($user_agent, 'android') !== false && !stripos($user_agent, 'mobile') ||
               stripos($user_agent, 'tablet') !== false
          );

          // fix: tablet should not be counted as mobile
          if ($is_tablet) {
               $is_mobile = false;
          }

          /* CONDITIONS */
          if ($is_mobile && !in_array('mobile', $rule['devices'])) return false;

          if ($is_tablet && !in_array('tablet', $rule['devices'])) return false;

          if (!$is_mobile && !$is_tablet && !in_array('desktop', $rule['devices'])) return false;
     }

     /* PRODUCT PAGE LOGIC */
     if (is_product()) {

    global $product;
    if (!$product) return false;

    $pid = $product->get_id();

    /* ================= TRIGGER ================= */

    $trigger = $rule['trigger_type'] ?? 'all_products';

    if ($trigger === 'specific_products') {

        if (empty($rule['productsInclude']) || 
            !in_array($pid, $rule['productsInclude'], true)
        ) {
            return false;
        }
    }

    elseif ($trigger === 'specific_categories') {

        if (empty($rule['categoriesInclude'])) {
            return false;
        }

        $cats = wp_get_post_terms($pid, 'product_cat', ['fields' => 'ids']);

        if (!array_intersect($rule['categoriesInclude'], $cats)) {
            return false;
        }
    }

    /*IMPORTANT: all_products = NO restriction */
    // no condition here → always pass

    /* ================= EXCLUDE PRODUCTS ================= */

    if (!empty($rule['exclude_productsInclude_enabled']) 
        && !empty($rule['exclude_productsInclude'])
    ) {

        if (in_array($pid, $rule['exclude_productsInclude'], true)) {
            return false;
        }
    }

    /* ================= EXCLUDE CATEGORIES ================= */

    if (!empty($rule['exclude_categoryInclude_enabled']) 
        && !empty($rule['exclude_categoriesInclude'])
    ) {

        $cats = wp_get_post_terms($pid, 'product_cat', ['fields' => 'ids']);

        if (array_intersect($rule['exclude_categoriesInclude'], $cats)) {
            return false;
        }
    }
}
        return true;
    }

    /* ================= RULE RENDER ================= */

    private function render_rule($rule) {

        $id = 'th-sale-' . esc_attr($rule['flexible_id']);
        $data = $this->get_data($rule);

        if (empty($data)) return;
        
        ?>

        <div id="<?php echo esc_attr($id); ?>" class='th-sale-group'>
        <?php
        foreach ($data as $i => $item) {
            $this->render_item($rule, $item, $i);
        } ?>
       </div>
   <?php  }

    /* ================= DATA ================= */

    private function get_data($rule) {

    /* ================= FAKE ================= */
    if ($rule['data_source'] === 'fake-order') {
        return $this->get_fake_data($rule);
    }

    /* ================= REAL ORDERS ================= */

     $orders = wc_get_orders([
     'limit' => intval($rule['product_to_show'] ?? 5),
     'status' => $this->normalize_status($rule['order_status'] ?? []),
     'date_created' => $this->get_time_query($rule),
     ]);

     $data = [];
     $used_products = [];

     /* ================= FROM ORDERS ================= */
     foreach ($orders as $order) {

     $customer_name = $order->get_billing_first_name();

     $city    = $order->get_billing_city();
     $state   = $order->get_billing_state();
     $country = $order->get_billing_country();
     $address = $order->get_billing_address_1();


     $order_id = $order->get_id();

     $order_time = human_time_diff(
    $order->get_date_created()->getTimestamp(),
    current_time('timestamp')
     );

     $selected_label = $this->format_show_time_label($rule['show_time']);

     $time = $order_time ? $order_time . ' ago' : $selected_label;

     foreach ($order->get_items() as $item) {

          $product = $item->get_product();
          if (!$product) continue;

          $pid = $product->get_id();

          /* EXCLUDE CHECK */
          if (!empty($rule['exclude_products_enabled']) &&
               in_array($pid, $rule['exclude_products'] ?? [])
          ) {
               continue;
          }

          /* DUPLICATE AVOID */
          if (in_array($pid, $used_products)) continue;

          $used_products[] = $pid;

          $data[] = [

               /* ===== CUSTOMER ===== */
               'customer_name' => $customer_name,

               /* ===== ADDRESS ===== */
               'city'    => $city,
               'state'   => $state,
               'country' => $country,
               'address' => $address,

               /* ===== PRODUCT ===== */
               'product_name' => $product->get_name(),
               'price'        => $product->get_price(),
               'sku'          => $product->get_sku(),

               /* ===== ORDER ===== */
               'order'   => '#' . $order_id,
               'invoice' => '', // optional future
               'ref'     => '',

               /* ===== IMAGE ===== */
               'image' => wp_get_attachment_url($product->get_image_id()),
               'time' => $time,
               'product_id' => $pid,
          ];
        }
     }

    /* ================= LIMIT CONTROL ================= */
    $limit = intval($rule['product_to_show'] ?? 5);

    return array_slice($data, 0, $limit);

   }

     private function normalize_status($statuses) {

     if (empty($statuses)) {
          return ['wc-completed'];
     }
     // ensure array
     if (!is_array($statuses)) {
     $statuses = [$statuses];
     }

     return array_map(function($status) {

          // already wc- prefixed
          if (strpos($status, 'wc-') === 0) {
               return $status;
          }

          return 'wc-' . $status;

     }, $statuses);

  }
  private function format_show_time_label($value) {

    switch ($value) {

        case '24_hours':
            return __('Last 24 hours', 'th-store-one');

        case '3_days':
            return sprintf(__('Last %d days', 'th-store-one'), 3);

        case '5_days':
            return sprintf(__('Last %d days', 'th-store-one'), 5);

        case '1_week':
            return sprintf(__('%d week ago', 'th-store-one'), 1);

        case '2_weeks':
            return sprintf(__('%d weeks ago', 'th-store-one'), 2);

        case '3_weeks':
            return sprintf(__('%d weeks ago', 'th-store-one'), 3);

        case '1_month':
            return sprintf(__('%d month ago', 'th-store-one'), 1);

        case '2_months':
            return sprintf(__('%d months ago', 'th-store-one'), 2);

        case '3_months':
            return sprintf(__('%d months ago', 'th-store-one'), 3);

        case '1_year':
            return sprintf(__('%d year ago', 'th-store-one'), 1);

        case '2_years':
            return sprintf(__('%d years ago', 'th-store-one'), 2);

        case '3_years':
            return sprintf(__('%d years ago', 'th-store-one'), 3);
    }

    return '';
   }
   private function get_fake_data($rule) {

    $data = [];

    if (empty($rule['fake_orders'])) return [];

    foreach ($rule['fake_orders'] as $fake) {

    /* ================= STORE PRODUCT ================= */
    if ($fake['fakePrductSrc'] == 'store_product') {

    if (empty($fake['fakeProductList'])) continue;

    $pid = is_array($fake['fakeProductList'])
        ? ($fake['fakeProductList'][0] ?? 0)
        : $fake['fakeProductList'];

    if (!$pid) continue;

    $product = wc_get_product($pid);
    if (!$product) continue;

    /* ===== ADDRESS SPLIT ===== */
    $addr_parts = array_map('trim', explode(',', $fake['fakeCustomerAddress'] ?? ''));

    $city    = $this->clean_value($addr_parts[0] ?? '');
    $state   = $this->clean_value($addr_parts[1] ?? '');
    $country = $this->clean_value($addr_parts[2] ?? '');
    $address = $this->clean_value($addr_parts[3] ?? '');

    /* ===== PRODUCT DATA ===== */
    $product_name = $product->get_name();
    $price        = $product->get_price();
    $sku          = $product->get_sku();

    /* ===== FINAL STRUCTURED DATA ===== */
    $data[] = [

        'customer_name' => $fake['fakeCustomerName'] ?? '',

        'city'    => $city,
        'state'   => $state,
        'country' => $country,
        'address' => $address,

        'product_name' => $product_name,
        'price'        => $price,
        'sku'          => $sku,

        'order'   => '',
        'invoice' => '',
        'ref'     => '',
        'time'    => $fake['fakeTime'] ?? '',

        'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
    ];
}
/* ================= CUSTOM PRODUCT ================= */
else {

    $address_text = $fake['fakeCustomerAddress'] ?? '';
    $product_text = $fake['fakeCustomProduct'] ?? '';

    /* ===== SPLIT ADDRESS ===== */

    $addr_parts = array_map('trim', explode(',', $address_text));

    $city    = $this->clean_value($addr_parts[0] ?? '');
    $state   = $this->clean_value($addr_parts[1] ?? '');
    $country = $this->clean_value($addr_parts[2] ?? '');
    $address = $this->clean_value($addr_parts[3] ?? '');

    /* ===== SPLIT PRODUCT ===== */
    
    $prod_parts = array_map('trim', explode(',', $product_text));

    $product_name = $this->clean_value($prod_parts[0] ?? '');
    $price        = $this->clean_value($prod_parts[1] ?? '');
    $sku          = $this->clean_value($prod_parts[2] ?? '');

    /* ===== EXTRA TAG CHECK ===== */
    $order   = strpos($product_text, '{order}') !== false ? '' : '';
    $invoice = strpos($product_text, '{invoice}') !== false ? '' : '';
    $ref     = strpos($product_text, '{ref}') !== false ? '' : '';

    /* ===== FINAL DATA ===== */
     $data[] = [
          'customer_name' => $fake['fakeCustomerName'] ?? '',
          'city'    => $city,
          'state'   => $state,
          'country' => $country,
          'address' => $address,
          'product_name' => $product_name,
          'price'        => $price,
          'sku'          => $sku,
          'order'   => $this->clean_value($order),
          'invoice' => $this->clean_value($invoice),
          'ref'     => $this->clean_value($ref),
          'time'    => $fake['fakeTime'] ?? '',
          'image' => $fake['fakeprd_image_url'] ?? '',
          'fakeprd_url' => $fake['fakeprd_url'] ?? '',
     ];
     }
     //error_log("\n==== DATA CHECK ====\n" . print_r($data, true));
    }
     return $data;
    }

    private function clean_value($val) {

    if (!$val) return '';

    // remove only brackets, keep content
    $val = str_replace(['{','}'], '', $val);

    $val = preg_replace('/\s+/', ' ', $val);

    return trim($val, " ,");
}

   private function get_time_query($rule) {

    $time = $rule['show_time'] ?? '24_hours';

    if (empty($time)) {
        return '';
    }

    $seconds = 0;

    switch ($time) {

        /* ---------- DAYS ---------- */
        case '24_hours':
            $seconds = DAY_IN_SECONDS;
            break;

        case '3_days':
            $seconds = 3 * DAY_IN_SECONDS;
            break;

        case '5_days':
            $seconds = 5 * DAY_IN_SECONDS;
            break;

        /* ---------- WEEKS ---------- */
        case '1_week':
            $seconds = WEEK_IN_SECONDS;
            break;

        case '2_weeks':
            $seconds = 2 * WEEK_IN_SECONDS;
            break;

        case '3_weeks':
            $seconds = 3 * WEEK_IN_SECONDS;
            break;

        /* ---------- MONTHS ---------- */
        case '1_month':
            $seconds = MONTH_IN_SECONDS;
            break;

        case '2_months':
            $seconds = 2 * MONTH_IN_SECONDS;
            break;

        case '3_months':
            $seconds = 3 * MONTH_IN_SECONDS;
            break;

        /* ---------- YEARS ---------- */
        case '1_year':
            $seconds = YEAR_IN_SECONDS;
            break;

        case '2_years':
            $seconds = 2 * YEAR_IN_SECONDS;
            break;

        case '3_years':
            $seconds = 3 * YEAR_IN_SECONDS;
            break;

        default:
            return '';
    }

    return '>' . ( time() - $seconds );
}

 private function render_item($rule, $item, $i) {

    /* ===== VARIABLES MAP ===== */
    $map = [
        'customer_name' => $item['customer_name'] ?? '',
        'city'          => $item['city'] ?? '',
        'state'         => $item['state'] ?? '',
        'country'       => $item['country'] ?? '',
        'address'       => $item['address'] ?? '',
        'product_name'  => $item['product_name'] ?? '',
        'price'         => $item['price'] ?? '',
        'sku'           => $item['sku'] ?? '',
        'order'         => $item['order'] ?? '',
        'invoice'       => $item['invoice'] ?? '',
        'ref'           => $item['ref'] ?? '',
    ];


    // style setting
    $title_clr = th_store_one_normalize_color($rule['noti_title_clr'] ?? '#111');
    $text_clr  = th_store_one_normalize_color($rule['noti_text_clr'] ?? '#1e1e1e');
    $product_link = '';

    if (!empty($item['product_id'])) {
        // store product
        $product_link = get_permalink($item['product_id']);
    } elseif (!empty($item['fakeprd_url'])) {
        // custom fake product
        $product_link = $item['fakeprd_url'];
    }
    
//     if (!empty($map['product_name']) && !empty($product_link)) {
//     $map['product_name'] = '<a href="' . esc_url($product_link) . '" 
//         target="_blank" 
//         rel="noopener noreferrer" 
//         style="color:' . esc_attr($text_clr) . ';">' 
//         . esc_html($map['product_name']) . 
//     '</a>';
// }

    /* ===== PARSER FUNCTION ===== */
    $parse = function($text) use ($map) {

        $text = preg_replace_callback('/\{(.*?)\}/', function($match) use ($map) {

            $key = strtolower(trim($match[1]));
            $key = str_replace(' ', '_', $key);

            return $map[$key] ?? $match[0];

        }, $text);

        return trim(preg_replace('/\s+/', ' ', $text));
    };

    /* ===== PARSE BOTH LINES ===== */
    $text_bold = $parse($rule['display_notification'] ?? '');
    $text_normal = $parse($rule['display_notification_n'] ?? '');
    $delay = (int)$rule['initial_delay'] + ($i * (int)$rule['delay_between']);

    

    $style = "";

        /* BACKGROUND */
        $bg = th_store_one_normalize_color($rule['noti_bg_clr'] ?? '');
        if ($bg) {
            $style .= "background: {$bg};";
        }

        /* TEXT COLOR */
        $text = th_store_one_normalize_color($rule['noti_text_clr'] ?? '');
        if ($text) {
            $style .= "color: {$text};";
        }

        /* PADDING */
        if (!empty($rule['noti_padding'])) {
            $p = $rule['noti_padding'];

            $top    = th_store_one_with_unit($p['top'] ?? 0);
            $right  = th_store_one_with_unit($p['right'] ?? 0);
            $bottom = th_store_one_with_unit($p['bottom'] ?? 0);
            $left   = th_store_one_with_unit($p['left'] ?? 0);

            $style .= "padding: $top $right $bottom $left;";
        }

        /* BORDER */
        if (!empty($rule['noti_border'])) {

            $b = $rule['noti_border'];

            $border_color = th_store_one_normalize_color($b['color'] ?? '');
            $border_style = $b['style'] ?? 'solid';

            $top    = th_store_one_with_unit($b['width']['top'] ?? 1);
            $right  = th_store_one_with_unit($b['width']['right'] ?? 1);
            $bottom = th_store_one_with_unit($b['width']['bottom'] ?? 1);
            $left   = th_store_one_with_unit($b['width']['left'] ?? 1);

            $style .= "border-style: $border_style;";
            $style .= "border-color: $border_color;";
            $style .= "border-width: $top $right $bottom $left;";

            /* RADIUS */
            $rt = th_store_one_normalize_radius($b['radius']['top'] ?? '0px');
            $rr = th_store_one_normalize_radius($b['radius']['right'] ?? '0px');
            $rb = th_store_one_normalize_radius($b['radius']['bottom'] ?? '0px');
            $rl = th_store_one_normalize_radius($b['radius']['left'] ?? '0px');

            $style .= "border-radius: $rt $rr $rb $rl;";
        }
?>
<div class="th-notification th-<?php echo esc_attr($rule['position']); ?> <?php echo esc_attr($rule['noti_style']); ?>" style="<?php echo esc_attr($style); ?>" 
data-animation="<?php echo esc_attr($rule['animation'] ?? 'slide'); ?>"     
data-delay="<?php echo esc_attr($delay); ?>"
     data-duration="<?php echo esc_attr($rule['display_duration']); ?>"
     data-delay-between="<?php echo esc_attr($rule['delay_between']); ?>"
     data-initial="<?php echo esc_attr($rule['initial_delay']); ?>"
     data-random="<?php echo $rule['random_delay'] ? 'true' : 'false'; ?>"
     data-random-range="<?php echo esc_attr($rule['random_delay_range']); ?>"
     data-loop="<?php echo $rule['loop'] ? 'true' : 'false'; ?>"
>
    <!-- CLOSE ICON -->
    <span class="th-close-btn" role="button" aria-label="Close" style="color: <?php echo esc_attr($text_clr); ?>"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
    </span>

    <div class="th-inner">
        <a href="<?php echo esc_url($product_link); ?>" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="s1-sale-prd-link"
        style="color:<?php echo esc_attr($text_clr); ?>;">
        </a>

        <?php if (!empty($item['image'])): ?>
            <img src="<?php echo esc_url($item['image']); ?>">
        <?php endif; ?>

        <div class="th-content">
            <?php if ($text_bold): ?>
                <strong class="th-line-1" style="color: <?php echo esc_attr($title_clr); ?>">
                    <?php echo esc_html($text_bold); ?>
                </strong>
            <?php endif; ?>

            <?php if ($text_normal): ?>
                <p class="th-line-2" style="color: <?php echo esc_attr($text_clr); ?>">
                    <?php echo wp_kses_post($text_normal); ?>
                </p>
            <?php endif; ?>

            <!-- TIME -->
            <span class="th-time">
                <?php echo esc_html($item['time'] ?? '1 week ago'); ?>
            </span>

        </div>

    </div>
</div>

<?php
}
    
}