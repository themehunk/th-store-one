<?php

/**
 * Store One - Variation Swatches Product Tooltip.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('TH_Store_One_Variation_Tooltip')) :

    class TH_Store_One_Variation_Tooltip
    {
        /**
         * Product meta key.
         *
         * @var string
         */
        public const PRODUCT_META_KEY = '_th_store_one_product_attributes';

        /**
         * Constructor.
         */
        public function __construct()
        {
            add_filter(
                'woocommerce_product_data_tabs',
                array($this, 'add_tab')
            );

            add_action(
                'woocommerce_product_data_panels',
                array($this, 'add_tab_panel')
            );

            add_action(
                'admin_enqueue_scripts',
                array($this, 'pro_script_enqueue')
            );

            /**
             * AJAX save.
             */
            add_action(
                'wp_ajax_th_store_one_save_product_attributes',
                array(
                    $this,
                    'prepare_for_save_ajax_product_attributes',
                )
            );

            /**
             * Normal WooCommerce product save.
             */
            add_action(
                'woocommerce_process_product_meta_variable',
                array(
                    $this,
                    'prepare_for_save_product_attributes',
                )
            );

            /**
             * AJAX reset.
             */
            add_action(
                'wp_ajax_th_store_one_reset_product_attributes',
                array(
                    $this,
                    'reset_ajax_product_attributes',
                )
            );

            /**
             * AJAX load.
             */
            add_action(
                'wp_ajax_th_store_one_load_product_attributes',
                array(
                    $this,
                    'load_product_attributes',
                )
            );
        }

        /**
         * Add product data tab.
         *
         * @param array $tabs Product tabs.
         * @return array
         */
        public function add_tab($tabs)
        {
            $tabs['th-store-one-variation-swatches-pro'] = array(
                'label'    => __('Store one Swatches', 'th-store-one'),
                'target'   => 'th-store-one-product-variable-swatches-options',
                'class'    => array(
                    'show_if_variable',
                    'variations_tab',
                ),
                'priority' => 65,
            );

            return $tabs;
        }

        /**
         * Add product data panel.
         *
         * @return void
         */
        public function add_tab_panel()
        {
            global $post, $product_object;

            if (
                ! $product_object instanceof WC_Product &&
                ! empty($post->ID)
            ) {
                $product_object = wc_get_product($post->ID);
            }

            ?>

            <div
                id="th-store-one-product-variable-swatches-options"
                class="panel wc-metaboxes-wrapper hidden"
            >

                <?php
                if ($product_object instanceof WC_Product) {
                    $this->panel_contents($product_object);
                }
            ?>

            </div>

            <?php
        }

        /**
         * Product panel contents.
         *
         * @param WC_Product $product_object Product object.
         * @return void
         */
        public function panel_contents($product_object)
        {
            $th_store_one_attributes       = array();
            $attributes                    = $product_object->get_attributes();
            $product_id                    = $product_object->get_id();
            $attribute_types               = wc_get_attribute_types();
            $attribute_types['custom']     = esc_html__(
                'Custom',
                'th-store-one'
            );
            $attribute_types_configurable  = wc_get_attribute_types();
            $saved_product_attributes      = $this->get_product_option($product_id);

            foreach ($attributes as $attribute) {

                $use_for_variation = $attribute->get_variation();
                $attribute_name    = $attribute->get_name();
                $options           = $attribute->get_options();

                if (! $use_for_variation) {
                    continue;
                }

                /**
                 * Taxonomy attribute.
                 */
                if (
                    $attribute->is_taxonomy() &&
                    $attribute_taxonomy = $attribute->get_taxonomy_object()
                ) {

                    $options = ! empty($options) ? $options : array();

                    $th_store_one_attributes[$attribute_name]['taxonomy_exists'] = true;

                    $th_store_one_attributes[$attribute_name]['taxonomy'] = (array) $attribute_taxonomy;

                    $th_store_one_attributes[$attribute_name]['terms'] = array();

                    $terms = array();

                    $args = array(
                        'orderby'    => 'name',
                        'hide_empty' => 0,
                    );

                    $all_terms = get_terms(
                        $attribute->get_taxonomy(),
                        apply_filters(
                            'woocommerce_product_attribute_terms',
                            $args
                        )
                    );

                    if ($all_terms && ! is_wp_error($all_terms)) {

                        foreach ($all_terms as $term) {

                            if (
                                in_array(
                                    $term->term_id,
                                    $options,
                                    true
                                )
                            ) {
                                $terms[$term->term_id] = esc_attr(
                                    apply_filters(
                                        'woocommerce_product_attribute_term_name',
                                        $term->name,
                                        $term
                                    )
                                );
                            }
                        }
                    }

                    $th_store_one_attributes[$attribute_name]['terms'] = $terms;

                } else {

                    /**
                     * Custom attribute.
                     */
                    $options = ! empty($options) ? $options : array();

                    $terms = array_reduce(
                        $options,
                        function ($opt, $option) {
                            $opt[$option] = $option;
                            return $opt;
                        },
                        array()
                    );

                    $th_store_one_attributes[$attribute_name]['taxonomy_exists'] = false;

                    $th_store_one_attributes[$attribute_name]['taxonomy'] = array(
                        'attribute_id'    => strtolower(
                            sanitize_title($attribute_name)
                        ),
                        'attribute_type'  => 'select',
                        'attribute_name'  => trim($attribute_name),
                        'attribute_label' => $attribute->get_name(),
                    );

                    $th_store_one_attributes[$attribute_name]['terms'] = $terms;
                }
            }

            ?>

            <div class="thvs-pro-product-variable-swatches-options wc-metaboxes">

                <?php if (! empty($th_store_one_attributes)) : ?>

                    <div
                        id="thvs-pro-product-variable-swatches-options-notice"
                        class="inline woocommerce-message"
                    ></div>

                    <?php
                    $thvs_pro_attributes = $th_store_one_attributes;
                    ?>

                    <?php foreach ($thvs_pro_attributes as $attribute_key => $thvs_pro_attribute) : ?>

                        <?php
                        $saved_type = isset(
                            $saved_product_attributes[$attribute_key]['type']
                        )
                            ? $saved_product_attributes[$attribute_key]['type']
                            : $thvs_pro_attribute['taxonomy']['attribute_type'];

                        $saved_style = isset(
                            $saved_product_attributes[$attribute_key]['style']
                        )
                            ? $saved_product_attributes[$attribute_key]['style']
                            : '';

                        $saved_tooltip = isset(
                            $saved_product_attributes[$attribute_key]['show_tooltip']
                        )
                            ? $saved_product_attributes[$attribute_key]['show_tooltip']
                            : '';
                        ?>

                        <div
                            class="wc-metabox closed thvs-pro-variable-swatches-attribute-wrapper <?php echo empty($thvs_pro_attribute['taxonomy_exists']) ? 'not_a_taxonomy' : 'is_a_taxonomy'; ?> visible_if_<?php echo esc_attr($saved_type); ?>"
                        >

                            <h3 class="variable-swatches-attribute-header">

                                <strong class="attribute_name">
                                    <?php
                                    echo esc_html(
                                        $thvs_pro_attribute['taxonomy']['attribute_label']
                                    );
                        ?>
                                </strong>

                                <div class="attribute-type-wrapper">

                                    <strong>
                                        <?php
                            esc_html_e(
                                'Attribute Type',
                                'th-store-one'
                            );
                        ?>
                                    </strong>

                                    <input
                                        type="hidden"
                                        name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][default_type]"
                                        value="<?php echo esc_attr($thvs_pro_attribute['taxonomy']['attribute_type']); ?>"
                                    >

                                    <select
                                        class="thvs-pro-swatch-option-type"
                                        name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][type]"
                                    >

                                        <?php foreach ($attribute_types as $key => $attribute_type) : ?>

                                            <option
                                                value="<?php echo esc_attr($key); ?>"
                                                <?php selected($saved_type, $key); ?>
                                            >
                                                <?php
                                echo esc_html($attribute_type);

                                            if (
                                                $thvs_pro_attribute['taxonomy']['attribute_type'] === $key
                                            ) {
                                                echo ' (' .
                                                    esc_html__('Default', 'th-store-one') .
                                                    ')';
                                            }
                                            ?>
                                            </option>

                                        <?php endforeach; ?>

                                    </select>

                                </div>

                            </h3>

                            <div
                                class="variable-swatches-attribute-data wc-metabox-content"
                                style="display: none"
                            >

                                <table cellpadding="0" cellspacing="0">
                                    <tbody>

                                        <tr class="visible_if_custom visible_if_image visible_if_color visible_if_button">
                                            <td class="thvs-pro-global-label-td">
                                                <strong>
                                                    <?php esc_html_e('Shape style', 'th-store-one'); ?>
                                                </strong>
                                            </td>

                                            <td>
                                                <select
                                                    name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][style]"
                                                >
                                                    <option
                                                        value=""
                                                        <?php selected($saved_style, ''); ?>
                                                    >
                                                        <?php esc_html_e('Global', 'th-store-one'); ?>
                                                    </option>

                                                    <option
                                                        value="rounded"
                                                        <?php selected($saved_style, 'rounded'); ?>
                                                    >
                                                        <?php esc_html_e('Rounded Shape', 'th-store-one'); ?>
                                                    </option>

                                                    <option
                                                        value="squared"
                                                        <?php selected($saved_style, 'squared'); ?>
                                                    >
                                                        <?php esc_html_e('Squared Shape', 'th-store-one'); ?>
                                                    </option>
                                                </select>
                                            </td>
                                        </tr>

                                        <tr class="visible_if_custom visible_if_image visible_if_color visible_if_button visible_if_radio">
                                            <td class="thvs-pro-global-label-td">
                                                <strong>
                                                    <?php esc_html_e('Enable tooltip', 'th-store-one'); ?>
                                                </strong>
                                            </td>

                                            <td>
                                                <select
                                                    name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][show_tooltip]"
                                                >
                                                    <option
                                                        value=""
                                                        <?php selected($saved_tooltip, ''); ?>
                                                    >
                                                        <?php esc_html_e('Global', 'th-store-one'); ?>
                                                    </option>

                                                    <option
                                                        value="no"
                                                        <?php selected($saved_tooltip, 'no'); ?>
                                                    >
                                                        <?php esc_html_e('Hide', 'th-store-one'); ?>
                                                    </option>

                                                    <option
                                                        value="text"
                                                        <?php selected($saved_tooltip, 'text'); ?>
                                                    >
                                                        <?php esc_html_e('Text', 'th-store-one'); ?>
                                                    </option>

                                                    <option
                                                        value="image"
                                                        <?php selected($saved_tooltip, 'image'); ?>
                                                    >
                                                        <?php esc_html_e('Image', 'th-store-one'); ?>
                                                    </option>
                                                </select>
                                            </td>
                                        </tr>

                                        <tr class="visible_if_custom visible_if_image visible_if_color visible_if_button visible_if_radio">

                                            <td
                                                class="thvs-pro-variable-swatches-tax-wrapper-td"
                                                colspan="2"
                                            >

                                                <?php foreach ($thvs_pro_attribute['terms'] as $term_id => $term) : ?>

                                                    <?php
                                                if (
                                                    isset(
                                                        $saved_product_attributes[$attribute_key]
                                                    )
                                                ) {

                                                    $saved_term = isset(
                                                        $saved_product_attributes[$attribute_key]['terms'][$term_id]
                                                    )
                                                        ? $saved_product_attributes[$attribute_key]['terms'][$term_id]
                                                        : array();

                                                    $saved_term_type =
                                                        isset($saved_term['type'])
                                                            ? $saved_term['type']
                                                            : $saved_type;

                                                    $saved_term_tooltip =
                                                        isset($saved_term['tooltip_text'])
                                                            ? $saved_term['tooltip_text']
                                                            : '';

                                                    $saved_term_tooltip_type =
                                                        isset($saved_term['tooltip_type'])
                                                            ? $saved_term['tooltip_type']
                                                            : '';

                                                    $saved_term_tooltip_image =
                                                        isset($saved_term['tooltip_image'])
                                                            ? $saved_term['tooltip_image']
                                                            : false;

                                                    $saved_term_image_id =
                                                        isset($saved_term['image_id'])
                                                            ? $saved_term['image_id']
                                                            : false;

                                                    $saved_term_color =
                                                        isset($saved_term['color'])
                                                            ? $saved_term['color']
                                                            : '';

                                                    $saved_term_is_dual_color =
                                                        isset($saved_term['is_dual_color'])
                                                            ? $saved_term['is_dual_color']
                                                            : '';

                                                    $saved_term_secondary_color =
                                                        isset($saved_term['secondary_color'])
                                                            ? $saved_term['secondary_color']
                                                            : '';

                                                } else {

                                                    $saved_term_type          = $saved_type;
                                                    $saved_term_tooltip       = '';
                                                    $saved_term_tooltip_type  = '';
                                                    $saved_term_tooltip_image = false;
                                                    $saved_term_image_id      = false;
                                                    $saved_term_color          = '';
                                                    $saved_term_is_dual_color  = '';
                                                    $saved_term_secondary_color = '';
                                                }
                                                    ?>

                                                    <div
                                                        class="wc-metabox thvs-pro-variable-swatches-attribute-tax-wrapper closed visible_if_tax_<?php echo esc_attr($saved_term_type); ?>"
                                                    >

                                                        <h3 class="variable-swatches-taxonomy-header">

                                                            <strong class="attribute_name">
                                                                <?php echo esc_html($term); ?>
                                                            </strong>

                                                            <div class="attribute-type-wrapper">

                                                                <strong>
                                                                    <?php esc_html_e('Type', 'th-store-one'); ?>
                                                                </strong>

                                                                <select
                                                                    class="thvs-pro-swatch-tax-type"
                                                                    name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][terms][<?php echo esc_attr($term_id); ?>][type]"
                                                                >

                                                                    <?php foreach ($attribute_types_configurable as $key => $attribute_type) : ?>

                                                                        <option
                                                                            value="<?php echo esc_attr($key); ?>"
                                                                            <?php selected($saved_term_type, $key); ?>
                                                                        >
                                                                            <?php
                                                                            echo esc_html($attribute_type);

                                                                        if (
                                                                            $thvs_pro_attribute['taxonomy']['attribute_type'] === $key
                                                                        ) {
                                                                            echo ' (' .
                                                                                esc_html__('Default', 'th-store-one') .
                                                                                ')';
                                                                        }
                                                                        ?>
                                                                        </option>

                                                                    <?php endforeach; ?>

                                                                </select>

                                                            </div>

                                                        </h3>

                                                        <div
                                                            class="variable-swatches-taxonomy-data wc-metabox-content"
                                                            style="display: none"
                                                        >

                                                            <table cellpadding="0" cellspacing="0">
                                                                <tbody>

                                                                    <tr class="visible_if_tax_color visible_if_tax_image visible_if_tax_button">

                                                                        <td class="thvs-pro-global-label-td">
                                                                            <strong>
                                                                                <?php esc_html_e('Tooltip', 'th-store-one'); ?>
                                                                            </strong>
                                                                        </td>

                                                                        <td>

                                                                            <select
                                                                                class="thvs-pro-item-tooltip-type"
                                                                                name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][terms][<?php echo esc_attr($term_id); ?>][tooltip_type]"
                                                                            >

                                                                                <option
                                                                                    value=""
                                                                                    <?php selected($saved_term_tooltip_type, ''); ?>
                                                                                >
                                                                                    <?php esc_html_e('Default', 'th-store-one'); ?>
                                                                                </option>

                                                                                <option
                                                                                    value="text"
                                                                                    <?php selected($saved_term_tooltip_type, 'text'); ?>
                                                                                >
                                                                                    <?php esc_html_e('Text', 'th-store-one'); ?>
                                                                                </option>

                                                                                <option
                                                                                    value="image"
                                                                                    <?php selected($saved_term_tooltip_type, 'image'); ?>
                                                                                >
                                                                                    <?php esc_html_e('Image', 'th-store-one'); ?>
                                                                                </option>

                                                                                <option
                                                                                    value="no"
                                                                                    <?php selected($saved_term_tooltip_type, 'no'); ?>
                                                                                >
                                                                                    <?php esc_html_e('No', 'th-store-one'); ?>
                                                                                </option>

                                                                            </select>

                                                                        </td>

                                                                    </tr>

                                                                    <tr class="thvs-pro-item-tooltip-type-item thvs-pro-item-tooltip-type-text visible_if_tax_color visible_if_tax_image visible_if_tax_button">

                                                                        <td class="thvs-pro-global-label-td">
                                                                            <strong>
                                                                                <?php esc_html_e('Tooltip Text', 'th-store-one'); ?>
                                                                            </strong>
                                                                        </td>

                                                                        <td>

                                                                            <input
                                                                                value="<?php echo esc_attr($saved_term_tooltip); ?>"
                                                                                type="text"
                                                                                name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][terms][<?php echo esc_attr($term_id); ?>][tooltip_text]"
                                                                            >

                                                                        </td>

                                                                    </tr>

                                                                    <tr class="thvs-pro-item-tooltip-type-item thvs-pro-item-tooltip-type-image visible_if_tax_color visible_if_tax_image visible_if_tax_button">

                                                                        <td class="thvs-pro-global-label-td">
                                                                            <strong>
                                                                                <?php esc_html_e('Tooltip Image', 'th-store-one'); ?>
                                                                            </strong>
                                                                        </td>

                                                                        <td>

                                                                            <div class="meta-image-field-wrapper">

                                                                                <div class="image-preview">

                                                                                    <img
                                                                                        data-placeholder="<?php echo esc_url(wc_placeholder_img_src()); ?>"
                                                                                        src="<?php echo esc_url($this->get_img_src($saved_term_tooltip_image)); ?>"
                                                                                        width="60"
                                                                                        height="60"
                                                                                    >

                                                                                </div>

                                                                                <div class="button-wrapper">

                                                                                    <input
                                                                                        type="hidden"
                                                                                        name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][terms][<?php echo esc_attr($term_id); ?>][tooltip_image]"
                                                                                        value="<?php echo esc_attr($saved_term_tooltip_image); ?>"
                                                                                    >

                                                                                    <button
                                                                                        type="button"
                                                                                        class="thvs_upload_image_button button button-primary button-small"
                                                                                    >
                                                                                        <?php esc_html_e('Upload / Add image', 'th-store-one'); ?>
                                                                                    </button>

                                                                                    <button
                                                                                        type="button"
                                                                                        class="thvs_remove_image_button button button-danger button-small"
                                                                                        style="<?php echo empty($saved_term_tooltip_image) ? 'display:none;' : ''; ?>"
                                                                                    >
                                                                                        <?php esc_html_e('Remove image', 'th-store-one'); ?>
                                                                                    </button>

                                                                                </div>

                                                                            </div>

                                                                        </td>

                                                                    </tr>

                                                                    <tr class="visible_if_tax_color">

                                                                        <td class="thvs-pro-global-label-td">
                                                                            <strong>
                                                                                <?php esc_html_e('Color', 'th-store-one'); ?>
                                                                            </strong>
                                                                        </td>

                                                                        <td class="thvs-color-picker-container">

                                                                            <input
                                                                                name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][terms][<?php echo esc_attr($term_id); ?>][color]"
                                                                                type="text"
                                                                                class="thvs-color-picker"
                                                                                data-default-color=""
                                                                                value="<?php echo esc_attr(sanitize_hex_color($saved_term_color)); ?>"
                                                                            >

                                                                        </td>

                                                                    </tr>

                                                                    <tr class="visible_if_tax_color">

                                                                        <td class="thvs-pro-global-label-td">
                                                                            <strong>
                                                                                <?php esc_html_e('Is dual color', 'th-store-one'); ?>
                                                                            </strong>
                                                                        </td>

                                                                        <td>

                                                                            <select
                                                                                class="thvs-pro-item-tooltip-is-dual-color"
                                                                                name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][terms][<?php echo esc_attr($term_id); ?>][is_dual_color]"
                                                                            >

                                                                                <option
                                                                                    value=""
                                                                                    <?php selected($saved_term_is_dual_color, ''); ?>
                                                                                >
                                                                                    <?php esc_html_e('Default', 'th-store-one'); ?>
                                                                                </option>

                                                                                <option
                                                                                    value="no"
                                                                                    <?php selected($saved_term_is_dual_color, 'no'); ?>
                                                                                >
                                                                                    <?php esc_html_e('No', 'th-store-one'); ?>
                                                                                </option>

                                                                                <option
                                                                                    value="yes"
                                                                                    <?php selected($saved_term_is_dual_color, 'yes'); ?>
                                                                                >
                                                                                    <?php esc_html_e('Yes', 'th-store-one'); ?>
                                                                                </option>

                                                                            </select>

                                                                        </td>

                                                                    </tr>

                                                                    <tr class="thvs-pro-item-secondary-color-item visible_if_tax_color visible_if_item_dual_color_yes">

                                                                        <td class="thvs-pro-global-label-td">
                                                                            <strong>
                                                                                <?php esc_html_e('Secondary Color', 'th-store-one'); ?>
                                                                            </strong>
                                                                        </td>

                                                                        <td class="thvs-color-picker-container">

                                                                            <input
                                                                                name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][terms][<?php echo esc_attr($term_id); ?>][secondary_color]"
                                                                                type="text"
                                                                                class="thvs-color-picker"
                                                                                data-default-color=""
                                                                                value="<?php echo esc_attr(sanitize_hex_color($saved_term_secondary_color)); ?>"
                                                                            >

                                                                        </td>

                                                                    </tr>

                                                                    <tr class="visible_if_tax_image">

                                                                        <td class="thvs-pro-global-label-td">
                                                                            <strong>
                                                                                <?php esc_html_e('Choose Image', 'th-store-one'); ?>
                                                                            </strong>
                                                                        </td>

                                                                        <td>

                                                                            <div class="meta-image-field-wrapper">

                                                                                <div class="image-preview">

                                                                                    <img
                                                                                        data-placeholder="<?php echo esc_url(wc_placeholder_img_src()); ?>"
                                                                                        src="<?php echo esc_url($this->get_img_src($saved_term_image_id)); ?>"
                                                                                        width="60"
                                                                                        height="60"
                                                                                    >

                                                                                </div>

                                                                                <div class="button-wrapper">

                                                                                    <input
                                                                                        type="hidden"
                                                                                        name="_thvs_pro_swatch_option[<?php echo esc_attr($attribute_key); ?>][terms][<?php echo esc_attr($term_id); ?>][image_id]"
                                                                                        value="<?php echo esc_attr($saved_term_image_id); ?>"
                                                                                    >

                                                                                    <button
                                                                                        type="button"
                                                                                        class="thvs_upload_image_button button button-primary button-small"
                                                                                    >
                                                                                        <?php esc_html_e('Upload / Add image', 'th-store-one'); ?>
                                                                                    </button>

                                                                                    <button
                                                                                        type="button"
                                                                                        class="thvs_remove_image_button button button-danger button-small"
                                                                                        style="<?php echo empty($saved_term_image_id) ? 'display:none;' : ''; ?>"
                                                                                    >
                                                                                        <?php esc_html_e('Remove image', 'th-store-one'); ?>
                                                                                    </button>

                                                                                </div>

                                                                            </div>

                                                                        </td>

                                                                    </tr>

                                                                </tbody>
                                                            </table>

                                                        </div>

                                                    </div>

                                                <?php endforeach; ?>

                                            </td>

                                        </tr>

                                    </tbody>
                                </table>

                            </div>

                        </div>

                    <?php endforeach; ?>

                    <div class="toolbar">

                        <button
                            type="button"
                            class="button thvs_pro_save_product_attributes button-primary"
                        >
                            <?php esc_html_e('Save swatches settings', 'th-store-one'); ?>
                        </button>

                        <button
                            type="button"
                            class="button thvs_pro_reset_product_attributes"
                        >
                            <?php esc_html_e('Reset to default', 'th-store-one'); ?>
                        </button>

                    </div>

                <?php else : ?>

                    <div class="inline notice woocommerce-message">

                        <p>
                            <?php
                            echo wp_kses_post(
                                __(
                                    'Before you can add a variation you need to add some variation attributes on the <strong>Attributes</strong> tab.',
                                    'th-store-one'
                                )
                            );
                    ?>
                        </p>

                    </div>

                <?php endif; ?>

            </div>

            <?php
        }

        /**
         * Get image source.
         *
         * @param int|bool $thumbnail_id Attachment ID.
         * @return string
         */
        public function get_img_src($thumbnail_id = false)
        {
            if (! empty($thumbnail_id)) {

                $image = wp_get_attachment_thumb_url($thumbnail_id);

            } else {

                if (defined('TH_STORE_ONE_PLUGIN_URL')) {

                    $image =
                        TH_STORE_ONE_PLUGIN_URL .
                        'assets/images/placeholder.png';

                } else {

                    $image = wc_placeholder_img_src();
                }
            }

            return $image;
        }

        /**
         * Get saved product option.
         *
         * @param int $product_id Product ID.
         * @return array
         */
        public function get_product_option($product_id)
        {
            $data = get_post_meta(
                $product_id,
                self::PRODUCT_META_KEY,
                true
            );

            return is_array($data)
                ? $data
                : array();
        }

        /**
         * AJAX save.
         *
         * @return void
         */
        public function prepare_for_save_ajax_product_attributes()
        {
            $nonce = isset($_POST['nonce'])
                ? sanitize_text_field(
                    wp_unslash($_POST['nonce'])
                )
                : '';

            if (! wp_verify_nonce($nonce)) {
                wp_send_json_error(
                    esc_html__('Wrong Nonce', 'th-store-one')
                );
            }

            if (! current_user_can('edit_products')) {
                wp_die(-1);
            }

            $data = isset($_POST['data'])
                ? wp_unslash($_POST['data'])
                : array();

            if (is_string($data)) {
                $parsed_data = array();

                parse_str(
                    $data,
                    $parsed_data
                );

                $data = $parsed_data;
            }

            if (! is_array($data)) {
                $data = array();
            }

            /**
             * If JS sends:
             *
             * {
             *     _thvs_pro_swatch_option: {...}
             * }
             *
             * extract the actual option data.
             */
            if (
                isset($data['_thvs_pro_swatch_option']) &&
                is_array($data['_thvs_pro_swatch_option'])
            ) {
                $data = $data['_thvs_pro_swatch_option'];
            }

            $data = $this->array_map_recursive(
                'sanitize_text_field',
                $data
            );

            $product_id = isset($_POST['post_id'])
                ? absint($_POST['post_id'])
                : 0;

            if (! $product_id) {
                wp_send_json_error(
                    esc_html__('Invalid product ID.', 'th-store-one')
                );
            }

            $this->save_product_attributes(
                $product_id,
                $data
            );

            do_action(
                'th_store_one_save_product_attributes',
                $product_id,
                $data
            );

            wp_send_json_success(
                array(
                    'class'   => 'updated',
                    'message' => '<p>' .
                        esc_html__(
                            'Settings saved',
                            'th-store-one'
                        ) .
                        '</p>',
                )
            );
        }

        /**
         * Normal WooCommerce product save.
         *
         * IMPORTANT:
         * The HTML fields use:
         *
         * _thvs_pro_swatch_option[...]
         *
         * so we must save this field here.
         *
         * @param int $product_id Product ID.
         * @return void
         */
        public function prepare_for_save_product_attributes($product_id)
        {
            $data = array();

            /**
             * Primary field used by our panel.
             */
            if (
                isset($_POST['_thvs_pro_swatch_option']) &&
                is_array($_POST['_thvs_pro_swatch_option'])
            ) {
                $data = wp_unslash(
                    $_POST['_thvs_pro_swatch_option']
                );
            }

            /**
             * Backward compatibility.
             */ elseif (
                isset($_POST[self::PRODUCT_META_KEY]) &&
                is_array($_POST[self::PRODUCT_META_KEY])
            ) {
                $data = wp_unslash(
                    $_POST[self::PRODUCT_META_KEY]
                );
            }

            if (empty($data)) {
                return;
            }

            $data = $this->array_map_recursive(
                'sanitize_text_field',
                $data
            );

            $this->save_product_attributes(
                $product_id,
                $data
            );

            do_action(
                'th_store_one_save_product_attributes',
                $product_id,
                $data
            );
        }

        /**
         * Reset product attributes.
         *
         * @return void
         */
        public function reset_ajax_product_attributes()
        {
            $nonce = isset($_POST['nonce'])
                ? sanitize_text_field(
                    wp_unslash($_POST['nonce'])
                )
                : '';

            if (! wp_verify_nonce($nonce)) {
                wp_send_json_error(
                    esc_html__('Wrong Nonce', 'th-store-one')
                );
            }

            if (! current_user_can('edit_products')) {
                wp_die(-1);
            }

            $product_id = isset($_POST['post_id'])
                ? absint($_POST['post_id'])
                : 0;

            if (! $product_id) {
                wp_send_json_error(
                    esc_html__('Invalid product ID.', 'th-store-one')
                );
            }

            delete_post_meta(
                $product_id,
                self::PRODUCT_META_KEY
            );

            do_action(
                'th_store_one_reset_product_attributes',
                $product_id
            );

            wp_send_json_success(true);
        }

        /**
         * Recursive sanitize.
         *
         * @param callable $callback Callback.
         * @param array    $array    Data.
         * @return array
         */
        public function array_map_recursive($callback, $array)
        {
            $output = array();

            if (! is_array($array)) {
                return $output;
            }

            foreach ($array as $key => $value) {

                if (is_array($value)) {

                    $output[$key] = $this->array_map_recursive(
                        $callback,
                        $value
                    );

                } else {

                    $output[$key] = call_user_func(
                        $callback,
                        $value
                    );
                }
            }

            return $output;
        }

        /**
         * Load product attributes through AJAX.
         *
         * @return void
         */
        public function load_product_attributes()
        {
            $nonce = isset($_POST['nonce'])
                ? sanitize_text_field(
                    wp_unslash($_POST['nonce'])
                )
                : '';

            if (! wp_verify_nonce($nonce)) {
                wp_send_json_error(
                    esc_html__('Wrong Nonce', 'th-store-one')
                );
            }

            if (! current_user_can('edit_products')) {
                wp_die(-1);
            }

            $product_id = isset($_POST['post_id'])
                ? absint($_POST['post_id'])
                : 0;

            $product_object = wc_get_product($product_id);

            if (! $product_object instanceof WC_Product) {
                wp_send_json_error(
                    esc_html__('Invalid product.', 'th-store-one')
                );
            }

            ob_start();

            $this->panel_contents(
                $product_object
            );

            $data = ob_get_clean();

            wp_send_json_success($data);
        }

        /**
         * Save product attributes.
         *
         * @param int   $product_id Product ID.
         * @param array $data       Data.
         * @return void
         */
        public function save_product_attributes($product_id, $data)
        {
            if (! $product_id || ! is_array($data)) {
                return;
            }

            update_post_meta(
                $product_id,
                self::PRODUCT_META_KEY,
                $data
            );
        }

        /**
         * Enqueue admin script.
         *
         * @return void
         */
        public function pro_script_enqueue()
        {
            $screen = get_current_screen();
            $screen_id = $screen ? $screen->id : '';

            if (! in_array($screen_id, array('product'), true)) {
                return;
            }

            global $post;

            wp_enqueue_media();
            wp_enqueue_style('wp-color-picker');

            $base_url = plugin_dir_url(__FILE__);
            $base_dir = __DIR__;

            $css_file =
                TH_STORE_ONE_PLUGIN_URL
            . 'includes/modules/variation-swatches/assets/th-store-one-variation-tooltip.css';

            $js_file =
                TH_STORE_ONE_PLUGIN_URL
            . 'includes/modules/variation-swatches/assets/th-store-one-variation-tooltip.js';

            if (file_exists($css_file)) {

                wp_enqueue_style(
                    'th-store-one-variation-tooltip',
                    TH_STORE_ONE_PLUGIN_URL
            . 'includes/modules/variation-swatches/assets/th-store-one-variation-tooltip.css',
                    array('wp-color-picker'),
                    defined('TH_STORE_ONE_VERSION')
                        ? TH_STORE_ONE_VERSION
                        : false
                );
            }

            if (file_exists($js_file)) {

                wp_enqueue_script(
                    'th-store-one-variation-tooltip',
                    TH_STORE_ONE_PLUGIN_URL
            . 'includes/modules/variation-swatches/assets/th-store-one-variation-tooltip.js',
                    array(
                        'jquery',
                        'serializejson',
                        'wp-color-picker',
                        'wp-util',
                        'jquery-blockui',
                    ),
                    defined('TH_STORE_ONE_VERSION')
                        ? TH_STORE_ONE_VERSION
                        : false,
                    true
                );

                wp_localize_script(
                    'th-store-one-variation-tooltip',
                    'THStoreOneVariationTooltip',
                    array(
                        'ajaxurl'        => esc_url(
                            admin_url(
                                'admin-ajax.php',
                                'relative'
                            )
                        ),
                        'nonce'          => wp_create_nonce(),
                        'attribute_types' => $this->get_attribute_types_for_js(),
                        'post_id'        => isset($post->ID)
                            ? absint($post->ID)
                            : '',
                        'reset_notice'   => esc_html__(
                            'Are you sure you want to reset it to default setting?',
                            'th-store-one'
                        ),
                    )
                );
            }
        }

        /**
         * Attribute types for JS.
         *
         * @return array
         */
        private function get_attribute_types_for_js()
        {
            $types = wc_get_attribute_types();

            $types['custom'] = esc_html__(
                'Custom',
                'th-store-one'
            );

            return $types;
        }
    }

endif;
