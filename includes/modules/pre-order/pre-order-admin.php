<?php
if (! defined('ABSPATH')) {
    exit;
}

/* =========================
 * REGISTER MODULE
 * ========================= */
add_filter(
    'th_store_one_modules',
    function ($modules) {

        $modules['pre-order'] = [
            'title'  => esc_html__('Pre Order', 'th-store-one'),
            'render' => function ($post) {
                do_action('th_store_one_preorder_panel', $post);
            },
        ];

        return $modules;
    },
    10
);

/* =========================
 * PREORDER PANEL UI
 * ========================= */
add_action(
    'th_store_one_preorder_panel',
    function ($post) {

        if (! $post || empty($post->ID)) {
            return;
        }

        $product = function_exists('wc_get_product')
            ? wc_get_product($post->ID)
            : null;

        if (! $product) {
            return;
        }

        $enable         = get_post_meta($post->ID, '_th_preorder_enable', true);
        $override       = get_post_meta($post->ID, '_th_preorder_override', true);
        $mode           = get_post_meta($post->ID, '_th_preorder_mode', true);
        $button_text    = get_post_meta($post->ID, '_th_preorder_button_text', true);
        $message        = get_post_meta($post->ID, '_th_preorder_message', true);
        $available_date = get_post_meta($post->ID, '_th_preorder_available_date', true);
        $limit          = get_post_meta($post->ID, '_th_preorder_limit', true);
        $logged_in      = get_post_meta($post->ID, '_th_preorder_logged_in', true);

        $date_mode      = get_post_meta($post->ID, '_th_preorder_date_mode', true);
        $price_type     = get_post_meta($post->ID, '_th_preorder_price_type', true);
        $price          = get_post_meta($post->ID, '_th_preorder_price', true);

        $date_mode  = $date_mode ? $date_mode : 'manual';
        $price_type = $price_type ? $price_type : 'product_price';

        ?>

		<div class="th-box th-s1-preorder">

			<h3 class="th-s1-heading">
				<?php esc_html_e('Pre-order options', 'th-store-one'); ?>
			</h3>

			<!-- ENABLE -->
			<div class="th-preorder-row">

				<div class="th-preorder-label">
					<label for="th_preorder_enable">
						<?php esc_html_e('Manage pre-order options for this product', 'th-store-one'); ?>
					</label>
				</div>

				<div class="th-preorder-control">

					<div class="th-toggle-wrap">
						<label class="th-switch">

							<input
								id="th_preorder_enable"
								type="checkbox"
								name="th_preorder_enable"
								value="yes"
								<?php checked($enable, 'yes'); ?>
							>

							<span class="th-slider"></span>

						</label>
					</div>

					<p class="description">
						<?php esc_html_e('Enable to set pre-order options for this product.', 'th-store-one'); ?>
					</p>

				</div>

			</div>

			<!-- OVERRIDE -->
			<div class="th-preorder-row">

				<div class="th-preorder-label">
					<label for="th_preorder_override">
						<?php esc_html_e('Override global rules', 'th-store-one'); ?>
					</label>
				</div>

				<div class="th-preorder-control">

					<div class="th-toggle-wrap">
						<label class="th-switch">

							<input
								id="th_preorder_override"
								type="checkbox"
								name="th_preorder_override"
								value="yes"
								<?php checked($override, 'yes'); ?>
							>

							<span class="th-slider"></span>

						</label>
					</div>

					<p class="description">
						<?php esc_html_e('Use custom pre-order settings for this product only.', 'th-store-one'); ?>
					</p>

				</div>

			</div>

			<!-- DATE MODE -->
			<div class="th-preorder-row">

				<div class="th-preorder-label">
					<label>
						<?php esc_html_e('Set product availability date', 'th-store-one'); ?>
					</label>
				</div>

				<div class="th-preorder-control">

					<p class="th-preorder-radio">
						<label>

							<input
								type="radio"
								name="th_preorder_date_mode"
								value="manual"
								<?php checked($date_mode, 'manual'); ?>
							>

							<?php esc_html_e('No date - end pre-order mode manually', 'th-store-one'); ?>

						</label>
					</p>

					<p class="th-preorder-radio">
						<label>

							<input
								type="radio"
								name="th_preorder_date_mode"
								value="calendar"
								<?php checked($date_mode, 'calendar'); ?>
							>

							<?php esc_html_e('Choose a date from the calendar', 'th-store-one'); ?>

						</label>
					</p>

					<p class="description">
						<?php esc_html_e('Choose how to manage the availability date.', 'th-store-one'); ?>
					</p>

				</div>

			</div>

			<!-- DATE -->
			<div
				class="th-preorder-row th-preorder-date-wrap"
				<?php if ('calendar' !== $date_mode) : ?>
					style="display:none;"
				<?php endif; ?>
			>

				<div class="th-preorder-label">
					<label for="th_preorder_available_date">
						<?php esc_html_e('Availability date and time', 'th-store-one'); ?>
					</label>
				</div>

				<div class="th-preorder-control">

					<input
						id="th_preorder_available_date"
						type="datetime-local"
						name="th_preorder_available_date"
						value="<?php echo esc_attr($available_date); ?>"
					>

					<p class="description">
						<?php esc_html_e('Set the date when this product will become available.', 'th-store-one'); ?>
					</p>

				</div>

			</div>

			<!-- PRICE TYPE -->
			<div class="th-preorder-row">

				<div class="th-preorder-label">
					<label for="th_preorder_price_type">
						<?php esc_html_e('Pre-order price', 'th-store-one'); ?>
					</label>
				</div>

				<div class="th-preorder-control">

					<select
						id="th_preorder_price_type"
						name="th_preorder_price_type"
						class="th-preorder-select"
					>

						<option
							value="product_price"
							<?php selected($price_type, 'product_price'); ?>
						>
							<?php esc_html_e('Use the selling price', 'th-store-one'); ?>
						</option>

						<option
							value="fixed_price"
							<?php selected($price_type, 'fixed_price'); ?>
						>
							<?php esc_html_e('Set a fixed pre-order price', 'th-store-one'); ?>
						</option>

						<option
							value="discount_percentage"
							<?php selected($price_type, 'discount_percentage'); ?>
						>
							<?php esc_html_e('Discount a percentage % of the selling price', 'th-store-one'); ?>
						</option>

						<option
							value="discount_fixed"
							<?php selected($price_type, 'discount_fixed'); ?>
						>
							<?php esc_html_e('Discount a fixed amount of the selling price', 'th-store-one'); ?>
						</option>

						<option
							value="increase_percentage"
							<?php selected($price_type, 'increase_percentage'); ?>
						>
							<?php esc_html_e('Increase a percentage % of the selling price', 'th-store-one'); ?>
						</option>

						<option
							value="increase_fixed"
							<?php selected($price_type, 'increase_fixed'); ?>
						>
							<?php esc_html_e('Increase a fixed amount of the selling price', 'th-store-one'); ?>
						</option>

					</select>

					<p class="description">
						<?php esc_html_e('Choose how to manage the pre-order price.', 'th-store-one'); ?>
					</p>

				</div>

			</div>

			<!-- PRICE -->
			<div
				class="th-preorder-row th-preorder-price-wrap"
				<?php
                if (
                    'fixed_price' !== $price_type &&
                    'discount_percentage' !== $price_type &&
                    'discount_fixed' !== $price_type &&
                    'increase_percentage' !== $price_type &&
                    'increase_fixed' !== $price_type
                ) :
                    ?>
					style="display:none;"
				<?php endif; ?>
			>

				<div class="th-preorder-label">
					<label for="th_preorder_price">
						<?php esc_html_e('Price', 'th-store-one'); ?>
					</label>
				</div>

				<div class="th-preorder-control">

					<input
						id="th_preorder_price"
						type="number"
						step="0.01"
						min="0"
						name="th_preorder_price"
						value="<?php echo esc_attr($price); ?>"
					>

					<p class="description th-preorder-price-desc">

						<?php
                        if ('discount_percentage' === $price_type) {

                            esc_html_e(
                                'Enter the discount percentage amount.',
                                'th-store-one'
                            );

                        } elseif ('discount_fixed' === $price_type) {

                            esc_html_e(
                                'Enter the fixed discount amount.',
                                'th-store-one'
                            );

                        } elseif ('increase_percentage' === $price_type) {

                            esc_html_e(
                                'Enter the increase percentage amount.',
                                'th-store-one'
                            );

                        } elseif ('increase_fixed' === $price_type) {

                            esc_html_e(
                                'Enter the fixed increase amount.',
                                'th-store-one'
                            );

                        } else {

                            esc_html_e(
                                'Set the pre-order price for this product.',
                                'th-store-one'
                            );

                        }
        ?>

					</p>

				</div>

			</div>

			<!-- BUTTON -->
			<div class="th-preorder-row">

				<div class="th-preorder-label">
					<label for="th_preorder_button_text">
						<?php esc_html_e('Button text', 'th-store-one'); ?>
					</label>
				</div>

				<div class="th-preorder-control">

					<input
						id="th_preorder_button_text"
						type="text"
						name="th_preorder_button_text"
						value="<?php echo esc_attr($button_text); ?>"
						placeholder="<?php esc_attr_e('Pre Order Now', 'th-store-one'); ?>"
					>

				</div>

			</div>

			<!-- MESSAGE -->
			<div class="th-preorder-row">

				<div class="th-preorder-label">
					<label for="th_preorder_message">
						<?php esc_html_e('Pre-order message', 'th-store-one'); ?>
					</label>
				</div>

				<div class="th-preorder-control">
					<textarea
						id="th_preorder_message"
						name="th_preorder_message"
						rows="4"
						placeholder="<?php esc_attr_e('This product is available for pre-order.', 'th-store-one'); ?>"
					><?php echo esc_textarea($message); ?></textarea>

				</div>

			</div>

			<!-- LIMIT -->
			<div class="th-preorder-row">

				<div class="th-preorder-label">
					<label for="th_preorder_limit">
						<?php esc_html_e('Pre-order limit', 'th-store-one'); ?>
					</label>
				</div>

				<div class="th-preorder-control">

					<input
						id="th_preorder_limit"
						type="number"
						min="0"
						name="th_preorder_limit"
						value="<?php echo esc_attr($limit); ?>"
					>

					<p class="description">
						<?php esc_html_e('Maximum preorder quantity allowed.', 'th-store-one'); ?>
					</p>

				</div>

			</div>

			<!-- LOGIN -->
			<div class="th-preorder-row">

				<div class="th-preorder-label">
					<label for="th_preorder_logged_in">
						<?php esc_html_e('Logged in users only', 'th-store-one'); ?>
					</label>
				</div>

				<div class="th-preorder-control">

					<div class="th-toggle-wrap">
						<label class="th-switch">

							<input
								id="th_preorder_logged_in"
								type="checkbox"
								name="th_preorder_logged_in"
								value="yes"
								<?php checked($logged_in, 'yes'); ?>
							>

							<span class="th-slider"></span>

						</label>
					</div>

				</div>

			</div>

			
			

		</div>

		<script>
		jQuery(function ($) {

			$('input[name="th_preorder_date_mode"]').on(
				'change',
				function () {

					if ($(this).val() === 'calendar') {
						$('.th-preorder-date-wrap').slideDown(200);
					} else {
						$('.th-preorder-date-wrap').slideUp(200);
					}

				}
			);

			$('#th_preorder_price_type').on(
				'change',
				function () {

					const value = $(this).val();

					if (
						value === 'fixed_price' ||
						value === 'discount_percentage' ||
						value === 'discount_fixed' ||
						value === 'increase_percentage' ||
						value === 'increase_fixed'
					) {

						$('.th-preorder-price-wrap').slideDown(200);

					} else {

						$('.th-preorder-price-wrap').slideUp(200);

					}

				}
			);

		});
		</script>

		<?php
    }
);

/* =========================
 * SAVE
 * ========================= */
add_action(
    'save_post_product',
    function ($post_id) {

        if (
            ! isset($_POST['th_store_one_nonce']) ||
            ! wp_verify_nonce(
                sanitize_text_field(
                    wp_unslash($_POST['th_store_one_nonce'])
                ),
                'th_store_one_save'
            )
        ) {
            return;
        }

        if (
            defined('DOING_AUTOSAVE') &&
            DOING_AUTOSAVE
        ) {
            return;
        }

        if (! current_user_can('edit_product', $post_id)) {
            return;
        }

        update_post_meta(
            $post_id,
            '_th_preorder_enable',
            isset($_POST['th_preorder_enable'])
                ? 'yes'
                : 'no'
        );

        update_post_meta(
            $post_id,
            '_th_preorder_override',
            isset($_POST['th_preorder_override'])
                ? 'yes'
                : 'no'
        );

        update_post_meta(
            $post_id,
            '_th_preorder_mode',
            sanitize_text_field(
                wp_unslash(
                    $_POST['th_preorder_mode'] ?? ''
                )
            )
        );

        update_post_meta(
            $post_id,
            '_th_preorder_button_text',
            sanitize_text_field(
                wp_unslash(
                    $_POST['th_preorder_button_text'] ?? ''
                )
            )
        );

        update_post_meta(
            $post_id,
            '_th_preorder_message',
            sanitize_textarea_field(
                wp_unslash(
                    $_POST['th_preorder_message'] ?? ''
                )
            )
        );

        update_post_meta(
            $post_id,
            '_th_preorder_available_date',
            sanitize_text_field(
                wp_unslash(
                    $_POST['th_preorder_available_date'] ?? ''
                )
            )
        );

        update_post_meta(
            $post_id,
            '_th_preorder_limit',
            absint(
                $_POST['th_preorder_limit'] ?? 0
            )
        );

        update_post_meta(
            $post_id,
            '_th_preorder_logged_in',
            isset($_POST['th_preorder_logged_in'])
                ? 'yes'
                : 'no'
        );


        update_post_meta(
            $post_id,
            '_th_preorder_date_mode',
            sanitize_text_field(
                wp_unslash(
                    $_POST['th_preorder_date_mode'] ?? 'manual'
                )
            )
        );

        update_post_meta(
            $post_id,
            '_th_preorder_price_type',
            sanitize_text_field(
                wp_unslash(
                    $_POST['th_preorder_price_type'] ?? 'product_price'
                )
            )
        );

        update_post_meta(
            $post_id,
            '_th_preorder_price',
            wc_format_decimal(
                wp_unslash(
                    $_POST['th_preorder_price'] ?? 0
                )
            )
        );

    },
    10
);
