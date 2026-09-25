<?php
/**
 * Store One - Advance Search Frontend.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('TH_Store_One_Advance_Search_Frontend')) {

    /**
     * Advance Search Frontend.
 *
     * Frontend responsibility only:
     * - Shortcodes.
     * - Frontend assets.
     * - Frontend configuration.
     * - Global autocomplete container.
     *
     * Product search/AJAX is handled by:
     * api/class-product-search-api.php
     */
    class TH_Store_One_Advance_Search_Frontend
    {
        /**
         * Module settings.
         *
         * @var array
         */
        private $settings = array();

        /**
         * Search instance counter.
         *
         * @var int
         */
        private $search_instances = 0;

        /**
         * Whether frontend data has been localized.
         *
         * @var bool
         */
        private $frontend_data_localized = false;

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

            /*
             * Register frontend shortcodes.
             */
            $this->register_shortcodes();

            /*
             * Register the product API separately.
             *
             * Keep API/search logic outside this frontend class.
             */
            $this->register_product_api();

            /*
             * Assets are registered/enqueued when the shortcode
             * is actually rendered.
             */
            add_action(
                'wp_enqueue_scripts',
                array( $this, 'enqueue_assets' )
            );

            /*
             * One global autocomplete container is shared by
             * all search instances on the page.
             */
            add_action(
                'wp_footer',
                array( $this, 'render_autocomplete_container' )
            );
        }

        /**
         * Register product search API.
         *
         * Product API is intentionally kept in a separate file.
         * Post/Page APIs can be added later without changing this class.
         *
         * @return void
         */
        private function register_product_api()
        {

            $api_file = __DIR__ . '/api/class-product-search-api.php';

            if (! file_exists($api_file)) {
                return;
            }

            require_once $api_file;

            if (
                class_exists('TH_Store_One_Product_Search_API')
            ) {
                new TH_Store_One_Product_Search_API($this->settings);
            }
        }

        /**
         * Register shortcodes.
         *
         * Store One:
         * [th_store_one_search]
         *
         * Legacy:
         * [tapsp]
         * [th-aps]
         * [tapsp-wdgt]
         * [th-aps-wdgt]
         *
         * @return void
         */
        private function register_shortcodes()
        {

            add_shortcode(
                'th_store_one_search',
                array( $this, 'search_shortcode' )
            );

            /*
             * Do not replace an existing legacy shortcode.
             *
             * If the old Advance Search plugin is active, its shortcode
             * remains connected to that plugin.
             */
            $legacy_shortcodes = array(
                'tapsp',
                'th-aps',
                'tapsp-wdgt',
                'th-aps-wdgt',
            );

            foreach ($legacy_shortcodes as $shortcode) {

                if (shortcode_exists($shortcode)) {
                    continue;
                }

                add_shortcode(
                    $shortcode,
                    array( $this, 'legacy_shortcode' )
                );
            }
        }

        /**
         * Enqueue frontend assets.
         *
         * Assets are registered/enqueued by the shortcode.
         *
         * @return void
         */
        public function enqueue_assets()
        {
            /*
             * Intentionally empty.
             *
             * The shortcode calls register_assets() only when needed.
             */
        }

        /**
         * Legacy shortcode.
         *
         * @param array  $atts    Shortcode attributes.
         * @param string $content Shortcode content.
         * @param string $tag     Shortcode tag.
         *
         * @return string
         */
        public function legacy_shortcode(
            $atts = array(),
            $content = null,
            $tag = ''
        ) {

            $atts = shortcode_atts(
                array(
                    'layout'           => 'default_style',
                    'custom_post_type' => '',
                ),
                $atts,
                $tag
            );

            return $this->search_shortcode($atts);
        }

        /**
         * Search shortcode.
         *
         * @param array $atts Shortcode attributes.
         *
         * @return string
         */
        public function search_shortcode($atts = array())
        {

            $atts = shortcode_atts(
                array(
                    'layout'           => 'default_style',
                    'custom_post_type' => '',
                ),
                $atts,
                'th_store_one_search'
            );

            /*
             * Lite currently supports:
             * - default_style
             * - bar_style
             */
            $layout = sanitize_key($atts['layout']);

            if (
                ! in_array(
                    $layout,
                    array(
                        'default_style',
                        'bar_style',
                    ),
                    true
                )
            ) {
                $layout = 'default_style';
            }

            $custom_post_type = sanitize_key(
                $atts['custom_post_type']
            );

            $settings = $this->settings;

            /*
             * Every shortcode gets its own instance ID.
             */
            $this->search_instances++;
            $instance = $this->search_instances;

            /*
             * Register and enqueue assets only when a search
             * shortcode is actually rendered.
             */
            $this->register_assets();

            wp_enqueue_style(
                'store-one-advance-search'
            );

            wp_enqueue_script(
                'store-one-advance-search'
            );

            /*
             * Localize common frontend configuration only once.
             */
            $this->localize_frontend_data();

            $template = __DIR__ . '/search-bar.php';

            if (! file_exists($template)) {
                return '';
            }

            /*
             * Variables available to search-bar.php:
             *
             * $settings
             * $atts
             * $layout
             * $custom_post_type
             * $instance
             */
            ob_start();

            include $template;

            $html = ob_get_clean();

            /*
             * Pro extension point.
             */
            return apply_filters(
                'store_one_advance_search_html',
                $html,
                $atts,
                $settings
            );
        }

        /**
         * Localize frontend configuration.
         *
         * No dummy products are passed to JavaScript.
         * Search results come from the Product Search API through AJAX.
         *
         * @return void
         */
        /**
 * Localize frontend configuration.
 *
 * No dummy products are passed to JavaScript.
 * Search results come from the Product Search API through AJAX.
 *
 * @return void
 */
        private function localize_frontend_data()
        {
            if ($this->frontend_data_localized) {
                return;
            }

            /*
             * Generate a nonce for the product-search AJAX request.
             */
            $nonce = wp_create_nonce(
                'store_one_product_search'
            );

            /*
             * Make sure settings are always an array.
             */
            $frontend_settings = is_array($this->settings)
    ? $this->settings
    : array();

            $frontend_settings = apply_filters(
                'store_one_advance_search_frontend_settings',
                $frontend_settings
            );

            /*
             * Normalize a few important frontend values.
             */
            $frontend_settings['set_autocomplete_length'] = isset(
                $frontend_settings['set_autocomplete_length']
            )
                ? absint(
                    $frontend_settings['set_autocomplete_length']
                )
                : 1;

            $frontend_settings['result_length'] = isset(
                $frontend_settings['result_length']
            )
                ? absint(
                    $frontend_settings['result_length']
                )
                : 5;

            $frontend_settings['desc_excpt_length'] = isset(
                $frontend_settings['desc_excpt_length']
            )
                ? absint(
                    $frontend_settings['desc_excpt_length']
                )
                : 90;

            /*
             * Localize all settings to the frontend.
             */
            wp_localize_script(
                'store-one-advance-search',
                'storeOneAdvanceSearch',
                array(
                    /*
                     * Current frontend implementation.
                     */
                    'step' => 3,

                    /*
                     * One global dropdown shared by all instances.
                     */
                    'dropdownId' =>
                        'store-one-advance-search-dropdown',

                    /*
                     * WordPress AJAX endpoint.
                     */
                    'ajaxUrl' =>
                        admin_url('admin-ajax.php'),

                    /*
                     * Product-search AJAX action.
                     */
                    'action' =>
                        'store_one_product_search',

                    /*
                     * Product-search nonce.
                     */
                    'nonce' =>
                        $nonce,

                    /*
                     * Minimum characters before AJAX is triggered.
                     */
                    'minChars' =>
                        $frontend_settings[
                            'set_autocomplete_length'
                        ],

                    /*
                     * Loader setting.
                     */
                    'showLoader' =>
                        ! empty(
                            $frontend_settings['show_loader']
                        ),

                    /*
             * Complete Advance Search settings.
             *
             * JavaScript can now directly use:
             *
             * result_length
             * enable_group_heading
             * enable_cat_image
             * tapsp_enable_product_image
             * tapsp_enable_product_price
             * tapsp_enable_product_desc
             * tapsp_enable_product_sku
             * tapsp_enable_cart_btn
             * tapsp_highlight_sale
             * tapsp_highlight_featured
             * tapsp_stock_availability
             * no_reult_label
             * more_reult_label
             * desc_excpt_length
             * search settings
             * ranking settings
             * etc.
             */
                    'settings' =>
                        $frontend_settings,
                )
            );

            $this->frontend_data_localized = true;
        }
        /**
         * Register frontend assets.
         *
         * @return void
         */
        private function register_assets()
        {

            if (! defined('TH_STORE_ONE_PLUGIN_URL')) {
                return;
            }

            $base_url = trailingslashit(
                TH_STORE_ONE_PLUGIN_URL
            ) . 'includes/modules/advance-search/assets/';

            $version = defined('TH_STORE_ONE_VERSION')
                ? TH_STORE_ONE_VERSION
                : null;

            /*
             * Search CSS.
             */
            wp_register_style(
                'store-one-advance-search',
                $base_url . 'search.css',
                array(),
                $version
            );

            /*
             * Search JS.
             */
            wp_register_script(
                'store-one-advance-search',
                $base_url . 'search.js',
                array(),
                $version,
                true
            );
        }

        /**
         * Render one global autocomplete container.
         *
         * @return void
         */
        public function render_autocomplete_container()
        {
            /*
             * Do not output anything if no search shortcode was rendered.
             */
            if ($this->search_instances <= 0) {
                return;
            }

            $settings = is_array($this->settings)
                ? $this->settings
                : array();

            /*
             * Dropdown style defaults.
             */
            $sus_bg_clr = ! empty($settings['sus_bg_clr'])
                ? $settings['sus_bg_clr']
                : '#ffffff';

            $sus_hglt_clr = ! empty($settings['sus_hglt_clr'])
                ? $settings['sus_hglt_clr']
                : '#2991f5';

            $sus_slect_clr = ! empty($settings['sus_slect_clr'])
                ? $settings['sus_slect_clr']
                : '#eef2f7';

            $sus_brdr_clr = ! empty($settings['sus_brdr_clr'])
                ? $settings['sus_brdr_clr']
                : '#e7edf3';

            $sus_grphd_clr = ! empty($settings['sus_grphd_clr'])
                ? $settings['sus_grphd_clr']
                : '#172033';

            $sus_title_clr = ! empty($settings['sus_title_clr'])
                ? $settings['sus_title_clr']
                : '#172033';

            $sus_text_clr = ! empty($settings['sus_text_clr'])
                ? $settings['sus_text_clr']
                : '#687386';

            $dropdown_style = sprintf(
                '--s1-suggestion-bg:%s;
         --s1-highlight:%s;
         --s1-selected:%s;
         --s1-suggestion-border:%s;
         --s1-group-title:%s;
         --s1-title:%s;
         --s1-text:%s;',
                esc_attr($sus_bg_clr),
                esc_attr($sus_hglt_clr),
                esc_attr($sus_slect_clr),
                esc_attr($sus_brdr_clr),
                esc_attr($sus_grphd_clr),
                esc_attr($sus_title_clr),
                esc_attr($sus_text_clr)
            );
            ?>

    <div
        id="store-one-advance-search-dropdown"
        class="store-one-advance-search-dropdown"
        aria-hidden="true"
        style="<?php echo esc_attr($dropdown_style); ?>"
    ></div>

    <?php
        }
    }
}
