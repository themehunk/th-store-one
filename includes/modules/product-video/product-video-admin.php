<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class TH_Store_One_Product_Video_Admin {

    public function __construct() {
        add_action('add_meta_boxes', [$this, 'add_metabox']);
        add_action('save_post_product', [$this, 'save']);
        add_action('admin_enqueue_scripts', [$this, 'scripts']);
    }

    public function add_metabox() {
        add_meta_box(
            'th_store_one_media',
            esc_html__('Store One Product Media', 'th-store-one'),
            [$this, 'render'],
            'product',
            'normal',
            'low'
        );
    }

public function render($post) {

    wp_nonce_field('th_store_one_save', 'th_store_one_nonce');

    $enable  = get_post_meta($post->ID, '_th_enable_video', true);
    $enable_gallery = get_post_meta($post->ID, '_th_enable_gallery', true);
    $url     = get_post_meta($post->ID, '_th_video_url', true);
    $source  = get_post_meta($post->ID, '_th_source', true);
    $gallery = get_post_meta($post->ID, '_th_gallery', true);
    $position = get_post_meta($post->ID, '_th_position', true);
    $aspect   = get_post_meta($post->ID, '_th_aspect', true);

    if (!is_array($gallery)) $gallery = [];
?>

<div class="th-s1-wrapper">

    <!-- SIDEBAR -->
    <div class="th-sidebar">
        <div class="th-tab active" data-tab="video">
            <?php echo esc_html__('Product Video', 'th-store-one'); ?>
        </div>
        <div class="th-tab" data-tab="audio">
            <?php echo esc_html__('Product Audio', 'th-store-one'); ?>
        </div>
    </div>

    <div class="th-content">

        <!-- VIDEO -->
        <div class="th-panel active" id="th-panel-video">

            <!-- FEATURED -->
            <div class="th-box th-s1-featured">

                <div class="th-row">
                    <div>
                        <strong><?php echo esc_html__('Enable Featured Video', 'th-store-one'); ?></strong>
                    </div>

                    <div class="th-toggle-wrap">
                        <label class="th-switch">
                            <input type="checkbox"
                                id="th_enable_video"
                                name="th_enable_video"
                                value="yes"
                                <?php checked($enable, 'yes'); ?>>
                            <span class="th-slider"></span>
                        </label>
                        <span class="th-toggle-label"></span>
                    </div>
                </div>

                <div class="th-featured-wrap">

                    <div class="th-field">
                        <label><?php echo esc_html__('Video Source', 'th-store-one'); ?></label>
                        <select name="th_source">
                            <option value="youtube" <?php selected($source,'youtube'); ?>>
                                <?php echo esc_html__('YouTube', 'th-store-one'); ?>
                            </option>
                            <option value="vimeo" <?php selected($source,'vimeo'); ?>>
                                <?php echo esc_html__('Vimeo', 'th-store-one'); ?>
                            </option>
                            <option value="upload" <?php selected($source,'upload'); ?>>
                                <?php echo esc_html__('Upload', 'th-store-one'); ?>
                            </option>
                        </select>
                    </div>

                    <div class="th-field">
                        <label><?php echo esc_html__('Video URL', 'th-store-one'); ?></label>
                        <input type="text"
                            name="th_video_url"
                            value="<?php echo esc_attr($url); ?>">
                    </div>

                    <button type="button" class="button th-upload-btn">
                        <?php echo esc_html__('Upload Video', 'th-store-one'); ?>
                    </button>

                </div>

            </div>

            <!-- GALLERY -->
            <div class="th-box th-s1-gallery">

                <div class="th-row">
                    <strong><?php echo esc_html__('Enable Video Gallery', 'th-store-one'); ?></strong>

                    <div class="th-toggle-wrap">
                        <label class="th-switch">
                            <input type="checkbox"
                                id="th_enable_gallery"
                                name="th_enable_gallery"
                                value="yes"
                                <?php checked($enable_gallery,'yes'); ?>>
                            <span class="th-slider"></span>
                        </label>
                        <span class="th-toggle-label"></span>
                    </div>
                </div>

                <div id="th_gallery_wrap">

                    <ul id="th_gallery_list">
                         
<?php 
$gallery_types = get_post_meta($post->ID, '_th_gallery_type', true);
if (!is_array($gallery_types)) $gallery_types = [];
?>

<?php foreach($gallery as $index => $g): 

    // mapping
    $type = $gallery_types[$index] ?? 'youtube';
?>

<li class="th-item">
    <span class="drag">☰</span>

    <select name="th_gallery_type[]">
        <option value="youtube" <?php selected($type,'youtube'); ?>>
            <?php echo esc_html__('YouTube','th-store-one'); ?>
        </option>

        <option value="vimeo" <?php selected($type,'vimeo'); ?>>
            <?php echo esc_html__('Vimeo','th-store-one'); ?>
        </option>

        <option value="upload" <?php selected($type,'upload'); ?>>
            <?php echo esc_html__('Upload','th-store-one'); ?>
        </option>
    </select>

    <input type="text"
        name="th_gallery[]"
        value="<?php echo esc_attr($g); ?>">

    <button class="button upload">
        <?php echo esc_html__('Upload','th-store-one'); ?>
    </button>

    <a href="#" class="remove">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="s1-icon s1-icon-danger"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
    </a>
</li>

<?php endforeach; ?>
                    </ul>

                    <button type="button" class="button button-primary" id="add_video">
                        <?php echo esc_html__('Add Video','th-store-one'); ?>
                    </button>

                </div>

            </div>

            <!-- POSITION -->
            <div class="th-box th-s1-other">

                <div class="th-field">
                    <label><?php echo esc_html__('Position','th-store-one'); ?></label>
                    <select name="th_position">
                        <option value="before" <?php selected($position,'before');?>>
                            <?php echo esc_html__('Before Image Gallery','th-store-one'); ?>
                        </option>
                        <option value="after" <?php selected($position,'after');?>>
                            <?php echo esc_html__('After Image Gallery','th-store-one'); ?>
                        </option>
                    </select>
                </div>

                <div class="th-field">
                    <label><?php echo esc_html__('Aspect Ratio','th-store-one'); ?></label>
                    <select name="th_aspect">
                        <option value="default" <?php selected($aspect,'default');?>>
                            <?php echo esc_html__('Default','th-store-one'); ?>
                        </option>
                        <option value="16:9" <?php selected($aspect,'16:9');?>>16:9</option>
                        <option value="4:3" <?php selected($aspect,'4:3');?>>4:3</option>
                    </select>
                </div>

            </div>

        </div>

        <!-- AUDIO -->
        <div class="th-panel" id="th-panel-audio">
            <p><?php echo esc_html__('Coming soon...','th-store-one'); ?></p>
        </div>

    </div>
</div>

<?php
}


public function save($post_id) {

    if (
        !isset($_POST['th_store_one_nonce']) ||
        !wp_verify_nonce($_POST['th_store_one_nonce'],'th_store_one_save')
    ) return;

    update_post_meta($post_id,'_th_enable_video', isset($_POST['th_enable_video'])?'yes':'no');
    update_post_meta($post_id,'_th_enable_gallery', isset($_POST['th_enable_gallery'])?'yes':'no');

    update_post_meta($post_id,'_th_video_url', esc_url_raw($_POST['th_video_url'] ?? ''));
    update_post_meta($post_id,'_th_source', sanitize_text_field($_POST['th_source'] ?? ''));

    /* ================= GALLERY URL ================= */
    $gallery = array_map('esc_url_raw', $_POST['th_gallery'] ?? []);
    update_post_meta($post_id,'_th_gallery', $gallery);

    /* =================FIX: GALLERY TYPE SAVE ================= */
    $gallery_type = array_map('sanitize_text_field', $_POST['th_gallery_type'] ?? []);
    update_post_meta($post_id,'_th_gallery_type', $gallery_type);

    /* ================= OTHER ================= */
    update_post_meta($post_id,'_th_position', sanitize_text_field($_POST['th_position'] ?? 'before'));
    update_post_meta($post_id,'_th_aspect', sanitize_text_field($_POST['th_aspect'] ?? 'default'));
}

     public function scripts($hook){

     global $post;

     if ( $hook !== 'post.php' && $hook !== 'post-new.php' ) {
          return;
     }

     if ( isset($post) && $post->post_type !== 'product' ) {
          return;
     }

     // Media + sortable
     wp_enqueue_media();
     wp_enqueue_script('jquery-ui-sortable');

     // CSS
     wp_enqueue_style(
          'th-store-one-video-admin',
          TH_STORE_ONE_PLUGIN_URL . 'assets/css/th-store-one-video-admin.css',
          [],
          TH_STORE_ONE_VERSION
     );

     // JS
     wp_enqueue_script(
          'th-store-one-video-admin',
          TH_STORE_ONE_PLUGIN_URL . 'assets/js/th-store-one-video-admin.js',
          ['jquery'],
          TH_STORE_ONE_VERSION,
          true
     );

     wp_localize_script('th-store-one-video-admin', 'thStoreOne', [
          'nonce' => wp_create_nonce('th_store_one_save')
     ]);
     }

}