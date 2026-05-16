<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class TH_Store_One_Tabs {

    /**
     * Get modules
     */
    public static function get_modules( $post ) {
        $modules = apply_filters( 'th_store_one_modules', [], $post );
        return is_array( $modules ) ? $modules : [];
    }

    /**
     * Render Sidebar Tabs
     */
    public static function render_tabs( $post ) {

        $modules = self::get_modules( $post );

        if ( empty( $modules ) ) {
            return;
        }

        $first = true;
        ?>
        <div class="th-sidebar">
            <?php foreach ( $modules as $key => $module ) :
                if ( empty( $module['title'] ) ) continue;
            ?>
                <div class="th-tab <?php echo $first ? 'active' : ''; ?>" data-tab="<?php echo esc_attr( $key ); ?>">
                    <?php echo esc_html( $module['title'] ); ?>
                </div>
            <?php $first = false; endforeach; ?>
        </div>
        <?php
    }

    /**
     * Render Panels (PRINT)
     */
    public static function render_panels( $post ) {

        $modules = self::get_modules( $post );

        if ( empty( $modules ) ) {
            return;
        }

        $first = true;
        ?>
        <div class="th-content">
            <?php foreach ( $modules as $key => $module ) : ?>
                
                <div class="th-panel <?php echo $first ? 'active' : ''; ?>" id="th-panel-<?php echo esc_attr( $key ); ?>">
                    
                    <?php
                    if ( isset( $module['render'] ) && is_callable( $module['render'] ) ) {
                        call_user_func( $module['render'], $post );
                    }
                    ?>

                </div>

            <?php $first = false; endforeach; ?>
        </div>
        <?php
    }

    /**
     * Main Render (PRINT — no return, no echo outside needed)
     */
    public static function render( $post ) {

        $modules = self::get_modules( $post );

        if ( empty( $modules ) ) {
            return;
        }
        ?>
        <div class="th-s1-wrapper">
            <?php
            self::render_tabs( $post );
            self::render_panels( $post );
            ?>
        </div>
        <?php
    }
}
/* ================= REGISTER VIDEO MODULE ================= */
add_filter('th_store_one_modules', function($modules, $post){
    
    return $modules;

}, 10, 2);


// added metabox and render function to call the tabs
function add_metabox() {
        add_meta_box(
            'th_store_one_media',
            esc_html__('Store One Product', 'th-store-one'),
            'render',
            'product',
            'normal',
            'low'
        );
    }
function render($post) {
        wp_nonce_field('th_store_one_save', 'th_store_one_nonce');
        TH_Store_One_Tabs::render($post);
    }
add_action('add_meta_boxes', 'add_metabox');