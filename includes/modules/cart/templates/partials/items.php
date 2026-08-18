<?php
/**
 * Cart Item.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

$product = apply_filters(
    'woocommerce_cart_item_product',
    $cart_item['data'],
    $cart_item,
    $cart_item_key
);

if (! $product || ! $product->exists()) {
    return;
}

$product_id = $product->get_id();

$product_permalink = apply_filters(
    'woocommerce_cart_item_permalink',
    $product->is_visible() ? $product->get_permalink($cart_item) : '',
    $cart_item,
    $cart_item_key
);

$image = apply_filters(
    'woocommerce_cart_item_thumbnail',
    $product->get_image('woocommerce_thumbnail'),
    $cart_item,
    $cart_item_key
);

$name = apply_filters(
    'woocommerce_cart_item_name',
    $product->get_name(),
    $cart_item,
    $cart_item_key
);

$price = apply_filters(
    'woocommerce_cart_item_price',
    WC()->cart->get_product_price($product),
    $cart_item,
    $cart_item_key
);

$quantity = $cart_item['quantity'];

$show_image    = ! empty($settings['taiowc_show_prd_img']);
$show_title    = ! empty($settings['taiowc_show_prd_title']);
$show_price    = ! empty($settings['taiowc_show_prd_price']);
$show_quantity = ! empty($settings['taiowc_show_prd_quantity']);
$show_rating   = ! empty($settings['taiowc_show_prd_rating']);
?>

<div
	class="s1-cart-item"
	data-cart-item="<?php echo esc_attr($cart_item_key); ?>"
	data-product-id="<?php echo esc_attr($product_id); ?>"
>
<button
        type="button"
        class="s1-cart-remove"
        data-cart-key="<?php echo esc_attr($cart_item_key); ?>"
        aria-label="<?php esc_attr_e('Remove item', 'th-store-one'); ?>"
    >
         <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
    </button>
	<?php if ($show_image) : ?>

		<div class="s1-cart-thumb">

			<?php if ($product_permalink) : ?>

				<a href="<?php echo esc_url($product_permalink); ?>">

					<?php echo wp_kses_post($image); ?>

				</a>

			<?php else : ?>

				<?php echo wp_kses_post($image); ?>

			<?php endif; ?>

		</div>

	<?php endif; ?>

	<div class="s1-cart-content">

		<?php if ($show_title) : ?>

			<h4 class="s1-cart-title">

				<?php if ($product_permalink) : ?>

					<a href="<?php echo esc_url($product_permalink); ?>">

						<?php echo wp_kses_post($name); ?>

					</a>

				<?php else : ?>

					<?php echo wp_kses_post($name); ?>

				<?php endif; ?>

			</h4>

		<?php endif; ?>

		<?php
        echo wc_get_formatted_cart_item_data(
            $cart_item
        );
?>

		<?php
        $rating = (float) $product->get_average_rating();

if ($show_rating && wc_review_ratings_enabled() && $rating > 0) : ?>

			<div class="s1-cart-rating">

				<?php echo wp_kses_post(wc_get_rating_html($rating)); ?>

			</div>

		<?php endif; ?>

		<div class="s1-cart-bottom-content">

		<?php if ($show_quantity) : ?>

			<div
				class="s1-woo-cart-qty"
				data-cart-key="<?php echo esc_attr($cart_item_key); ?>"
			>

				<button
					type="button"
					class="s1-qty-minus"
				>
					−
				</button>

				<input
					type="number"
					class="s1-cart-qty"
					min="1"
					value="<?php echo esc_attr($quantity); ?>"
				/>

				<button
					type="button"
					class="s1-qty-plus"
				>
					+
				</button>

			</div>

		<?php endif; ?>

		<div class="s1-cart-right">

		<?php if ($show_price) : ?>

			<div class="s1-cart-price">

				<?php echo wp_kses_post($price); ?>

			</div>

		<?php endif; ?>

		

	</div>
		</div>

	</div>

	

</div>