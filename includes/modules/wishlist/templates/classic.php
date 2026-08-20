<?php
if (! defined('ABSPATH')) {
    exit;
}

?>
<div class="thwl-normal"  style="
        --thwl-table-bg: <?php echo esc_attr($settings['thw_wishlist_table_bg_color'] ?? ''); ?>;
        --thwl-table-text: <?php echo esc_attr($settings['thw_wishlist_table_txt_color'] ?? ''); ?>;
        --thwl-table-border: <?php echo esc_attr($settings['thw_wishlist_table_brd_color'] ?? ''); ?>;
    ">

	<?php if (! empty($args['show_header'])) : ?>

    <div class="thwl-normal-header">

        <div class="thwl-normal-title">

            <h3>
                <?php
                echo ! empty($wishlist->wishlist_name)
                    ? esc_html($wishlist->wishlist_name)
                    : esc_html__('Wishlist', 'th-store-one');
	    ?>
            </h3>

            <?php if (class_exists('Th_Store_One_Wishlist_Data_Pro_Data') && ! empty($wishlist->privacy)) : ?>

                <span class="thwl-badge thwl-badge-<?php echo esc_attr($wishlist->privacy); ?>">
                    <?php echo esc_html(ucfirst($wishlist->privacy)); ?>
                </span>

            <?php endif; ?>

        </div>

        <?php if (! empty($args['show_share'])) : ?>

            <div class="thwl-wishlist-share">

                <?php $this->render_social_share_links($wishlist); ?>

            </div>

        <?php endif; ?>

    </div>

<?php endif; ?>


<?php if (class_exists('Th_Store_One_Wishlist_Data_Pro_Data')) :

    $wishlists = Th_Store_One_Wishlist_Data_Pro_Data::get_user_wishlists(get_current_user_id());

    $active_id = ! empty($wishlist->id) ? absint($wishlist->id) : 0;

    if (! empty($wishlists)) :
        ?>

<div class="s1-thwl-wishlist-tabs">

    <?php foreach ($wishlists as $wl) : ?>

        <a
            href="<?php echo esc_url(add_query_arg('wishlist_id', $wl->id)); ?>"
            class="thwl-wishlist-tab <?php echo ($active_id === (int) $wl->id) ? 'active' : ''; ?>"
        >

            <?php echo esc_html($wl->wishlist_name); ?>

        </a>

    <?php endforeach; ?>

</div>

<?php
    endif;
endif;
?>



	<table class="thwl-table">

		<thead>

			<tr>

				<!-- <th class="thwl-check-col">
					<span class="thwl-checkbox"></span>
				</th> -->

				<th><?php esc_html_e('Product', 'th-store-one'); ?></th>

				<th><?php esc_html_e('Title', 'th-store-one'); ?></th>

				<th><?php esc_html_e('Price', 'th-store-one'); ?></th>

				<th><?php esc_html_e('Stock', 'th-store-one'); ?></th>

				<th><?php esc_html_e('Action', 'th-store-one'); ?></th>

				<th><?php esc_html_e('Remove', 'th-store-one'); ?></th>

			</tr>

		</thead>

		<tbody>

<?php if (empty($items)) : ?>

    <tr class="thwl-empty-row">
        <td colspan="7" class="thwl-empty">
            <?php esc_html_e('Your wishlist is empty.', 'th-store-one'); ?>
        </td>
    </tr>

<?php else : ?>

<?php foreach ($items as $item) :

    $product = wc_get_product(
        $item->variation_id ? $item->variation_id : $item->product_id
    );

    if (! $product) {
        continue;
    }
    ?>

<tr class="thwl-item-row"
    data-item-id="<?php echo esc_attr($item->id); ?>"
    data-product-id="<?php echo esc_attr($product->get_id()); ?>">

    <!-- <td class="thwl-check-col">
        <span class="thwl-checkbox"></span>
    </td> -->

    <td class="thwl-product-image">

        <a class="thwl-product-link"
            href="<?php echo esc_url($product->get_permalink()); ?>">

            <?php echo wp_kses_post($product->get_image('woocommerce_thumbnail')); ?>

        </a>

    </td>

    <td class="thwl-product-title">

        <a class="thwl-title-link"
            href="<?php echo esc_url($product->get_permalink()); ?>">

            <?php echo esc_html($product->get_name()); ?>

        </a>

    </td>

    <td class="thwl-product-price">

        <?php echo wp_kses_post($product->get_price_html()); ?>

    </td>

    <td class="thwl-product-stock">

        <span class="thwl-stock-status <?php echo $product->is_in_stock() ? 'in-stock' : 'out-stock'; ?>">

            <?php
                echo esc_html(
                    $product->is_in_stock()
                        ? __('In Stock', 'th-store-one')
                        : __('Out of Stock', 'th-store-one')
                );
    ?>

        </span>

    </td>

    <td class="thwl-product-action">

        <?php $this->render_add_to_cart_button($product, $item); ?>

    </td>

    <td class="thwl-product-remove">

        <a href="#"
            class="thwl-remove-item"
            
            aria-label="<?php esc_attr_e('Remove from wishlist', 'th-store-one'); ?>">
            <span class="dashicons dashicons-no-alt"></span>
        </a>
    </td>
</tr>

<?php endforeach; ?>

<?php endif; ?>

</tbody>

	</table>

</div>