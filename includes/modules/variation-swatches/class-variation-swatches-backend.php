<?php
/**
 * Variation Swatches Backend.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Variation Swatches Backend.
 */
class TH_Store_One_Variation_Swatches_Backend
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

        $this->settings = is_array($settings) ? $settings : array();

        $this->register_hooks();
    }

    /**
     * Register backend hooks.
     *
     * @return void
     */
    private function register_hooks()
    {

        /*
         * Attribute types.
         */
        if ($this->is_product_attributes_page()) {
            add_filter(
                'product_attributes_type_selector',
                array($this, 'product_attributes_types')
            );
        }
        /*
         * Register term meta.
         */
        add_action(
            'init',
            array( $this, 'register_taxonomy_meta' ),
            20
        );

        /*
         * Register taxonomy term hooks.
         */
        add_action(
            'init',
            array( $this, 'register_taxonomy_term_hooks' ),
            30
        );

        /*
         * Admin assets.
         */
        add_action(
            'admin_enqueue_scripts',
            array( $this, 'enqueue_admin_assets' )
        );

        /*
         * WooCommerce attribute cache.
         */
        add_action(
            'woocommerce_attribute_added',
            array( $this, 'clear_attribute_cache' ),
            10
        );

        add_action(
            'woocommerce_attribute_updated',
            array( $this, 'clear_attribute_cache' ),
            10
        );

        add_action(
            'woocommerce_attribute_deleted',
            array( $this, 'clear_attribute_cache' ),
            10
        );

        /*
         * Product attribute changes.
         */
        add_action(
            'woocommerce_attribute_updated',
            array( $this, 'clear_variation_cache' ),
            20
        );
    }

    /**
     * Add variation attribute types.
     *
     * @param array $types Existing attribute types.
     * @return array
     */
    public function product_attributes_types($types)
    {

        $types['select'] = __('Select', 'th-store-one');
        $types['color']  = __('Color', 'th-store-one');
        $types['image']  = __('Image', 'th-store-one');
        $types['button'] = __('Button', 'th-store-one');

        return $types;
    }

    /**
     * Register term meta.
     *
     * @return void
     */
    public function register_taxonomy_meta()
    {

        if (! function_exists('wc_get_attribute_taxonomies')) {
            return;
        }

        $attributes = wc_get_attribute_taxonomies();

        if (empty($attributes)) {
            return;
        }

        foreach ($attributes as $attribute) {

            $taxonomy = wc_attribute_taxonomy_name(
                $attribute->attribute_name
            );

            register_term_meta(
                $taxonomy,
                'product_attribute_color',
                array(
                    'type'              => 'string',
                    'single'            => true,
                    'sanitize_callback' => 'sanitize_hex_color',
                    'show_in_rest'      => true,
                )
            );

            register_term_meta(
                $taxonomy,
                'is_dual_color',
                array(
                    'type'              => 'string',
                    'single'            => true,
                    'sanitize_callback' => array(
                        $this,
                        'sanitize_dual_color',
                    ),
                    'show_in_rest'      => true,
                )
            );

            register_term_meta(
                $taxonomy,
                'secondary_color',
                array(
                    'type'              => 'string',
                    'single'            => true,
                    'sanitize_callback' => 'sanitize_hex_color',
                    'show_in_rest'      => true,
                )
            );

            register_term_meta(
                $taxonomy,
                'product_attribute_image',
                array(
                    'type'              => 'integer',
                    'single'            => true,
                    'sanitize_callback' => 'absint',
                    'show_in_rest'      => true,
                )
            );
        }
    }

    /**
     * Register dynamic taxonomy hooks.
     *
     * @return void
     */
    public function register_taxonomy_term_hooks()
    {

        if (! function_exists('wc_get_attribute_taxonomies')) {
            return;
        }

        $attributes = wc_get_attribute_taxonomies();

        if (empty($attributes)) {
            return;
        }

        foreach ($attributes as $attribute) {

            $taxonomy = wc_attribute_taxonomy_name(
                $attribute->attribute_name
            );

            /*
             * Add term fields.
             */
            add_action(
                "{$taxonomy}_add_form_fields",
                array( $this, 'add_term_fields' ),
                10
            );

            /*
             * Edit term fields.
             */
            add_action(
                "{$taxonomy}_edit_form_fields",
                array( $this, 'edit_term_fields' ),
                10,
                2
            );

            /*
             * Save term.
             */
            add_action(
                "created_{$taxonomy}",
                array( $this, 'save_term_meta' ),
                10,
                1
            );

            add_action(
                "edited_{$taxonomy}",
                array( $this, 'save_term_meta' ),
                10,
                1
            );

            /*
             * Add Swatch column.
             */
            add_filter(
                "manage_edit-{$taxonomy}_columns",
                array( $this, 'add_term_column' )
            );

            /*
             * Render Swatch column.
             */
            add_filter(
                "manage_{$taxonomy}_custom_column",
                array( $this, 'render_term_column' ),
                10,
                3
            );

            /*
             * Term deletion cleanup.
             */
            add_action(
                "delete_{$taxonomy}",
                array( $this, 'delete_term_meta' ),
                10,
                4
            );
        }
    }

    /**
     * Add term fields.
     *
     * @param string $taxonomy Taxonomy.
     * @return void
     */
    public function add_term_fields($taxonomy)
    {

        $type = $this->get_attribute_type($taxonomy);

        if (! $this->is_supported_type($type)) {
            return;
        }

        wp_nonce_field(
            'th_store_one_variation_term',
            'th_store_one_variation_term_nonce'
        );

        if ('color' === $type) {
            $this->render_color_fields();
        }

        if ('image' === $type) {
            $this->render_image_fields();
        }

        if ('button' === $type) {
            $this->render_button_fields();
        }
    }

    /**
     * Edit term fields.
     *
     * @param WP_Term $term     Term.
     * @param string  $taxonomy Taxonomy.
     * @return void
     */
    public function edit_term_fields($term, $taxonomy)
    {

        $type = $this->get_attribute_type($taxonomy);

        if (! $this->is_supported_type($type)) {
            return;
        }

        wp_nonce_field(
            'th_store_one_variation_term',
            'th_store_one_variation_term_nonce'
        );

        if ('color' === $type) {
            $this->render_color_fields($term);
        }

        if ('image' === $type) {
            $this->render_image_fields($term);
        }

        if ('button' === $type) {
            $this->render_button_fields($term);
        }
    }

    /**
     * Render color fields.
     *
     * @param WP_Term|null $term Term.
     * @return void
     */
    private function render_color_fields($term = null)
    {

        $color           = '';
        $dual            = 'no';
        $secondary_color = '';

        if ($term instanceof WP_Term) {

            $color = get_term_meta(
                $term->term_id,
                'product_attribute_color',
                true
            );

            $dual = get_term_meta(
                $term->term_id,
                'is_dual_color',
                true
            );

            $secondary_color = get_term_meta(
                $term->term_id,
                'secondary_color',
                true
            );

            $dual = $dual ? $dual : 'no';
        }
        ?>

		<div class="form-field th-store-one-field">

			<label for="product_attribute_color">
				<?php esc_html_e('Color', 'th-store-one'); ?>
			</label>

			<input
				type="text"
				name="product_attribute_color"
				id="product_attribute_color"
				class="th-store-one-color-picker"
				value="<?php echo esc_attr($color); ?>"
				data-default-color="#000000"
			/>

			<p class="description">
				<?php
                esc_html_e(
                    'Choose the color for this attribute term.',
                    'th-store-one'
                );
        ?>
			</p>

		</div>

		<div class="form-field th-store-one-field">

			<label for="is_dual_color">
				<?php esc_html_e('Dual Color', 'th-store-one'); ?>
			</label>

			<select
				name="is_dual_color"
				id="is_dual_color"
			>

				<option
					value="no"
					<?php selected($dual, 'no'); ?>
				>
					<?php esc_html_e('No', 'th-store-one'); ?>
				</option>

				<option
					value="yes"
					<?php selected($dual, 'yes'); ?>
				>
					<?php esc_html_e('Yes', 'th-store-one'); ?>
				</option>

			</select>

			<p class="description">
				<?php
        esc_html_e(
            'Enable this if the swatch should use two colors.',
            'th-store-one'
        );
        ?>
			</p>

		</div>

		<div
			class="form-field th-store-one-field th-store-one-secondary-color"
			<?php echo 'yes' !== $dual ? 'style="display:none;"' : ''; ?>
		>

			<label for="secondary_color">
				<?php esc_html_e('Secondary Color', 'th-store-one'); ?>
			</label>

			<input
				type="text"
				name="secondary_color"
				id="secondary_color"
				class="th-store-one-color-picker"
				value="<?php echo esc_attr($secondary_color); ?>"
				data-default-color="#ffffff"
			/>

			<p class="description">
				<?php
        esc_html_e(
            'Choose the second color for the dual-color swatch.',
            'th-store-one'
        );
        ?>
			</p>

		</div>

		<?php
    }

    /**
     * Render image fields.
     *
     * @param WP_Term|null $term Term.
     * @return void
     */
    private function render_image_fields($term = null)
    {

        $image_id  = 0;
        $image_url = '';

        if ($term instanceof WP_Term) {

            $image_id = absint(
                get_term_meta(
                    $term->term_id,
                    'product_attribute_image',
                    true
                )
            );

            if ($image_id) {

                $image_url = wp_get_attachment_image_url(
                    $image_id,
                    'thumbnail'
                );
            }
        }
        ?>

		<div class="form-field th-store-one-field">

			<label>
				<?php esc_html_e('Attribute Image', 'th-store-one'); ?>
			</label>

			<input
				type="hidden"
				name="product_attribute_image"
				id="product_attribute_image"
				value="<?php echo absint($image_id); ?>"
			/>

			<div
				class="th-store-one-image-preview"
				<?php echo $image_url ? '' : 'style="display:none;"'; ?>
			>

				<?php if ($image_url) : ?>

					<img
						src="<?php echo esc_url($image_url); ?>"
						alt=""
					/>

				<?php endif; ?>

			</div>

			<p>

				<button
					type="button"
					class="button th-store-one-upload-image"
				>
					<?php esc_html_e('Choose Image', 'th-store-one'); ?>
				</button>

				<button
					type="button"
					class="button th-store-one-remove-image"
					<?php echo $image_id ? '' : 'style="display:none;"'; ?>
				>
					<?php esc_html_e('Remove Image', 'th-store-one'); ?>
				</button>

			</p>

			<p class="description">
				<?php
                esc_html_e(
                    'Choose an image for this attribute term.',
                    'th-store-one'
                );
        ?>
			</p>

		</div>

		<?php
    }

    /**
     * Render button fields.
     *
     * @param WP_Term|null $term Term.
     * @return void
     */
    private function render_button_fields($term = null)
    {
        ?>

		<div class="form-field th-store-one-field">

			<label>
				<?php esc_html_e('Button Preview', 'th-store-one'); ?>
			</label>

			<div class="th-store-one-button-preview">
				<span>
					<?php
                    esc_html_e(
                        'Attribute name will be used',
                        'th-store-one'
                    );
        ?>
				</span>
			</div>

			<p class="description">
				<?php
                esc_html_e(
                    'The term name will be displayed as the swatch button.',
                    'th-store-one'
                );
        ?>
			</p>

		</div>

		<?php
    }

    /**
     * Save term metadata.
     *
     * @param int    $term_id  Term ID.
     * @param int    $tt_id    Term taxonomy ID.
     * @param string $taxonomy Taxonomy.
     * @return void
     */
    public function save_term_meta($term_id, $tt_id = 0, $taxonomy = '')
    {

        if (
            empty($_POST['th_store_one_variation_term_nonce'])
        ) {
            return;
        }

        $nonce = sanitize_text_field(
            wp_unslash(
                $_POST['th_store_one_variation_term_nonce']
            )
        );

        if (
            ! wp_verify_nonce(
                $nonce,
                'th_store_one_variation_term'
            )
        ) {
            return;
        }

        if (! current_user_can('manage_product_terms')) {
            return;
        }

        /*
         * Get the actual term.
         */
        $term = get_term($term_id);

        if (! $term || is_wp_error($term)) {
            return;
        }

        /*
         * Always get taxonomy from the term.
         */
        $taxonomy = $term->taxonomy;

        /*
         * Get attribute type.
         */
        $type = $this->get_attribute_type($taxonomy);

        /*
         * Debug.
         */
        error_log(
            'TH STORE ONE - Term ID: ' . absint($term_id)
        );

        error_log(
            'TH STORE ONE - Taxonomy: ' . $taxonomy
        );

        error_log(
            'TH STORE ONE - Type: ' . $type
        );

        error_log(
            'TH STORE ONE - Image ID: ' .
            (
                isset($_POST['product_attribute_image'])
                    ? absint(
                        wp_unslash(
                            $_POST['product_attribute_image']
                        )
                    )
                    : 0
            )
        );

        /*
         * Color.
         */
        if ('color' === $type) {

            $color = '';

            if (isset($_POST['product_attribute_color'])) {

                $color = sanitize_hex_color(
                    wp_unslash(
                        $_POST['product_attribute_color']
                    )
                );
            }

            update_term_meta(
                $term_id,
                'product_attribute_color',
                $color ? $color : ''
            );

            $dual = 'no';

            if (isset($_POST['is_dual_color'])) {

                $dual = $this->sanitize_dual_color(
                    sanitize_text_field(
                        wp_unslash(
                            $_POST['is_dual_color']
                        )
                    )
                );
            }

            update_term_meta(
                $term_id,
                'is_dual_color',
                $dual
            );

            $secondary_color = '';

            if (
                'yes' === $dual
                && isset($_POST['secondary_color'])
            ) {

                $secondary_color = sanitize_hex_color(
                    wp_unslash(
                        $_POST['secondary_color']
                    )
                );
            }

            update_term_meta(
                $term_id,
                'secondary_color',
                $secondary_color ? $secondary_color : ''
            );

            delete_term_meta(
                $term_id,
                'product_attribute_image'
            );
        }

        /*
         * Image.
         */ elseif ('image' === $type) {

            $image_id = isset(
                $_POST['product_attribute_image']
            )
                ? absint(
                    wp_unslash(
                        $_POST['product_attribute_image']
                    )
                )
                : 0;

            if (
                $image_id
                && wp_attachment_is_image($image_id)
            ) {

                update_term_meta(
                    $term_id,
                    'product_attribute_image',
                    $image_id
                );

            } else {

                delete_term_meta(
                    $term_id,
                    'product_attribute_image'
                );
            }

            /*
             * Remove color data.
             */
            delete_term_meta(
                $term_id,
                'product_attribute_color'
            );

            delete_term_meta(
                $term_id,
                'is_dual_color'
            );

            delete_term_meta(
                $term_id,
                'secondary_color'
            );
        }

        /*
         * Button.
         */ elseif ('button' === $type) {

            delete_term_meta(
                $term_id,
                'product_attribute_color'
            );

            delete_term_meta(
                $term_id,
                'is_dual_color'
            );

            delete_term_meta(
                $term_id,
                'secondary_color'
            );

            delete_term_meta(
                $term_id,
                'product_attribute_image'
            );
        }

        /*
         * Clear product/variation cache.
         */
        $this->clear_variation_cache();
    }

    /**
     * Add Swatch column.
     *
     * @param array $columns Columns.
     * @return array
     */
    public function add_term_column($columns)
    {

        $new_columns = array();

        foreach ($columns as $key => $label) {

            $new_columns[ $key ] = $label;

            if ('name' === $key) {

                $new_columns['th_store_one_swatch'] = __(
                    'Swatch',
                    'th-store-one'
                );
            }
        }

        return $new_columns;
    }

    /**
     * Render Swatch column.
     *
     * @param string $content Content.
     * @param string $column  Column name.
     * @param int    $term_id Term ID.
     * @return string
     */
    public function render_term_column(
        $content,
        $column,
        $term_id
    ) {

        if ('th_store_one_swatch' !== $column) {
            return $content;
        }

        $term = get_term($term_id);

        if (! $term || is_wp_error($term)) {
            return '';
        }

        $type = $this->get_attribute_type(
            $term->taxonomy
        );

        /*
         * Color preview.
         */
        if ('color' === $type) {

            $primary = get_term_meta(
                $term_id,
                'product_attribute_color',
                true
            );

            $secondary = get_term_meta(
                $term_id,
                'secondary_color',
                true
            );

            $dual = get_term_meta(
                $term_id,
                'is_dual_color',
                true
            );

            if (
                'yes' === $dual
                && $primary
                && $secondary
            ) {

                return sprintf(
                    '<span class="th-store-one-dual-preview" style="background:linear-gradient(135deg,%1$s 0%%,%1$s 50%%,%2$s 50%%,%2$s 100%%);"></span>',
                    esc_attr($primary),
                    esc_attr($secondary)
                );
            }

            if ($primary) {

                return sprintf(
                    '<span class="th-store-one-color-preview" style="background-color:%s;"></span>',
                    esc_attr($primary)
                );
            }
        }

        /*
         * Image preview.
         */
        /*
 * Image preview.
 */
        if ('image' === $type) {

            $image_id = absint(
                get_term_meta(
                    $term_id,
                    'product_attribute_image',
                    true
                )
            );

            if ($image_id) {

                $image_url = wp_get_attachment_image_url(
                    $image_id,
                    'thumbnail'
                );

                if ($image_url) {

                    return sprintf(
                        '<img class="th-store-one-term-image" src="%1$s" alt="%2$s" width="40" height="40" />',
                        esc_url($image_url),
                        esc_attr($term->name)
                    );
                }
            }
        }

        /*
         * Button preview.
         */
        if ('button' === $type) {

            return sprintf(
                '<span class="th-store-one-button-preview">%s</span>',
                esc_html($term->name)
            );
        }

        return '';
    }

    /**
     * Delete term metadata.
     *
     * @param int    $term_id  Term ID.
     * @param int    $tt_id    Term taxonomy ID.
     * @param string $taxonomy Taxonomy.
     * @param WP_Term $deleted_term Deleted term.
     * @return void
     */
    public function delete_term_meta(
        $term_id,
        $tt_id = 0,
        $taxonomy = '',
        $deleted_term = null
    ) {

        delete_term_meta(
            $term_id,
            'product_attribute_color'
        );

        delete_term_meta(
            $term_id,
            'is_dual_color'
        );

        delete_term_meta(
            $term_id,
            'secondary_color'
        );

        delete_term_meta(
            $term_id,
            'product_attribute_image'
        );

        $this->clear_variation_cache();
    }

    /**
     * Get attribute type.
     *
     * @param string $taxonomy Taxonomy.
     * @return string
     */
    private function get_attribute_type($taxonomy)
    {

        if (! function_exists('wc_get_attribute_taxonomies')) {
            return '';
        }

        $taxonomy = str_replace(
            'pa_',
            '',
            $taxonomy
        );

        $attributes = wc_get_attribute_taxonomies();

        foreach ($attributes as $attribute) {

            if (
                isset($attribute->attribute_name)
                && $attribute->attribute_name === $taxonomy
            ) {

                return ! empty($attribute->attribute_type)
                    ? $attribute->attribute_type
                    : 'select';
            }
        }

        return '';
    }

    /**
     * Check supported attribute type.
     *
     * @param string $type Attribute type.
     * @return bool
     */
    private function is_supported_type($type)
    {

        return in_array(
            $type,
            array(
                'color',
                'image',
                'button',
            ),
            true
        );
    }

    /**
     * Sanitize dual color.
     *
     * @param string $value Value.
     * @return string
     */
    public function sanitize_dual_color($value)
    {

        return in_array(
            $value,
            array(
                'yes',
                'no',
            ),
            true
        )
            ? $value
            : 'no';
    }

    /**
     * Enqueue admin assets.
     *
     * @param string $hook Current admin hook.
     * @return void
     */
    public function enqueue_admin_assets($hook)
    {

        if (
            'edit-tags.php' !== $hook
            && 'term.php' !== $hook
        ) {
            return;
        }

        $screen = get_current_screen();

        if (
            ! $screen
            || empty($screen->taxonomy)
            || 0 !== strpos($screen->taxonomy, 'pa_')
        ) {
            return;
        }

        $type = $this->get_attribute_type(
            $screen->taxonomy
        );

        if (! $this->is_supported_type($type)) {
            return;
        }

        /*
         * WordPress color picker.
         */
        wp_enqueue_style('wp-color-picker');

        wp_enqueue_script('wp-color-picker');

        /*
         * WordPress media uploader.
         */
        wp_enqueue_media();

        /*
         * Admin CSS.
         */
        $css_file = TH_STORE_ONE_PLUGIN_DIR
            . 'includes/modules/variation-swatches/assets/admin.css';

        $css_url = TH_STORE_ONE_PLUGIN_URL
            . 'includes/modules/variation-swatches/assets/admin.css';

        if (file_exists($css_file)) {

            wp_enqueue_style(
                'th-store-one-variation-swatches-admin',
                $css_url,
                array( 'wp-color-picker' ),
                defined('TH_STORE_ONE_VERSION')
                    ? TH_STORE_ONE_VERSION
                    : filemtime($css_file)
            );
        }

        /*
         * Admin JS.
         */
        $js_file = TH_STORE_ONE_PLUGIN_DIR
            . 'includes/modules/variation-swatches/assets/admin.js';

        $js_url = TH_STORE_ONE_PLUGIN_URL
            . 'includes/modules/variation-swatches/assets/admin.js';

        if (file_exists($js_file)) {

            wp_enqueue_script(
                'th-store-one-variation-swatches-admin',
                $js_url,
                array(
                    'jquery',
                    'wp-color-picker',
                ),
                defined('TH_STORE_ONE_VERSION')
                    ? TH_STORE_ONE_VERSION
                    : filemtime($js_file),
                true
            );

            wp_localize_script(
                'th-store-one-variation-swatches-admin',
                'THStoreOneVariationSwatches',
                array(
                    'mediaTitle' => __(
                        'Choose Attribute Image',
                        'th-store-one'
                    ),
                    'mediaButton' => __(
                        'Use This Image',
                        'th-store-one'
                    ),
                )
            );
        }
    }

    /**
     * Clear WooCommerce attribute cache.
     *
     * @return void
     */
    public function clear_attribute_cache()
    {

        delete_transient(
            'wc_attribute_taxonomies'
        );

        if (class_exists('WC_Cache_Helper')) {

            WC_Cache_Helper::invalidate_cache_group(
                'woocommerce-attributes'
            );
        }
    }

    /**
     * Clear variation/product cache.
     *
     * @return void
     */
    public function clear_variation_cache()
    {

        if (function_exists('wc_delete_product_transients')) {
            wc_delete_product_transients();
        }

        if (function_exists('wc_delete_shop_order_transients')) {
            wc_delete_shop_order_transients();
        }
    }

    private function is_product_attributes_page()
    {
        return (
            is_admin()
            && isset($_GET['page'])
            && 'product_attributes' === sanitize_key(
                wp_unslash($_GET['page'])
            )
        );
    }
}
