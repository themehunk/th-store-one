<?php
/**
 * Store One - Advance Search Bar.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}


/*
 * ---------------------------------------------------------
 * Settings
 * ---------------------------------------------------------
 */

/*
 * Form width.
 */
$form_width = isset($settings['set_form_width'])
    ? absint($settings['set_form_width'])
    : 550;

if ($form_width <= 0) {
    $form_width = 550;
}


/*
 * Search style.
 *
 * Lite supports:
 *
 * th-normal
 * th-traditional
 * th-modern
 */
$search_style = isset($settings['tapsp_product_search_style'])
    ? sanitize_html_class($settings['tapsp_product_search_style'])
    : 'th-normal';

if (! in_array(
    $search_style,
    array(
        'th-normal',
        'th-traditional',
        'th-modern',
    ),
    true
)) {
    $search_style = 'th-normal';
}


/*
 * Layout.
 *
 * Lite currently supports:
 *
 * default_style
 * bar_style
 */
$layout = isset($layout)
    ? sanitize_html_class($layout)
    : 'default_style';

if (! in_array(
    $layout,
    array(
        'default_style',
        'bar_style',
    ),
    true
)) {
    $layout = 'default_style';
}


/*
 * Show submit.
 *
 * show_submit = true
 * + level_submit has text
 * => show text.
 *
 * show_submit = true
 * + level_submit empty
 * => show icon.
 *
 * show_submit = false
 * => show icon.
 */
$show_submit = ! empty($settings['show_submit']);


/*
 * Submit button text.
 */
$submit_text = isset($settings['level_submit'])
    ? trim((string) $settings['level_submit'])
    : '';


/*
 * Placeholder.
 */
$placeholder = isset($settings['placeholder_text'])
    ? (string) $settings['placeholder_text']
    : __('Search for products...', 'th-store-one');


/*
 * Loader setting.
 *
 * STEP 2:
 *
 * Loader is handled by JavaScript.
 * The markup is always available inside the button
 * so JS can replace the search icon with loader.
 */
$show_loader = ! empty($settings['show_loader']);


/*
 * Autocomplete minimum characters.
 */
$autocomplete_length = isset($settings['set_autocomplete_length'])
    ? absint($settings['set_autocomplete_length'])
    : 1;

if ($autocomplete_length < 1) {
    $autocomplete_length = 1;
}


/*
 * ---------------------------------------------------------
 * Instance
 * ---------------------------------------------------------
 */

$search_id = 'store-one-search-' . absint($instance);


/*
 * ---------------------------------------------------------
 * Wrapper Classes
 * ---------------------------------------------------------
 */

$classes = array(
    'store-one-advance-search',
    'store-one-search',
    $search_style,
    $layout,
);

$classes = array_filter(
    array_map(
        'sanitize_html_class',
        $classes
    )
);


/*
 * ---------------------------------------------------------
 * Custom Post Type
 * ---------------------------------------------------------
 */

$custom_post_type = ! empty($custom_post_type)
    ? sanitize_key($custom_post_type)
    : '';


/*
 * ---------------------------------------------------------
 * Current Search Value
 * ---------------------------------------------------------
 */

$search_value = get_search_query();


/*
 * ---------------------------------------------------------
 * Form Action
 * ---------------------------------------------------------
 */

$form_action = home_url('/');


/*
 * ---------------------------------------------------------
 * CSS Variable
 * ---------------------------------------------------------
 */

$search_style_attribute = sprintf(
    '--store-one-search-width: %dpx;',
    $form_width
);

/*
 * ---------------------------------------------------------
 * CSS Variable
 * ---------------------------------------------------------
 */

$search_style_attribute = sprintf(
    '--store-one-search-width: %dpx;',
    $form_width
);

$bar_bg_clr = isset($settings['bar_bg_clr']) && $settings['bar_bg_clr'] !== ''
    ? $settings['bar_bg_clr']
    : '#ffffff';

$bar_brdr_clr = isset($settings['bar_brdr_clr']) && $settings['bar_brdr_clr'] !== ''
    ? $settings['bar_brdr_clr']
    : '#e7edf3';

$bar_text_clr = isset($settings['bar_text_clr']) && $settings['bar_text_clr'] !== ''
    ? $settings['bar_text_clr']
    : '#172033';

$icon_clr = isset($settings['icon_clr']) && $settings['icon_clr'] !== ''
    ? $settings['icon_clr']
    : '#fff';

$bar_button_bg_clr = isset($settings['bar_button_bg_clr']) && $settings['bar_button_bg_clr'] !== ''
    ? $settings['bar_button_bg_clr']
    : '#172033';

$bar_button_txt_clr = isset($settings['bar_button_txt_clr']) && $settings['bar_button_txt_clr'] !== ''
    ? $settings['bar_button_txt_clr']
    : '#ffffff';

$bar_button_hvr_clr = isset($settings['bar_button_hvr_clr']) && $settings['bar_button_hvr_clr'] !== ''
    ? $settings['bar_button_hvr_clr']
    : $bar_button_bg_clr;

$bar_button_txt_hvr_clr = isset($settings['bar_button_txt_hvr_clr']) && $settings['bar_button_txt_hvr_clr'] !== ''
    ? $settings['bar_button_txt_hvr_clr']
    : $bar_button_txt_clr;

$search_style2_attribute = sprintf(
    '--s1-bar-bg: %s;
    --s1-bar-border: %s;
    --s1-bar-text: %s;
    --s1-icon-color: %s;
    --s1-button-bg: %s;
    --s1-button-text: %s;
    --s1-button-hover-bg: %s;
    --s1-button-hover-text: %s;',
    $bar_bg_clr,
    $bar_brdr_clr,
    $bar_text_clr,
    $icon_clr,
    $bar_button_bg_clr,
    $bar_button_txt_clr,
    $bar_button_hvr_clr,
    $bar_button_txt_hvr_clr
);

?>

<div
	id="<?php echo esc_attr($search_id); ?>"
	class="<?php echo esc_attr(implode(' ', $classes)); ?>"
	data-instance="<?php echo esc_attr($instance); ?>"
	data-layout="<?php echo esc_attr($layout); ?>"
	data-style="<?php echo esc_attr($search_style); ?>"
	data-search-id="<?php echo esc_attr($search_id); ?>"
	data-autocomplete-length="<?php echo esc_attr($autocomplete_length); ?>"
	data-show-loader="<?php echo $show_loader ? '1' : '0'; ?>"
	style="<?php echo esc_attr($search_style_attribute . ' ' . $search_style2_attribute); ?>"
>

	<form
		class="store-one-search-form"
		role="search"
		method="get"
		action="<?php echo esc_url($form_action); ?>"
	>

		<div class="store-one-search-field">


			<?php
            /*
             * =====================================================
             * BAR STYLE
             * =====================================================
             *
             * [ Search Icon ] [ Search for products... ]
             *
             * Search icon itself is the submit button.
             */
?>

			<?php if ('bar_style' === $layout) : ?>

				<button
					type="submit"
					class="store-one-search-submit store-one-search-submit-icon-only"
					aria-label="<?php echo esc_attr_x('Search', 'submit button', 'th-store-one'); ?>"
				>

					<span
						class="store-one-search-submit-icon"
						aria-hidden="true"
					>

						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle
								cx="11"
								cy="11"
								r="7"
							></circle>

							<path
								d="m20 20-3.5-3.5"
							></path>
						</svg>

					</span>


					<span
						class="store-one-search-submit-loader"
						aria-hidden="true"
					></span>

				</button>

			<?php endif; ?>


			<?php
/*
 * =====================================================
 * SEARCH INPUT
 * =====================================================
 */
?>
<?php
/**
 * =====================================================
 * PRO SEARCH CONTROLS
 * =====================================================
 *
 * Category Filter is rendered here by Store One Pro.
 */
do_action(
    'store_one_advance_search_before_input',
    $settings,
    $instance
);
?>
			<input
				type="search"
				class="store-one-search-input"
				name="s"
				value="<?php echo esc_attr($search_value); ?>"
				placeholder="<?php echo esc_attr($placeholder); ?>"
				autocomplete="off"
				aria-label="<?php echo esc_attr($placeholder); ?>"
				data-custom-post-type="<?php echo esc_attr($custom_post_type); ?>"
			/>


			<?php
/*
 * =====================================================
 * DEFAULT STYLE
 * =====================================================
 *
 * [ Search for products... ] [ Search ]
 *
 * show_submit = true
 * level_submit = Search
 * => Search text.
 *
 * show_submit = true
 * level_submit = empty
 * => Search icon.
 *
 * show_submit = false
 * => Search icon.
 *
 * During autocomplete:
 *
 * Search icon/text
 *       ↓
 * Loader
 */
?>

			<?php if ('default_style' === $layout) : ?>

				<button
					type="submit"
					class="store-one-search-submit <?php echo ($show_submit && '' !== $submit_text) ? 'has-text' : 'icon-only'; ?>"
					aria-label="<?php echo esc_attr_x('Search', 'submit button', 'th-store-one'); ?>"
				>

					<?php if ($show_submit && '' !== $submit_text) : ?>

						<span class="store-one-search-submit-text">
							<?php echo esc_html($submit_text); ?>
						</span>

					<?php else : ?>

						<span
							class="store-one-search-submit-icon"
							aria-hidden="true"
						>

							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle
									cx="11"
									cy="11"
									r="7"
								></circle>

								<path
									d="m20 20-3.5-3.5"
								></path>
							</svg>

						</span>

					<?php endif; ?>


					<span
						class="store-one-search-submit-loader"
						aria-hidden="true"
					></span>

				</button>

			<?php endif; ?>


		</div>


		<?php
        /*
         * ---------------------------------------------------------
         * Custom Post Type
         * ---------------------------------------------------------
         */
?>

		<?php if (! empty($custom_post_type)) : ?>

			<input
				type="hidden"
				name="post_type"
				value="<?php echo esc_attr($custom_post_type); ?>"
			/>

		<?php endif; ?>

	</form>

</div>