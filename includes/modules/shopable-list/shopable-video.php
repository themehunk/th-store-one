<?php
if (!defined('ABSPATH')) {
    exit;
}

class Th_Store_One_Shopable_List
{
    private $settings = [];

    public function __construct()
    {
        $modules = get_option('th_store_one_module_option', []);

        if (empty($modules['shopable-list'])) {
            return;
        }

        $all = get_option('th_store_one_module_set', []);
        $this->settings = $all['shopable-list'] ?? [];


        add_shortcode(
            'th_store_one_shoppable_video',
            [$this, 'shortcode']
        );

        add_action(
            'wp_enqueue_scripts',
            [$this, 'assets']
        );


        add_action('wp_ajax_th_shopable_get_product', [$this, 'ajax_get_product']);
        add_action('wp_ajax_nopriv_th_shopable_get_product', [$this, 'ajax_get_product']);


    }



    public function assets()
    {
        wp_enqueue_style(
            'th-shopable-list',
            TH_STORE_ONE_PLUGIN_URL .
            'assets/css/shopable-list.css',
            [],
            TH_STORE_ONE_VERSION
        );

        wp_enqueue_style(
            'swiper-css',
            TH_STORE_ONE_PLUGIN_URL .
            'assets/css/swiper/swiper-bundle.min.css',
            [],
            TH_STORE_ONE_VERSION
        );

        wp_enqueue_script(
            'swiper-js',
            TH_STORE_ONE_PLUGIN_URL .
            'assets/js/swiper/swiper-bundle.min.js',
            [],
            TH_STORE_ONE_VERSION,
            true
        );



        wp_enqueue_script(
            'th-shopable-list',
            TH_STORE_ONE_PLUGIN_URL . 'assets/js/shopable-list.js',
            ['swiper-js', 'jquery'],
            TH_STORE_ONE_VERSION,
            true
        );

        // Localize - Ensure it's after enqueue
        wp_localize_script('th-shopable-list', 'thShopable', [
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce'   => wp_create_nonce('th_shopable_nonce')
        ]);

        wp_enqueue_script('wc-add-to-cart-variation');
    }

    public function shortcode($atts)
    {
        $atts = shortcode_atts(
            [
                'id' => '',
            ],
            $atts
        );

        if (empty($atts['id'])) {
            return '';
        }

        $rule = $this->get_rule(
            $atts['id']
        );

        if (!$rule) {
            return '';
        }

        ob_start();

        $this->render($rule);

        return ob_get_clean();
    }

    private function get_rule($id)
    {
        if (empty($this->settings['rules'])) {
            return false;
        }

        $id = intval($id);

        foreach ($this->settings['rules'] as $index => $rule) {
            if (($index + 1) === $id) {
                return $rule;
            }
        }

        return false;
    }

    private function render($rule)
    {
        $is_slider =
            !empty(
                $rule['slider']['enabled']
            );

        $columns = intval(
            $rule['columns'] ?? 3
        );

        $gap = intval(
            $rule['columns_gap'] ?? 15
        );
        ?>

        <div class="th-shopable-list-wrap"  data-delay="<?php echo esc_attr(
            $rule['prd_delay'] ?? ''
        ); ?>" data-autoplay="<?php echo !empty(
            $rule['video_auto_play']
        ) ? 'true' : 'false'; ?>" data-allautoplay="<?php echo !empty(
            $rule['video_all_auto_play']
        ) ? 'true' : 'false'; ?>">

            <?php if (empty($rule['hide_title'])) : ?>

                <<?php echo esc_attr(
                    $rule['title_tag'] ?? 'h2'
                ); ?>
                    class="th-shopable-title" style="color: <?php echo esc_attr($rule['title_color'] ?? '#111'); ?>;">

                    <?php echo esc_html(
                        $rule['title'] ?? ''
                    ); ?>

                </<?php echo esc_attr(
                    $rule['title_tag'] ?? 'h2'
                ); ?>>

            <?php endif; ?>

            <?php if ($is_slider) : ?>

                <div
                    class="swiper th-shopable-slider"
                    data-slides="<?php echo esc_attr(
                        $rule['slider']['slides'] ?? 3
                    ); ?>"
                    data-autoplay="<?php echo !empty(
                        $rule['slider']['autoplay']
                    ) ? 'true' : 'false'; ?>"
                    data-nav="<?php echo !empty(
                        $rule['slider']['navigation']
                    ) ? 'true' : 'false'; ?>"
                    data-gap="<?php echo esc_attr(
                        $gap
                    ); ?>"
                >

                   <div class="swiper-wrapper" style="
    --s1-bg-color:
    <?php echo esc_attr($rule['bg_color'] ?? '#fff'); ?>;

    --s1-border-style:
    <?php echo esc_attr($rule['border']['style'] ?? 'solid'); ?>;

    --s1-border-color:
    <?php echo esc_attr($rule['border']['color'] ?? 'transparent'); ?>;

    --s1-border-top:
    <?php echo esc_attr($rule['border']['width']['top'] ?? '0px'); ?>;

    --s1-border-right:
    <?php echo esc_attr($rule['border']['width']['right'] ?? '0px'); ?>;

    --s1-border-bottom:
    <?php echo esc_attr($rule['border']['width']['bottom'] ?? '0px'); ?>;

    --s1-border-left:
    <?php echo esc_attr($rule['border']['width']['left'] ?? '0px'); ?>;

    --s1-radius-top:
    <?php echo esc_attr($rule['border']['radius']['top'] ?? '0px'); ?>;

    --s1-radius-right:
    <?php echo esc_attr($rule['border']['radius']['right'] ?? '0px'); ?>;

    --s1-radius-bottom:
    <?php echo esc_attr($rule['border']['radius']['bottom'] ?? '0px'); ?>;

    --s1-radius-left:
    <?php echo esc_attr($rule['border']['radius']['left'] ?? '0px'); ?>;

    --s1-title-color:
    <?php echo esc_attr($rule['prd_title_color'] ?? '#111'); ?>;

    --s1-price-color:
    <?php echo esc_attr($rule['prd_price_color'] ?? '#111'); ?>;

    --s1-cart-bg:
    <?php echo esc_attr($rule['prd_cart_bg_color'] ?? '#22c55e'); ?>;

    --s1-cart-color:
    <?php echo esc_attr($rule['prd_cart_icon_color'] ?? '#fff'); ?>;

    --s1-play-bg:
    <?php echo esc_attr($rule['vicon_bg_color'] ?? '#000'); ?>;

    --s1-play-color:
    <?php echo esc_attr($rule['vicon_color'] ?? '#fff'); ?>;
    --s1-progress-color: <?php echo esc_attr($rule['bar_color'] ?? '#22c55e'); ?>;
    
    border: none;

    --s1-card-border-radius:<?php echo esc_attr($rule['prd_cart_border_radius'] ?? '10px'); ?>;
">

<?php
foreach (
    $rule['shopable_list'] as $list
) :

    if (
        empty(
            $list['items']
        )
    ) {
        continue;
    }
    ?>

    <div class="swiper-slide">

        <?php
            $this->render_card(
                $list,
                $rule
            );
    ?>

    </div>

<?php
endforeach;
                ?>

</div>
<?php if ($rule['slider']['navigation'] == true):?>
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-button-next"></div>
                    <?php endif;?>

                </div>

            <?php else : ?>

                <div
                    class="th-shopable-grid"
                    style="
    --s1-bg-color:
    <?php echo esc_attr($rule['bg_color'] ?? '#fff'); ?>;

    --s1-border-style:
    <?php echo esc_attr($rule['border']['style'] ?? 'solid'); ?>;

    --s1-border-color:
    <?php echo esc_attr($rule['border']['color'] ?? 'transparent'); ?>;

    --s1-border-top:
    <?php echo esc_attr($rule['border']['width']['top'] ?? '0px'); ?>;

    --s1-border-right:
    <?php echo esc_attr($rule['border']['width']['right'] ?? '0px'); ?>;

    --s1-border-bottom:
    <?php echo esc_attr($rule['border']['width']['bottom'] ?? '0px'); ?>;

    --s1-border-left:
    <?php echo esc_attr($rule['border']['width']['left'] ?? '0px'); ?>;

    --s1-radius-top:
    <?php echo esc_attr($rule['border']['radius']['top'] ?? '0px'); ?>;

    --s1-radius-right:
    <?php echo esc_attr($rule['border']['radius']['right'] ?? '0px'); ?>;

    --s1-radius-bottom:
    <?php echo esc_attr($rule['border']['radius']['bottom'] ?? '0px'); ?>;

    --s1-radius-left:
    <?php echo esc_attr($rule['border']['radius']['left'] ?? '0px'); ?>;

    --s1-title-color:
    <?php echo esc_attr($rule['prd_title_color'] ?? '#111'); ?>;

    

    --s1-price-color:
    <?php echo esc_attr($rule['prd_price_color'] ?? '#111'); ?>;

    --s1-cart-bg:
    <?php echo esc_attr($rule['prd_cart_bg_color'] ?? '#22c55e'); ?>;

    --s1-cart-color:
    <?php echo esc_attr($rule['prd_cart_icon_color'] ?? '#fff'); ?>;

    --s1-play-bg:
    <?php echo esc_attr($rule['vicon_bg_color'] ?? '#000'); ?>;

    --s1-play-color:
    <?php echo esc_attr($rule['vicon_color'] ?? '#fff'); ?>;
    --s1-card-border-radius:<?php echo esc_attr($rule['prd_cart_border_radius'] ?? '10px'); ?>;
    --s1-progress-color: <?php echo esc_attr($rule['bar_color'] ?? '#22c55e'); ?>;
    --desktop-columns: <?php echo esc_attr($columns); ?>;
        --mobile-columns:1;
        display:grid;
        grid-template-columns:
        repeat(var(--desktop-columns),minmax(0,1fr));
        gap:<?php echo esc_attr($gap); ?>px;
        border: none;
"
                   
                >

                    <?php
                    foreach (
                        $rule['shopable_list'] as $list
                    ) :

                        if (
                            empty(
                                $list['items']
                            )
                        ) {
                            continue;
                        }

                        $this->render_card(
                            $list,
                            $rule
                        );

                    endforeach;
                ?>

                </div>

            <?php endif; ?>

        </div>

        <?php
        // POPUP SIRF EK BAAR YAHAN RENDER HOGA
        if (!empty($rule['show_prd_popup'])) {
            $this->render_popup($rule);
        }
        ?>

        <?php
    }

    private function render_card($list, $rule)
    {
        $layout = $rule['list_style'] ?? 'style1';

        switch ($layout) {

            case 'style2':
                $this->render_card_style2($list, $rule);
                break;

            default:
                $this->render_card_style1($list, $rule);
                break;

        }
    }

    private function render_card_style1($list, $rule)
    {

        $items = $list['items'] ?? [];

        if (empty($items)) {
            return;
        }

        $first_item   = $items[0];
        $product_ids  = $first_item['products'] ?? [];
        $product      = ! empty($product_ids) ? wc_get_product(intval($product_ids[0])) : false;

        if (! $product) {
            return;
        }

        // Build rotation items array
        $rotation_items = [];

        foreach ($items as $item) {

            $video_url = ! empty($item['video_url'])
                ? esc_url($item['video_url'])
                : '';

            if (empty($video_url)) {
                continue;
            }

            $product_ids = $item['products'] ?? [];

            foreach ($product_ids as $product_id) {

                $p = wc_get_product(intval($product_id));

                if (!$p) {
                    continue;
                }

                $rotation_items[] = [
                    'video'       => $video_url,
                    'product_id'  => $p->get_id(),
                    'title'       => $p->get_name(),
                    'price'       => wp_kses_post($p->get_price_html()),
                    'image'       => wp_get_attachment_image_url(
                        $p->get_image_id(),
                        'thumbnail'
                    ),
                    'link'        => get_permalink($p->get_id()),
                    'cart_url'    => $p->add_to_cart_url(),
                    'sku'         => $p->get_sku(),
                    'desc'        => wp_trim_words(
                        wp_strip_all_tags(
                            $p->get_short_description()
                        ),
                        20
                    ),
                ];
            }
        }

        if (empty($rotation_items)) {
            return;

        }

        $list_style            = $rule['list_style'] ?? 'style1';
        $product_info_position = $rule['product_info_position'] ?? 'bottom';
        $show_popup = !empty($rule['show_prd_popup']);
        $is_muted_default = !empty($rule['video_mute']) ? 'true' : 'false';
        ?>
    <div class="th-shopable-card 
                th-shopable-layout-<?php echo esc_attr($list_style); ?> 
                th-product-info-<?php echo esc_attr($product_info_position); ?>"
         data-items="<?php echo esc_attr(wp_json_encode($rotation_items)); ?>" 
         data-show-popup="<?php echo $show_popup ? 'true' : 'false'; ?>" 
         data-muted="<?php echo $is_muted_default; ?>"
         >

        <div class="th-shopable-video-wrap product-info-<?php echo esc_attr($product_info_position); ?>">

            <video class="th-shopable-video"
                   playsinline
                   muted
                   preload="metadata">
                <source src="<?php echo esc_url($rotation_items[0]['video']); ?>"
                        type="video/mp4">
            </video>
            <div class="th-video-mute-toggle">
                <!-- Muted Icon -->
                <svg class="icon-muted" viewBox="0 0 24 24" fill="none">
                    <path d="M14 5L9 9H5V15H9L14 19V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 3L21 21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
                <!-- Unmuted Icon -->
                <svg class="icon-unmuted" viewBox="0 0 24 24" fill="none" style="display:none">
                    <path d="M11 5L6 9H3V15H6L11 19V5Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M15 9C16.2 10.2 16.2 13.8 15 15" stroke="currentColor" stroke-width="2"/>
                    <path d="M18 7C20.5 9.5 20.5 14.5 18 17" stroke="currentColor" stroke-width="2"/>
                </svg>
            </div>
 <?php if (($rule['video_all_auto_play'] == false)) { ?>
            <div class="th-shopable-progress">
                <span class="th-shopable-progress-fill"></span>
            </div>
            <?php }?>

            

            <button class="th-shopable-play" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.9l10.28-6.86a1.03 1.03 0 0 0 0-1.8L9.56 4.24A1.03 1.03 0 0 0 8 5.14Z"/>
                </svg>
            </button>

           <?php if (($rule['hide_navigation'] ?? false) === true) { ?>
            <div class="th-shopable-slider-nav">

                    <button class="th-nav-prev">

                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M6 15L12 9L18 15"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>

                    </button>

                    <button class="th-nav-next">

                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>

                    </button>

                </div>
                
           <?php  }?>

            <div class="th-shopable-product-bar swiper th-product-swiper">

            <div class="swiper-wrapper">

                <?php foreach ($rotation_items as $index => $item) : ?>

                    <div class="swiper-slide th-product-init-slide" data-index="<?php echo esc_attr($index); ?>">

                        <div class="th-shopable-product-left">

                           <?php if (!empty($item['image'])) : ?>
    <img
        class="th-product-image"
        src="<?php echo esc_url($item['image']); ?>"
        alt="<?php echo esc_attr($item['title'] ?? ''); ?>"
    >
<?php endif; ?>

                            <div class="th-shopable-product-content">

                              <a
                                    href="#"
                                    class="th-shopable-product-link th-open-popup"
                                >
                                    <span class="title">
                                        <?php echo esc_html($item['title']); ?>
                                    </span>
                                </a>
                                

                                <span class="price">
                                    <?php echo wp_kses_post($item['price']); ?>
                                </span>

                            </div>

                        </div>

                        <a
                            href="<?php echo esc_url($item['cart_url']); ?>"
                            data-product_id="<?php echo esc_attr($item['product_id']); ?>"
                            data-product_sku="<?php echo esc_attr($item['sku']); ?>"
                            data-quantity="1"
                            class="product_type_simple add_to_cart_button ajax_add_to_cart th-shopable-btn"
                            rel="nofollow"
                        >
                            <span class="cart-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                            </span>
                            <span class="check-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 6L9 17L4 12"/>
                        </svg>
                    </span>
                        </a>

                    </div>

                <?php endforeach; ?>

    </div>

</div>

        

        </div>
    </div>

    <?php

    }

    private function render_card_style2($list, $rule)
    {
        $items = $list['items'] ?? [];

        if (empty($items)) {
            return;
        }

        $first_item  = $items[0];
        $product_ids = $first_item['products'] ?? [];
        $product     = !empty($product_ids)
            ? wc_get_product(intval($product_ids[0]))
            : false;

        if (!$product) {
            return;
        }

        $rotation_items = [];

        foreach ($items as $item) {

            $video_url = ! empty($item['video_url'])
                ? esc_url($item['video_url'])
                : '';

            if (empty($video_url)) {
                continue;
            }

            $product_ids = $item['products'] ?? [];

            foreach ($product_ids as $product_id) {

                $p = wc_get_product(intval($product_id));

                if (!$p) {
                    continue;
                }

                $rotation_items[] = [
                    'video'       => $video_url,
                    'product_id'  => $p->get_id(),
                    'title'       => $p->get_name(),
                    'price'       => wp_kses_post($p->get_price_html()),
                    'image'       => wp_get_attachment_image_url(
                        $p->get_image_id(),
                        'thumbnail'
                    ),
                    'link'        => get_permalink($p->get_id()),
                    'cart_url'    => $p->add_to_cart_url(),
                    'sku'         => $p->get_sku(),
                    'desc'        => wp_trim_words(
                        wp_strip_all_tags(
                            $p->get_short_description()
                        ),
                        20
                    ),
                ];
            }
        }
        if (empty($rotation_items)) {
            return;
        }

        $item = $rotation_items[0];

        $product_info_position = $rule['product_info_position'] ?? 'bottom';
        $show_popup = !empty($rule['show_prd_popup']);
        $is_muted_default = !empty($rule['video_mute']) ? 'true' : 'false';
        ?>

<div
    class="th-shopable-card th-shopable-layout-style2 
                th-product-info-<?php echo esc_attr($product_info_position); ?>"
         data-items="<?php echo esc_attr(wp_json_encode($rotation_items)); ?>" 
         data-show-popup="<?php echo $show_popup ? 'true' : 'false'; ?>" 
         data-muted="<?php echo $is_muted_default; ?>"
    
    
>

    <div class="th-shopable-video-wrap" >

        <video
            class="th-shopable-video"
            playsinline
            <?php echo !empty($rule['video_mute']) ? 'muted' : ''; ?>
            preload="metadata"
        >
            <source
                src="<?php echo esc_url($item['video']); ?>"
                type="video/mp4"
            >
        </video>
                    <div class="th-video-mute-toggle is-muted">
        <!-- Mute -->
        <svg viewBox="0 0 24 24" fill="none">
    <path
        d="M14 5L9 9H5V15H9L14 19V5Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    <path
        d="M3 3L21 21"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
    />
</svg>

        <!-- Unmute -->
        <svg class="icon-unmute" viewBox="0 0 24 24" fill="none">
            <path d="M11 5L6 9H3V15H6L11 19V5Z" stroke="currentColor" stroke-width="2"/>
            <path d="M15 9C16.2 10.2 16.2 13.8 15 15" stroke="currentColor" stroke-width="2"/>
            <path d="M18 7C20.5 9.5 20.5 14.5 18 17" stroke="currentColor" stroke-width="2"/>
        </svg>
    </div>

        <button
            class="th-shopable-play"
            type="button"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.9l10.28-6.86a1.03 1.03 0 0 0 0-1.8L9.56 4.24A1.03 1.03 0 0 0 8 5.14Z"/>
            </svg>
        </button>
<?php if (($rule['video_all_auto_play']) === false) { ?>
        <div class="th-shopable-progress">
            <span class="th-shopable-progress-fill"></span>
        </div>
         <?php }if (($rule['hide_navigation'] ?? false) === true) { ?>
            <div class="th-shopable-slider-nav">

                    <button class="th-nav-prev">

                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M6 15L12 9L18 15"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>

                    </button>

                    <button class="th-nav-next">

                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>

                    </button>

                </div>
                
           <?php  }?>

    </div>
    <div class="th-shopable-product-bar swiper th-product-swiper">

    <div class="swiper-wrapper">

        <?php foreach ($rotation_items as $item) : ?>

            <div class="swiper-slide">

                <?php if (!empty($item['image'])) : ?>
                <img
                    class="th-product-image"
                    src="<?php echo esc_url($item['image']); ?>"
                    alt="<?php echo esc_attr($item['title'] ?? ''); ?>"
                >
            <?php endif; ?>

                <div class="th-shopable-product-content">

                    <div class="th-shopable-cnt">

                        <a
                            href="<?php echo esc_url($item['link']); ?>"
                            class="th-shopable-product-link"
                        >
                            <span class="title">
                                <?php echo esc_html($item['title']); ?>
                            </span>
                        </a>

                        <span class="price">
                            <?php echo wp_kses_post($item['price']); ?>
                        </span>

                    </div>

                    <div class="th-shopable-btn-wrap">

                        <a
                            href="<?php echo esc_url($item['cart_url']); ?>"
                            data-product_id="<?php echo esc_attr($item['product_id']); ?>"
                            data-product_sku="<?php echo esc_attr($item['sku']); ?>"
                            data-quantity="1"
                            class="product_type_simple add_to_cart_button ajax_add_to_cart th-shopable-btn"
                            rel="nofollow"
                        >

                            <span class="cart-icon">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     width="18"
                                     height="18"
                                     viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor"
                                     stroke-width="2">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                            </span>

                            <span class="check-icon">
                                <svg viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor">
                                    <path d="M20 6L9 17L4 12"/>
                                </svg>
                            </span>

                        </a>

                    </div>

                </div>

            </div>

        <?php endforeach; ?>

    </div>

     


</div>



</div>

<?php
    }

    private function render_popup($rule)
    {
        ?>
    <div id="th-shopable-popup" class="th-shopable-popup">
        <button class="th-popup-close">&times;</button>

        <div class="th-popup-main">
            <!-- Video Side -->
            <div class="th-video-reel-container">
                <div class="swiper th-video-swiper">
                    <div class="swiper-wrapper" id="th-video-wrapper"></div>
                </div>

                <div class="th-video-nav">
                    <button class="th-nav-arrow th-prev" type="button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M6 15L12 9L18 15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="th-nav-arrow th-next" type="button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Content Side -->
            <div class="th-side-panel" style="
    --s1-bg-color:
    <?php echo esc_attr($rule['bg_color'] ?? '#fff'); ?>;

    --s1-border-style:
    <?php echo esc_attr($rule['border']['style'] ?? 'solid'); ?>;

    --s1-border-color:
    <?php echo esc_attr($rule['border']['color'] ?? 'transparent'); ?>;

    --s1-border-top:
    <?php echo esc_attr($rule['border']['width']['top'] ?? '0px'); ?>;

    --s1-border-right:
    <?php echo esc_attr($rule['border']['width']['right'] ?? '0px'); ?>;

    --s1-border-bottom:
    <?php echo esc_attr($rule['border']['width']['bottom'] ?? '0px'); ?>;

    --s1-border-left:
    <?php echo esc_attr($rule['border']['width']['left'] ?? '0px'); ?>;

    --s1-radius-top:
    <?php echo esc_attr($rule['border']['radius']['top'] ?? '0px'); ?>;

    --s1-radius-right:
    <?php echo esc_attr($rule['border']['radius']['right'] ?? '0px'); ?>;

    --s1-radius-bottom:
    <?php echo esc_attr($rule['border']['radius']['bottom'] ?? '0px'); ?>;

    --s1-radius-left:
    <?php echo esc_attr($rule['border']['radius']['left'] ?? '0px'); ?>;

    --s1-title-color:
    <?php echo esc_attr($rule['prd_title_color'] ?? '#111'); ?>;

    --s1-price-color:
    <?php echo esc_attr($rule['prd_price_color'] ?? '#111'); ?>;

    --s1-cart-bg:
    <?php echo esc_attr($rule['prd_cart_bg_color'] ?? '#22c55e'); ?>;

    --s1-cart-color:
    <?php echo esc_attr($rule['prd_cart_icon_color'] ?? '#fff'); ?>;

    --s1-play-bg:
    <?php echo esc_attr($rule['vicon_bg_color'] ?? '#000'); ?>;

    --s1-play-color:
    <?php echo esc_attr($rule['vicon_color'] ?? '#fff'); ?>;
    --s1-progress-color: <?php echo esc_attr($rule['bar_color'] ?? '#22c55e'); ?>;>">
                <div id="popup-content" class="th-product-content"></div>
            </div>
        </div>
    </div>
    <?php
    }

    public function ajax_get_product()
    {
        // Security
        if (!check_ajax_referer('th_shopable_nonce', 'nonce', false)) {
            wp_send_json_error(['message' => 'Security check failed']);
        }

        $product_id = intval($_POST['product_id'] ?? 0);

        if (!$product_id) {
            wp_send_json_error(['message' => 'Product ID missing']);
        }

        $product = wc_get_product($product_id);

        if (!$product || !$product->is_visible()) {
            wp_send_json_error(['message' => 'Product not found']);
        }

        global $post;
        $post = get_post($product_id);
        setup_postdata($post);

        ob_start();
        ?>

    <div class="th-product-content s1-shopalbe-popup-content" data-main-product-id="<?php echo esc_attr($product_id); ?>">
        
       

        <?php

$has_featured = has_post_thumbnail($product_id);
        $gallery_ids  = $product->get_gallery_image_ids();
        $has_gallery   = !empty($gallery_ids);


        if ($has_featured || $has_gallery) :
            ?>
    <div class="th-product-gallery swiper th-product-gallery-swiper">
        <div class="swiper-wrapper" id="th-gallery-wrapper">
            
            <?php if ($has_featured) : ?>
                <div class="swiper-slide main-thumb-slide" data-thumb-id="<?php echo esc_attr(get_post_thumbnail_id($product_id)); ?>">
                    <?php echo get_the_post_thumbnail($product_id, 'large', array('class' => 'th-gallery-image')); ?>
                </div>
            <?php endif; ?>

            <?php
                        if ($has_gallery) :
                            foreach ($gallery_ids as $image_id) :
                                ?>
                    <div class="swiper-slide">
                        <?php echo wp_get_attachment_image($image_id, 'large', false, array('class' => 'th-gallery-image')); ?>
                    </div>
                    <?php
                            endforeach;
                        endif;
            ?>
            
        </div>
        
        <div class="swiper-pagination"></div>
    </div>
<?php
        endif;
        ?>

        <h2 class="th-product-title">
            <?php echo esc_html($product->get_name()); ?>
        </h2>

        <div class="th-product-price" id="th-dynamic-price">
            <?php echo $product->get_price_html(); ?>
        </div>

        <?php if (wc_review_ratings_enabled()) : ?>
            <div class="th-product-rating">
                <?php woocommerce_template_single_rating(); ?>
            </div>
        <?php endif; ?>

        <div class="th-divider"></div>

        
 <?php do_action('th_shopable_before_product_popup_content', $product_id, $product); ?>
        <div class="th-cart-section">
            
            
            <?php if ($product->is_type('variable')) : ?>
                <div class="th-variations-wrapper">
                    <?php woocommerce_variable_add_to_cart(); ?>
                </div>
            <?php endif; ?>

            <div class="th-quantity-wrapper">
                <label class="th-label"><?php echo esc_html__('Quantity', 'store-one'); ?></label>
                <div class="th-quantity-box">
                    <button type="button" class="th-qty-minus">−</button>
                    <input type="number" class="qty custom-th-qty" value="1" min="1">
                    <button type="button" class="th-qty-plus">+</button>
                </div>
            </div>
           <?php if ($product->get_short_description()):?>
            <div class="th-description-container">
                <div class="th-divider"></div>
                <div class="th-section-title"><?php echo esc_html__('Product Details', 'store-one'); ?></div>
                <div class="th-product-description" id="th-dynamic-desc">
                    <?php echo wp_kses_post(wpautop($product->get_short_description())); ?>
                </div>
            </div>
            <?php endif; ?>

            <?php do_action('th_shopable_after_product_popup_content', $product_id, $product); ?>

        </div>

        <div class="button-group">
            <a href="<?php echo esc_url(get_permalink($product_id)); ?>" class="button more-info">
                <?php echo esc_html__('More Info', 'store-one'); ?>
            </a>

            <button type="button" 
                    id="th-custom-add-to-cart"
                    data-product_id="<?php echo esc_attr($product_id); ?>"
                    data-variation_id="0" 
                    data-quantity="1"
                    class="button add-to-cart custom_th_add_to_cart">
                <?php echo esc_html__('Add To Cart', 'store-one'); ?>
            </button>
        </div>

    </div>

    <?php
            $html = ob_get_clean();
        wp_reset_postdata();

        wp_send_json_success([
            'html'         => $html,
            'product_id'   => $product_id,
            'product_type' => $product->get_type()
        ]);
    }


}
