<?php
if (! defined('ABSPATH')) {
    exit;
}
?>

<div class="s1-traditional"  style="
        --thwl-bg: <?php echo esc_attr($settings['thw_wishlist_table_bg_color'] ?? ''); ?>;
        --thwl-text: <?php echo esc_attr($settings['thw_wishlist_table_txt_color'] ?? ''); ?>;
        --thwl-border: <?php echo esc_attr($settings['thw_wishlist_table_brd_color'] ?? ''); ?>;
    ">

    <?php if (! empty($args['show_header'])) : ?>

        <div class="s1-tr-header">

            <div class="s1-tr-title">

                <h3><?php esc_html_e('Wishlist', 'th-store-one'); ?></h3>

                <!-- <span class="s1-tr-badge">
                    <?php esc_html_e('Public', 'th-store-one'); ?>
                </span> -->

            </div>

            <?php if (! empty($args['show_share'])) : ?>

                

                   <div class="thwl-wishlist-share">
               
                    <?php $this->render_social_share_links($wishlist); ?>
                
            </div>

            

            <?php endif; ?>

        </div>

    <?php endif; ?>

    <?php if (empty($items)) : ?>

        <div class="s1-tr-row">

            <div class="info">

                <h4><?php esc_html_e('Your wishlist is empty.', 'th-store-one'); ?></h4>

            </div>

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

            <div class="s1-tr-row thwl-item-row"
                data-item-id="<?php echo esc_attr($item->id); ?>"
                data-product-id="<?php echo esc_attr($product->get_id()); ?>">

                <div class="s1-tr-left">

                    <div class="s1-tr-image">

                        <a href="<?php echo esc_url($product->get_permalink()); ?>">

                            <?php echo wp_kses_post($product->get_image('woocommerce_thumbnail')); ?>

                        </a>

                    </div>

                </div>

                <div class="info">

                    <h4>

                        <a href="<?php echo esc_url($product->get_permalink()); ?>">

                            <?php echo esc_html($product->get_name()); ?>

                        </a>

                    </h4>

                    <span class="price">

                        <?php echo wp_kses_post($product->get_price_html()); ?>

                    </span>

                    <span class="stock">

                        <?php
                            echo esc_html(
                                $product->is_in_stock()
                                    ? __('In Stock', 'th-store-one')
                                    : __('Out of Stock', 'th-store-one')
                            );
            ?>

                    </span>

                </div>

                <div class="s1-tr-actions">

                    <?php $this->render_add_to_cart_button($product, $item); ?>

                    <a href="#"
                        class="s1-tr-remove thwl-remove-item"
                        aria-label="<?php esc_attr_e('Remove from wishlist', 'th-store-one'); ?>">

                        &times;

                    </a>

                </div>

            </div>

        <?php endforeach; ?>

    <?php endif; ?>

</div>