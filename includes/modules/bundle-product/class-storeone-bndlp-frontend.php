<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/* -----------------------------------------
 * Bundle Frontend
 * ----------------------------------------- */
class StoreOne_Bundle_Frontend {

    public function __construct() {

        // Render bundle INSIDE add-to-cart form
        add_action(
            'woocommerce_before_add_to_cart_form',
            [ $this, 'render_bundle' ],
            5
        );

        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ] );
    }

    /* -----------------------------------------
     * Render Bundle
     * ----------------------------------------- */
    public function render_bundle() {

        global $product;

        if ( ! $product ) {
            return;
        }

        // 🔥 Bundle is detected by meta, NOT product type
        $items = get_post_meta(
            $product->get_id(),
            '_storeone_bundle_products',
            true
        );

        if ( empty( $items ) || ! is_array( $items ) ) {
            return;
        }
        ?>

        <div class="storeone-bundle-frontend"
             data-bundle-id="<?php echo esc_attr( $product->get_id() ); ?>">

            <h3 class="s1-bundle-title">
                <?php esc_html_e( 'Bundle includes', 'store-one' ); ?>
            </h3>

            <div class="s1-bundle-items">

                <?php foreach ( $items as $item ) :

                    if ( empty( $item['id'] ) ) continue;

                    $p = wc_get_product( $item['id'] );
                    if ( ! $p ) continue;

                    $price = (float) $p->get_price();
                    $image = wp_get_attachment_image_url(
                        $p->get_image_id(),
                        'woocommerce_thumbnail'
                    );
                ?>
                    <div class="s1-bundle-item"
                         data-id="<?php echo esc_attr( $p->get_id() ); ?>"
                         data-price="<?php echo esc_attr( $price ); ?>"
                         data-discount-type="<?php echo esc_attr( $item['discount_type'] ?? 'percent' ); ?>"
                         data-discount-percent="<?php echo esc_attr( $item['discount_percent'] ?? 0 ); ?>"
                         data-discount-fixed="<?php echo esc_attr( $item['discount_fixed'] ?? 0 ); ?>"
                         data-optional="<?php echo esc_attr( $item['optional'] ?? 0 ); ?>"
                         data-qty="<?php echo esc_attr( $item['qty'] ?? 1 ); ?>">

                        <?php if ( ! empty( $item['optional'] ) ) : ?>
                            <label class="s1-check-wrap">
                                <input type="checkbox" class="s1-check" checked>
                            </label>
                        <?php endif; ?>

                        <div class="s1-thumb">
                            <img src="<?php echo esc_url( $image ); ?>" alt="">
                        </div>

                        <div class="s1-info">
                            <div class="s1-name">
                                <?php echo esc_html( $p->get_name() ); ?>
                            </div>
                            <div class="s1-unit-price">
                                <?php echo wc_price( $price ); ?>
                            </div>
                        </div>

                        <div class="s1-line-price"></div>
                    </div>
                <?php endforeach; ?>

            </div>

            <!-- hidden field for cart -->
            <input type="hidden"
                   name="storeone_bundle_data"
                   id="storeone_bundle_data">

        </div>
        <?php
    }

    /* -----------------------------------------
     * Assets
     * ----------------------------------------- */
    public function enqueue_assets() {

        if ( ! is_product() ) return;

        wp_enqueue_style(
            'storeone-bundle-frontend',
            STORE_ONE_PLUGIN_URL . 'assets/css/storeone-bundle-frontend.css',
            [],
            STORE_ONE_VERSION
        );

        wp_enqueue_script(
            'storeone-bundle-frontend',
            STORE_ONE_PLUGIN_URL . 'assets/js/storeone-bundle-frontend.js',
            [ 'jquery' ],
            STORE_ONE_VERSION,
            true
        );
    }
}
