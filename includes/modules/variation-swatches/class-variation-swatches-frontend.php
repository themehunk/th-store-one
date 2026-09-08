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

        add_filter(
            'woocommerce_ajax_variation_threshold',
            [$this, 'variation_threshold'],
            10,
            1
        );

        add_action(
            'wp_ajax_th_store_one_catalog_add_to_cart',
            array( $this, 'catalog_add_to_cart' )
        );

        add_action(
            'wp_ajax_nopriv_th_store_one_catalog_add_to_cart',
            array( $this, 'catalog_add_to_cart' )
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
                    'ajax_url' => admin_url('admin-ajax.php'),
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
                        'variation_label_separator' => $this->get_setting(
                            'variation_label_separator',
                            ':'
                        ),
                        'clear_on_reselect' =>
                            $this->get_setting('clear_on_reselect', false),

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

        // Single product page swatches enable/disable.
        if (
            ! $this->to_bool(
                $this->get_setting(
                    'show_single_swatches_on_shop',
                    false
                )
            )
        ) {
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

        $type = $this->get_attribute_type($attribute, $product);

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
     * Get effective attribute type.
     *
     * Product-level type overrides the global WooCommerce attribute type.
     * Empty/Global falls back to the global attribute type.
     *
     * @param string          $attribute Attribute taxonomy/name.
     * @param WC_Product|false $product Product.
     * @return string
     */
    private function get_attribute_type($attribute, $product = false)
    {
        $product_settings = $this->get_product_attribute_settings(
            $product,
            $attribute
        );

        if ($this->has_product_setting($product_settings, 'type')) {
            $type = sanitize_key($product_settings['type']);

            if (in_array($type, array('color', 'image', 'button', 'select'), true)) {
                return $type;
            }
        }

        $taxonomy = $this->get_taxonomy_name($attribute);

        if (! taxonomy_exists($taxonomy)) {
            return 'select';
        }

        $attribute_name = str_replace('pa_', '', $taxonomy);
        $attribute_taxonomies = wc_get_attribute_taxonomies();

        if (empty($attribute_taxonomies)) {
            return 'select';
        }

        foreach ($attribute_taxonomies as $attribute_data) {
            if (
                sanitize_title($attribute_data->attribute_name) !==
                sanitize_title($attribute_name)
            ) {
                continue;
            }

            $type = isset($attribute_data->attribute_type)
                ? sanitize_key($attribute_data->attribute_type)
                : 'select';

            return in_array(
                $type,
                array('color', 'image', 'button'),
                true
            ) ? $type : 'select';
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
			        $option,
			        $product
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
    /**
     * Render one swatch.
     *
     * Product-level settings are applied first. Empty/Default values fall back
     * to the global Store One settings and then to the global term meta.
     *
     * @param string              $type      Type.
     * @param string              $attribute Attribute.
     * @param string              $option    Option/term slug.
     * @param WC_Product|false    $product   Product.
     * @return void
     */
    private function render_swatch(
        $type,
        $attribute,
        $option,
        $product = false
    ) {
        $taxonomy = $this->get_taxonomy_name($attribute);
        $term     = false;
        $term_id  = 0;
        $label    = $option;

        if (taxonomy_exists($taxonomy)) {
            $term = get_term_by('slug', $option, $taxonomy);

            if (! $term || is_wp_error($term)) {
                $term = get_term_by('name', $option, $taxonomy);
            }

            if ($term && ! is_wp_error($term)) {
                $term_id = absint($term->term_id);
                $label   = $term->name;
            }
        }

        // Custom attributes do not have taxonomy terms. They are still valid
        // swatch options, so use the option itself as the term key.
        if (! $term_id && ! taxonomy_exists($taxonomy)) {
            $term_id = sanitize_title($option);
            $label   = $option;
        }

        if (! $term_id) {
            return;
        }

        $attribute_settings = $this->get_product_attribute_settings(
            $product,
            $attribute
        );

        $term_settings = $this->get_product_term_settings(
            $attribute_settings,
            $term_id,
            $option
        );

        // -------------------------------------------------------------
        // Effective type/style.
        // -------------------------------------------------------------
        $effective_type = $type;

        if ($this->has_product_setting($term_settings, 'type')) {
            $term_type = sanitize_key($term_settings['type']);

            if (in_array($term_type, array('color', 'image', 'button', 'select'), true)) {
                $effective_type = $term_type;
            }
        }

        if ('select' === $effective_type) {
            return;
        }

        $shape = $this->has_product_setting($attribute_settings, 'style')
            ? sanitize_html_class($attribute_settings['style'])
            : sanitize_html_class($this->get_setting('style', 'rounded'));

        $swatch_style = sanitize_html_class(
            $this->get_setting('th-swatches-style', 'thswatche')
        );

        $classes = array(
            'th-store-one-swatch',
            'th-store-one-swatch-' . sanitize_html_class($effective_type),
        );

        if ($shape) {
            $classes[] = 'th-store-one-shape-' . $shape;
        }

        if ($swatch_style) {
            $classes[] = 'th-store-one-style-' . $swatch_style;
        }

        // -------------------------------------------------------------
        // Effective tooltip mode.
        // Attribute-level setting: Global | Hide | Text | Image.
        // Term-level setting: Default | Text | Image | No | Text + Image.
        // -------------------------------------------------------------
        $global_tooltip_enabled = $this->to_bool(
            $this->get_setting('tooltip', true)
        );

        $attribute_tooltip = $this->has_product_setting(
            $attribute_settings,
            'show_tooltip'
        ) ? sanitize_key($attribute_settings['show_tooltip']) : '';

        if ('no' === $attribute_tooltip) {
            $tooltip_mode = 'no';
        } elseif (in_array($attribute_tooltip, array('text', 'image'), true)) {
            $tooltip_mode = $attribute_tooltip;
        } else {
            $tooltip_mode = $global_tooltip_enabled ? 'text' : 'no';

            // Preserve the existing global "image tooltip attribute" feature.
            $global_image_tooltip = $this->to_bool(
                $this->get_setting('show_tootip_image', false)
            );
            $global_image_attribute = sanitize_title(
                $this->get_setting('show_tootip_image_attr', '')
            );

            if (
                $global_tooltip_enabled &&
                $global_image_tooltip &&
                $global_image_attribute &&
                $this->same_attribute($attribute, $global_image_attribute)
            ) {
                $tooltip_mode = 'image';
            }
        }

        $term_tooltip = $this->has_product_setting(
            $term_settings,
            'tooltip_type'
        ) ? sanitize_key($term_settings['tooltip_type']) : '';

        if ($term_tooltip) {
            if ('no' === $term_tooltip) {
                $tooltip_mode = 'no';
            } elseif (in_array($term_tooltip, array('text', 'image', 'text-image'), true)) {
                $tooltip_mode = $term_tooltip;
            }
        }

        // If the parent attribute explicitly says Hide, never let a term
        // setting turn the tooltip back on.
        if ('no' === $attribute_tooltip) {
            $tooltip_mode = 'no';
        }

        $tooltip_text = $label;

        if ($this->has_product_setting($term_settings, 'tooltip_text')) {
            $custom_tooltip_text = trim((string) $term_settings['tooltip_text']);

            if ('' !== $custom_tooltip_text) {
                $tooltip_text = $custom_tooltip_text;
            }
        }

        // -------------------------------------------------------------
        // Effective tooltip image.
        // Product term image overrides the global image source.
        // -------------------------------------------------------------
        $tooltip_image_id = $this->has_product_setting(
            $term_settings,
            'tooltip_image'
        ) ? absint($term_settings['tooltip_image']) : 0;

        $tooltip_image_url = '';

        if ($tooltip_image_id) {
            $tooltip_image_url = wp_get_attachment_image_url(
                $tooltip_image_id,
                'thumbnail'
            );
        }

        // -------------------------------------------------------------
        // Common data attributes. JS can use these for the tooltip without
        // needing to know anything about the product meta structure.
        // -------------------------------------------------------------
        $data_tooltip_type = $tooltip_mode;
        $data_tooltip_text = $tooltip_text;

        $tooltip_attrs = sprintf(
            'data-tooltip-type="%1$s" data-tooltip="%2$s" data-tooltip-text="%2$s"',
            esc_attr($data_tooltip_type),
            esc_attr($data_tooltip_text)
        );

        if ($tooltip_image_url) {
            $classes[] = 'th-store-one-tooltip-image';
            $tooltip_attrs .= sprintf(
                ' data-tooltip-image="%s"',
                esc_url($tooltip_image_url)
            );
        }

        // -------------------------------------------------------------
        // COLOR
        // Product color/dual-color values override global term meta.
        // -------------------------------------------------------------
        if ('color' === $effective_type) {
            $color = '';
            $is_dual_color = '';
            $secondary_color = '';

            if ($this->has_product_setting($term_settings, 'color')) {
                $color = sanitize_hex_color($term_settings['color']);
            }

            if (! $color && $term) {
                $color = sanitize_hex_color(
                    get_term_meta($term_id, 'product_attribute_color', true)
                );
            }

            if ($this->has_product_setting($term_settings, 'is_dual_color')) {
                $is_dual_color = sanitize_key($term_settings['is_dual_color']);
            }

            if ('' === $is_dual_color && $term) {
                $is_dual_color = sanitize_key(
                    get_term_meta($term_id, 'is_dual_color', true)
                );
            }

            if ($this->has_product_setting($term_settings, 'secondary_color')) {
                $secondary_color = sanitize_hex_color(
                    $term_settings['secondary_color']
                );
            }

            if (! $secondary_color && $term) {
                $secondary_color = sanitize_hex_color(
                    get_term_meta($term_id, 'secondary_color', true)
                );
            }

            $style = '';

            if (
                'yes' === $is_dual_color &&
                $color &&
                $secondary_color
            ) {
                $classes[] = 'th-store-one-swatch-dual';
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
                class="<?php echo esc_attr(implode(' ', $classes)); ?>"
                data-value="<?php echo esc_attr($option); ?>"
                title="<?php echo esc_attr($label); ?>"
                <?php echo $tooltip_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped?>
                aria-label="<?php echo esc_attr($label); ?>"
                style="<?php echo esc_attr($style); ?>"
            ></button>

            <?php
            return;
        }

        // -------------------------------------------------------------
        // IMAGE
        // Product image_id overrides global term image meta.
        // -------------------------------------------------------------
        if ('image' === $effective_type) {
            $image_id = $this->has_product_setting(
                $term_settings,
                'image_id'
            ) ? absint($term_settings['image_id']) : 0;

            if (! $image_id && $term) {
                $image_id = absint(
                    get_term_meta(
                        $term_id,
                        'product_attribute_image',
                        true
                    )
                );
            }

            $image_url = $image_id
                ? wp_get_attachment_image_url($image_id, 'thumbnail')
                : '';
            ?>

            <button
                type="button"
                class="<?php echo esc_attr(implode(' ', $classes)); ?>"
                data-value="<?php echo esc_attr($option); ?>"
                title="<?php echo esc_attr($label); ?>"
                <?php echo $tooltip_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped?>
                aria-label="<?php echo esc_attr($label); ?>"
            >
                <?php if ($image_url) : ?>
                    <img
                        src="<?php echo esc_url($image_url); ?>"
                        alt="<?php echo esc_attr($label); ?>"
                        loading="lazy"
                    />
                <?php else : ?>
                    <span class="th-store-one-image-fallback">
                        <?php echo esc_html($label); ?>
                    </span>
                <?php endif; ?>
            </button>

            <?php
            return;
        }

        // -------------------------------------------------------------
        // BUTTON
        // -------------------------------------------------------------
        if ('button' === $effective_type) {
            ?>

            <button
                type="button"
                class="<?php echo esc_attr(implode(' ', $classes)); ?>"
                data-value="<?php echo esc_attr($option); ?>"
                title="<?php echo esc_attr($label); ?>"
                <?php echo $tooltip_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped?>
                aria-label="<?php echo esc_attr($label); ?>"
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
        if (! $product instanceof WC_Product) {
            return;
        }

        if (! $product->is_type('variable')) {
            return;
        }

        $attributes = $product->get_variation_attributes();

        $available_variations = $product->get_available_variations();

        $variations_json = wp_json_encode($available_variations);

        $variations_attr = function_exists('wc_esc_json')
            ? wc_esc_json($variations_json)
            : _wp_specialchars(
                $variations_json,
                ENT_QUOTES,
                'UTF-8',
                true
            );

        if (empty($attributes)) {
            return;
        }

        /*
         * -----------------------------------------
         * Catalog / Shop Attribute Mode
         * -----------------------------------------
         */
        $catalog_mode = $this->to_bool(
            $this->get_setting(
                'show_single_swatches_on_attr_shop',
                false
            )
        );

        /*
         * -----------------------------------------
         * Selected Catalog Attribute
         * -----------------------------------------
         */
        $catalog_attribute = sanitize_title(
            $this->get_setting(
                'show_swatches_shop_attr',
                ''
            )
        );

        /*
         * Normalize:
         *
         * color
         *      ↓
         * pa_color
         */
        if ($catalog_attribute) {

            if (0 !== strpos($catalog_attribute, 'pa_')) {
                $catalog_attribute = 'pa_' . $catalog_attribute;
            }
        }

        /*
         * -----------------------------------------
         * Render wrapper
         * -----------------------------------------
         */

        ?>

    <div
         class="th-store-one-shop-swatches"
    data-product-id="<?php echo esc_attr($product->get_id()); ?>"
    data-product-type="<?php echo esc_attr($product->get_type()); ?>"
    data-variation-count="<?php echo esc_attr(count($available_variations)); ?>"
    data-product-variations="<?php echo esc_attr($variations_attr); ?>"
     data-align="<?php echo esc_attr($this->get_setting('show_swatches_shop_attr_alignment', 'left')); ?>"
    style="
    --th-store-one-shop-swatch-width: <?php echo esc_attr(absint($this->get_setting('swatches_shop_width', 36))); ?>px;
    --th-store-one-shop-font-size: <?php echo esc_attr(absint($this->get_setting('swatches_shop_font_size', 14))); ?>px;
    --th-store-one-shop-align: <?php echo esc_attr($this->get_setting('show_swatches_shop_attr_alignment', 'left')); ?>;
"
    >

        <?php foreach ($attributes as $attribute => $options) : ?>

            <?php

            /*
             * -----------------------------------------
             * Catalog mode ON
             *
             * Only selected attribute render karo.
             * -----------------------------------------
             */
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

            /*
             * -----------------------------------------
             * Attribute type
             * -----------------------------------------
             */
            $type = $this->get_attribute_type(
                $attribute,
                $product
            );

            /*
             * Select type ko abhi skip.
             *
             * Step 1 me sirf swatch attributes.
             */
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

        /*
         * Clear abhi existing setting ke according.
         */
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
                <?php
                    esc_html_e(
                        'Clear',
                        'th-store-one'
                    );
            ?>
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
			        $option,
			        $product
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
     * Get product-level Store One attribute settings.
     *
     * Empty values mean Global/Default and therefore fall back to the
     * global Store One/WooCommerce settings.
     *
     * @param WC_Product|false $product   Product.
     * @param string           $attribute Attribute name.
     * @return array
     */
    private function get_product_attribute_settings($product, $attribute)
    {
        if (! $product instanceof WC_Product) {
            return array();
        }

        $settings = get_post_meta(
            $product->get_id(),
            '_th_store_one_product_attributes',
            true
        );

        if (! is_array($settings)) {
            return array();
        }

        $keys = array_unique(
            array(
                $attribute,
                sanitize_title($attribute),
                $this->get_taxonomy_name($attribute),
            )
        );

        foreach ($keys as $key) {
            if (isset($settings[$key]) && is_array($settings[$key])) {
                return $settings[$key];
            }
        }

        return array();
    }

    /**
     * Get product-level settings for one term/option.
     *
     * @param array  $attribute_settings Attribute settings.
     * @param mixed  $term_id            Term ID/custom key.
     * @param string $option             Original option.
     * @return array
     */
    private function get_product_term_settings(
        $attribute_settings,
        $term_id,
        $option = ''
    ) {
        if (
            ! is_array($attribute_settings) ||
            empty($attribute_settings['terms']) ||
            ! is_array($attribute_settings['terms'])
        ) {
            return array();
        }

        $keys = array(
            $term_id,
            (string) $term_id,
        );

        if ('' !== (string) $option) {
            $keys[] = $option;
            $keys[] = sanitize_title($option);
        }

        foreach (array_unique($keys) as $key) {
            if (
                isset($attribute_settings['terms'][$key]) &&
                is_array($attribute_settings['terms'][$key])
            ) {
                return $attribute_settings['terms'][$key];
            }
        }

        return array();
    }

    /**
     * Check whether a product setting has an explicit value.
     *
     * @param array  $settings Settings.
     * @param string $key      Key.
     * @return bool
     */
    private function has_product_setting($settings, $key)
    {
        return (
            is_array($settings) &&
            array_key_exists($key, $settings) &&
            '' !== trim((string) $settings[$key])
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

            'show_stock_available' => $this->to_bool(
                $this->get_setting(
                    'show_stock_available',
                    false
                )
            ),

            'stock_display_threshold' => absint(
                $this->get_setting(
                    'stock_display_threshold',
                    0
                )
            ),
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

    public function variation_threshold($threshold)
    {
        $configured_threshold = absint(
            $this->settings['threshold'] ?? 30
        );

        if ($configured_threshold < 1) {
            return 1;
        }

        return $configured_threshold;
    }
    /**
 * Add catalog variation to cart.
 *
 * @return void
 */
    public function catalog_add_to_cart()
    {

        if (! function_exists('WC') || ! WC()->cart) {
            wp_send_json_error(
                array(
                    'message' => 'WooCommerce cart is not available.',
                )
            );
        }

        $product_id = isset($_POST['product_id'])
            ? absint($_POST['product_id'])
            : 0;

        $variation_id = isset($_POST['variation_id'])
            ? absint($_POST['variation_id'])
            : 0;

        $quantity = isset($_POST['quantity'])
            ? max(1, absint($_POST['quantity']))
            : 1;

        if (! $product_id || ! $variation_id) {
            wp_send_json_error(
                array(
                    'message' => 'Invalid product or variation.',
                )
            );
        }

        $variation = wc_get_product($variation_id);

        if (! $variation || ! $variation->is_type('variation')) {
            wp_send_json_error(
                array(
                    'message' => 'Invalid variation.',
                )
            );
        }

        $variation_attributes = array();

        foreach ($variation->get_attributes() as $attribute_name => $attribute_value) {

            $key = 'attribute_' . sanitize_title($attribute_name);

            if (isset($_POST[ $key ])) {
                $variation_attributes[ $key ] = wc_clean(
                    wp_unslash($_POST[ $key ])
                );
            } else {
                $variation_attributes[ $key ] = $attribute_value;
            }
        }

        $cart_item_key = WC()->cart->add_to_cart(
            $product_id,
            $quantity,
            $variation_id,
            $variation_attributes
        );

        if (! $cart_item_key) {
            wp_send_json_error(
                array(
                    'message' => 'Unable to add variation to cart.',
                )
            );
        }

        wp_send_json_success(
            array(
                'cart_item_key' => $cart_item_key,
                'fragments'     => apply_filters(
                    'woocommerce_add_to_cart_fragments',
                    array()
                ),
                'cart_hash'     => WC()->cart->get_cart_hash(),
            )
        );
    }
}
