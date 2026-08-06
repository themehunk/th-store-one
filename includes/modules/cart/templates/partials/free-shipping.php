<?php
/**
 * Shipping.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! WC()->cart || ! WC()->cart->needs_shipping()) {
    return;
}

$packages = WC()->shipping()->get_packages();

if (empty($packages)) {
    return;
}

$package = $packages[0];
$index   = 0;

$chosen_methods = WC()->session->get('chosen_shipping_methods', array());

$chosen_method = isset($chosen_methods[$index])
    ? $chosen_methods[$index]
    : '';

$available_methods = isset($package['rates'])
    ? $package['rates']
    : array();

$formatted_destination = WC()->countries->get_formatted_address(
    $package['destination'],
    ', '
);

$has_calculated_shipping = WC()->customer->has_calculated_shipping();
?>

<div class="s1-shipping">

	<div class="s1-shipping-head">

		<div class="s1-shipping-title">

			<strong>

				<?php
                if (
                    ! empty($chosen_method) &&
                    isset($available_methods[$chosen_method])
                ) {

                    echo esc_html(
                        $available_methods[$chosen_method]->get_label()
                    );

                } else {

                    esc_html_e(
                        'Shipping',
                        'th-store-one'
                    );

                }
?>

			</strong>

			<span>

				<?php echo wp_kses_post(WC()->cart->get_cart_shipping_total()); ?>

			</span>

		</div>

		<span class="s1-shipping-arrow">
			 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 9L12 15L18 9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"/>
    </svg>
		</span>

	</div>

	<div class="s1-shipping-content">

		<?php if (! empty($available_methods)) : ?>

			<ul class="woocommerce-shipping-methods">

				<?php foreach ($available_methods as $method) : ?>

					<li>

						<?php
        if (count($available_methods) > 1) {

            printf(
                '<input type="radio"
									name="shipping_method[%1$d]"
									data-index="%1$d"
									id="shipping_method_%1$d_%2$s"
									value="%3$s"
									class="shipping_method"
									%4$s />',
                $index,
                esc_attr(sanitize_title($method->id)),
                esc_attr($method->id),
                checked(
                    $method->id,
                    $chosen_method,
                    false
                )
            );

        } else {

            printf(
                '<input type="hidden"
									name="shipping_method[%1$d]"
									value="%2$s"
									class="shipping_method" />',
                $index,
                esc_attr($method->id)
            );

        }

				    printf(
				        '<label for="shipping_method_%1$s_%2$s">%3$s</label>',
				        $index,
				        esc_attr(sanitize_title($method->id)),
				        wc_cart_totals_shipping_method_label($method)
				    );
				    ?>

					</li>

				<?php endforeach; ?>

			</ul>

		<?php endif; ?>

		<?php if ($formatted_destination) : ?>

			<p class="s1-shipping-address">

				<?php
                printf(
                    esc_html__('Shipping to %s', 'th-store-one'),
                    '<strong>' . esc_html($formatted_destination) . '</strong>'
                );
		    ?>

			</p>

		<?php endif; ?>

		<div class="s1-shipping-calculator">

			<?php
		    ob_start();

woocommerce_shipping_calculator(
    __('Change address', 'th-store-one')
);

echo ob_get_clean();
?>

		</div>

	</div>

</div>