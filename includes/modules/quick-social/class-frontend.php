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
    }

    public function enqueue_assets() {

        wp_enqueue_style(
            'storeone-quick-social',
            STORE_ONE_PLUGIN_URL . 'assets/css/quick-social.css',
            array(),
            STORE_ONE_VERSION
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

            ?>
            <div class="s1-quick-social s1-quick-social--<?php echo esc_attr( $rule['social_style'] ?? 'style1' ); ?>"
                 style="<?php echo esc_attr( $this->generate_inline_styles( $rule ) ); ?>">

                <div class="s1-quick-social__inner">

                    <?php foreach ( $rule['social_list'] ?? array() as $item ) :

                        $tab  = $item['itemTab'] ?? 'social';
                        $data = $item[$tab] ?? array();

                        $url = $this->build_dynamic_url( $data );
                        if ( empty( $url ) ) continue;
                        ?>

                        <a href="<?php echo esc_url( $url ); ?>"
                           target="_blank"
                           rel="noopener noreferrer"
                           class="s1-quick-social__item">

                            <span class="s1-quick-social__icon">
                                <?php echo $this->get_icon_markup( $data ); ?>
                            </span>

                        </a>

                    <?php endforeach; ?>

                </div>
            </div>
            <?php
        }

        return ob_get_clean();
    }

    /* ================= DYNAMIC URL BUILDER ================= */

    private function build_dynamic_url( $data ) {

        if ( empty( $data ) ) return '';

        $mode       = $data['social_choose'] ?? 'share';
        $custom_url = trim( $data['url'] ?? '' );
        $platform   = strtoupper( $data['selected_icon'] ?? '' );

        /* PROFILE MODE */
        if ( $mode === 'profile' ) {

            if ( empty( $custom_url ) ) return '';

            if ( ! preg_match( '#^(https?|mailto|tel|sms):#', $custom_url ) ) {
                $custom_url = 'https://' . $custom_url;
            }

            return esc_url( $custom_url );
        }

        /* SHARE MODE */

        // Detect current URL & title
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

        $encoded_url   = urlencode( $page_url );
        $share_text    = ! empty( $data['share_text'] ) ? $data['share_text'] : $page_title;
        $encoded_text  = urlencode( $share_text );

        switch ( $platform ) {

            case 'FACEBOOK':
                return "https://www.facebook.com/sharer/sharer.php?u={$encoded_url}";

            case 'TWITTER':
                return "https://twitter.com/intent/tweet?url={$encoded_url}&text={$encoded_text}";

            case 'LINKEDIN':
                return "https://www.linkedin.com/sharing/share-offsite/?url={$encoded_url}";

            case 'PINTEREST':
                return "https://pinterest.com/pin/create/button/?url={$encoded_url}&description={$encoded_text}";

            case 'YOUTUBE':
            case 'INSTAGRAM':
            case 'TIKTOK':
            case 'SNAPCHAT':
                return ! empty( $custom_url ) ? esc_url( $custom_url ) : '';

            default:
                return '';
        }
    }

    /* ================= STYLE VARS ================= */

    private function generate_inline_styles( $rule ) {

        $styles = array(
            '--s1-icon-color'       => $rule['icon_clr'] ?? '#111',
            '--s1-icon-bg'          => $rule['icon_bg_clr'] ?? '#fff',
            '--s1-icon-bg-hover'    => $rule['icon_bg_hvr_clr'] ?? '#eee',
            '--s1-icon-color-hover' => $rule['icon_hvr_clr'] ?? '#2563eb',
            '--s1-icon-size'        => $rule['icon_size'] ?? '18px',
            '--s1-border-radius'    => $rule['border_radius'] ?? '50%',
        );

        $output = '';
        foreach ( $styles as $key => $value ) {
            $output .= $key . ':' . esc_attr( $value ) . ';';
        }

        return $output;
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
                return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 2c-3.866 0-7 3.134-7 7 0 1.57.518 3.017 1.393 4.183C5.534 14.11 5 15.49 5 17c0 2.761 3.134 5 7 5s7-2.239 7-5c0-1.51-.534-2.89-1.393-3.817C18.482 12.017 19 10.57 19 9c0-3.866-3.134-7-7-7zm0 2c2.761 0 5 2.239 5 5 0 1.1-.36 2.116-.968 2.937C15.41 12.56 15 13.23 15 14c0 .552.448 1 1 1s1-.448 1-1c0-.403.16-.768.423-1.033C17.785 12.24 18 11.15 18 10c0-3.314-2.686-6-6-6s-6 2.686-6 6c0 1.15.215 2.24.577 3.217C6.84 13.232 7 13.597 7 14c0 .552.448 1 1 1s1-.448 1-1c0-.77-.41-1.44-1.032-2.063C7.36 11.116 7 10.1 7 9c0-2.761 2.239-5 5-5zm0 14c-2.761 0-5-1.343-5-3 0-.414.336-.75.75-.75s.75.336.75.75c0 .828 1.567 1.5 3.5 1.5s3.5-.672 3.5-1.5c0-.414.336-.75.75-.75s.75.336.75.75c0 1.657-2.239 3-5 3z" />
  </svg>';

            default:
                return '';
        }
    }
}