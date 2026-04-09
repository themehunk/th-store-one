<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Th_Store_One_Trust_Badges_Frontend {

    private $rules = array();

    public function __construct() {

         $theme = wp_get_theme();
         $text_domain = $theme->get( 'TextDomain' );

        $all_modules   = get_option( 'th_store_one_module_set', array() );

        $modules = get_option('th_store_one_module_option', []);

        if ( empty($modules['trust-badges']) ) {
                return;
        } 

        $this->rules   = $all_modules['trust-badges']['rules'] ?? array();

        $enable_loop = false;

        if ( ! empty( $this->rules ) ) {
            foreach ( $this->rules as $rule ) {
                if ( ! empty( $rule['enableLoop'] ) ) {
                    $enable_loop = true;
                    break;
                }
            }
        }

        if ( $enable_loop ) {

            // Detect block theme
            if ( function_exists('wp_is_block_theme') && wp_is_block_theme() ) {

                //Block theme support
               add_filter(
                'render_block',
                array( $this, 'wrap_block_product_image_with_badge' ),
                10,
                2
            );

            } else {

                //Classic theme (tumhara existing code)
                add_action( 'woocommerce_before_shop_loop_item_title', array( $this, 'loop_wrap_start' ), 8 );
                add_action( 'woocommerce_before_shop_loop_item_title', array( $this, 'wrap_product_image_with_badge' ), 11 );
                add_action( 'woocommerce_before_shop_loop_item_title', array( $this, 'loop_wrap_end' ), 12 );
                
            }
        }

        $enable_single = false;

        if ( ! empty( $this->rules ) ) {
            foreach ( $this->rules as $rule ) {
                if ( ! empty( $rule['enableSingle'] ) ) {
                    $enable_single = true;
                    break;
                }
            }
        }

        if ( $enable_single ) {
            
                add_filter(
                    'woocommerce_single_product_image_thumbnail_html',
                    array( $this, 'wrap_single_image_with_badge' ),
                    10,
                    2
                );
 
            }

        
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
    }

    

    public function enqueue_assets() {
        wp_enqueue_style(
            'th-store-one-trust-badges',
            TH_STORE_ONE_PLUGIN_URL . 'assets/css/trust-badges.css',
            array(),
            TH_STORE_ONE_VERSION
        );
    }

    

    public function loop_wrap_start(){?>
    <div class="s1-product-image-wrap s1-loop">
    <?php }

    public function loop_wrap_end(){?>
    </div>
    <?php }

    public function wrap_product_image_with_badge() {
    
       global $product;

        if ( ! $product || empty( $this->rules ) ) {
            return;
        }

        foreach ( $this->rules as $rule ) {

            if ( ! $this->is_rule_valid( $rule, $product ) ) {
                continue;
            }

            $this->render_single_badge( $rule );
        }
   }

   public function wrap_single_image_with_badge( $html, $attachment_id ) {

    global $product;

    if ( ! $product || empty( $this->rules ) ) {
        return $html;
    }

    // if ( $attachment_id !== $product->get_image_id() ) {
    //     return $html;
    // }

    ob_start();

    foreach ( $this->rules as $rule ) {

        if ( ! $this->is_rule_valid( $rule, $product ) ) {
            continue;
        }

        $this->render_single_badge( $rule ); 
    }

    $badges = ob_get_clean();

    if ( empty( $badges ) ) {
        return $html;
    }

    $pos = strrpos( $html, '</div>' );

    if ( $pos !== false ) {
        $html = substr_replace(
            $html,
            '<div class="s1-badges-wrap">' . $badges . '</div></div>',
            $pos,
            6
        );
    }

    return $html;
    }

    /**********************/
    // for block used only
    /**********************/
    public function wrap_block_product_image_with_badge( $block_content, $block ) {

    if ( empty( $block['blockName'] ) || $block['blockName'] !== 'woocommerce/product-image' ) {
        return $block_content;
    }

    global $product;

    if ( ! $product || empty( $this->rules ) ) {
        return $block_content;
    }

    ob_start();
    $this->wrap_product_image_with_badge();
    $badges = ob_get_clean();

    if ( empty( $badges ) ) {
        return $block_content;
    }

    return '<div class="s1-product-image-wrap s1-loop">'
        . $badges
        . $block_content
        . '</div>';
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

    $style   = $rule['badge_style'] ?? array();
    $type    = $rule['badges_type'] ?? 'badges_text';
    $rule_id = $rule['flexible_id'] ?? '';

    $wrapper_style = $this->get_wrapper_style( $style );
    ?>

    <div 
        class="s1-badge-container" 
        data-rule-id="<?php echo esc_attr( $rule_id ); ?>" 
        style="<?php echo esc_attr( $wrapper_style ); ?>"
    >
        <?php
        if ( $type === 'badges_images' ) {

        $this->render_image_badge( $rule );

        } elseif($type === 'badges_css'){

        $this->render_css_badge( $rule );
            
        }elseif($type === 'badges_advance'){

        $this->render_advance_badge( $rule );
            
        }else {

        $this->render_text_badge( $rule );

        }
        ?>
        </div>

        <?php
    }

    private function render_text_badge( $rule ) {

    $style = $this->get_inner_style( $rule['badge_style'] ?? array(), true );

    ?>
    <div class="s1-badge s1-badge-text" style="<?php echo esc_attr( $style ); ?>">
        <?php echo esc_html( $rule['badgetext'] ?? 'Sale!' ); ?>
    </div>
    <?php
   }

    private function render_image_badge( $rule ) {

    if ( empty( $rule['badge_image'] ) ) {
        return;
    }

    $style = $rule['badge_style'] ?? array();
    $width = $style['image_width'] ?? '100px';
    ?>

    <img 
        class="s1-badge-image" 
        src="<?php echo esc_url( $rule['badge_image'] ); ?>" 
        style="width:<?php echo esc_attr( $width ); ?>;"
    />

    <?php
    }

    private function render_css_badge( $rule ) {

    $type   = $rule['badge_css_type'] ?? 'new';
    $text   = $rule['badgetext'] ?? 'NEW';
    $style  = $this->get_inner_style( $rule['badge_style'] ?? array(), true );
    $stylee = $rule['badge_style'] ?? array();

    if ( $type === 'sale' ) {
        ?>
        <div class="s1-css-badge-sale" style="<?php echo esc_attr($style); ?>">
            <div class="s1-css-badge-inner"><?php echo esc_html($text); ?></div>
        </div>
        <?php
    }

    elseif ( $type === 'newsale' ) {

        $padding = $stylee['padding'] ?? array();

        $padding_css = sprintf(
            '%s %s %s %s',
            th_store_one_with_unit($padding['top'] ?? 6),
           th_store_one_with_unit($padding['right'] ?? 12),
            th_store_one_with_unit($padding['bottom'] ?? 6),
            th_store_one_with_unit($padding['left'] ?? 6)
        );

        $stylec = sprintf(
            '--badge-color:%s;
             --badge-txt:%s;
             --badge-txtsize:%s;
             --badge-padding:%s;',
            $stylee['bgclr'] ?? '#45d0eb',
            $stylee['textclr'] ?? '#ffffff',
            th_store_one_with_unit($stylee['text_size'] ?? 15),
            $padding_css
        );
        ?>
        <div class="s1-ribbon-wrap-s2" style="<?php echo esc_attr($stylec); ?>">
            <div class="s1-ribbon-wrap">
                <div class="s1-ribbon-s2"></div>
                <div class="s1-ribbon-text">
                    <?php echo esc_html($text); ?>
                </div>
            </div>
        </div>
        <?php
    }

    elseif ( $type === "sale_badge_pink" ) {

        $style   = $rule['badge_style'] ?? array();
        $padding = $style['padding'] ?? array();

        $padding_css = sprintf(
            '%s %s %s %s',
            th_store_one_with_unit($padding['top'] ?? 5),
            th_store_one_with_unit($padding['right'] ?? 5),
            th_store_one_with_unit($padding['bottom'] ?? 5),
            th_store_one_with_unit($padding['left'] ?? 5)
        );

        $stylec = sprintf(
            '--badge-salebgcolor:%s;
             --badge-salebgtxt:%s;
             --badge-saletxtsize:%s;
             --badge-salepadding:%s;',
            $style['bgclr'] ?? '#d4547e',
            $style['textclr'] ?? '#ffffff',
            th_store_one_with_unit($style['text_size'] ?? 15),
            $padding_css
        );
        ?>
        <div class="s1-sale_badge_pink">
            <div class="s1-sale-badge" style="<?php echo esc_attr($stylec); ?>">
                <span><?php echo esc_html($text); ?></span>
            </div>
        </div>
        <?php
    }

    elseif ( $type === "saletxt" ) {

        $style   = $rule['badge_style'] ?? array();
        $padding = $style['padding'] ?? array();

        $padding_css = sprintf(
            '%s %s %s %s',
            th_store_one_with_unit($padding['top'] ?? 5),
            th_store_one_with_unit($padding['right'] ?? 5),
            th_store_one_with_unit($padding['bottom'] ?? 5),
            th_store_one_with_unit($padding['left'] ?? 5)
        );

        $stylec = sprintf(
            '--badge-saletxtbgcolor:%s;
             --badge-saletxt:%s;
             --badge-saletxtsize1:%s;
             --badge-salepadding1:%s;',
            $style['bgclr'] ?? 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            $style['textclr'] ?? '#1e293b',
            th_store_one_with_unit($style['text_size'] ?? 21),
            $padding_css
        );
        ?>
        <div class="s1-sale_txt">
            <div class="s1-sale-underline" style="<?php echo esc_attr($stylec); ?>">
                <?php echo esc_html($text); ?>
            </div>
        </div>
        <?php
    }

    else {
        ?>
        <div class="s1-css-badge-new" style="<?php echo esc_attr($style); ?>">
            <div class="s1-css-badge-inner"><?php echo esc_html($text); ?></div>
        </div>
        <?php
    }
   }

   private function render_advance_badge( $rule ) {

    global $product;

    if ( ! $product ) {
        return;
    }

    $style = $this->get_advance_inner_style( $rule['badge_style'] ?? array(), true );
    $stylee = $rule['badge_style'] ?? array();

    $type  = $rule['badge_advance_type'] ?? 'one';
    $value = $this->get_discount_value( $rule );

    if ( $type === 'two' ) {
        if ( ! $product || ! $product->is_on_sale() ) {
        return;
       }
        ?>
        <div class="s1-adv-burst" style="<?php echo esc_attr($style); ?>">
            <div><?php echo esc_html($value); ?></div>
            <small><?php echo esc_html__( 'OFF', 'th-store-one' ); ?></small>
        </div>
        <?php
    }

    elseif ( $type === "four" ) {
if ( ! $product || ! $product->is_on_sale() ) {
        return;
       }
        $stylec = sprintf(
            '--badge-4-color:%s; --badge-4-txt:%s;',
            $stylee['bgclr'] ?? '#47DCBF',
            $stylee['textclr'] ?? '#ffffff'
        );
        ?>
        <div class="s1-preview-badge s1-corner-badge">
            <div class="s1-badge-shape" style="<?php echo esc_attr($stylec); ?>">
                <svg viewBox="0 0 91.333 91">
                    <polygon points="53.666,0 91.333,38.385 91.333,91 0,0" />
                </svg>
            </div>

            <div class="s1-badge-text" style="<?php echo esc_attr($stylec); ?>">
                <div class="value">-<?php echo esc_html($value); ?></div>
            </div>
        </div>
        <?php
    }

    elseif ( $type === "five" ) {

        if($product->get_stock_quantity() ==''){
            return;
        }

        $stylec = sprintf(
            '--badge-5-color:%s; --badge-5-txt:%s;',
            $stylee['bgclr'] ?? '#da9005',
            $stylee['textclr'] ?? '#ffffff'
        );
        ?>
        <div class="s1-adv-css-badge s1-5">
            <div class="s1-css-s1" style="<?php echo esc_attr($stylec); ?>"></div>

            <div class="s1-css-text" style="<?php echo esc_attr($stylec); ?>">
               <?php
                echo esc_html(
                    
                    sprintf(
                        /* translators: %d: available stock quantity */
                        __( 'Only %d available', 'th-store-one' ),
                        $product->get_stock_quantity()
                    )
                );
                ?>
            </div>
        </div>
        <?php
    }
    elseif ( $type === "daimond" ) {
    if ( ! $product || ! $product->is_on_sale() ) {
        return;
       }
        $stylec = sprintf(
            '--badge-daimondbgcolor:%s; --badge-daimondtxt:%s;',
            $stylee['bgclr'] ?? 'linear-gradient(135deg, #ff7a18, #ff3d00)',
            $stylee['textclr'] ?? '#ffffff'
        );
        ?>
        <div class="s1-adv-css-badge s1-daimond">
            <div class="s1-diamond-badge" style="<?php echo esc_attr($stylec); ?>">
                <span>-<?php echo esc_html($value); ?></span>
            </div>
        </div>
        <?php
    }

    elseif ( $type === "circle" ) {
if ( ! $product || ! $product->is_on_sale() ) {
        return;
       }
        $stylec = sprintf(
            '--badge-circlebgcolor:%s; --badge-circletxt:%s;',
            $stylee['bgclr'] ?? 'radial-gradient(circle, #ff4d6d 0%, #ff0033 100%)',
            $stylee['textclr'] ?? '#ffffff'
        );
        ?>
        <div class="s1-adv-css-badge s1-circle">
            <div class="s1-off-badge" style="<?php echo esc_attr($stylec); ?>">
                <div class="s1-off-inner">
                    <span class="s1-off-value"><?php echo esc_html($value); ?></span>
                    <span class="s1-off-text"><?php echo esc_html__( 'OFF', 'th-store-one' ); ?></span>
                </div>
            </div>
        </div>
        <?php
    }

    elseif ( $type === "simplecircle" ) {
        if ( ! $product || ! $product->is_on_sale() ) {
        return;
       }
        $stylec = sprintf(
            '--badge-simplecirclebgcolor:%s; --badge-simplecircletxt:%s;',
            $stylee['bgclr'] ?? '#8BC34A',
            $stylee['textclr'] ?? '#ffffff'
        );
        ?>
        <div class="s1-adv-css-badge s1-simple-circle">
        <div class="s1-off-badge" style="<?php echo esc_attr($stylec); ?>">
        <div class="s1-off-inner">
          <span class="s1-off-value"><?php echo esc_html($value); ?></span>
          <span class="s1-off-text"><?php echo esc_html__( 'OFF', 'th-store-one' ); ?></span>
        </div>
        </div>
      </div>
        <?php
    }
    elseif ( $type === "simplenew" ) {
        if ( ! $product || ! $product->is_on_sale() ) {
        return;
       }
       $radius = $stylee['border']['radius'] ?? [];

        $stylec = sprintf(
            '--badge-simplenewbgcolor:%s; --badge-simplenewtxt:%s; border-radius:%s %s %s %s;',
            $stylee['bgclr'] ?? 'linear-gradient(90deg, #f59e0b, #f97316)',
            $stylee['textclr'] ?? '#ffffff',
            $radius['top'] ?? '0px',
            $radius['right'] ?? '0px',
            $radius['bottom'] ?? '0px',
            $radius['left'] ?? '0px'
        );
        
        ?>
        <div class="s1-preview-badge">
          <div class="s1-css-badge-simple"  style="<?php echo esc_attr($stylec); ?>">
            <div class="s1-css-badge-inner">
              <span class="s1-off-value"><?php echo esc_html($value); ?> <?php echo esc_html__( 'OFF', 'th-store-one' ); ?></span>
            </div>
          </div>
        </div>
        <?php
    }
    elseif ( $type === "simpleaval" ) {
       if($product->get_stock_quantity() ==''){
            return;
        }

       $radius = $stylee['border']['radius'] ?? [];

        $stylec = sprintf(
            '--badge-simpleavalbgcolor:%s; --badge-simpleavaltxt:%s; border-radius:%s %s %s %s;',
            $stylee['bgclr'] ?? '#00cfb0',
            $stylee['textclr'] ?? '#ffffff',
            $radius['top'] ?? '0px',
            $radius['right'] ?? '0px',
            $radius['bottom'] ?? '0px',
            $radius['left'] ?? '0px'
        );
        
        ?>
        <div class="s1-preview-badge">
          <div class="s1-css-badge-simple-available"  style="<?php echo esc_attr($stylec); ?>">
            <div class="s1-css-badge-inner">
              <span class="s1-off-value"><?php
                echo esc_html(
                     
                    sprintf(
                        /* translators: %d: available stock quantity */
                        __( 'Only %d available', 'th-store-one' ),
                        $product->get_stock_quantity()
                    )
                );
                ?></span>
            </div>
          </div>
        </div>
        <?php
    }

    else {
        $stylec = sprintf(
            '--adv-bg:%s; --adv-txt:%s;',
            esc_attr( $stylee['bgclr'] ?? '#673ab7' ),
            esc_attr( $stylee['textclr'] ?? '#fff' )
        );
        ?>
        <div class="s1-adv-circle" style="<?php echo esc_attr($stylec); ?>">
            <div><?php echo esc_html($value); ?></div>
            <small><?php echo esc_html__( 'OFF', 'th-store-one' ); ?></small>
        </div>
        <?php
    }
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

    // Percentage
    if ( ($rule['displayBadge'] ?? '') === 's1-percent' ) {
        return round( ( $discount / $regular ) * 100 ) . '%';
    }

    // Remove trailing .00
    $decimals = wc_get_price_decimals();

    if ( $decimals > 0 ) {
        $discount = number_format( $discount, $decimals, '.', '' );
        $discount = rtrim( rtrim( $discount, '0' ), '.' ); 
    }

    return get_woocommerce_currency_symbol() . $discount;
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
$translate = '';

if ( ($pos['mode'] ?? '') === 'fixed' ) {

    if ( ($pos['position'] ?? '') === 'top' ) $css .= 'top:0px;';
    
    if ( ($pos['position'] ?? '') === 'middle' ) {
        $css .= 'top:50%;';
        $translate .= 'translateY(-50%) ';
    }

    if ( ($pos['position'] ?? '') === 'bottom' ) $css .= 'bottom:0px;';

    if ( ($pos['align'] ?? '') === 'left' ) $css .= 'left:0px;';

    if ( ($pos['align'] ?? '') === 'right' ) $css .= 'right:0px;';

    if ( ($pos['align'] ?? '') === 'center' ) {
        $css .= 'left:50%;';
        $translate .= 'translateX(-50%) ';
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

/* ---------- FINAL TRANSFORM (SINGLE) ---------- */
$final_transform = trim($rotate . ' ' . $flip_css . ' ' . $translate);

if ( ! empty($final_transform) ) {
    $css .= 'transform:' . $final_transform . ';';
}

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

    $padding['top']    = ! empty($padding['top']) && $padding['top'] !== '0'
        ? th_store_one_with_unit($padding['top'])
        : '6px';

    $padding['right']  = ! empty($padding['right']) && $padding['right'] !== '0'
        ? th_store_one_with_unit($padding['right'])
        : '8px';

    $padding['bottom'] = ! empty($padding['bottom']) && $padding['bottom'] !== '0'
        ? th_store_one_with_unit($padding['bottom'])
        : '6px';

    $padding['left']   = ! empty($padding['left']) && $padding['left'] !== '0'
        ? th_store_one_with_unit($padding['left'])
        : '8px';
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

        $limit = apply_filters( 'storeone_recent_products_limit', 10 );

        $args = array(
            'post_type'      => 'product',
            'posts_per_page' => $limit,
            'post_status'    => 'publish',
            'orderby'        => 'date',
            'order'          => 'DESC',
            'fields'         => 'ids',
            'no_found_rows'  => true, // performance boost
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

        $limit = 10;

        $query = new WC_Product_Query( array(
            'limit'   => $limit,
            'orderby' => 'popularity',
            'return'  => 'ids',
        ) );

        $top_ids = $query->get_products();
    }

    return in_array( $product->get_id(), $top_ids, true );
}

}