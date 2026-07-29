<?php
if (! defined('ABSPATH')) {
    exit;
}
?>

<div class="thwl-modern">

    <?php if (! empty($args['show_header'])) : ?>

        <div class="thwl-modern-header">

            <div class="thwl-modern-title">

                <h3><?php esc_html_e('Wishlist', 'th-store-one'); ?></h3>

            </div>

            <?php if (! empty($args['show_share'])) : ?>

                <div class="thwl-wishlist-share">
                    <?php $this->render_social_share_links($wishlist); ?>
                </div>

            <?php endif; ?>

        </div>

    <?php endif; ?>

    <div class="thwl-modern-grid">

        <?php if (empty($items)) : ?>

            <div class="thwl-modern-empty">
                <?php esc_html_e('Your wishlist is empty.', 'th-store-one'); ?>
            </div>

        <?php else : ?>

            <?php foreach ($items as $item) :

                $product = wc_get_product(
                    $item->variation_id ? $item->variation_id : $item->product_id
                );

                if (! $product) {
                    continue;
                }
                ?>

                <div
                    class="thwl-modern-card thw-wishlist-card"
                    data-item-id="<?php echo esc_attr($item->id); ?>"
                    data-product-id="<?php echo esc_attr($product->get_id()); ?>"
                    style="
        --thwl-card-bg: <?php echo esc_attr($settings['thw_wishlist_table_bg_color'] ?? ''); ?>;
        --thwl-card-text: <?php echo esc_attr($settings['thw_wishlist_table_txt_color'] ?? ''); ?>;
        --thwl-card-border: <?php echo esc_attr($settings['thw_wishlist_table_brd_color'] ?? ''); ?>;
    ">

                    <div class="thwl-card-top">

                        <!-- <span class="thwl-checkbox"></span> -->

                        <a href="#"
                            class="thwl-remove thwl-remove-item"
                            aria-label="<?php esc_attr_e('Remove from wishlist', 'th-store-one'); ?>">
                            &times;
                        </a>

                    </div>

                    <div class="thwl-image-morden">

                        <a href="<?php echo esc_url($product->get_permalink()); ?>">

                            <?php echo wp_kses_post($product->get_image('woocommerce_thumbnail')); ?>

                        </a>

                    </div>

                    <h4>

                        <a href="<?php echo esc_url($product->get_permalink()); ?>">

                            <?php echo esc_html($product->get_name()); ?>

                        </a>

                    </h4>

                    <div class="thwl-price">

                        <?php echo wp_kses_post($product->get_price_html()); ?>

                    </div>

                    <span class="thwl-stock <?php echo $product->is_in_stock() ? 'in-stock' : 'out-stock'; ?>">

                        <?php
                            echo esc_html(
                                $product->is_in_stock()
                                    ? __('In Stock', 'th-store-one')
                                    : __('Out of Stock', 'th-store-one')
                            );
                ?>

                    </span>

                    <?php $this->render_add_to_cart_button($product, $item); ?>

                </div>

            <?php endforeach; ?>

        <?php endif; ?>

    </div>

</div>