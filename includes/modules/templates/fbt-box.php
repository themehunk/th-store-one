<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** @var array $rule */
/** @var WC_Product $main_product */
/** @var WC_Product[] $bundle_products */
?>
<div class="storeone-fbt-box" style="border:1px solid #ddd;padding:15px;margin:20px 0;">
	<h3><?php echo esc_html( $rule['bundle_title'] ?? 'Frequently Bought Together' ); ?></h3>

	<p>Main product: <strong><?php echo esc_html( $main_product->get_name() ); ?></strong></p>

	<ul>
		<?php foreach ( $bundle_products as $p ) : ?>
			<li>
				<?php echo wp_kses_post( $p->get_image( 'thumbnail' ) ); ?>
				<?php echo esc_html( $p->get_name() ); ?> –
				<?php echo wp_kses_post( $p->get_price_html() ); ?>
			</li>
		<?php endforeach; ?>
	</ul>

	<button class="button storeone-fbt-add-all">
		<?php echo esc_html( $rule['button_text'] ?? 'Add bundle to cart' ); ?>
	</button>
</div>
