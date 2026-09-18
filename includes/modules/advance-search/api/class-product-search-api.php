<?php

/**
 * Store One - Product Search API.
 *
 * Handles WooCommerce product autocomplete/search requests.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('TH_Store_One_Product_Search_API')) {

    /**
     * Product Search API.
     *
     * This class is intentionally responsible only for products.
     * Post/Page search APIs can be added as separate classes later.
     */
    class TH_Store_One_Product_Search_API
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
        public function __construct($settings)
        {

            $this->settings = is_array($settings)
                ? $settings
                : array();

            add_action(
                'wp_ajax_store_one_product_search',
                array( $this, 'search' )
            );

            add_action(
                'wp_ajax_nopriv_store_one_product_search',
                array( $this, 'search' )
            );
        }

        /**
         * Handle product search AJAX request.
         *
         * @return void
         */
        public function search()
        {

            check_ajax_referer(
                'store_one_product_search',
                'nonce'
            );

            $term = isset($_POST['term'])
                ? sanitize_text_field(
                    wp_unslash($_POST['term'])
                )
                : '';

            $term = trim($term);

            $min_chars = isset(
                $this->settings['set_autocomplete_length']
            )
                ? absint(
                    $this->settings['set_autocomplete_length']
                )
                : 1;

            if ('' === $term || strlen($term) < $min_chars) {
                wp_send_json_success(
                    array(
                        'categories' => array(),
                        'products'   => array(),
                        'total'      => 0,
                    )
                );
            }

            $results = $this->search_products($term);

            wp_send_json_success($results);
        }

        /**
         * Search WooCommerce products.
         *
         * @param string $term Search term.
         *
         * @return array
         */
        private function search_products($term)
        {

            if (! class_exists('WooCommerce')) {
                return array(
                    'categories' => array(),
                    'products'   => array(),
                    'total'      => 0,
                );
            }

            $limit = isset($this->settings['result_length'])
                ? absint($this->settings['result_length'])
                : 5;

            $limit = max(1, min(50, $limit));

            $exclude_ids = apply_filters(
                'store_one_advance_search_excluded_product_ids',
                array(),
                $term
            );

            /*
             * First collect products matching the main WordPress
             * title/content search.
             */
            $ids = $this->search_by_wordpress_query(
                $term,
                $limit,
                $exclude_ids
            );

            /*
             * Add additional matches enabled by Store One settings.
             */
            $additional_ids = array();

            if ($this->setting_enabled('tapsp_search_in_product_sku')) {
                $additional_ids = array_merge(
                    $additional_ids,
                    $this->search_by_sku($term)
                );
            }

            if ($this->setting_enabled('tapsp_search_in_category')) {
                $additional_ids = array_merge(
                    $additional_ids,
                    $this->search_by_taxonomy(
                        $term,
                        'product_cat'
                    )
                );
            }

            if ($this->setting_enabled('tapsp_search_in_tag')) {
                $additional_ids = array_merge(
                    $additional_ids,
                    $this->search_by_taxonomy(
                        $term,
                        'product_tag'
                    )
                );
            }

            if ($this->setting_enabled('tapsp_search_in_brand')) {
                $additional_ids = array_merge(
                    $additional_ids,
                    $this->search_by_brand($term)
                );
            }

            if ($this->setting_enabled('tapsp_search_in_attributes')) {
                $additional_ids = array_merge(
                    $additional_ids,
                    $this->search_by_attributes($term)
                );
            }

            if (
                $this->setting_enabled(
                    'tapsp_search_in_description'
                )
            ) {
                $additional_ids = array_merge(
                    $additional_ids,
                    $this->search_by_description(
                        $term,
                        false
                    )
                );
            }

            if (
                $this->setting_enabled(
                    'tapsp_search_in_short_description'
                )
            ) {
                $additional_ids = array_merge(
                    $additional_ids,
                    $this->search_by_description(
                        $term,
                        true
                    )
                );
            }

            $additional_ids = array_merge(
                $additional_ids,
                $this->search_by_custom_fields($term)
            );

            /*
             * Merge while preserving the primary WordPress search order.
             */
            $ids = array_values(
                array_unique(
                    array_merge(
                        $ids,
                        $additional_ids
                    )
                )
            );

            if (! empty($exclude_ids)) {
                $ids = array_values(
                    array_diff(
                        $ids,
                        $exclude_ids
                    )
                );
            }

            /*
             * Remove invalid/non-purchasable product posts and
             * respect WooCommerce catalog visibility.
             */
            $ids = $this->filter_product_ids($ids);

            /*
             * Apply a simple Store One relevance ordering when enabled.
             * Exact title/SKU/category matches are placed first.
             */
            $ids = $this->rank_product_ids(
                $ids,
                $term
            );

            $total = count($ids);

            $ids = array_slice(
                $ids,
                0,
                $limit
            );

            $products = array();

            foreach ($ids as $product_id) {

                $product = wc_get_product($product_id);

                if (! $product) {
                    continue;
                }

                $products[] = $this->prepare_product(
                    $product,
                    $term
                );
            }

            /*
             * Categories are returned separately so the frontend can
             * render a category section without mixing it with products.
             */
            $categories = array();

            if ($this->setting_enabled('show_category_in')) {
                $categories = $this->search_categories(
                    $term
                );
            }

            return array(
                'categories' => $categories,
                'products'   => $products,
                'total'      => $total,
            );
        }

        /**
         * Main WordPress product search.
         *
         * @param string $term        Search term.
         * @param int    $limit       Result limit.
         * @param array $exclude_ids  Excluded product IDs.
         *
         * @return array
         */
        private function search_by_wordpress_query(
            $term,
            $limit,
            $exclude_ids
        ) {

            $post_types = array( 'product' );

            $args = array(
                'post_type'              => $post_types,
                'post_status'            => 'publish',
                'posts_per_page'         => max(20, $limit * 4),
                's'                      => $term,
                'fields'                 => 'ids',
                'no_found_rows'          => true,
                'ignore_sticky_posts'    => true,
                'update_post_meta_cache' => false,
                'update_post_term_cache' => false,
            );

            if (! empty($exclude_ids)) {
                $args['post__not_in'] = $exclude_ids;
            }

            /*
             * Product visibility.
             */
            $args['tax_query'] = array(
                'relation' => 'AND',
                array(
                    'taxonomy' => 'product_visibility',
                    'field'    => 'name',
                    'terms'    => array( 'exclude-from-search' ),
                    'operator' => 'NOT IN',
                ),
            );

            $query = new WP_Query($args);

            return array_map(
                'absint',
                $query->posts
            );
        }

        /**
         * Search by product/variation SKU.
         *
         * Variation SKU matches are converted to the parent product.
         *
         * @param string $term Search term.
         *
         * @return array
         */
        private function search_by_sku($term)
        {

            global $wpdb;

            $like = '%' . $wpdb->esc_like($term) . '%';

            $sql = $wpdb->prepare(
                "SELECT DISTINCT p.ID
				FROM {$wpdb->posts} p
				INNER JOIN {$wpdb->postmeta} pm
					ON pm.post_id = p.ID
				WHERE pm.meta_key = '_sku'
				AND pm.meta_value LIKE %s
				AND p.post_status = 'publish'
				AND p.post_type IN ('product', 'product_variation')
				LIMIT 100",
                $like
            );

            $ids = $wpdb->get_col($sql);

            $result = array();

            foreach ($ids as $id) {

                $id = absint($id);

                if ('product_variation' === get_post_type($id)) {
                    $parent_id = wp_get_post_parent_id($id);

                    if ($parent_id) {
                        $result[] = absint($parent_id);
                    }
                } else {
                    $result[] = $id;
                }
            }

            return array_values(
                array_unique($result)
            );
        }

        /**
         * Search product taxonomy.
         *
         * @param string $term     Search term.
         * @param string $taxonomy Taxonomy name.
         *
         * @return array
         */
        private function search_by_taxonomy($term, $taxonomy)
        {

            $terms = get_terms(
                array(
                    'taxonomy'   => $taxonomy,
                    'hide_empty' => true,
                    'search'     => $term,
                    'number'     => 50,
                    'fields'     => 'ids',
                )
            );

            if (
                is_wp_error($terms) ||
                empty($terms)
            ) {
                return array();
            }

            $query = new WP_Query(
                array(
                    'post_type'      => 'product',
                    'post_status'    => 'publish',
                    'posts_per_page' => 100,
                    'fields'         => 'ids',
                    'no_found_rows'  => true,
                    'tax_query'      => array(
                        array(
                            'taxonomy' => $taxonomy,
                            'field'    => 'term_id',
                            'terms'    => array_map(
                                'absint',
                                $terms
                            ),
                        ),
                    ),
                )
            );

            return array_map(
                'absint',
                $query->posts
            );
        }

        /**
         * Search product brand taxonomy.
         *
         * WooCommerce does not have one universal brand taxonomy,
         * so support the common brand taxonomy names.
         *
         * @param string $term Search term.
         *
         * @return array
         */
        private function search_by_brand($term)
        {

            $taxonomies = array(
                'product_brand',
                'pwb-brand',
                'yith_product_brand',
                'pa_brand',
            );

            $result = array();

            foreach ($taxonomies as $taxonomy) {

                if (! taxonomy_exists($taxonomy)) {
                    continue;
                }

                $result = array_merge(
                    $result,
                    $this->search_by_taxonomy(
                        $term,
                        $taxonomy
                    )
                );
            }

            return array_values(
                array_unique($result)
            );
        }

        /**
         * Search product attributes.
         *
         * @param string $term Search term.
         *
         * @return array
         */
        private function search_by_attributes($term)
        {

            $taxonomies = wc_get_attribute_taxonomies();

            if (empty($taxonomies)) {
                return array();
            }

            $result = array();

            foreach ($taxonomies as $attribute) {

                if (empty($attribute->attribute_name)) {
                    continue;
                }

                $taxonomy = wc_attribute_taxonomy_name(
                    $attribute->attribute_name
                );

                $result = array_merge(
                    $result,
                    $this->search_by_taxonomy(
                        $term,
                        $taxonomy
                    )
                );
            }

            return array_values(
                array_unique($result)
            );
        }

        /**
         * Search long/short product description.
         *
         * @param string $term  Search term.
         * @param bool   $short Whether to search short description.
         *
         * @return array
         */
        private function search_by_description(
            $term,
            $short = false
        ) {

            $like = '%' . $term . '%';

            $args = array(
                'post_type'              => 'product',
                'post_status'            => 'publish',
                'posts_per_page'         => 100,
                'fields'                 => 'ids',
                'no_found_rows'          => true,
                'update_post_meta_cache' => false,
                'update_post_term_cache' => false,
            );

            global $wpdb;

            if ($short) {

                $sql = $wpdb->prepare(
                    "SELECT p.ID
					FROM {$wpdb->posts} p
					WHERE p.post_type = 'product'
					AND p.post_status = 'publish'
					AND p.post_excerpt LIKE %s
					LIMIT 100",
                    $like
                );

            } else {

                $sql = $wpdb->prepare(
                    "SELECT p.ID
					FROM {$wpdb->posts} p
					WHERE p.post_type = 'product'
					AND p.post_status = 'publish'
					AND p.post_content LIKE %s
					LIMIT 100",
                    $like
                );
            }

            unset($args);

            $ids = $wpdb->get_col($sql);

            return array_map(
                'absint',
                $ids
            );
        }

        /**
         * Search configured custom fields.
         *
         * @param string $term Search term.
         *
         * @return array
         */
        private function search_by_custom_fields($term)
        {

            $fields = isset(
                $this->settings['tapsp_search_in_custom_fld']
            )
                ? $this->settings['tapsp_search_in_custom_fld']
                : array();

            if (! is_array($fields) || empty($fields)) {
                return array();
            }

            $fields = array_filter(
                array_map(
                    'sanitize_key',
                    $fields
                )
            );

            if (empty($fields)) {
                return array();
            }

            global $wpdb;

            $meta_placeholders = implode(
                ',',
                array_fill(
                    0,
                    count($fields),
                    '%s'
                )
            );

            $params = array_merge(
                array( '%' . $wpdb->esc_like($term) . '%' ),
                $fields
            );

            $sql = $wpdb->prepare(
                "SELECT DISTINCT p.ID
				FROM {$wpdb->posts} p
				INNER JOIN {$wpdb->postmeta} pm
					ON pm.post_id = p.ID
				WHERE p.post_type = 'product'
				AND p.post_status = 'publish'
				AND pm.meta_value LIKE %s
				AND pm.meta_key IN ({$meta_placeholders})
				LIMIT 100",
                $params
            );

            return array_map(
                'absint',
                $wpdb->get_col($sql)
            );
        }

        /**
         * Filter product IDs.
         *
         * @param array $ids Product IDs.
         *
         * @return array
         */
        private function filter_product_ids($ids)
        {

            $result = array();

            foreach ($ids as $id) {

                $id = absint($id);

                if (! $id) {
                    continue;
                }

                $product = wc_get_product($id);

                if (! $product) {
                    continue;
                }

                if ('publish' !== get_post_status($id)) {
                    continue;
                }

                /*
                 * Respect catalog visibility.
                 */
                if (
                    in_array(
                        'exclude-from-search',
                        $product->get_catalog_visibility()
                            ? array( $product->get_catalog_visibility() )
                            : array(),
                        true
                    )
                ) {
                    continue;
                }

                /*
                 * Respect WooCommerce visibility directly.
                 */
                if (
                    $product->is_visible() &&
                    'product' === get_post_type($id)
                ) {
                    $result[] = $id;
                }
            }

            return array_values(
                array_unique($result)
            );
        }

        /**
         * Rank product IDs.
         *
         * @param array  $ids  Product IDs.
         * @param string $term Search term.
         *
         * @return array
         */
        private function rank_product_ids($ids, $term)
        {

            if (
                ! $this->setting_enabled(
                    'tapsp_enable_custom_ranking'
                )
            ) {
                return $ids;
            }

            $term = strtolower(trim($term));

            $weights = array(
                'title'      => $this->setting_int(
                    'tapsp_rank_weight_title',
                    100
                ),
                'sku'        => $this->setting_int(
                    'tapsp_rank_weight_sku',
                    80
                ),
                'category'   => $this->setting_int(
                    'tapsp_rank_weight_category',
                    60
                ),
                'tags'       => $this->setting_int(
                    'tapsp_rank_weight_tags',
                    50
                ),
                'attributes' => $this->setting_int(
                    'tapsp_rank_weight_attributes',
                    50
                ),
                'brand'      => $this->setting_int(
                    'tapsp_rank_weight_brand',
                    60
                ),
                'popularity' => $this->setting_int(
                    'tapsp_rank_weight_popularity',
                    30
                ),
                'rating'     => $this->setting_int(
                    'tapsp_rank_weight_rating',
                    20
                ),
                'stock'      => $this->setting_int(
                    'tapsp_rank_weight_stock',
                    10
                ),
            );

            $scores = array();

            foreach ($ids as $id) {

                $product = wc_get_product($id);

                if (! $product) {
                    continue;
                }

                $score = 0;
                $title = strtolower(
                    $product->get_name()
                );

                /*
                 * Title relevance.
                 */
                if (false !== strpos($title, $term)) {
                    $score += $weights['title'];

                    if ($title === $term) {
                        $score += $weights['title'];
                    }
                }

                /*
                 * SKU relevance.
                 */
                $sku = strtolower(
                    (string) $product->get_sku()
                );

                if (
                    '' !== $sku &&
                    false !== strpos($sku, $term)
                ) {
                    $score += $weights['sku'];
                }

                /*
                 * Category relevance.
                 */
                $categories = get_the_terms(
                    $id,
                    'product_cat'
                );

                if (! is_wp_error($categories)) {
                    foreach ($categories as $category) {

                        $name = strtolower(
                            $category->name
                        );

                        if (
                            false !== strpos(
                                $name,
                                $term
                            )
                        ) {
                            $score += $weights['category'];
                            break;
                        }
                    }
                }

                /*
                 * Tag relevance.
                 */
                $tags = get_the_terms(
                    $id,
                    'product_tag'
                );

                if (
                    ! is_wp_error($tags) &&
                    ! empty($tags) &&
                    is_array($tags)
                ) {
                    foreach ($tags as $tag) {

                        $name = strtolower(
                            $tag->name
                        );

                        if (
                            false !== strpos(
                                $name,
                                $term
                            )
                        ) {
                            $score += $weights['tags'];
                            break;
                        }
                    }
                }

                /*
                 * Featured.
                 */
                if ($product->is_featured()) {
                    $score += max(
                        0,
                        (int) $weights['popularity']
                    );
                }

                /*
                 * Rating.
                 */
                $rating = (float) $product->get_average_rating();

                if ($rating > 0) {
                    $score += $rating *
                        max(
                            0,
                            (int) $weights['rating']
                        );
                }

                /*
                 * Stock.
                 */
                if ($product->is_in_stock()) {
                    $score += max(
                        0,
                        (int) $weights['stock']
                    );
                }

                $scores[ $id ] = $score;
            }

            usort(
                $ids,
                function ($a, $b) use ($scores) {

                    $a_score = isset($scores[ $a ])
                        ? $scores[ $a ]
                        : 0;

                    $b_score = isset($scores[ $b ])
                        ? $scores[ $b ]
                        : 0;

                    if ($a_score === $b_score) {
                        return 0;
                    }

                    return ($a_score > $b_score)
                        ? -1
                        : 1;
                }
            );

            return $ids;
        }

        /**
         * Prepare product response.
         *
         * @param WC_Product $product Product object.
         * @param string     $term    Search term.
         *
         * @return array
         */
        private function prepare_product(
            $product,
            $term
        ) {

            /*
             * Lite provides only the basic product data.
             *
             * Product image, price and sale are available in Lite.
             * Pro can control their visibility and add additional
             * product functionality through the filter below.
             */

            $data = array(
                'id'    => $product->get_id(),
                'title' => html_entity_decode(
                    wp_strip_all_tags(
                        $product->get_name()
                    ),
                    ENT_QUOTES,
                    get_bloginfo('charset')
                ),
                'image' => $this->get_product_image($product),
                'price' => $this->get_product_price($product),
                'url'   => get_permalink(
                    $product->get_id()
                ),
                'sale'  => $product->is_on_sale(),
            );

            /*
             * Pro extension point.
             *
             * Pro can:
             * - Show/hide image
             * - Show/hide price
             * - Add description
             * - Add SKU
             * - Add to cart
             * - Add featured status
             * - Add stock availability
             * - Control sale highlight
             */
            return apply_filters(
                'store_one_advance_search_product_result',
                $data,
                $product,
                $term,
                $this->settings
            );
        }
        /**
         * Get product image URL.
         *
         * @param WC_Product $product Product.
         *
         * @return string
         */
        private function get_product_image($product)
        {

            $image_id = $product->get_image_id();

            if (! $image_id) {
                return '';
            }

            $image = wp_get_attachment_image_url(
                $image_id,
                'woocommerce_thumbnail'
            );

            return $image ? esc_url_raw($image) : '';
        }

        /**
         * Get product description.
         *
         * @param WC_Product $product Product.
         *
         * @return string
         */
        private function get_product_description($product)
        {

            $description = $product->get_short_description();

            if ('' === trim($description)) {
                $description = $product->get_description();
            }

            $description = wp_strip_all_tags(
                $description
            );

            $length = isset(
                $this->settings['desc_excpt_length']
            )
                ? absint(
                    $this->settings['desc_excpt_length']
                )
                : 90;

            if ($length > 0) {
                $description = wp_html_excerpt(
                    $description,
                    $length,
                    '…'
                );
            }

            return $description;
        }

        /**
         * Get product price HTML.
         *
         * @param WC_Product $product Product.
         *
         * @return string
         */
        private function get_product_price($product)
        {

            return wp_kses_post(
                $product->get_price_html()
            );
        }

        /**
         * Get cart data.
         *
         * @param WC_Product $product Product.
         *
         * @return array
         */
        private function get_product_cart_data($product)
        {

            $data = array(
                'enabled'      => false,
                'url'          => '',
                'text'         => '',
                'product_id'   => $product->get_id(),
                'variation_id' => 0,
            );

            if (
                ! $this->setting_enabled(
                    'tapsp_enable_cart_btn'
                )
            ) {
                return $data;
            }

            if (
                ! $product->is_purchasable() ||
                ! $product->is_in_stock()
            ) {
                return $data;
            }

            $data['enabled'] = true;
            $data['url'] = esc_url_raw(
                $product->add_to_cart_url()
            );
            $data['text'] = esc_html__(
                'Add to cart',
                'store-one'
            );

            return $data;
        }

        /**
         * Search product categories for the category section.
         *
         * @param string $term Search term.
         *
         * @return array
         */
        private function search_categories($term)
        {

            $limit = isset(
                $this->settings['result_length']
            )
                ? absint(
                    $this->settings['result_length']
                )
                : 5;

            $limit = max(1, min(20, $limit));

            $terms = get_terms(
                array(
                    'taxonomy'   => 'product_cat',
                    'hide_empty' => true,
                    'search'     => $term,
                    'number'     => $limit,
                )
            );

            if (
                is_wp_error($terms) ||
                empty($terms)
            ) {
                return array();
            }

            $categories = array();

            foreach ($terms as $term_object) {

                $image = '';

                if (
                    $this->setting_enabled(
                        'enable_cat_image'
                    )
                ) {
                    $image_id = get_term_meta(
                        $term_object->term_id,
                        'thumbnail_id',
                        true
                    );

                    if ($image_id) {
                        $image = wp_get_attachment_image_url(
                            $image_id,
                            'woocommerce_thumbnail'
                        );

                        $image = $image
                            ? esc_url_raw($image)
                            : '';
                    }
                }

                $categories[] = array(
                    'id'    => $term_object->term_id,
                    'title' => $term_object->name,
                    'url'   => get_term_link(
                        $term_object
                    ),
                    'image' => $image,
                );
            }

            return $categories;
        }


        /**
         * Check a boolean setting.
         *
         * @param string $key Setting key.
         *
         * @return bool
         */
        /**
 * Check a boolean setting.
 *
 * Supports:
 * - true / false
 * - 1 / 0
 * - "1" / "0"
 * - "true" / "false"
 * - "yes" / "no"
 * - "on" / "off"
 *
 * @param string $key Setting key.
 *
 * @return bool
 */
        private function setting_enabled($key)
        {
            if (! isset($this->settings[ $key ])) {
                return false;
            }

            $value = $this->settings[ $key ];

            if (is_bool($value)) {
                return $value;
            }

            if (is_numeric($value)) {
                return 1 === absint($value);
            }

            if (is_string($value)) {
                $value = strtolower(
                    trim($value)
                );

                return in_array(
                    $value,
                    array(
                        '1',
                        'true',
                        'yes',
                        'on',
                    ),
                    true
                );
            }

            return false;
        }

        /**
         * Get integer setting.
         *
         * @param string $key     Setting key.
         * @param int    $default Default value.
         *
         * @return int
         */
        private function setting_int(
            $key,
            $default = 0
        ) {

            return isset($this->settings[ $key ])
                ? absint(
                    $this->settings[ $key ]
                )
                : absint($default);
        }
    }
}
