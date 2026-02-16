<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class StoreOne_Quick_Social {

    private $settings = [];

    public function __construct() {

        // Get all module settings
        $all_modules = get_option( 'store_one_module_set', [] );

        $this->settings = isset( $all_modules['quick-social'] )
            ? $all_modules['quick-social']
            : [];

        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ] );

        // Footer render
        add_action( 'woocommerce_after_single_product_summary', [ $this, 'render_footer' ], 99 );

        // Shortcode
        add_shortcode( 'storeone_quick_social', [ $this, 'shortcode' ] );
    }

    /**
     * Enqueue CSS
     */
    public function enqueue_assets() {

        wp_enqueue_style(
            'storeone-quick-social',
            STORE_ONE_PLUGIN_URL . 'assets/css/quick-social.css',
            [],
           STORE_ONE_VERSION,
        );
    }

    /**
     * Shortcode handler (must return)
     */
    public function shortcode() {
        return $this->generate_output();
    }

    /**
     * Footer render (must echo)
     */
    public function render_footer() {

        // Optional: only on single product page
        if ( function_exists( 'is_product' ) && ! is_product() ) {
            return;
        }

        echo $this->generate_output();
    }

    /**
     * Generate HTML Output
     */
    private function generate_output() {

        if ( empty( $this->settings['links'] ) || ! is_array( $this->settings['links'] ) ) {
            return '';
        }

        $style      = $this->settings['social_style'] ?? 'style1';
        $visibility = $this->settings['social_visiblity'] ?? 'show-all';
        $icon_size  = $this->settings['icon_size'] ?? '20px';
        $icon_color = $this->settings['icon_color'] ?? '#111';
        $bg_color   = $this->settings['bg_color'] ?? '#fff';

        ob_start();
        ?>

        <div class="s1-quick-social s1-quick-social--<?php echo esc_attr( $style ); ?>"
             data-visibility="<?php echo esc_attr( $visibility ); ?>"
             style="
                --s1-icon-size: <?php echo esc_attr( $icon_size ); ?>;
                --s1-icon-color: <?php echo esc_attr( $icon_color ); ?>;
                --s1-icon-bg: <?php echo esc_attr( $bg_color ); ?>;
             ">

            <div class="s1-quick-social__inner">

                <?php foreach ( $this->settings['links'] as $link ) :

                    $final_url = $this->get_final_share_url( $link );

                         if ( empty( $final_url ) ) {
                         continue;
                         }
                    ?>

                    <a href="<?php echo esc_url( $final_url ); ?>"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="s1-quick-social__item"
                       aria-label="<?php echo esc_attr( ucfirst( strtolower( $link['selected_icon'] ?? 'social' ) ) ); ?>">

                        <span class="s1-quick-social__icon">
                            <?php echo $this->get_icon_markup( $link ); ?>
                        </span>

                    </a>

                <?php endforeach; ?>

            </div>

        </div>

        <?php
        return ob_get_clean();
    }

    /**
     * Render Icon Markup
     */
    private function get_icon_markup( $link ) {

        $type = $link['type'] ?? 'icon';

        // Custom SVG
        if ( $type === 'custom_svg' && ! empty( $link['custom_svg'] ) ) {

            return wp_kses(
                $link['custom_svg'],
                [
                    'svg'  => [
                        'xmlns' => true,
                        'viewBox' => true,
                        'fill' => true,
                        'width' => true,
                        'height' => true,
                        'class' => true,
                    ],
                    'path' => [
                        'd' => true,
                        'fill' => true,
                        'fill-rule' => true,
                        'clip-rule' => true,
                    ],
                ]
            );
        }

        // Image
        if ( $type === 'image' && ! empty( $link['image_url'] ) ) {
            return '<img src="' . esc_url( $link['image_url'] ) . '" alt="" />';
        }

        // Predefined SVG
        return $this->get_predefined_svg( $link['selected_icon'] ?? 'FACEBOOK' );
    }

    /**
     * Predefined SVG Icons
     */
    private function get_predefined_svg( $icon ) {

        $icon = strtoupper( $icon );

        $icons = [

            'FACEBOOK' => '<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12A10 10 0 1 0 10.94 21.95V14.89H8.41V12h2.53V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v7.06A10 10 0 0 0 22 12z"/>
            </svg>',

            'INSTAGRAM' => '<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm5 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.88a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0z"/>
            </svg>',

            'TWITTER' => '<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2H21.5l-7.59 8.67L23 22h-6.828l-5.346-6.987L4.5 22H1.244l8.108-9.264L1 2h6.828l4.836 6.356L18.244 2zm-1.2 18h1.89L7.004 4H5.05l11.994 16z"/>
</svg>',

            'LINKEDIN' => '<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7 0h4.8v2.2h.07c.67-1.27 2.3-2.6 4.73-2.6C22 7.6 24 10 24 14.2V24h-5v-8.3c0-2-.03-4.5-2.75-4.5-2.75 0-3.17 2.15-3.17 4.36V24H7V8z"/>
            </svg>',

            'YOUTUBE' => '<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.2a2.96 2.96 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A2.96 2.96 0 0 0 .5 6.2C0 8.2 0 12 0 12s0 3.8.5 5.8a2.96 2.96 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a2.96 2.96 0 0 0 2.1-2.1c.5-2 .5-5.8.5-5.8s0-3.8-.5-5.8zM9.5 15.5v-7l6 3.5-6 3.5z"/>
            </svg>',
            'WHATSAPP' => '<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.2 6.38 2.2 11.84c0 1.92.5 3.7 1.46 5.28L2 22l5-1.6a9.79 9.79 0 0 0 5.04 1.36c5.46 0 9.84-4.38 9.84-9.84S17.5 2 12.04 2zm0 17.9c-1.6 0-3.15-.42-4.5-1.22l-.32-.18-2.96.95.97-2.88-.2-.33a7.78 7.78 0 0 1-1.2-4.2c0-4.34 3.53-7.88 7.88-7.88 4.35 0 7.88 3.54 7.88 7.88 0 4.35-3.53 7.88-7.88 7.88zm4.35-5.92c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.44-1.34-1.68-.14-.24-.02-.36.1-.48.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.12 3.64.58.26 1.04.42 1.4.54.58.18 1.1.16 1.52.1.46-.06 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
          </svg>',
          'TELEGRAM' => '<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.5 2.5L2.8 9.7c-1.28.5-1.27 1.23-.23 1.55l4.8 1.5 1.84 5.78c.23.7.12.98.86.98.58 0 .83-.26 1.15-.58.2-.2.94-.92 1.92-1.86l4 2.94c.74.4 1.28.2 1.46-.7l3.03-14.3c.27-1.1-.42-1.6-1.2-1.25zM8.2 12.3l9.6-6.06c.48-.3.92-.14.56.18l-8.24 7.44-.32 3.36-.6-4.92z"/>
          </svg>',
          'PINTEREST' => '<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.38 2 11.88c0 4.22 2.64 7.82 6.36 9.26-.08-.78-.16-1.98.04-2.84.18-.78 1.18-4.98 1.18-4.98s-.3-.6-.3-1.48c0-1.38.8-2.42 1.8-2.42.84 0 1.24.62 1.24 1.36 0 .82-.52 2.06-.8 3.2-.22.92.46 1.68 1.36 1.68 1.64 0 2.9-1.74 2.9-4.26 0-2.22-1.6-3.78-3.9-3.78-2.66 0-4.22 2-4.22 4.06 0 .8.3 1.66.7 2.12.08.1.1.2.08.32-.08.36-.26 1.14-.3 1.3-.04.2-.14.24-.32.14-1.2-.56-1.96-2.32-1.96-3.74 0-3.04 2.22-5.82 6.4-5.82 3.36 0 5.98 2.4 5.98 5.62 0 3.36-2.12 6.06-5.06 6.06-1 0-1.94-.52-2.26-1.14l-.62 2.36c-.22.84-.82 1.9-1.22 2.54.92.28 1.9.44 2.92.44 5.52 0 10-4.38 10-9.88C22 6.38 17.52 2 12 2z"/>
          </svg>',
            
        ];

        return $icons[ $icon ] ?? '';
    }
    

    private function get_final_share_url( $link ) {

    $url = isset( $link['url'] ) ? trim( $link['url'] ) : '';

    // Custom URL
    if ( ! empty( $url ) ) {

        if ( ! preg_match( '#^https?://#i', $url ) ) {
            $url = 'https://' . $url;
        }

        return esc_url( $url );
    }

    // Only on product page
    if ( ! function_exists( 'is_product' ) || ! is_product() ) {
        return '';
    }

    // Get product safely
    global $product;

    if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
        return '';
    }

    $product_id    = $product->get_id();
    $product_url   = urlencode( get_permalink( $product_id ) );
    $product_title = urlencode( $product->get_name() );

    switch ( strtoupper( $link['selected_icon'] ?? '' ) ) {

        case 'FACEBOOK':
            return "https://www.facebook.com/sharer/sharer.php?u={$product_url}";

        case 'TWITTER':
            return "https://twitter.com/intent/tweet?url={$product_url}&text={$product_title}";

        case 'LINKEDIN':
            return "https://www.linkedin.com/sharing/share-offsite/?url={$product_url}";

        case 'WHATSAPP':
            return "https://api.whatsapp.com/send?text={$product_title}%20{$product_url}";

        case 'TELEGRAM':
            return "https://t.me/share/url?url={$product_url}&text={$product_title}";

        case 'PINTEREST':
            return "https://pinterest.com/pin/create/button/?url={$product_url}";

        default:
            return get_permalink( $product_id );
    }
}


}