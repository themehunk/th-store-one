<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class TH_Store_One_Product_Video_Frontend {

    public function __construct() {

         $modules = get_option('th_store_one_module_option', []);
        if ( empty($modules['product-video']) ) {
                return;
        } 
        // TEMPLATE OVERRIDE
        add_filter( 'wc_get_template', [ $this, 'override_template' ], 99, 5 );
        // REMOVE DEFAULT THUMBNAIL
        if ( $this->is_block_theme() ) {
        add_filter( 'render_block', [ $this, 'inject_video_in_block' ], 10, 2 );
        }else{
        //remove_action( 'woocommerce_before_shop_loop_item_title', 'woocommerce_template_loop_product_thumbnail', 10 );
        // ADD VIDEO / IMAGE
        add_action( 'woocommerce_before_shop_loop_item_title', [ $this, 'add_video_loop_media' ], 10 );
        //REMOVE DEFAULT LINKS (GLOBAL)
        remove_action( 'woocommerce_before_shop_loop_item', 'woocommerce_template_loop_product_link_open', 10 );
        remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_product_link_close', 5 );
        //ADD CONDITIONAL LINKS
        add_action( 'woocommerce_before_shop_loop_item', [ $this, 'custom_link_open' ], 10 );
        add_action( 'woocommerce_after_shop_loop_item', [ $this, 'custom_link_close' ], 5 );
        // TITLE LINK (ONLY VIDEO PRODUCTS)
        add_action( 'woocommerce_shop_loop_item_title', [ $this, 'wrap_title_link_open' ], 1 );
        add_action( 'woocommerce_shop_loop_item_title', [ $this, 'wrap_title_link_close' ], 20 );
        }
        // ADD CLASS
        add_filter( 'post_class', [ $this, 'add_product_video_class' ], 10, 3 );
        // FRONTEND ASSETS
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ] );
    }

    private function is_block_theme() {
    return function_exists('wp_is_block_theme') && wp_is_block_theme();
    }

    /* ================= TEMPLATE OVERRIDE ================= */
    public function override_template( $located, $template_name, $args, $template_path, $default_path ) {

        if ( $template_name === 'single-product/product-image.php' ) {

        global $product;

        if ( ! $product ) return $located;

        $product_id = $product->get_id();

        $enable_video = get_post_meta( $product_id, '_th_enable_gallery', true );
        $videos       = get_post_meta( $product_id, '_th_gallery', true );
            if ( $enable_video === 'yes' && ! empty( $videos ) ) {
            $plugin_template = plugin_dir_path( __FILE__ ) . 'templates/product-image.php';
              if ( file_exists( $plugin_template ) ) {
                 return $plugin_template;
              }
            }
        }

        return $located;
    }

    /* ================= ENQUEUE ================= */
    public function enqueue() {

        if ( ! is_product() && ! is_shop() && ! is_product_category() ) return;

        wp_enqueue_script(
            'th-store-onevideo-gallery',
            TH_STORE_ONE_PLUGIN_URL . 'assets/js/th-store-one-video.js',
            ['jquery'],
            TH_STORE_ONE_VERSION,
            true
        );

        wp_enqueue_style(
            'th-store-onevideo-gallery',
            TH_STORE_ONE_PLUGIN_URL . 'assets/css/th-store-one-video.css',
            [],
            TH_STORE_ONE_VERSION
        );

        $settings = th_store_one_get_video_settings();

        wp_localize_script(
            'th-store-onevideo-gallery',
            'thVideoData',
            [
                'icon'  => $settings['icon'],
                'color' => $settings['icon_clr'],
            ]
        );
    }
    /* ================= CUSTOM LINK CONTROL ================= */
    public function custom_link_open() {

        global $product;
        if ( ! $product ) return;

        //VIDEO PRODUCT → NO FULL LINK
        if ( $this->has_video( $product->get_id() ) ) {
            return;
        }

        //NORMAL PRODUCT → DEFAULT LINK
        woocommerce_template_loop_product_link_open();
    }

    public function custom_link_close() {

        global $product;
        if ( ! $product ) return;

        if ( $this->has_video( $product->get_id() ) ) {
            return;
        }

        woocommerce_template_loop_product_link_close();
    }

    /* ================= TITLE LINK (VIDEO PRODUCTS ONLY) ================= */
    public function wrap_title_link_open() {

        global $product;
        if ( ! $product ) return;

        if ( $this->has_video( $product->get_id() ) ) : ?>
            <a href="<?php echo esc_url( get_permalink( $product->get_id() ) ); ?>" class="th-title-link">
        <?php endif;
    }

    public function wrap_title_link_close() {

        global $product;
        if ( ! $product ) return;

        if ( $this->has_video( $product->get_id() ) ) : ?>
            </a>
        <?php endif;
    }

    public function inject_video_in_block( $block_content, $block ) {

    // only product image block
    if ( empty( $block['blockName'] ) || $block['blockName'] !== 'woocommerce/product-image' ) {
        return $block_content;
    }

    
    $settings      = th_store_one_get_video_settings();
    $global_icon   = $settings['ficon'];
    $icon_color    = $settings['ficon_clr'];
    $aspect_shop   = $settings['aspectShop'] ?? 'default';
    $image_f_url   = $settings['image_f_url'] ?? '';
    $fauto_play     = $settings['fauto_play'] ?? false;

    global $product;
    if ( ! $product ) return $block_content;

    $product_id = $product->get_id();

    $enable = get_post_meta( $product_id, '_th_enable_video', true );
    $source = get_post_meta( $product_id, '_th_source', true );
    $url    = get_post_meta( $product_id, '_th_video_url', true );

    if ( $enable !== 'yes' || empty($url) ) {
        return $block_content;
    }

    $aspect_class  = 'th-aspect-default';

        if ( $aspect_shop === '16:9' || $aspect_shop === 'default' ) {
            $aspect_class = 'th-aspect-16-9';
        }
        elseif ( $aspect_shop === '9:16' ) {
            $aspect_class = 'th-aspect-9-16';
        }
        elseif ( $aspect_shop === '4:3' ) {
            $aspect_class = 'th-aspect-4-3';
        }
        elseif ( $aspect_shop === '3:2' ) {
            $aspect_class = 'th-aspect-3-2';
        }
        elseif ( $aspect_shop === '1:1' ) {
            $aspect_class = 'th-aspect-1-1';
        }
        elseif ( $aspect_shop === 'auto' ) {
            $aspect_class = 'th-aspect-auto';
        }
    ob_start();
    ?>

    <div class="th-loop-video <?php echo esc_attr($aspect_class); ?>">

            <?php if ( $source === 'youtube' ) :

                            // watch?v=
                parse_str( wp_parse_url( $url, PHP_URL_QUERY ), $vars );
                if ( ! empty( $vars['v'] ) ) {
                    $id = $vars['v'];
                }

                // youtu.be/
                if ( empty($id) && strpos($url, 'youtu.be') !== false ) {
                    $id = trim( wp_parse_url( $url, PHP_URL_PATH ), '/' );
                }

                // embed/
                if ( empty($id) && strpos($url, '/embed/') !== false ) {
                    $parts = explode('/embed/', $url);
                    $id = $parts[1] ?? '';
                }

                // SHORTS SUPPORT
                if ( empty($id) && strpos($url, '/shorts/') !== false ) {
                    $parts = explode('/shorts/', $url);
                    $id = $parts[1] ?? '';
                }

                // extra params remove (?feature=share etc.)
                if ( strpos($id, '?') !== false ) {
                    $id = explode('?', $id)[0];
                }

                if ( $id ) : ?>
                <iframe 
                    src="https://www.youtube.com/embed/<?php echo esc_attr($id); ?>?autoplay=<?php echo $fauto_play ? '1' : '0'; ?>&mute=1&loop=1&playlist=<?php echo esc_attr($id); ?>" 
                    allow="autoplay; encrypted-media"
                    allowfullscreen>
                </iframe>
                <?php endif; ?>
               <?php elseif ( $source === 'vimeo' ) :

                $id = trim( wp_parse_url( $url, PHP_URL_PATH ), '/' );

                if ( $id ) : ?>
                   <iframe 
                    src="https://player.vimeo.com/video/<?php echo esc_attr($id); ?>?muted=1&loop=1&autoplay=<?php echo esc_attr($fauto_play) ? '1' : '0'; ?>" 
                    allow="<?php echo esc_attr($fauto_play) ? 'autoplay' : ''; ?>">
                </iframe>
                <?php endif; ?>
            <?php else : ?>

                <!-- SELF HOSTED VIDEO -->
                <div class="th-video-wrap <?php echo esc_attr($aspect_class); ?>" data-src="<?php echo esc_url($url); ?>">

                    <video 
                        src="<?php echo esc_url($url); ?>" 
                        muted 
                        playsinline
                        <?php echo esc_attr($fauto_play) ? 'autoplay loop' : ''; ?>
                        style="width:100%;height:100%;object-fit:cover;"
                        poster="<?php echo esc_url($image_f_url); ?>"
                        >
                    </video>

                    <span class="th-video-play">
                       <?php
$allowed_svg = array(
    'svg' => array(
        'viewBox' => true,
        'width' => true,
        'height' => true,
        'fill' => true,
        'stroke' => true,
        'stroke-width' => true,
        'xmlns' => true,
    ),
    'g' => array(),
    'path' => array(
        'd' => true,
        'fill' => true,
    ),
    'polygon' => array(
        'points' => true,
        'fill' => true,
    ),
    'rect' => array(
        'x' => true,
        'y' => true,
        'width' => true,
        'height' => true,
        'rx' => true,
        'fill' => true,
    ),
    'circle' => array(
        'cx' => true,
        'cy' => true,
        'r' => true,
        'fill' => true,
    ),
);

echo wp_kses(
    th_store_one_get_video_icon($global_icon, $icon_color),
    $allowed_svg
);
?>
                    </span>

                </div>

            <?php endif; ?>

        </div>
    <?php
    return ob_get_clean();
    }

    /* ================= VIDEO / IMAGE ================= */
    public function add_video_loop_media() {

    global $product;
    if ( ! $product ) return;

    $product_id = $product->get_id();

    if ( ! $this->has_video( $product_id ) ) {
        return; 
    }

    $settings      = th_store_one_get_video_settings();
    $global_icon   = $settings['ficon'];
    $icon_color    = $settings['ficon_clr'];
    $aspect_shop   = $settings['aspectShop'] ?? 'default';
    $image_f_url   = $settings['image_f_url'] ?? '';
    $fauto_play     = $settings['fauto_play'] ?? false;
    


    $aspect_class  = 'th-aspect-default';

        if ( $aspect_shop === '16:9' || $aspect_shop === 'default' ) {
            $aspect_class = 'th-aspect-16-9';
        }
        elseif ( $aspect_shop === '9:16' ) {
            $aspect_class = 'th-aspect-9-16';
        }
        elseif ( $aspect_shop === '4:3' ) {
            $aspect_class = 'th-aspect-4-3';
        }
        elseif ( $aspect_shop === '3:2' ) {
            $aspect_class = 'th-aspect-3-2';
        }
        elseif ( $aspect_shop === '1:1' ) {
            $aspect_class = 'th-aspect-1-1';
        }
        elseif ( $aspect_shop === 'auto' ) {
            $aspect_class = 'th-aspect-auto';
        }

        global $product;
        if ( ! $product ) return;

        $product_id = $product->get_id();

        $enable = get_post_meta( $product_id, '_th_enable_video', true );
        $source = get_post_meta( $product_id, '_th_source', true );
        $url    = get_post_meta( $product_id, '_th_video_url', true );

        // NO VIDEO → DEFAULT IMAGE
        if ( $enable !== 'yes' || empty($url) ) {
            echo wp_kses_post(woocommerce_get_product_thumbnail());
            return;
        }
        ?>

        <div class="th-loop-video <?php echo esc_attr($aspect_class); ?>">

            <?php if ( $source === 'youtube' ) :

                $id = '';

                // watch?v=
                parse_str( wp_parse_url( $url, PHP_URL_QUERY ), $vars );
                if ( ! empty( $vars['v'] ) ) {
                    $id = $vars['v'];
                }

                // youtu.be/
                if ( empty($id) && strpos($url, 'youtu.be') !== false ) {
                    $id = trim( wp_parse_url( $url, PHP_URL_PATH ), '/' );
                }

                // embed/
                if ( empty($id) && strpos($url, '/embed/') !== false ) {
                    $parts = explode('/embed/', $url);
                    $id = $parts[1] ?? '';
                }

                // SHORTS SUPPORT
                if ( empty($id) && strpos($url, '/shorts/') !== false ) {
                    $parts = explode('/shorts/', $url);
                    $id = $parts[1] ?? '';
                }

                // extra params remove (?feature=share etc.)
                if ( strpos($id, '?') !== false ) {
                    $id = explode('?', $id)[0];
                }

                if ( $id ) : ?>
                <iframe 
                    src="https://www.youtube.com/embed/<?php echo esc_attr($id); ?>?autoplay=<?php echo $fauto_play ? '1' : '0'; ?>&mute=1&loop=1&playlist=<?php echo esc_attr($id); ?>" 
                    allow="autoplay; encrypted-media"
                    allowfullscreen>
                </iframe>
                <?php endif; ?>
               <?php elseif ( $source === 'vimeo' ) :

                $id = trim(  wp_parse_url( $url, PHP_URL_PATH ), '/' );

                if ( $id ) : ?>
                   <iframe 
                    src="https://player.vimeo.com/video/<?php echo esc_attr($id); ?>?muted=1&loop=1&autoplay=<?php echo esc_attr($fauto_play) ? '1' : '0'; ?>" 
                    allow="<?php echo esc_attr($fauto_play) ? 'autoplay' : ''; ?>">
                </iframe>
                <?php endif; ?>
            <?php else : ?>

                <!-- SELF HOSTED VIDEO -->
                <div class="th-video-wrap <?php echo esc_attr($aspect_class); ?>" data-src="<?php echo esc_url($url); ?>">

                    <video 
                        src="<?php echo esc_url($url); ?>" 
                        muted 
                        playsinline
                        <?php echo esc_attr($fauto_play) ? 'autoplay loop' : ''; ?>
                        style="width:100%;height:100%;object-fit:cover;"
                        poster="<?php echo esc_url($image_f_url); ?>"
                        >
                    </video>

                    <span class="th-video-play">
                       <?php
$allowed_svg = array(
    'svg' => array(
        'viewBox' => true,
        'width' => true,
        'height' => true,
        'fill' => true,
        'stroke' => true,
        'stroke-width' => true,
        'xmlns' => true,
    ),
    'g' => array(),
    'path' => array(
        'd' => true,
        'fill' => true,
    ),
    'polygon' => array(
        'points' => true,
        'fill' => true,
    ),
    'rect' => array(
        'x' => true,
        'y' => true,
        'width' => true,
        'height' => true,
        'rx' => true,
        'fill' => true,
    ),
    'circle' => array(
        'cx' => true,
        'cy' => true,
        'r' => true,
        'fill' => true,
    ),
);

echo wp_kses(
    th_store_one_get_video_icon($global_icon, $icon_color),
    $allowed_svg
);
?>
                    </span>

                </div>

            <?php endif; ?>

        </div>

        <?php
    }

    /* ================= HELPER ================= */
    private function has_video( $product_id ) {

        $enable = get_post_meta( $product_id, '_th_enable_video', true );
        $url    = get_post_meta( $product_id, '_th_video_url', true );

        return ( $enable === 'yes' && ! empty($url) );
    }

    /* ================= ADD CLASS ================= */
   public function add_product_video_class( $classes, $class, $post_id ) {

    if ( get_post_type( $post_id ) !== 'product' ) {
        return $classes;
    }

    if ( is_product() && get_queried_object_id() == $post_id ) {
        return $classes;
    }

    if ( $this->has_video( $post_id ) ) {
        $classes[] = 'th-has-video';
    }

    return $classes;
   }
}


function th_store_one_get_video_settings() {

    $modules = get_option( 'th_store_one_module_set', [] );
    $video   = $modules['product-video'] ?? [];

    $defaults = [
        // Gallery
        'image_url'        => '',
        'image_you_url'    => '',
        'image_vim_url'    => '',

        // Featured (Shop)
        'image_f_url'      => '',
        'image_f_you_url'  => '',
        'image_f_vim_url'  => '',

        // Layout
        'aspect'           => 'default',
        'aspectShop'       => 'default',

        // Icons
        'icon'             => 'outline',
        'icon_clr'         => '#e3e3e3',

        // Featured icons
        'ficon'            => 'outline',
        'ficon_clr'        => '#e3e3e3',

        // Autoplay
        'fauto_play'       => false,
        'gauto_play'       => false,
    ];

    // merge (safe)
    $merged = wp_parse_args( $video, $defaults );

    return $merged;
}

function th_store_one_get_video_icon($type = 'outline', $color = '#e3e3e3') {

    switch ($type) {

        case 'triangle':
            return '<svg viewBox="0 0 24 24" width="34" height="34">
                <polygon points="8,5 19,12 8,19" fill="'.esc_attr($color).'"/>
            </svg>';

        case 'camera':
            return '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="'.esc_attr($color).'" stroke-width="2">
                <rect x="3" y="6" width="11" height="12" rx="2"></rect>
                <polygon points="16,9 21,6 21,18 16,15"></polygon>
            </svg>';

        case 'youtube':
            return '<svg viewBox="0 0 68 48" width="34" height="24">
                <rect width="68" height="48" rx="10" fill="'.esc_attr($color).'"/>
                <polygon points="28,18 28,30 42,24" fill="#fff"/>
            </svg>';

        case 'circle':
            return '<svg viewBox="0 0 24 24" width="34" height="34">
                <circle cx="12" cy="12" r="10" fill="'.esc_attr($color).'"/>
                <polygon points="10,8 16,12 10,16" fill="#fff"/>
            </svg>';

        case 'outline':
            return '<svg viewBox="0 0 24 24" width="34" height="34" fill="'.esc_attr($color).'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0h24v24H0z" fill="none"></path><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM10.622 8.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z"></path></g></svg>';

        default:
            return '<svg viewBox="0 0 24 24" width="34" height="34">
                <circle cx="12" cy="12" r="10" fill="'.esc_attr($color).'"/>
                <polygon points="10,8 16,12 10,16" fill="#fff"/>
            </svg>';
    }
}