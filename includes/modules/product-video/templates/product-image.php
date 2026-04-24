<?php
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals
defined( 'ABSPATH' ) || exit;

global $product;

if ( ! function_exists( 'wc_get_gallery_image_html' ) ) {
    return;
}

// for compatible to badges managemnt
$th_store_one_badge_instance = null;
if ( class_exists('Th_Store_One_Trust_Badges_Frontend') ) {
  $th_store_one_badge_instance = new Th_Store_One_Trust_Badges_Frontend();
}

$settings = th_store_one_get_video_settings();
$global_thumb  = $settings['image_url'];
$global_icon   = $settings['icon'];
$icon_color    = $settings['icon_clr'];
$global_aspect = $settings['aspect'];
$post_thumbnail_id = $product->get_image_id();
$attachment_ids    = $product->get_gallery_image_ids();
$product_id        = $product->get_id();

/* ================= SETTINGS ================= */
$enable = get_post_meta( $product_id, '_th_enable_gallery', true );
$videos = get_post_meta( $product_id, '_th_gallery', true );
$gallery_types = get_post_meta($product_id, '_th_gallery_type', true);
if (!is_array($gallery_types)) $gallery_types = [];

$position = get_post_meta( $product_id, '_th_position', true );
$aspect   = get_post_meta( $product_id, '_th_aspect', true );

if ( empty($position) ) $position = 'before';


$gallery_thumbs = get_post_meta($product_id, '_th_gallery_thumb', true);
if (!is_array($gallery_thumbs)) $gallery_thumbs = [];

$th_enable_custom_poster = get_post_meta($product_id, '_th_enable_custom_poster', true);
if (!is_array($th_enable_custom_poster)) $th_enable_custom_poster = [];


/* ================= BUILD VIDEO HTML ================= */
$video_html = '';

if ( $enable === 'yes' && ! empty( $videos ) && is_array( $videos ) ) {

    foreach ( $videos as $index => $video ) {

        if ( empty( $video ) ) continue;

        
        $type  = $gallery_types[$index] ?? 'youtube';

        /* YOUTUBE */
        
    if ( $type === 'youtube' ) {

    $id = '';

    // watch?v=
    parse_str( wp_parse_url( $video, PHP_URL_QUERY ), $vars );
    if ( ! empty( $vars['v'] ) ) {
        $id = $vars['v'];
    }

    // youtu.be/
    if ( empty( $id ) && strpos($video, 'youtu.be') !== false ) {
        $id = trim( wp_parse_url( $video, PHP_URL_PATH ), '/' );
    }

    // embed/
    if ( empty( $id ) && strpos($video, '/embed/') !== false ) {
        $parts = explode('/embed/', $video);
        $id = $parts[1] ?? '';
    }

        //SHORTS SUPPORT
        if ( empty( $id ) && strpos($video, '/shorts/') !== false ) {
            $parts = explode('/shorts/', $video);
            $id = $parts[1] ?? '';
        }

        // remove extra params (?feature etc.)
        if ( strpos($id, '?') !== false ) {
            $id = explode('?', $id)[0];
        }

        if ( ! empty( $id ) ) {
            $thumb = 'https://img.youtube.com/vi/' . $id . '/hqdefault.jpg';
        }
    }

        /* VIMEO */
        elseif ( $type === 'vimeo' ) {

            $id = trim( wp_parse_url( $video, PHP_URL_PATH ), '/' );

            if ( ! empty( $id ) ) {
                $thumb = 'https://vumbnail.com/' . $id . '.jpg';
            }
        }/* SELF HOSTED VIDEO */
        elseif ( $type === 'upload' ) {

        // 1. gallery thumb (highest priority)
        if ( !empty($gallery_thumbs[$index]) && !empty($th_enable_custom_poster[$index]) ) {

            $thumb = esc_url($gallery_thumbs[$index]);

        }
        //2. global thumb
        elseif ( !empty($global_thumb) ) {

            $thumb = esc_url($global_thumb);

        }
        //3. fallback placeholder
        else {

            $thumb = wc_placeholder_img_src();
        }
        }
        $full = esc_url( $video );

        ob_start(); 
        
            //FINAL aspect decide
            $final_aspect = $aspect;

            // agar meta empty ya auto → global use karo
            if ( empty($final_aspect) || $final_aspect === 'auto' ) {
                $final_aspect = $global_aspect;
            }

            // fallback
            if ( empty($final_aspect) ) {
                $final_aspect = 'default';
            }

            // class mapping
            $aspect_class = 'th-aspect-default';

            if ( $final_aspect === '16:9' || $final_aspect === 'default' ) {
                $aspect_class = 'th-aspect-16-9';
            }
            elseif ( $final_aspect === '9:16' ) {
                $aspect_class = 'th-aspect-9-16';
            }
            elseif ( $final_aspect === '4:3' ) {
                $aspect_class = 'th-aspect-4-3';
            }
            elseif ( $final_aspect === '3:2' ) {
                $aspect_class = 'th-aspect-3-2';
            }
            elseif ( $final_aspect === '1:1' ) {
                $aspect_class = 'th-aspect-1-1';
            }
            elseif ( $final_aspect === 'auto' ) {
                $aspect_class = 'th-aspect-auto';
            }
            ?>
            <div class="woocommerce-product-gallery__image th-video-slide <?php echo esc_attr($aspect_class); ?>"
            data-autoplay="<?php echo esc_attr( get_post_meta($product_id, '_th_enable_video_auto_play', true) === 'yes' ? '1' : '0' ); ?>"
                data-type="<?php echo esc_attr( $type ); ?>"
                data-video="<?php echo esc_url( $video ); ?>"
                data-thumb="<?php echo esc_url( $thumb ); ?>"
                data-src="<?php echo esc_url( $full ); ?>"
                data-large_image="<?php echo esc_url( $thumb ); ?>"
                data-large_image_width="800"
                data-large_image_height="800">
                <a href="<?php echo esc_url($thumb); ?>" class="th-video-trigger">
                    <img src="<?php echo esc_url( $thumb ); ?>" class="wp-post-image" />
                    <span class="th-video-thumb-icon">
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
                </a>
            </div>
        <?php
        $video_html .= ob_get_clean();
    }
}
?>
<div class="woocommerce-product-gallery woocommerce-product-gallery--with-images woocommerce-product-gallery--columns-4 images"
     data-columns="4"
     style="opacity:0; transition:opacity .25s ease;">
    <div class="woocommerce-product-gallery__wrapper">
        <?php
        /* ================= BEFORE ================= */
        if ( $position === 'before' ) {
           echo wp_kses_post($video_html);
        }
        /* FEATURED */
        if ( $post_thumbnail_id ) {
            echo wp_kses_post(wc_get_gallery_image_html( $post_thumbnail_id, true ));
        }
        /* GALLERY */
        if ( $attachment_ids ) {
            foreach ( $attachment_ids as $attachment_id ) {
                $html = wc_get_gallery_image_html( $attachment_id );

                if ( $th_store_one_badge_instance ) {
                    $html = $th_store_one_badge_instance->wrap_single_image_with_badge(
                        $html,
                        $attachment_id
                    );
                }

                echo wp_kses_post( $html );
            }
        }
        /* ================= AFTER ================= */
        if ( $position === 'after' ) {
            echo wp_kses_post($video_html);
        }
        ?>
    </div>
</div>

<?php
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals