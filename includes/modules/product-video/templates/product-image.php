<?php
defined( 'ABSPATH' ) || exit;

global $product;

if ( ! function_exists( 'wc_get_gallery_image_html' ) ) {
    return;
}

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
if ( empty($aspect) )   $aspect   = 'default';

/* ================= ASPECT CLASS ================= */
$aspect_class = 'th-aspect-default';
if ( $aspect === '16:9' ) $aspect_class = 'th-aspect-16-9';
elseif ( $aspect === '4:3' ) $aspect_class = 'th-aspect-4-3';

/* ================= BUILD VIDEO HTML ================= */
$video_html = '';

if ( $enable === 'yes' && ! empty( $videos ) && is_array( $videos ) ) {

    foreach ( $videos as $index => $video ) {

        if ( empty( $video ) ) continue;

        $thumb = wc_placeholder_img_src();
        $type  = $gallery_types[$index] ?? 'youtube';

        /* YOUTUBE */
        if ( $type === 'youtube' ) {

            parse_str( parse_url( $video, PHP_URL_QUERY ), $vars );
            $id = $vars['v'] ?? '';

            if ( empty( $id ) ) {
                $id = trim( parse_url( $video, PHP_URL_PATH ), '/' );
            }

            if ( ! empty( $id ) ) {
                $thumb = 'https://img.youtube.com/vi/' . $id . '/hqdefault.jpg';
            }
        }

        /* VIMEO */
        elseif ( $type === 'vimeo' ) {

            $id = trim( parse_url( $video, PHP_URL_PATH ), '/' );

            if ( ! empty( $id ) ) {
                $thumb = 'https://vumbnail.com/' . $id . '.jpg';
            }
        }

        $full = esc_url( $thumb );

        ob_start(); ?>

        <div class="woocommerce-product-gallery__image th-video-slide"
             data-type="<?php echo esc_attr( $type ); ?>"
             data-video="<?php echo esc_url( $video ); ?>"
             data-thumb="<?php echo esc_url( $thumb ); ?>"
             data-src="<?php echo esc_url( $full ); ?>"
             data-large_image="<?php echo esc_url( $full ); ?>"
             data-large_image_width="800"
             data-large_image_height="800">
             <div class="th-video-inner">
            <a href="#" class="th-video-trigger">
                <img src="<?php echo esc_url( $thumb ); ?>" class="wp-post-image" />
                <span class="th-play-icon">▶</span>
            </a>
          </div>
          

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
            echo $video_html;
        }

        /* FEATURED */
        if ( $post_thumbnail_id ) {
            echo wc_get_gallery_image_html( $post_thumbnail_id, true );
        }

        /* GALLERY */
        if ( $attachment_ids ) {
            foreach ( $attachment_ids as $attachment_id ) {
                echo wc_get_gallery_image_html( $attachment_id );
            }
        }

        /* ================= AFTER ================= */
        if ( $position === 'after' ) {
            echo $video_html;
        }
        ?>

    </div>

</div>

<!-- LIGHTBOX -->
<div id="th-video-lightbox">
    <div class="th-video-inner">
        <span class="th-close">×</span>
        <div class="th-video-content"></div>
    </div>
</div>