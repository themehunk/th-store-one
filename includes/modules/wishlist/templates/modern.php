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

			<span class="thwl-badge">
				<?php esc_html_e('Public', 'th-store-one'); ?>
			</span>

		</div>

		<?php if (! empty($args['show_share'])) : ?>

			<button class="thwl-share-btn" type="button">
				<span class="dashicons dashicons-share"></span>
			</button>

		<?php endif; ?>

	</div>

	<?php endif; ?>

	<div class="thwl-modern-grid">

		<?php foreach ($items as $item) : ?>

			<div
				class="thwl-modern-card"
				style="
					background:<?php echo esc_attr($settings['thw_wishlist_table_bg_color']); ?>;
					color:<?php echo esc_attr($settings['thw_wishlist_table_txt_color']); ?>;
					border-color:<?php echo esc_attr($settings['thw_wishlist_table_brd_color']); ?>;
				"
			>

				<div class="thwl-card-top">

					<span class="thwl-checkbox"></span>

					<span class="thwl-remove">&times;</span>

				</div>

				<div class="thwl-image-skeleton">
					<div class="thwl-image-icon"></div>
				</div>

				<h4><?php echo esc_html($item['title']); ?></h4>

				<div class="thwl-price">

					<?php echo esc_html($item['price']); ?>

				</div>

				<span class="thwl-stock">

					<?php echo esc_html($item['stock']); ?>

				</span>

				<button class="thwl-cart-btn">

					<?php esc_html_e('Add to Cart', 'th-store-one'); ?>

				</button>

			</div>

		<?php endforeach; ?>

	</div>

</div>