<?php
if (! defined('ABSPATH')) {
    exit;
}
?>

<div class="s1-traditional">

	<?php if (! empty($args['show_header'])) : ?>

	<div class="s1-tr-header">

		<div class="s1-tr-title">

			<h3><?php esc_html_e('Wishlist', 'th-store-one'); ?></h3>

			<span class="s1-tr-badge">

				<?php esc_html_e('Public', 'th-store-one'); ?>

			</span>

		</div>

		<?php if (! empty($args['show_share'])) : ?>

			<button class="s1-tr-share-btn">

				<span class="dashicons dashicons-share"></span>

			</button>

		<?php endif; ?>

	</div>

	<?php endif; ?>

	<?php foreach ($items as $item) : ?>

		<div class="s1-tr-row">

			<div class="s1-tr-left">

				<div class="s1-tr-checkbox"></div>

				<div class="s1-tr-image-skeleton">

					<div class="s1-tr-image-icon"></div>

				</div>

			</div>

			<div class="info">

				<h4><?php echo esc_html($item['title']); ?></h4>

				<span class="price">

					<?php echo esc_html($item['price']); ?>

				</span>

				<span class="stock">

					<?php echo esc_html($item['stock']); ?>

				</span>

			</div>

			<div class="s1-tr-actions">

				<button>

					<?php esc_html_e('Add to Cart', 'th-store-one'); ?>

				</button>

				<span class="s1-tr-remove">&times;</span>

			</div>

		</div>

	<?php endforeach; ?>

</div>