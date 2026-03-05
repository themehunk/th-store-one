<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class StoreOne_Quick_Social {

    private $rules = array();

    public function __construct() {

        $all_modules = get_option( 'store_one_module_set', array() );
        $this->rules = $all_modules['quick-social']['rules'] ?? array();
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
        add_action( 'wp_footer', array( $this, 'render_auto' ), 99 );
        add_shortcode( 'storeone_quick_social', array( $this, 'shortcode' ) );
        add_action( 'wp', array( $this, 'register_single_hooks' ) );
        
    }

    public function enqueue_assets() {

        wp_enqueue_style(
            'storeone-quick-social',
            STORE_ONE_PLUGIN_URL . 'assets/css/quick-social.css',
            array(),
            STORE_ONE_VERSION
        );
        wp_enqueue_script(
        'storeone-quick-social-js',
        STORE_ONE_PLUGIN_URL . 'assets/js/quick-social.js',
        array(),
        STORE_ONE_VERSION,
        true
    );
    }

    public function render_auto() {
        echo $this->generate_output();
    }

    public function shortcode( $atts ) {

        $atts = shortcode_atts(
            array( 'id' => '' ),
            $atts
        );

        return $this->generate_output( $atts['id'] );
    }

    /* ================= MAIN OUTPUT ================= */

    private function generate_output( $specific_id = '' ) {

        if ( empty( $this->rules ) ) return '';

        ob_start();

        foreach ( $this->rules as $rule ) {

            if ( ! empty( $specific_id ) && $rule['flexible_id'] !== $specific_id ) continue;
            if ( ($rule['status'] ?? '') !== 'active' ) continue;

            // Skip trigger check for shortcode usage
            if ( empty( $specific_id ) && ! $this->should_display_rule( $rule ) ) continue;

                $classes = '';
                
                if ($rule['trigger_type'] == 'all_single' && $rule['onpage_enabled'] == true) {
                   $classes = 's1-quick-social s1-quick-social-onpage'; 
                }else{
                    $classes = 's1-quick-social s1-quick-social--' . esc_attr($rule['social_style'] ?? 'style1');
                }

            ?>
           
            <div class="<?php echo esc_attr($classes); ?>"
                 style="<?php echo esc_attr( $this->generate_inline_styles( $rule ) ); ?>">

                <div class="s1-quick-social__inner">
            <?php
            $social_list = $rule['social_list'] ?? array();
            $visible_limit = $rule['max_show'] ?? 4;

            $visible_items = array_slice( $social_list, 0, $visible_limit );
            $hidden_items  = array_slice( $social_list, $visible_limit );
            ?>
            <?php foreach ( $visible_items as $item ) :

                $tab  = $item['itemTab'] ?? 'social';
                $data = $item[$tab] ?? array();
                $url  = $this->build_dynamic_url( $data );
                if ( empty( $url ) ) continue;

                $label = ! empty( $data['custom_label'] )
                    ? $data['custom_label']
                    : ucfirst( $data['selected_icon'] ?? '' );
            ?>
            <?php
            $brand_style = '';

            if ( ! empty( $rule['original_enabled'] ) ) {
                $brand_style = $this->get_brand_style( $data['selected_icon'] ?? '' );
            }
            ?>
                <a href="<?php echo esc_url( $url ); ?>"
                target="_blank"
                rel="noopener noreferrer"
                class="s1-quick-social__item"
                data-tooltip="<?php echo esc_attr( $label ); ?>"
                style="<?php echo esc_attr( $brand_style ); ?>">

                    <span class="s1-quick-social__icon">
                        <?php echo $this->get_icon_markup( $data ); ?>
                    </span>

                </a>
                <?php endforeach; ?>
                    <?php if ( ! empty( $hidden_items ) ) : ?>
                        <span class="s1-quick-social__item s1-more-trigger"
                            data-tooltip="More">

                            <span class="s1-quick-social__icon">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                            </span>

                        </span>
                    <?php endif; ?>

                            </div>

                        </div>
                    <?php if ( ! empty( $social_list ) ) : ?>
                <div class="s1-popup-overlay" style="<?php echo esc_attr( $this->generate_inline_styles( $rule ) ); ?>">
                <div class="s1-popup-content">

                    <div class="s1-popup-header">
                        <button class="s1-popup-close">&times;</button>
                    </div>

                    <div class="s1-popup-icons">
                        <?php foreach ( $social_list as $item ) :

                            $tab  = $item['itemTab'] ?? 'social';
                            $data = $item[$tab] ?? array();
                            $url  = $this->build_dynamic_url( $data );
                            if ( empty( $url ) ) continue;

                            $label = ! empty( $data['custom_label'] )
                                ? $data['custom_label']
                                : ucfirst( $data['selected_icon'] ?? '' );
                                $brand_style = '';
                            if ( ! empty( $rule['original_enabled'] ) ) {
                                $brand_style = $this->get_brand_style( $data['selected_icon'] ?? '' );
                            }
                        ?>
                            <a href="<?php echo esc_url( $url ); ?>"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="s1-quick-social__item"
                            data-tooltip="<?php echo esc_attr( $label ); ?>"
                            style="<?php echo esc_attr( $brand_style ); ?>"
                            >
                            <span class="s1-quick-social__icon">
                                <?php echo $this->get_icon_markup( $data ); ?>
                            </span>
                            </a>
                        <?php endforeach; ?>
                    </div>

                </div>
            </div>
            <?php endif; ?>
                        <?php
                    }

                    return ob_get_clean();
                }

    /* ================= DYNAMIC URL BUILDER ================= */

   private function build_dynamic_url( $data ) {

    if ( empty( $data ) ) return '';

    $platform   = strtoupper( $data['selected_icon'] ?? '' );
    $custom_url = trim( $data['url'] ?? '' );

    /* ================= OTHER TAB FIX ================= */

    if ( ! isset( $data['social_choose'] ) ) {

        if ( empty( $custom_url ) || $custom_url === '{CUSTOM_URL}' ) {
            return '';
        }

        if ( ! preg_match( '#^(https?|mailto|tel|sms):#', $custom_url ) ) {
            $custom_url = 'https://' . $custom_url;
        }

        return esc_url( $custom_url );
    }

    /* ================= NORMAL FLOW ================= */

    $mode = $data['social_choose'] ?? 'share';

    if ( $mode === 'profile' ) {

        if ( empty( $custom_url ) ) return '';

        if ( ! preg_match( '#^(https?|mailto|tel|sms):#', $custom_url ) ) {
            $custom_url = 'https://' . $custom_url;
        }

        return esc_url( $custom_url );
    }


    /* ================= PROFILE MODE ================= */
    if ( $mode === 'profile' ) {

    if ( empty( $custom_url ) ) return '';

    $phone   = trim( $data['phone'] ?? '' );
    $message = trim( $data['message'] ?? '' );

    /* CLEAN PHONE + MESSAGE */
    $phone   = trim( $phone, '{}' );
    $message = trim( $message, '{}' );

    /* ===== FIX IF MESSAGE ALREADY INSIDE URL ===== */

    // Decode URL so %7B %7D become { }
    $decoded_url = urldecode( $custom_url );

    // Remove any curly brackets globally
    $decoded_url = str_replace( array('{','}'), '', $decoded_url );

    $custom_url = $decoded_url;

    // Replace MOBILE
    if ( strpos( $custom_url, '{MOBILE_NUMBER}' ) !== false ) {
        if ( ! empty( $phone ) ) {
            $custom_url = str_replace( '{MOBILE_NUMBER}', $phone, $custom_url );
        }
    }

    // Replace MESSAGE
    if ( strpos( $custom_url, '{YOUR_MESSAGE}' ) !== false ) {
        if ( ! empty( $message ) ) {
            $custom_url = str_replace(
                '{YOUR_MESSAGE}',
                urlencode( $message ),
                $custom_url
            );
        }
    }

    // Re-encode URL
    $custom_url = esc_url_raw( $custom_url );

    if ( ! preg_match( '#^(https?|mailto|tel|sms):#', $custom_url ) ) {
        $custom_url = 'https://' . $custom_url;
    }

    return esc_url( $custom_url );
   }

    /* ================= SHARE MODE ================= */

    if ( function_exists( 'is_product' ) && is_product() ) {
        global $product;
        $page_url   = $product ? get_permalink( $product->get_id() ) : get_permalink();
        $page_title = $product ? $product->get_name() : get_the_title();
    } elseif ( is_singular() ) {
        $page_url   = get_permalink();
        $page_title = get_the_title();
    } else {
        $page_url   = home_url();
        $page_title = get_bloginfo( 'name' );
    }

    $encoded_url  = urlencode( $page_url );
    $share_text   = ! empty( $data['share_text'] ) ? $data['share_text'] : $page_title;
    $encoded_text = urlencode( $share_text );

    switch ( $platform ) {

        case 'FACEBOOK':
            return "https://www.facebook.com/sharer/sharer.php?u={$encoded_url}";

        case 'TWITTER':
            return "https://twitter.com/intent/tweet?url={$encoded_url}&text={$encoded_text}";

        case 'LINKEDIN':
            return "https://www.linkedin.com/sharing/share-offsite/?url={$encoded_url}";

        case 'PINTEREST':
            return "https://pinterest.com/pin/create/button/?url={$encoded_url}&description={$encoded_text}";

        case 'WHATSAPP':
            return "https://wa.me/?text={$encoded_text}%20{$encoded_url}";

        case 'TELEGRAM':
            return "https://t.me/share/url?url={$encoded_url}&text={$encoded_text}";

        case 'YOUTUBE':
        case 'INSTAGRAM':
        case 'TIKTOK':
        case 'SNAPCHAT':
            return ! empty( $custom_url ) ? esc_url( $custom_url ) : '';

        default:
            return esc_url( $custom_url );
    }
   }

    /* ================= STYLE VARS ================= */

    private function generate_inline_styles( $rule ) {

    $output = '';

    /* ================= BRAND MODE ================= */
    if ( ! empty( $rule['original_enabled'] ) ) {

        // Disable custom dynamic colors
        $output .= '--s1-icon-bg:transparent;';
        $output .= '--s1-icon-color:inherit;';
        $output .= '--s1-icon-bg-hover:transparent;';
        $output .= '--s1-icon-color-hover:inherit;';

    } else {

        $styles = array(
            '--s1-icon-color'       => $rule['icon_clr'] ?? '#111',
            '--s1-icon-bg'          => $rule['icon_bg_clr'] ?? '#fff',
            '--s1-icon-bg-hover'    => $rule['icon_bg_hvr_clr'] ?? '#eee',
            '--s1-icon-color-hover' => $rule['icon_hvr_clr'] ?? '#2563eb',
        );

        foreach ( $styles as $key => $value ) {
            $output .= $key . ':' . esc_attr( $value ) . ';';
        }
    }

    /* ALWAYS APPLY THESE */
    $output .= '--s1-icon-size:' . esc_attr( $rule['icon_size'] ?? '18px' ) . ';';
    $output .= '--s1-border-radius:' . esc_attr( $rule['border_radius'] ?? '50%' ) . ';';
    $output .= '--s1-top:' . esc_attr( $rule['position_top'] ?? '50%' ) . ';';
    $output .= '--s1-left:' . esc_attr( $rule['position_left'] ?? '10px' ) . ';';
    $output .= '--s1-bottom:' . esc_attr( $rule['position_bottom'] ?? '20px' ) . ';';
    $output .= '--s1-right:' . esc_attr( $rule['position_right'] ?? '10px' ) . ';';

    return $output;
}

private function get_brand_style( $icon ) {

    $icon = strtoupper( $icon );

    $colors = array(
    'FACEBOOK'      => '#1877F2',
    'INSTAGRAM'     => '#E4405F',
    'TWITTER'       => '#000000',
    'LINKEDIN'      => '#0A66C2',
    'YOUTUBE'       => '#FF0000',
    'PINTEREST'     => '#E60023',
    'TIKTOK'        => '#000000',
    'SNAPCHAT'      => '#FFFC00',
    'TELEGRAM'      => '#0088CC',
    'WHATSAPP'      => '#25D366',
    'MESSENGER'     => '#0084FF',
    'VIBER'         => '#7360F2',
    'WECHAT'        => '#07C160',
    'LINE'          => '#00C300',
    'SKYPE'         => '#00AFF0',
    'DISCORD'       => '#5865F2',
    'EMAIL'         => '#EA4335',
    'GMAIL'         => '#EA4335',
    'OUTLOOK'       => '#0078D4',
    'PHONE'         => '#34B7F1',
    'SMS'           => '#4CAF50',
    'GITHUB'        => '#181717',
    'BEHANCE'       => '#1769FF',
    'GITLAB'        => '#FC6D26',
    'STACKOVERFLOW' => '#F48024',
    'DRIBBLE'       => '#EA4C89',
    'GOOGLE_MAPS'   => '#EA4335',
    'YELP'          => '#D32323',
    'GOOGLEBUSS'    => '#4285F4',
    'TRUSTPILOT'    => '#00B67A',
    'TRIPADVISER'   => '#34E0A1',
    'WEBSITE'       => '#2563EB',
    'RSS'           => '#FF6600',
    'CUSTOM'        => '#6B7280',
);

    /* Instagram Special Gradient */
    if ( $icon === 'INSTAGRAM' ) {
        return 'background:linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4);color:#fff;';
    }

    if ( isset( $colors[$icon] ) ) {
        return 'background:' . esc_attr( $colors[$icon] ) . ';color:#fff;';
    }

    return '';
}

    /* ================= TRIGGER LOGIC FIXED ================= */

    private function should_display_rule( $rule ) {

        $trigger = $rule['trigger_type'] ?? '';

        switch ( $trigger ) {

            case 'all_pages':
                return is_singular(); // posts + pages

            case 'all_products':
                return function_exists('is_product') && is_product();

            case 'home_page_only':
                return is_front_page();

            case 'specific_pages':
                return is_page() && in_array( get_the_ID(), $rule['pages'] ?? array(), true );

            case 'specific_products':
                if ( function_exists('is_product') && is_product() ) {
                    global $product;
                    return in_array( $product->get_id(), $rule['products'] ?? array(), true );
                }
                return false;

            case 'custom_shrtcd':
                return false; // only render via shortcode

            default:
                return false;
        }
    }

    /* ================= ICON RENDER ================= */

    private function get_icon_markup( $data ) {

        if ( ! empty( $data['custom_svg'] ) ) {
            return wp_kses_post( $data['custom_svg'] );
        }

        if ( ! empty( $data['image_url'] ) ) {
            return '<img src="' . esc_url( $data['image_url'] ) . '" alt="" />';
        }

        return $this->get_predefined_svg( $data['selected_icon'] ?? '' );
    }


  public function register_single_hooks() {

    if ( empty( $this->rules ) ) {
        return;
    }

    foreach ( $this->rules as $rule ) {

        if ( ($rule['trigger_type'] ?? '') !== 'all_single' ) {
            continue;
        }

        if ( empty( $rule['onpage_enabled'] ) ) {
            continue;
        }

        $placement = $rule['placement'] ?? 'after_summary';

        switch ( $placement ) {

            case 'after_title':
                add_action(
                    'woocommerce_single_product_summary',
                    function() use ( $rule ) {
                        echo $this->generate_output( $rule['flexible_id'] );
                    },
                    6
                );
                break;

            case 'before_add_to_cart':
                add_action(
                    'woocommerce_before_add_to_cart_form',
                    function() use ( $rule ) {
                        echo $this->generate_output( $rule['flexible_id'] );
                    }
                );
                break;

            case 'after_add_to_cart':
                add_action(
                    'woocommerce_after_add_to_cart_form',
                    function() use ( $rule ) {
                        echo $this->generate_output( $rule['flexible_id'] );
                    }
                );
                break;

            case 'after_summary':
            default:
                add_action(
                    'woocommerce_after_single_product_summary',
                    function() use ( $rule ) {
                        echo $this->generate_output( $rule['flexible_id'] );
                    },
                    5
                );
                break;
        }
    }
  }
    private function get_predefined_svg( $icon ) {

        switch ( strtoupper( $icon ) ) {

            case 'FACEBOOK':
                return ' <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M22 12A10 10 0 1 0 10.94 21.95V14.89H8.41V12h2.53V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v7.06A10 10 0 0 0 22 12z"/>
    </svg>';

            case 'INSTAGRAM':
                return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm5 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.88a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0z"/>
    </svg>';

            case 'TWITTER':
                return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18.244 2H21.5l-7.59 8.67L23 22h-6.828l-5.346-6.987L4.5 22H1.244l8.108-9.264L1 2h6.828l4.836 6.356L18.244 2zm-1.2 18h1.89L7.004 4H5.05l11.994 16z"/>
</svg>';

            case 'LINKEDIN':
                return ' <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7 0h4.8v2.2h.07c.67-1.27 2.3-2.6 4.73-2.6C22 7.6 24 10 24 14.2V24h-5v-8.3c0-2-.03-4.5-2.75-4.5-2.75 0-3.17 2.15-3.17 4.36V24H7V8z"/>
    </svg>';

            case 'YOUTUBE':
                return ' <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M23.5 6.2a2.96 2.96 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A2.96 2.96 0 0 0 .5 6.2C0 8.2 0 12 0 12s0 3.8.5 5.8a2.96 2.96 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a2.96 2.96 0 0 0 2.1-2.1c.5-2 .5-5.8.5-5.8s0-3.8-.5-5.8zM9.5 15.5v-7l6 3.5-6 3.5z"/>
    </svg>';

            case 'PINTEREST':
                return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.38 2 11.88c0 4.22 2.64 7.82 6.36 9.26-.08-.78-.16-1.98.04-2.84.18-.78 1.18-4.98 1.18-4.98s-.3-.6-.3-1.48c0-1.38.8-2.42 1.8-2.42.84 0 1.24.62 1.24 1.36 0 .82-.52 2.06-.8 3.2-.22.92.46 1.68 1.36 1.68 1.64 0 2.9-1.74 2.9-4.26 0-2.22-1.6-3.78-3.9-3.78-2.66 0-4.22 2-4.22 4.06 0 .8.3 1.66.7 2.12.08.1.1.2.08.32-.08.36-.26 1.14-.3 1.3-.04.2-.14.24-.32.14-1.2-.56-1.96-2.32-1.96-3.74 0-3.04 2.22-5.82 6.4-5.82 3.36 0 5.98 2.4 5.98 5.62 0 3.36-2.12 6.06-5.06 6.06-1 0-1.94-.52-2.26-1.14l-.62 2.36c-.22.84-.82 1.9-1.22 2.54.92.28 1.9.44 2.92.44 5.52 0 10-4.38 10-9.88C22 6.38 17.52 2 12 2z"/>
  </svg>';

            case 'TIKTOK':
                return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.77h-3.07v13.4a2.75 2.75 0 1 1-2.75-2.75c.23 0 .45.03.66.08V9.56a5.82 5.82 0 1 0 5.82 5.82V8.9a8.06 8.06 0 0 0 4.7 1.48V7.3a4.8 4.8 0 0 1-1.59-.61z"/>
  </svg>';

            case 'SNAPCHAT':
                return '<svg width="18" height="18" fill="currentColor" class="bi bi-snapchat" viewBox="0 0 16 16">
  <path d="M15.943 11.526c-.111-.303-.323-.465-.564-.599a1 1 0 0 0-.123-.064l-.219-.111c-.752-.399-1.339-.902-1.746-1.498a3.4 3.4 0 0 1-.3-.531c-.034-.1-.032-.156-.008-.207a.3.3 0 0 1 .097-.1c.129-.086.262-.173.352-.231.162-.104.289-.187.371-.245.309-.216.525-.446.66-.702a1.4 1.4 0 0 0 .069-1.16c-.205-.538-.713-.872-1.329-.872a1.8 1.8 0 0 0-.487.065c.006-.368-.002-.757-.035-1.139-.116-1.344-.587-2.048-1.077-2.61a4.3 4.3 0 0 0-1.095-.881C9.764.216 8.92 0 7.999 0s-1.76.216-2.505.641c-.412.232-.782.53-1.097.883-.49.562-.96 1.267-1.077 2.61-.033.382-.04.772-.036 1.138a1.8 1.8 0 0 0-.487-.065c-.615 0-1.124.335-1.328.873a1.4 1.4 0 0 0 .067 1.161c.136.256.352.486.66.701.082.058.21.14.371.246l.339.221a.4.4 0 0 1 .109.11c.026.053.027.11-.012.217a3.4 3.4 0 0 1-.295.52c-.398.583-.968 1.077-1.696 1.472-.385.204-.786.34-.955.8-.128.348-.044.743.28 1.075q.18.189.409.31a4.4 4.4 0 0 0 1 .4.7.7 0 0 1 .202.09c.118.104.102.26.259.488q.12.178.296.3c.33.229.701.243 1.095.258.355.014.758.03 1.217.18.19.064.389.186.618.328.55.338 1.305.802 2.566.802 1.262 0 2.02-.466 2.576-.806.227-.14.424-.26.609-.321.46-.152.863-.168 1.218-.181.393-.015.764-.03 1.095-.258a1.14 1.14 0 0 0 .336-.368c.114-.192.11-.327.217-.42a.6.6 0 0 1 .19-.087 4.5 4.5 0 0 0 1.014-.404c.16-.087.306-.2.429-.336l.004-.005c.304-.325.38-.709.256-1.047m-1.121.602c-.684.378-1.139.337-1.493.565-.3.193-.122.61-.34.76-.269.186-1.061-.012-2.085.326-.845.279-1.384 1.082-2.903 1.082s-2.045-.801-2.904-1.084c-1.022-.338-1.816-.14-2.084-.325-.218-.15-.041-.568-.341-.761-.354-.228-.809-.187-1.492-.563-.436-.24-.189-.39-.044-.46 2.478-1.199 2.873-3.05 2.89-3.188.022-.166.045-.297-.138-.466-.177-.164-.962-.65-1.18-.802-.36-.252-.52-.503-.402-.812.082-.214.281-.295.49-.295a1 1 0 0 1 .197.022c.396.086.78.285 1.002.338q.04.01.082.011c.118 0 .16-.06.152-.195-.026-.433-.087-1.277-.019-2.066.094-1.084.444-1.622.859-2.097.2-.229 1.137-1.22 2.93-1.22 1.792 0 2.732.987 2.931 1.215.416.475.766 1.013.859 2.098.068.788.009 1.632-.019 2.065-.01.142.034.195.152.195a.4.4 0 0 0 .082-.01c.222-.054.607-.253 1.002-.338a1 1 0 0 1 .197-.023c.21 0 .409.082.49.295.117.309-.04.56-.401.812-.218.152-1.003.638-1.18.802-.184.169-.16.3-.139.466.018.14.413 1.991 2.89 3.189.147.073.394.222-.041.464"/>
</svg>';
  case 'WHATSAPP':
                return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.2 6.38 2.2 11.84c0 1.92.5 3.7 1.46 5.28L2 22l5-1.6a9.79 9.79 0 0 0 5.04 1.36c5.46 0 9.84-4.38 9.84-9.84S17.5 2 12.04 2zm0 17.9c-1.6 0-3.15-.42-4.5-1.22l-.32-.18-2.96.95.97-2.88-.2-.33a7.78 7.78 0 0 1-1.2-4.2c0-4.34 3.53-7.88 7.88-7.88 4.35 0 7.88 3.54 7.88 7.88 0 4.35-3.53 7.88-7.88 7.88zm4.35-5.92c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.44-1.34-1.68-.14-.24-.02-.36.1-.48.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.12 3.64.58.26 1.04.42 1.4.54.58.18 1.1.16 1.52.1.46-.06 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>';
    case 'TELEGRAM':
                return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M21.5 2.5L2.8 9.7c-1.28.5-1.27 1.23-.23 1.55l4.8 1.5 1.84 5.78c.23.7.12.98.86.98.58 0 .83-.26 1.15-.58.2-.2.94-.92 1.92-1.86l4 2.94c.74.4 1.28.2 1.46-.7l3.03-14.3c.27-1.1-.42-1.6-1.2-1.25zM8.2 12.3l9.6-6.06c.48-.3.92-.14.56.18l-8.24 7.44-.32 3.36-.6-4.92z" />
    </svg>';
    case 'MESSENGER':
            return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.02 2 11c0 2.54 1.18 4.82 3.08 6.47V22l4.18-2.3c.9.25 1.85.39 2.84.39 5.52 0 10-4.02 10-9S17.52 2 12 2z"/>
            </svg>';
    case 'WEBSITE':
            return ' <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.93 9h-3.18a15.6 15.6 0 00-1.13-5.03A8.03 8.03 0 0119.93 11zM12 4c.9 1.3 1.64 3.1 1.93 5H10.07c.29-1.9 1.03-3.7 1.93-5zM4.07 13h3.18c.23 1.78.84 3.42 1.75 4.8A8.03 8.03 0 014.07 13zm3.18-2H4.07a8.03 8.03 0 014.93-5.03A15.6 15.6 0 007.25 11zm2.82 0c.29-1.9 1.03-3.7 1.93-5 .9 1.3 1.64 3.1 1.93 5H10.07zm1.93 9c-.9-1.3-1.64-3.1-1.93-5h3.86c-.29 1.9-1.03 3.7-1.93 5zm3.62-2.2c.91-1.38 1.52-3.02 1.75-4.8h3.18a8.03 8.03 0 01-4.93 4.8z" />
    </svg>';

        case 'RSS':
            return ' <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M4 4v3a13 13 0 0113 13h3C20 11.16 12.84 4 4 4zm0 6v3a7 7 0 017 7h3c0-5.52-4.48-10-10-10zm0 6a2 2 0 100 4 2 2 0 000-4z" />
    </svg>';
       
    case 'CUSTOM':
             return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M18 16a3 3 0 00-2.24 1.02L8.91 13.7a3.03 3.03 0 000-3.4l6.85-3.32A3 3 0 1014 5a2.98 2.98 0 00.24 1.18L7.39 9.5a3 3 0 100 5l6.85 3.32A3 3 0 0014 19a3 3 0 103-3z" />
    </svg>';

    case 'GOOGLE_MAPS':
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    </svg>';

case 'YELP':
    return '<svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.4 2.1c-.5 0-.9.3-1 .8l-1.2 6.1c-.1.4.1.8.5 1l3.5 1.7c.4.2.9.1 1.1-.3l3.3-5.1c.3-.5.1-1.2-.5-1.4L12.9 2.2c-.2-.1-.3-.1-.5-.1zm-5.7 4c-.4 0-.8.3-.9.7l-.8 4.2c-.1.4.1.8.4 1l3.6 1.8c.4.2.9 0 1.1-.4l1.7-3.6c.2-.4 0-.9-.4-1.1L7.3 6.2c-.2-.1-.4-.1-.6-.1zm9.9 4.3c-.3 0-.6.2-.8.5l-1.6 3.7c-.2.4 0 .9.4 1.1l3.6 1.8c.4.2.9 0 1-.4l.8-4.2c.1-.4-.1-.8-.5-1l-3.6-1.8c-.1-.1-.2-.1-.3-.1zm-6.7 5.1c-.3 0-.6.2-.8.4l-3.2 5.2c-.3.5-.1 1.2.5 1.4l5.1 2.7c.5.3 1.2.1 1.4-.5l1.2-6.1c.1-.4-.1-.8-.5-1l-3.5-1.7c-.1-.1-.2-.1-.3-.1z" />
    </svg>';

case 'TRUSTPILOT':
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6L12 2z"/>
    </svg>';

case 'GOOGLEBUSS':
    return '<svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3 7l1-4h16l1 4v2a3 3 0 01-3 3 3 3 0 01-2-1 3 3 0 01-4 0 3 3 0 01-4 0 3 3 0 01-2 1 3 3 0 01-3-3V7z" />
      <path d="M5 11h14v9H5z" />
    </svg>';

case 'TRIPADVISER':
    return '<svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 5c2.4 0 4.5.8 6 2.2l2-.4-1.2 1.8c.4.7.7 1.5.7 2.4 0 2.8-2.2 5-5 5-1.4 0-2.7-.6-3.5-1.6C10.2 15.4 8.9 16 7.5 16c-2.8 0-5-2.2-5-5 0-.9.3-1.7.7-2.4L2 6.8l2 .4C5.5 5.8 7.6 5 10 5h2zm-4.5 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm9 0a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
    </svg>';
case 'BEHANCE':
    return '<svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3 6h5.5c2.5 0 4 1.2 4 3.2 0 1.3-.7 2.2-1.8 2.6 1.5.4 2.4 1.6 2.4 3.1 0 2.3-1.8 3.6-4.5 3.6H3V6zm5.3 5.1c1.3 0 2-.6 2-1.6 0-1-.7-1.5-2-1.5H5v3.1h3.3zm.2 5.1c1.4 0 2.2-.6 2.2-1.8 0-1.1-.8-1.7-2.2-1.7H5v3.5h3.5zM15 8h6v1.5h-6V8zm3 3c3 0 4.5 2 4.5 4.6 0 .3 0 .6-.1.9h-6.9c.2 1.3 1.1 2 2.5 2 .9 0 1.7-.3 2.2-1l1.8 1.2c-.9 1.3-2.3 2-4 2-3 0-5-2-5-5s2-4.7 5-4.7zm-2.4 3.3h4.7c-.1-1.2-.9-2-2.3-2-1.2 0-2.1.7-2.4 2z" />
    </svg>';
case 'GITLAB':
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M22.65 14.39L12 22.5 1.35 14.39a1 1 0 01-.36-1.1L3.3 6.1a.8.8 0 011.5-.08l2.1 6.55h10.2l2.1-6.55a.8.8 0 011.5.08l2.31 7.19a1 1 0 01-.36 1.1z" />
    </svg>';
case 'STACKOVERFLOW':
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M17.473 20.004H6.527v-5.454h1.818v3.636h7.31V14.55h1.818v5.454zM9.45 14.55h7.1v1.818h-7.1V14.55zm.363-3.818l6.737 1.41-.364 1.78-6.736-1.41.363-1.78zm1.454-4.182l6.364 2.973-.727 1.636-6.364-2.973.727-1.636zm2.546-4.546l5.273 4.545-1.182 1.364-5.273-4.545 1.182-1.364z" />
    </svg>';
case 'DRIBBLE':
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.93 6.36a8.02 8.02 0 01-3.48.54 17.62 17.62 0 00-1.68-3.3 8.05 8.05 0 015.16 2.76zM12 4a8 8 0 012.8.52 15.9 15.9 0 011.82 3.46 26.2 26.2 0 01-7.24-.1 14.93 14.93 0 011.64-3.36A8 8 0 0112 4zM6.7 5.54a16.2 16.2 0 001.7 3.34 26.03 26.03 0 01-3.86 1.2A8.02 8.02 0 016.7 5.54zM4 12c0-.24.01-.48.04-.72a27.87 27.87 0 004.76-1.48 18.2 18.2 0 011.16 2.84 27.4 27.4 0 00-5.92 1.22A8 8 0 014 12zm1.54 3.92a25.66 25.66 0 015.12-1.1 27.92 27.92 0 01.34 4.14A8.04 8.04 0 015.54 15.92zM12 20a8 8 0 01-2.64-.45 29.93 29.93 0 00-.34-4.48 25.77 25.77 0 015.54.06 15.95 15.95 0 011.44 3.1A8 8 0 0112 20zm4.3-2.28a17.66 17.66 0 00-1.3-2.78 27.9 27.9 0 014.3-1.16A8.04 8.04 0 0116.3 17.72z" />
    </svg>';
case 'SMS':
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M20 2H4C2.9 2 2 2.9 2 4v14l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 10H6l-2 2V4h16v8z" />
    </svg>';
case 'GMAIL':
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M2 4v16h20V4H2zm10 9L4 6h16l-8 7zm-8 5V8l8 7 8-7v10H4z" />
    </svg>';
case 'OUTLOOK':
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M4 4h11v4h5v12H4V4zm8 6a3 3 0 100 6 3 3 0 000-6z" />
    </svg>';
case 'PHONE':
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M6.62 10.79a15.07 15.07 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.07 21 3 13.93 3 5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.12.35.03.75-.24 1.02l-2.2 2.2z" />
    </svg>';
    case 'GITHUB':
    return '<svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 008 10.95c.6.1.82-.25.82-.56v-2.02c-3.26.7-3.95-1.57-3.95-1.57-.55-1.38-1.34-1.75-1.34-1.75-1.1-.75.08-.74.08-.74 1.22.08 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.32 3.52 1.01.1-.78.42-1.32.76-1.63-2.6-.3-5.33-1.3-5.33-5.77 0-1.27.45-2.3 1.2-3.1-.12-.3-.52-1.52.11-3.17 0 0 .98-.31 3.2 1.18a11.1 11.1 0 015.84 0c2.21-1.5 3.2-1.18 3.2-1.18.63 1.65.23 2.87.11 3.17.75.8 1.2 1.83 1.2 3.1 0 4.48-2.73 5.47-5.34 5.76.43.37.81 1.1.81 2.22v3.3c0 .31.21.67.83.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>';
 case 'VIBER':
     return '
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2C6.48 2 2 5.58 2 10c0 2.39 1.34 4.55 3.5 6.04V20l3.04-1.67c1.07.3 2.2.47 3.46.47 5.52 0 10-3.58 10-8s-4.48-8-10-8zm3.64 11.27c-.18.51-.94.96-1.29 1.01-.34.05-.77.07-1.24-.08-.29-.1-.66-.22-1.14-.43-2.01-.87-3.32-2.91-3.42-3.05-.09-.14-.82-1.09-.82-2.08 0-.99.52-1.47.7-1.67.18-.2.39-.25.52-.25.13 0 .26 0 .37.01.12 0 .28-.05.44.34.17.41.57 1.42.62 1.53.05.11.08.24.02.38-.06.14-.09.22-.18.34-.09.11-.18.25-.26.33-.09.09-.18.19-.08.38.1.19.46.76.98 1.23.68.6 1.25.79 1.43.88.18.09.29.08.39-.05.1-.13.43-.5.54-.67.11-.17.22-.14.37-.08.15.05.96.45 1.12.53.16.08.27.12.31.19.05.07.05.41-.13.92z" />
    </svg>';
    case 'SKYPE':
     return '
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2a7 7 0 00-6.9 8.1A5.5 5.5 0 0012 22a7 7 0 006.9-8.1A5.5 5.5 0 0012 2zm.3 12.7c-2.1 0-3.4-1.2-3.4-2.8h1.8c.1.8.6 1.3 1.6 1.3.8 0 1.3-.3 1.3-.9 0-.6-.5-.8-1.6-1-1.9-.4-3-1-3-2.6 0-1.6 1.3-2.6 3.2-2.6 1.9 0 3.1 1 3.2 2.6h-1.8c-.1-.7-.6-1.1-1.4-1.1-.7 0-1.2.3-1.2.8 0 .6.6.8 1.8 1.1 1.9.4 2.9 1 2.9 2.6 0 1.7-1.4 2.6-3.4 2.6z" />
    </svg>';
     case 'DISCORD':
     return '
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M20.3 4.1A19.8 19.8 0 0016.7 3c-.2.4-.4.9-.6 1.3-1.6-.2-3.2-.2-4.8 0-.2-.4-.4-.9-.6-1.3-1.2.2-2.4.6-3.6 1.1C4.6 8 4 11.8 4.3 15.6c1.5 1.1 3 1.8 4.5 2.2.4-.6.8-1.2 1.1-1.9-.5-.2-1-.5-1.5-.8.1-.1.2-.2.3-.3 2.9 1.4 6 1.4 8.9 0 .1.1.2.2.3.3-.5.3-1 .6-1.5.8.3.7.7 1.3 1.1 1.9 1.5-.4 3-1.1 4.5-2.2.4-4.3-.7-8.1-2.7-11.5zM9.8 13.8c-.8 0-1.4-.8-1.4-1.8s.6-1.8 1.4-1.8c.8 0 1.4.8 1.4 1.8s-.6 1.8-1.4 1.8zm4.4 0c-.8 0-1.4-.8-1.4-1.8s.6-1.8 1.4-1.8c.8 0 1.4.8 1.4 1.8s-.6 1.8-1.4 1.8z" />
    </svg>';
    case 'LINE':
     return '
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2C6.48 2 2 5.58 2 10c0 3.53 3.58 6.39 8 6.39.72 0 1.41-.08 2.07-.22L15 19l-.76-3.03C17.64 14.83 20 12.6 20 10c0-4.42-4.48-8-8-8zm-3 6h2v4H9V8zm3 0h2v4h-2V8z" />
    </svg>';
    case 'EMAIL':
     return '
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M2 4h20c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm10 7L2 6v12h20V6l-10 5z" />
    </svg>';

default:
    return '';
        }
    }

}