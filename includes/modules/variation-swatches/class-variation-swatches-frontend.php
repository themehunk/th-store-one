<?php
/**
 * Variation Swatches Frontend - Store One.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Frontend Variation Swatches Renderer.
 */
class TH_Store_One_Variation_Swatches_Frontend_Render
{
    /**
     * Module settings.
     *
     * @var array
     */
    private $settings = array();

    /**
     * Constructor.
     *
     * @param array $settings Module settings.
     */
    public function __construct($settings = array())
    {

        $this->settings = is_array($settings)
            ? $settings
            : array();

        $this->init_hooks();
    }

    /**
     * Initialize frontend hooks.
     *
     * @return void
     */
    private function init_hooks()
    {

        /*
         * Assets.
         */
        add_action(
            'wp_enqueue_scripts',
            array( $this, 'enqueue_assets' )
        );

        /*
         * Single product variation attributes.
         *
         * WooCommerce keeps the original select and JS
         * synchronizes our swatches with it.
         */
        add_filter(
            'woocommerce_dropdown_variation_attribute_options_html',
            array( $this, 'variation_attribute_options_html' ),
            999,
            2
        );

        /*
         * Classic WooCommerce shop loop.
         */
        add_action(
            'woocommerce_after_shop_loop_item',
            array( $this, 'render_loop_swatches' ),
            5
        );

        /*
         * Also support themes that use product title hook.
         */
        add_action(
            'woocommerce_shop_loop_item_title',
            array( $this, 'render_loop_swatches' ),
            10
        );

        /*
         * Add extra variation data.
         */
        add_filter(
            'woocommerce_available_variation',
            array( $this, 'available_variation' ),
            100,
            3
        );
    }

    /**
     * Enqueue frontend CSS and JS.
     *
     * @return void
     */
    public function enqueue_assets()
    {

        if (is_admin()) {
            return;
        }

        $css_file = TH_STORE_ONE_PLUGIN_DIR .
            'includes/modules/variation-swatches/assets/frontend.css';

        $css_url = TH_STORE_ONE_PLUGIN_URL .
            'includes/modules/variation-swatches/assets/frontend.css';

        if (file_exists($css_file)) {

            wp_enqueue_style(
                'th-store-one-variation-swatches',
                $css_url,
                array(),
                defined('TH_STORE_ONE_VERSION')
                    ? TH_STORE_ONE_VERSION
                    : filemtime($css_file)
            );
        }

        $js_file = TH_STORE_ONE_PLUGIN_DIR .
            'includes/modules/variation-swatches/assets/frontend.js';

        $js_url = TH_STORE_ONE_PLUGIN_URL .
            'includes/modules/variation-swatches/assets/frontend.js';

        if (file_exists($js_file)) {

            wp_enqueue_script(
                'th-store-one-variation-swatches',
                $js_url,
                array(
                    'jquery',
                    'wc-add-to-cart-variation',
                ),
                defined('TH_STORE_ONE_VERSION')
                    ? TH_STORE_ONE_VERSION
                    : filemtime($js_file),
                true
            );

            wp_localize_script(
                'th-store-one-variation-swatches',
                'THStoreOneVariationSwatches',
                array(
                    'settings' => array(
                        'style' => $this->get_setting(
                            'style',
                            'rounded'
                        ),
                        'swatch_style' => $this->get_setting(
                            'th-swatches-style',
                            'thswatche'
                        ),
                        'width' => absint(
                            $this->get_setting(
                                'width',
                                36
                            )
                        ),
                        'font_size' => absint(
                            $this->get_setting(
                                'single_font_size',
                                14
                            )
                        ),
                        'border_color' => $this->get_setting(
                            'attr_brdr_color',
                            '#EBEBEB'
                        ),
                        'border_size' => absint(
                            $this->get_setting(
                                'attr_brdr_size',
                                1
                            )
                        ),
                        'hover_border_color' => $this->get_setting(
                            'attr_brdr_hvr_color',
                            '#111'
                        ),
                        'text_color' => $this->get_setting(
                            'attr_text_color',
                            ''
                        ),
                        'hover_text_color' => $this->get_setting(
                            'attr_text_hvr_color',
                            '#fff'
                        ),
                        'background_color' => $this->get_setting(
                            'attr_bg_btn_color',
                            ''
                        ),
                        'hover_background_color' => $this->get_setting(
                            'attr_bg_btn_hvr_color',
                            '#111'
                        ),
                        'behavior' => $this->get_setting(
                            'attribute_behavior',
                            'blur'
                        ),
                        'tooltip' => $this->to_bool(
                            $this->get_setting(
                                'tooltip',
                                true
                            )
                        ),
                        'tooltip_background' => $this->get_setting(
                            'tooltip_background_color',
                            ''
                        ),
                        'tooltip_text' => $this->get_setting(
                            'tooltip_text_color',
                            ''
                        ),
                        'tooltip_border' => $this->get_setting(
                            'tooltip_border_color',
                            '#7100e2'
                        ),
                        'image_tooltip' => $this->to_bool(
                            $this->get_setting(
                                'show_tootip_image',
                                false
                            )
                        ),
                        'image_tooltip_attribute' => sanitize_title(
                            $this->get_setting(
                                'show_tootip_image_attr',
                                ''
                            )
                        ),
                        'image_tooltip_width' => absint(
                            $this->get_setting(
                                'tootip_image_width',
                                120
                            )
                        ),
                    ),
                )
            );
        }
    }

    /**
     * Render single product variation swatches.
     *
     * @param string $html Existing WooCommerce select HTML.
     * @param array  $args Variation arguments.
     * @return string
     */
    public function variation_attribute_options_html(
        $html,
        $args
    ) {

        if (
            empty($args['product']) ||
            ! $args['product'] instanceof WC_Product
        ) {
            return $html;
        }

        $product = $args['product'];

        if (! $product->is_type('variable')) {
            return $html;
        }

        $attribute = isset($args['attribute'])
            ? sanitize_title($args['attribute'])
            : '';

        $options = isset($args['options'])
            ? $args['options']
            : array();

        if (empty($attribute) || empty($options)) {
            return $html;
        }

        $type = $this->get_attribute_type($attribute);

        /*
         * Select remains normal WooCommerce select.
         */
        if ('select' === $type) {
            return $html;
        }

        $swatches = $this->render_attribute_swatches(
            $attribute,
            $options,
            $type,
            $args
        );

        if (empty($swatches)) {
            return $html;
        }

        /*
         * Keep select in DOM.
         *
         * WooCommerce variation JS requires it.
         */
        return sprintf(
            '<div class="th-store-one-native-select">%1$s</div>%2$s',
            $html,
            $swatches
        );
    }

    /**
     * Get WooCommerce attribute type.
     *
     * @param string $attribute Attribute taxonomy.
     * @return string
     */
    private function get_attribute_type($attribute)
    {

        $taxonomy = $this->get_taxonomy_name(
            $attribute
        );

        if (! taxonomy_exists($taxonomy)) {
            return 'select';
        }

        $attribute_name = str_replace(
            'pa_',
            '',
            $taxonomy
        );

        $attribute_taxonomies = wc_get_attribute_taxonomies();

        if (empty($attribute_taxonomies)) {
            return 'select';
        }

        foreach ($attribute_taxonomies as $attribute_data) {

            if (
                sanitize_title(
                    $attribute_data->attribute_name
                ) !== sanitize_title(
                    $attribute_name
                )
            ) {
                continue;
            }

            $type = isset(
                $attribute_data->attribute_type
            )
                ? sanitize_key(
                    $attribute_data->attribute_type
                )
                : 'select';

            if (
                in_array(
                    $type,
                    array(
                        'color',
                        'image',
                        'button',
                    ),
                    true
                )
            ) {
                return $type;
            }

            return 'select';
        }

        return 'select';
    }

    /**
     * Render attribute swatches.
     *
     * @param string $attribute Attribute.
     * @param array  $options Attribute options.
     * @param string $type Type.
     * @param array  $args Variation args.
     * @return string
     */
    private function render_attribute_swatches(
        $attribute,
        $options,
        $type,
        $args
    ) {

        $product = $args['product'];

        $classes = array(
            'th-store-one-swatches',
            'th-store-one-swatches-' . sanitize_html_class(
                $type
            ),
        );

        $shape = sanitize_html_class(
            $this->get_setting(
                'style',
                'rounded'
            )
        );

        if ($shape) {
            $classes[] = 'th-store-one-shape-' . $shape;
        }

        $swatch_style = sanitize_html_class(
            $this->get_setting(
                'th-swatches-style',
                'thswatche'
            )
        );

        if ($swatch_style) {
            $classes[] = 'th-store-one-style-' .
                $swatch_style;
        }

        ob_start();

        ?>

		<div
			class="<?php echo esc_attr(
			    implode(' ', $classes)
			); ?>"
			data-attribute="<?php echo esc_attr(
			    wc_variation_attribute_name(
			        $attribute
			    )
			); ?>"
			data-product-id="<?php echo esc_attr(
			    $product->get_id()
			); ?>"
			data-type="<?php echo esc_attr($type); ?>"
		>

			<?php foreach ($options as $option) : ?>

				<?php
			    $this->render_swatch(
			        $type,
			        $attribute,
			        $option
			    );
			    ?>

			<?php endforeach; ?>

		</div>

		<?php

        return ob_get_clean();
    }

    /**
     * Render one swatch.
     *
     * @param string $type Type.
     * @param string $attribute Attribute.
     * @param string $option Option.
     * @return void
     */
    private function render_swatch(
        $type,
        $attribute,
        $option
    ) {

        $taxonomy = $this->get_taxonomy_name(
            $attribute
        );

        $term = false;

        if (taxonomy_exists($taxonomy)) {

            $term = get_term_by(
                'slug',
                $option,
                $taxonomy
            );
        }

        /*
         * Some WooCommerce attributes can pass
         * the term name instead of slug.
         */
        if (! $term || is_wp_error($term)) {

            $term = get_term_by(
                'name',
                $option,
                $taxonomy
            );
        }

        if (! $term || is_wp_error($term)) {
            return;
        }

        $term_id = absint($term->term_id);
        $label   = $term->name;

        /*
         * ---------------------------------------------------------
         * COLOR
         * ---------------------------------------------------------
         */
        if ('color' === $type) {

            $color = get_term_meta(
                $term_id,
                'product_attribute_color',
                true
            );

            $is_dual_color = get_term_meta(
                $term_id,
                'is_dual_color',
                true
            );

            $secondary_color = get_term_meta(
                $term_id,
                'secondary_color',
                true
            );

            $classes = array(
                'th-store-one-swatch',
                'th-store-one-swatch-color',
            );

            $style = '';

            if (
                'yes' === $is_dual_color &&
                $color &&
                $secondary_color
            ) {

                $classes[] =
                    'th-store-one-swatch-dual';

                $style = sprintf(
                    '--th-store-one-color:%1$s;--th-store-one-secondary-color:%2$s;',
                    esc_attr($color),
                    esc_attr($secondary_color)
                );

            } elseif ($color) {

                $style = sprintf(
                    '--th-store-one-color:%s;',
                    esc_attr($color)
                );
            }

            ?>

			<button
				type="button"
				class="<?php echo esc_attr(
				    implode(' ', $classes)
				); ?>"
				data-value="<?php echo esc_attr(
				    $option
				); ?>"
				title="<?php echo esc_attr(
				    $label
				); ?>"
                data-tooltip="<?php echo esc_attr($label); ?>"
				aria-label="<?php echo esc_attr(
				    $label
				); ?>"
				style="<?php echo esc_attr(
				    $style
				); ?>"
			>
				
			</button>

			<?php
            return;
        }

        /*
         * ---------------------------------------------------------
         * IMAGE
         * ---------------------------------------------------------
         */
        if ('image' === $type) {

            $image_id = absint(
                get_term_meta(
                    $term_id,
                    'product_attribute_image',
                    true
                )
            );

            $image_url = '';

            if ($image_id) {

                $image_url = wp_get_attachment_image_url(
                    $image_id,
                    'thumbnail'
                );
            }

            ?>

			<button
				type="button"
				class="th-store-one-swatch th-store-one-swatch-image"
				data-value="<?php echo esc_attr(
				    $option
				); ?>"
				title="<?php echo esc_attr(
				    $label
				); ?>"
                data-tooltip="<?php echo esc_attr($label); ?>"
				aria-label="<?php echo esc_attr(
				    $label
				); ?>"
			>

				<?php if ($image_url) : ?>

					<img
						src="<?php echo esc_url(
						    $image_url
						); ?>"
						alt="<?php echo esc_attr(
						    $label
						); ?>"
						loading="lazy"
					/>

				<?php else : ?>

					<span class="th-store-one-image-fallback">
						<?php echo esc_html(
						    $label
						); ?>
					</span>

				<?php endif; ?>

			</button>

			<?php
            return;
        }

        /*
         * ---------------------------------------------------------
         * BUTTON
         * ---------------------------------------------------------
         */
        if ('button' === $type) {

            ?>

			<button
				type="button"
				class="th-store-one-swatch th-store-one-swatch-button"
				data-value="<?php echo esc_attr(
				    $option
				); ?>"
				title="<?php echo esc_attr(
				    $label
				); ?>"
                data-tooltip="<?php echo esc_attr($label); ?>"
				aria-label="<?php echo esc_attr(
				    $label
				); ?>"
			>
				<?php echo esc_html($label); ?>
			</button>

			<?php
        }
    }

    /**
     * Render swatches in classic WooCommerce shop.
     *
     * @return void
     */
    public function render_loop_swatches()
    {

        global $product;

        if (! $product instanceof WC_Product) {
            return;
        }

        if (! $product->is_type('variable')) {
            return;
        }

        if (
            ! $this->to_bool(
                $this->get_setting(
                    'show_swatches_shop',
                    false
                )
            )
        ) {
            return;
        }

        /*
         * Avoid duplicate output when two classic hooks
         * are fired by the theme.
         */
        static $rendered = array();

        $product_id = $product->get_id();

        if (isset($rendered[ $product_id ])) {
            return;
        }

        $rendered[ $product_id ] = true;

        $this->render_shop_product($product);
    }

    /**
     * Render shop product swatches.
     *
     * @param WC_Product $product Product.
     * @return void
     */
    private function render_shop_product($product)
    {

        $attributes = $product->get_variation_attributes();

        if (empty($attributes)) {
            return;
        }

        $catalog_mode = $this->to_bool(
            $this->get_setting(
                'show_single_swatches_on_shop',
                false
            )
        );

        $catalog_attribute = sanitize_title(
            $this->get_setting(
                'show_swatches_shop_attr',
                ''
            )
        );

        if ($catalog_attribute) {

            if (0 !== strpos(
                $catalog_attribute,
                'pa_'
            )) {
                $catalog_attribute =
                    'pa_' . $catalog_attribute;
            }
        }

        $variations = $product->get_available_variations();

        $variations_json = wp_json_encode(
            $variations
        );

        ?>

		<div
			class="th-store-one-shop-swatches variations_form"
			data-product-id="<?php echo esc_attr(
			    $product->get_id()
			); ?>"
			data-product-variations="<?php echo esc_attr(
			    $variations_json
			); ?>"
			style="
				--th-store-one-shop-width:
				<?php
			    echo absint(
			        $this->get_setting(
			            'swatches_shop_width',
			            36
			        )
			    );
        ?>px;
				--th-store-one-shop-font-size:
				<?php
        echo absint(
            $this->get_setting(
                'swatches_shop_font_size',
                14
            )
        );
        ?>px;
			"
		>

			<?php foreach ($attributes as $attribute => $options) : ?>

				<?php
        if (
            $catalog_mode &&
            $catalog_attribute &&
            ! $this->same_attribute(
                $attribute,
                $catalog_attribute
            )
        ) {
            continue;
        }

			    $type = $this->get_attribute_type(
			        $attribute
			    );

			    if ('select' === $type) {
			        continue;
			    }
			    ?>

				<div class="th-store-one-shop-attribute">

					<?php
			        $this->render_shop_attribute(
			            $attribute,
			            $options,
			            $type,
			            $product
			        );
			    ?>

				</div>

			<?php endforeach; ?>

			<?php
            if (
                $this->to_bool(
                    $this->get_setting(
                        'show_swatches_shop_clear_link',
                        false
                    )
                )
            ) :
                ?>

				<button
					type="button"
					class="th-store-one-shop-clear"
				>
					<?php esc_html_e(
					    'Clear',
					    'th-store-one'
					); ?>
				</button>

			<?php endif; ?>

		</div>

		<?php
    }

    /**
     * Render shop attribute.
     *
     * @param string     $attribute Attribute.
     * @param array      $options Options.
     * @param string     $type Type.
     * @param WC_Product $product Product.
     * @return void
     */
    private function render_shop_attribute(
        $attribute,
        $options,
        $type,
        $product
    ) {

        ?>

		<div
			class="th-store-one-shop-swatches-group"
			data-attribute="<?php echo esc_attr(
			    wc_variation_attribute_name(
			        $attribute
			    )
			); ?>"
			data-type="<?php echo esc_attr(
			    $type
			); ?>"
		>

			<?php foreach ($options as $option) : ?>

				<?php
			    $this->render_swatch(
			        $type,
			        $attribute,
			        $option
			    );
			    ?>

			<?php endforeach; ?>

		</div>

		<?php
    }

    /**
     * Check two attributes.
     *
     * @param string $first First.
     * @param string $second Second.
     * @return bool
     */
    private function same_attribute(
        $first,
        $second
    ) {

        return wc_variation_attribute_name(
            $first
        ) === wc_variation_attribute_name(
            $second
        );
    }

    /**
     * Get taxonomy.
     *
     * @param string $attribute Attribute.
     * @return string
     */
    private function get_taxonomy_name($attribute)
    {

        $attribute = sanitize_title(
            $attribute
        );

        if (taxonomy_exists($attribute)) {
            return $attribute;
        }

        if (0 === strpos(
            $attribute,
            'pa_'
        )) {
            return $attribute;
        }

        return 'pa_' . $attribute;
    }

    /**
     * Add extra variation data.
     *
     * @param array                 $variation Variation.
     * @param WC_Product            $product Product.
     * @param WC_Product_Variation  $variation_product Variation.
     * @return array
     */
    public function available_variation(
        $variation,
        $product,
        $variation_product
    ) {

        $variation['th_store_one'] = array(
            'id' => $variation_product->get_id(),
        );

        return $variation;
    }

    /**
     * Get setting.
     *
     * @param string $key Key.
     * @param mixed  $default Default.
     * @return mixed
     */
    private function get_setting(
        $key,
        $default = null
    ) {

        return array_key_exists(
            $key,
            $this->settings
        )
            ? $this->settings[ $key ]
            : $default;
    }

    /**
     * Convert setting to boolean.
     *
     * @param mixed $value Value.
     * @return bool
     */
    private function to_bool($value)
    {

        if (is_bool($value)) {
            return $value;
        }

        return in_array(
            strtolower(
                (string) $value
            ),
            array(
                '1',
                'true',
                'yes',
                'on',
            ),
            true
        );
    }
}
