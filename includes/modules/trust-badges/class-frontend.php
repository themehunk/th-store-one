<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class StoreOne_Trust_Badges_Frontend {

    private $rules = array();

    public function __construct() {

        $all_modules   = get_option( 'store_one_module_set', array() );
        $this->rules   = $all_modules['trust-badges']['rules'] ?? array();

        add_action( 'woocommerce_before_shop_loop_item_title', array( $this, 'loop_wrap_start' ), 8 );

        add_action( 'woocommerce_before_shop_loop_item_title', array( $this, 'render_badges' ), 11 );

        add_action( 'woocommerce_before_shop_loop_item_title', array( $this, 'loop_wrap_end' ), 12 );

       add_filter(
            'woocommerce_single_product_image_thumbnail_html',
            array( $this, 'wrap_single_image_with_badge' ),
            10,
            2
        );

        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
    }

    public function enqueue_assets() {
        wp_enqueue_style(
            'storeone-trust-badges',
            STORE_ONE_PLUGIN_URL . 'assets/css/trust-badges.css',
            array(),
            STORE_ONE_VERSION
        );
    }
    public function loop_wrap_start() {
    echo '<div class="s1-product-image-wrap s1-loop">';
    }

    public function loop_wrap_end() {
        echo '</div>';
    }

   public function wrap_single_image_with_badge( $html, $attachment_id ) {

    global $product;

    if ( ! $product || empty( $this->rules ) ) {
        return $html;
    }

    $badges = $this->render_badges( $product );

    if ( empty( $badges ) ) {
        return $html;
    }

    return sprintf(
        '<div class="s1-image-inner-wrap">%s<div class="s1-badges-wrap">%s</div></div>',
        $html,
        $badges
    );
}
    /* =========================
       MAIN RENDER
    ========================= */
    public function render_badges() {

        global $product;

        if ( ! $product || empty( $this->rules ) ) {
            return;
        }

        foreach ( $this->rules as $rule ) {

            if ( ! $this->is_rule_valid( $rule, $product ) ) {
                continue;
            }

            echo $this->render_single_badge( $rule );
        }
    }

    /* =========================
       RULE VALIDATION
    ========================= */
    private function is_rule_valid( $rule, $product ) {

        if ( ($rule['status'] ?? '') !== 'active' ) return false;

        if ( ! $this->match_user_condition( $rule ) ) return false;

        if ( ! $this->match_show_badges( $rule, $product ) ) return false;

        if ( ! $this->match_exclusions( $rule, $product ) ) return false;

        return true;
    }

    /* =========================
       SHOW BADGES CONDITIONS
    ========================= */
    private function match_show_badges( $rule, $product ) {

        $type = $rule['show_badges'] ?? 'all_products';

        switch ( $type ) {

            case 'all_products': return true;
            case 'sale_products': return $product->is_on_sale();
            case 'featured_products': return $product->is_featured();
            case 'in_stock_products': return $product->is_in_stock();
            case 'out_stock_products': return ! $product->is_in_stock();
            case 'back_order_products': return $product->get_stock_status() === 'onbackorder';
            case 'low_stock_products': return $this->is_low_stock( $product );
            case 'recent_products': return $this->is_recent_product( $product );
            case 'best_seller_products': return $this->is_best_seller( $product );

            case 'specific_products':
                return in_array( $product->get_id(), $rule['products'] ?? array(), true );

            case 'specific_categories':
                return has_term( $rule['categories'] ?? array(), 'product_cat', $product->get_id() );

            case 'specific_tags':
                return has_term( $rule['tags'] ?? array(), 'product_tag', $product->get_id() );
        }

        return false;
    }

    /* =========================
       EXCLUDE CONDITIONS
    ========================= */
    private function match_exclusions( $rule, $product ) {

        $id = $product->get_id();

        if ( ! empty($rule['exclude_products_enabled']) &&
            in_array($id, $rule['exclude_products'] ?? array(), true)
        ) return false;

        if ( ! empty($rule['exclude_categories_enabled']) &&
            has_term($rule['exclude_categories'] ?? array(), 'product_cat', $id)
        ) return false;

        if ( ! empty($rule['exclude_tags_enabled']) &&
            has_term($rule['exclude_tags'] ?? array(), 'product_tag', $id)
        ) return false;

        return true;
    }

    /* =========================
       USER CONDITIONS
    ========================= */
    private function match_user_condition( $rule ) {

        $condition = $rule['user_condition'] ?? 'all';

        if ( $condition === 'all' ) return true;
        if ( $condition === 'logged_in' ) return is_user_logged_in();
        if ( $condition === 'guest' ) return ! is_user_logged_in();

        if ( $condition === 'roles' ) {
            if ( ! is_user_logged_in() ) return false;
            $user = wp_get_current_user();
            return array_intersect( $user->roles, $rule['allowed_roles'] ?? array() );
        }

        if ( $condition === 'users' ) {
            if ( ! is_user_logged_in() ) return false;
            return in_array( get_current_user_id(), $rule['allowed_users'] ?? array(), true );
        }

        return true;
    }

    /* =========================
       BADGE RENDER
    ========================= */
    private function render_single_badge( $rule ) {

        $style  = $rule['badge_style'] ?? array();
        $type   = $rule['badges_type'] ?? 'badges_text';
        $rule_id = $rule['flexible_id'] ?? '';

        $wrapper_style = $this->get_wrapper_style( $style );

        $html = '<div class="s1-badge-container" data-rule-id="'.esc_attr($rule_id).'" style="'.esc_attr($wrapper_style).'">';

        switch ( $type ) {

        case 'badges_images':
            $html .= $this->render_image_badge( $rule );
            break;

        case 'badges_css':
            $html .= $this->render_css_badge( $rule );
            break;

        case 'badges_advance':
            $html .= $this->render_advance_badge( $rule );
            break;

        case 'badges_text':
        default:
            $html .= $this->render_text_badge( $rule );
            break;
    }

        $html .= '</div>';

        return $html;
    }

    private function render_text_badge( $rule ) {

        $style = $this->get_inner_style( $rule['badge_style'] ?? array(), true );

        return '<div class="s1-badge s1-badge-text" style="'.esc_attr($style).'">'
            . esc_html( $rule['badgetext'] ?? 'Badge' ) .
        '</div>';
    }

    private function render_image_badge( $rule ) {

        if ( empty( $rule['badge_image'] ) ) return '';
        $style = $rule['badge_style'] ?? array();
        return '<img class="s1-badge-image" src="'.esc_url($rule['badge_image']).'" style="width:'.esc_attr($style['image_width'] ?? '100px').';" />';
    }

    private function render_css_badge( $rule ) {

    $type  = $rule['badge_css_type'] ?? 'new';
    $text  = $rule['badgetext'] ?? 'NEW';

    $style = $this->get_inner_style( $rule['badge_style'] ?? array(), true );

    if ( $type === 'sale' ) {
        return '<div class="s1-css-badge-sale" style="'.esc_attr($style).'">
                    <div class="s1-css-badge-inner">'.esc_html($text).'</div>
                </div>';
    }elseif($type === 'newsale'){
        $stylec = sprintf(
                '--badge-color:%s;--badge-txt:%s;',
                $style['bgclr'] ?? '#45d0eb',
                $style['textclr'] ?? '#ffffff'
            );
        return '<div class="s1-ribbon-wrap-s2" style="'.esc_attr($stylec).'">
          <div
            class="s1-ribbon-wrap">
            <div class="s1-ribbon-s2"></div>
            <div class="s1-ribbon-text">
             '.esc_html($text).'
            </div>
          </div>
        </div>';
    }
    elseif($type === "sale_badge_pink") {
        $stylec = sprintf(
                '--badge-salebgcolor:%s;--badge-salebgtxt:%s;',
                $style['bgclr'] ?? '#d4547e',
                $style['textclr'] ?? '#ffffff'
            );
    return '<div class="s1-sale_badge_pink">
          <div class="s1-sale-badge" style="'.esc_attr($stylec).'">
          <span> '.esc_html($text).'</span>
        </div>
        </div>';
    }
    elseif ($type === "saletxt") {
        $stylec = sprintf(
                '--badge-saletxtbgcolor:%s;--badge-saletxt:%s;',
                $style['bgclr'] ?? 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                $style['textclr'] ?? '#1e293b'
            );
      return 
        '<div class="s1-sale_txt">
          
              <div class="s1-sale-underline" style="'.esc_attr($stylec).'">
           '.esc_html($text).'
            
        </div>
        </div>';
      
    }

    // default NEW
    return '<div class="s1-css-badge-new" style="'.esc_attr($style).'">
                <div class="s1-css-badge-inner">'.esc_html($text).'</div>
            </div>';
   }

   private function render_advance_badge( $rule ) {

    global $product;

   if ( ! $product || ! $product->is_on_sale() ) {
        return '';
    }

    $style = $this->get_advance_inner_style( $rule['badge_style'] ?? array(), true );
    $type  = $rule['badge_advance_type'] ?? 'one';

    $value = $this->get_discount_value( $rule );

    if ( $type === 'two' ) {
    return '<div class="s1-adv-burst" style="'.esc_attr($style).'">
                <div>'.$value.'</div><small>OFF</small>
            </div>';
    }
    elseif($type === "four") {

    $stylec = sprintf(
        '--badge-4-color:%s; --badge-4-txt:%s;',
        $style['bgclr'] ?? '#47DCBF',
        $style['textclr'] ?? '#ffffff',
    );

    return 
    '<div class="s1-preview-badge s1-corner-badge">
        <div class="s1-badge-shape" style="'.esc_attr($stylec).'">
            <svg viewBox="0 0 91.333 91">
                <polygon points="53.666,0 91.333,38.385 91.333,91 0,0" />
            </svg>
        </div>

        <div class="s1-badge-text" style="'.esc_attr($stylec).'">
            <div class="value">-'.$value.'</div>
        </div>
    </div>';
}
elseif ($type === "five") {
    $stylec = sprintf(
        '--badge-5-color:%s; --badge-5-txt:%s;',
        $style['bgclr'] ?? '#da9005',
        $style['textclr'] ?? '#ffffff',
    );
    
      return 
        '<div class="s1-adv-css-badge s1-5">
          <div
            class="s1-css-s1"
            style="'.esc_attr($stylec).'"
          ></div>

          <div
            class="s1-css-text"
            style="'.esc_attr($stylec).'"
          >
            '.esc_html( $product->get_stock_quantity() ).' Only available
          </div>
        </div>';
      
    }
     elseif ($type === "daimond") {
         $stylec = sprintf(
        '--badge-daimondbgcolor:%s; --badge-daimondtxt:%s;',
        $style['bgclr'] ?? 'linear-gradient(135deg, #ff7a18, #ff3d00)',
        $style['textclr'] ?? '#ffffff',
    );
      return 
        '<div class="s1-adv-css-badge s1-daimond">
          <div class="s1-diamond-badge"  style="'.esc_attr($stylec).'">
           <span>-'.$value.'</span>
        </div>
        </div>';
    }
    elseif ($type === "circle") {
        $stylec = sprintf(
        '--badge-circlebgcolor:%s; --badge-circletxt:%s;',
        $style['bgclr'] ?? 'radial-gradient(circle, #ff4d6d 0%, #ff0033 100%)',
        $style['textclr'] ?? '#ffffff',
    );
      return'
        <div class="s1-adv-css-badge s1-circle">
        <div class="s1-off-badge" style="'.esc_attr($stylec).'">
        <div class="s1-off-inner">
          <span class="s1-off-value">'.$value.'</span>
          <span class="s1-off-text">OFF</span>
        </div>
        </div>
      </div>';
    }

    return '<div class="s1-adv-circle" style="'.esc_attr($style).'">
                <div>'.$value.'</div><small>OFF</small>
            </div>';
    }

   private function get_discount_value( $rule ) {

    global $product;

    if ( ! $product || ! $product->is_on_sale() ) {
        return '';
    }

    $regular = (float) $product->get_regular_price();
    $sale    = (float) $product->get_sale_price();

    if ( ! $regular || ! $sale ) return '';

    $discount = $regular - $sale;

    if ( ($rule['displayBadge'] ?? '') === 's1-percent' ) {
        return round( ( $discount / $regular ) * 100 ) . '%';
    }

    return wc_price( $discount );

   }

    /* =========================
       STYLE ENGINE
    ========================= */
    private function get_wrapper_style( $style ) {

    $pos       = $style['position'] ?? array();
    $margin    = $style['margin'] ?? array();
    $transform = $style['transform'] ?? array();
    $flip      = $style['flip'] ?? array();

    $unit = $pos['unit'] ?? 'px';

    $css = 'position:absolute;';

    /* ---------- POSITION ---------- */
    if ( ($pos['mode'] ?? '') === 'custom' ) {

        switch ( $pos['anchor'] ?? '' ) {

            case 'top-left':
                $css .= 'top:' . ($pos['top'] ?? 0) . $unit . ';';
                $css .= 'left:' . ($pos['left'] ?? 0) . $unit . ';';
                break;

            case 'top-right':
                $css .= 'top:' . ($pos['top'] ?? 0) . $unit . ';';
                $css .= 'right:' . ($pos['right'] ?? 0) . $unit . ';';
                break;

            case 'bottom-left':
                $css .= 'bottom:' . ($pos['bottom'] ?? 0) . $unit . ';';
                $css .= 'left:' . ($pos['left'] ?? 0) . $unit . ';';
                break;

            case 'bottom-right':
                $css .= 'bottom:' . ($pos['bottom'] ?? 0) . $unit . ';';
                $css .= 'right:' . ($pos['right'] ?? 0) . $unit . ';';
                break;
        }
    }

    /* ---------- FIXED MODE ---------- */
    if ( ($pos['mode'] ?? '') === 'fixed' ) {

        if ( ($pos['position'] ?? '') === 'top' ) $css .= 'top:10px;';
        if ( ($pos['position'] ?? '') === 'middle' ) $css .= 'top:50%;';
        if ( ($pos['position'] ?? '') === 'bottom' ) $css .= 'bottom:10px;';

        if ( ($pos['align'] ?? '') === 'left' ) $css .= 'left:10px;';
        if ( ($pos['align'] ?? '') === 'right' ) $css .= 'right:10px;';
        if ( ($pos['align'] ?? '') === 'center' ) {
            $css .= 'left:50%;transform:translateX(-50%);';
        }
    }

    /* ---------- ROTATE ---------- */
    $rotate = sprintf(
        'rotateX(%sdeg) rotateY(%sdeg) rotateZ(%sdeg)',
        $transform['rotateX'] ?? 0,
        $transform['rotateY'] ?? 0,
        $transform['rotateZ'] ?? 0
    );

    /* ---------- FLIP ---------- */
    $flip_css = '';
    if ( ! empty($flip['enabled']) ) {
        if ( $flip['orientation'] === 'horizontal' ) $flip_css = 'scaleX(-1)';
        elseif ( $flip['orientation'] === 'vertical' ) $flip_css = 'scaleY(-1)';
        elseif ( $flip['orientation'] === 'both' ) $flip_css = 'scale(-1,-1)';
    }

    $css .= 'transform:' . trim($rotate . ' ' . $flip_css) . ';';

    /* ---------- OPACITY ---------- */
    $opacity = isset($transform['opacity']) ? ($transform['opacity'] / 100) : 1;
    $css .= 'opacity:' . $opacity . ';';

    /* ---------- MARGIN ---------- */
    $css .= sprintf(
        'margin:%s %s %s %s;',
        $margin['top'] ?? '0px',
        $margin['right'] ?? '0px',
        $margin['bottom'] ?? '0px',
        $margin['left'] ?? '0px'
    );

    return $css;
   }

    private function get_inner_style( $style, $is_text = false ) {

    $padding = $style['padding'] ?? array();
    $border  = $style['border'] ?? array();

    // Default padding fix (same as JS)
    if ( $is_text ) {
        $padding['top']    = ($padding['top'] ?? '0px') === '0px' ? '12px' : $padding['top'];
        $padding['right']  = ($padding['right'] ?? '0px') === '0px' ? '15px' : $padding['right'];
        $padding['bottom'] = ($padding['bottom'] ?? '0px') === '0px' ? '12px' : $padding['bottom'];
        $padding['left']   = ($padding['left'] ?? '0px') === '0px' ? '15px' : $padding['left'];
    }

    return sprintf(
        'background:%s;color:%s;font-size:%s;padding:%s %s %s %s;border-style:%s;border-color:%s;border-width:%s %s %s %s;border-radius:%s %s %s %s;',
        $style['bgclr'] ?? '#000',
        $style['textclr'] ?? '#fff',
        $style['text_size'] ?? '14px',
        $padding['top'] ?? '0px',
        $padding['right'] ?? '0px',
        $padding['bottom'] ?? '0px',
        $padding['left'] ?? '0px',
        $border['style'] ?? 'solid',
        $border['color'] ?? '#000',
        $border['width']['top'] ?? '0px',
        $border['width']['right'] ?? '0px',
        $border['width']['bottom'] ?? '0px',
        $border['width']['left'] ?? '0px',
        $border['radius']['top'] ?? '0px',
        $border['radius']['right'] ?? '0px',
        $border['radius']['bottom'] ?? '0px',
        $border['radius']['left'] ?? '0px'
    );
}

private function get_advance_inner_style( $style ) {

    return sprintf(
        'background:%s;color:%s;font-size:%s;',
        $style['bgclr'] ?? '#0a70ed',
        $style['textclr'] ?? '#fff',
        $style['text_size'] ?? '18px',
        
    );
}

    /* =========================
       HELPERS
    ========================= */
    private function is_recent_product( $product ) {
    static $recent_ids = null;
    if ( $recent_ids === null ) {
        // Allow dev override (important)
        $limit = apply_filters( 'storeone_recent_products_limit', 10 );
        $args = array(
            'post_type'      => 'product',
            'posts_per_page' => $limit,
            'post_status'    => 'publish',
            'orderby'        => 'date',
            'order'          => 'DESC',
            'fields'         => 'ids',
            'meta_query'     => WC()->query->get_meta_query(),
            'tax_query'      => WC()->query->get_tax_query(),
        );
        $query = new WP_Query( $args );
        $recent_ids = $query->posts;
    }
    return in_array( $product->get_id(), $recent_ids, true );
    }

    private function is_low_stock( $product ) {

    // Handle variable products
    if ( $product->is_type( 'variable' ) ) {

        foreach ( $product->get_children() as $child_id ) {

            $variation = wc_get_product( $child_id );

            if ( ! $variation || ! $variation->managing_stock() ) {
                continue;
            }

            $qty = $variation->get_stock_quantity();
            $threshold = wc_get_low_stock_amount( $variation );

            if ( $qty !== null && $qty <= $threshold ) {
                return true;
            }
        }

        return false;
    }
    // Simple product
    if ( ! $product->managing_stock() ) {
        return false;
    }

    $qty = $product->get_stock_quantity();

    if ( $qty === null ) {
        return false;
    }

    $threshold = wc_get_low_stock_amount( $product );

    return $qty <= $threshold;
}

   private function is_best_seller( $product ) {

    static $top_ids = null;

    if ( $top_ids === null ) {

        $args = array(
            'post_type'      => 'product',
            'posts_per_page' => 10,
            'meta_key'       => 'total_sales',
            'orderby'        => 'meta_value_num',
            'order'          => 'DESC',
            'fields'         => 'ids',
        );

        $query = new WP_Query( $args );
        $top_ids = $query->posts;
    }

    return in_array( $product->get_id(), $top_ids, true );
 }

 
}