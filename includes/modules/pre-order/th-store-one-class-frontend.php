<?php

if (! defined('ABSPATH')) {
    exit;
}

class TH_Store_One_Pre_Order
{
    /**
     * Rules
     *
     * @var array
     */
    private $rules = [];

    /**
     * Constructor
     */
    public function __construct()
    {

        $modules = get_option(
            'th_store_one_module_option',
            []
        );

        if (
            empty($modules['pre-order'])
        ) {
            return;
        }

        $all = get_option(
            'th_store_one_module_set',
            []
        );

        $this->rules =
            $all['pre-order']['rules']
            ?? [];

        /* =========================
         * ASSETS
         * ========================= */

        add_action(
            'wp_enqueue_scripts',
            [ $this, 'assets' ]
        );

        /* =========================
         * FRONTEND
         * ========================= */

        add_action(
            'wp',
            [ $this, 'register_front_hooks' ]
        );

        /* =========================
         * BUTTONS
         * ========================= */

        add_filter(
            'woocommerce_product_single_add_to_cart_text',
            [ $this, 'button_text' ]
        );

        add_filter(
            'woocommerce_product_add_to_cart_text',
            [ $this, 'button_text' ]
        );



        add_filter(
            'woocommerce_loop_add_to_cart_link',
            [ $this, 'loop_button' ],
            10,
            2
        );

        add_filter(
            'woocommerce_available_variation',
            [ $this, 'variation_button' ],
            10,
            3
        );



        /* =========================
         * PURCHASE CONTROL
         * ========================= */

        add_filter(
            'woocommerce_is_purchasable',
            [ $this, 'disable_purchase' ],
            10,
            2
        );

        /* =========================
         * CART
         * ========================= */

        add_filter(
            'woocommerce_add_cart_item_data',
            [ $this, 'add_cart_item_data' ],
            10,
            3
        );

        add_filter(
            'woocommerce_get_item_data',
            [ $this, 'cart_item_display' ],
            10,
            2
        );

        add_action(
            'woocommerce_checkout_create_order_line_item',
            [ $this, 'order_item_meta' ],
            10,
            4
        );

        /* =========================
         * PRICE
         * ========================= */

        add_action(
            'woocommerce_before_calculate_totals',
            [ $this, 'modify_price' ],
            999
        );

        /* =========================
         * COMING SOON
         * ========================= */

        add_action(
            'wp',
            [ $this, 'coming_soon_mode' ]
        );

        add_action(
            'woocommerce_before_calculate_totals',
            [ $this, 'modify_price' ],
            999
        );

        add_filter(
            'woocommerce_get_price_html',
            [ $this, 'price_html' ],
            999,
            2
        );

        add_filter(
            'woocommerce_cart_item_price',
            [ $this, 'cart_price_html' ],
            999,
            3
        );

        add_filter(
            'woocommerce_cart_item_subtotal',
            [ $this, 'cart_subtotal_html' ],
            999,
            3
        );

        add_filter(
            'woocommerce_get_item_data',
            [ $this, 'cart_item_display' ],
            10,
            2
        );



    }

    /* =========================
 * ASSETS
 * ========================= */

    public function assets()
    {

        wp_enqueue_style(
            'th-preorder',
            TH_STORE_ONE_PLUGIN_URL .
            'assets/css/preorder.css',
            [],
            TH_STORE_ONE_VERSION
        );

        wp_enqueue_script(
            'th-preorder',
            TH_STORE_ONE_PLUGIN_URL .
            'assets/js/preorder.js',
            [ 'jquery' ],
            TH_STORE_ONE_VERSION,
            true
        );

        /* =========================
         * DEFAULT LOCALIZE
         * ========================= */

        $localized = [
            'enabled' => false,
            'text'    => '',
        ];

        /* =========================
         * SINGLE PRODUCT
         * ========================= */

        if (! is_product()) {
            return;
        }

        $product_id = get_queried_object_id();

        if (! $product_id) {
            return;
        }

        $product = wc_get_product(
            $product_id
        );

        if (! $product) {
            return;
        }

        foreach ($this->rules as $rule) {

            if (
                ! $this->match_rule(
                    $rule,
                    $product->get_id()
                )
            ) {
                continue;
            }

            $settings = $this->get_settings(
                $product->get_id(),
                $rule
            );

            /* =========================
             * PREORDER TEXT
             * ========================= */

            $mode =
                $settings['preorder_mode']
                ?? 'preorder';

            if (
                'coming_soon'
                === $mode
            ) {

                $localized = [
                    'enabled' => true,

                    'text' => __(
                        'Coming Soon',
                        'th-store-one'
                    ),
                ];

            } else {

                $localized = [
                    'enabled' => true,

                    'text' =>
                        $settings['button_text']
                        ?? __(
                            'Pre Order',
                            'th-store-one'
                        ),
                ];
            }

            /* =========================
             * BUTTON STYLE
             * ========================= */

            $btn = $this->get_preorder_button_style(
                $settings
            );

            $style = str_replace(
                ';',
                ' !important;',
                $btn['style']
            );

            $css = '
        .single_add_to_cart_button{

            ' . $style . '

        }

        .single_add_to_cart_button:hover{

            color:' . esc_attr(
                $settings['btn_text_clr']
                    ?? '#fff'
            ) . ' !important;

        }
        ';

            wp_add_inline_style(
                'th-preorder',
                $css
            );

            break;
        }

        /* =========================
         * LOCALIZE
         * ========================= */

        wp_localize_script(
            'th-smart-offer',
            'thPreorder',
            $localized
        );
    }

    /* =========================
     * REGISTER HOOKS
     * ========================= */

    public function register_front_hooks()
    {

        if (empty($this->rules)) {
            return;
        }

        foreach ($this->rules as $rule) {

            if (
                empty($rule['status']) ||
                'active' !== $rule['status']
            ) {
                continue;
            }

            /* =========================
             * SINGLE PRODUCT
             * ========================= */

            if (
                ! empty(
                    $rule['enable_single_page']
                )
            ) {

                add_action(
                    'woocommerce_before_add_to_cart_form',
                    [ $this, 'open_single_wrap' ],
                    1
                );

                add_action(
                    'woocommerce_after_add_to_cart_form',
                    [ $this, 'close_single_wrap' ],
                    999
                );

                $placement =
                    $rule['single_placement']
                    ?? 'woocommerce_after_add_to_cart_form';

                $priority =
                    isset($rule['single_priority'])
                    ? absint(
                        $rule['single_priority']
                    )
                    : 10;

                $hook =
                    th_store_one_get_hook_from_placement(
                        $placement
                    );

                if ($hook) {

                    add_action(
                        $hook,
                        function () use ($rule) {

                            global $product;

                            if (
                                ! $product instanceof WC_Product
                            ) {
                                return;
                            }

                            if (
                                ! $this->match_rule(
                                    $rule,
                                    $product->get_id()
                                )
                            ) {
                                return;
                            }

                            $settings =
                                $this->get_settings(
                                    $product->get_id(),
                                    $rule
                                );

                            if (
                                ! $this->validate_user(
                                    $settings
                                )
                            ) {
                                return;
                            }

                            $this->render_preorder(
                                $product,
                                $settings
                            );

                        },
                        $priority
                    );
                }
            }

            /* =========================
             * SHOP / ARCHIVE
             * ========================= */

            if (
                ! empty(
                    $rule['enable_shop_page']
                )
            ) {

                $archive_hook =
                    $this->get_archive_hook(
                        $rule['shop_position']
                        ?? 'after_price'
                    );

                $priority =
                    isset($rule['shop_priority'])
                    ? absint(
                        $rule['shop_priority']
                    )
                    : 10;

                add_action(
                    $archive_hook,
                    function () use ($rule) {

                        global $product;

                        if (
                            ! $product instanceof WC_Product
                        ) {
                            return;
                        }

                        if (
                            ! $this->match_rule(
                                $rule,
                                $product->get_id()
                            )
                        ) {
                            return;
                        }

                        $settings =
                            $this->get_settings(
                                $product->get_id(),
                                $rule
                            );

                        if (
                            ! $this->validate_user(
                                $settings
                            )
                        ) {
                            return;
                        }

                        echo wp_kses_post(
                            $this->render_loop_preorder(
                                $product,
                                $settings
                            )
                        );

                    },
                    $priority
                );
            }
        }
    }

    /* =========================
     * ARCHIVE HOOK
     * ========================= */

    private function get_archive_hook(
        $position
    ) {

        switch ($position) {

            case 'after_title':
                return 'woocommerce_shop_loop_item_title';

            case 'before_add_to_cart':
                return 'woocommerce_after_shop_loop_item';

            case 'after_add_to_cart':
                return 'woocommerce_after_shop_loop_item';

            case 'after_price':
            default:
                return 'woocommerce_after_shop_loop_item_title';
        }
    }

    /* =========================
     * LOOP PREORDER
     * ========================= */

    private function render_loop_preorder(
        $product,
        $settings
    ) {

        ob_start();
        ?>

		<div class="th-preorder-loop-wrap">

			<?php
            $this->render_preorder(
                $product,
                $settings
            );
        ?>

		</div>

		<?php

        return ob_get_clean();
    }

    /* =========================
     * MATCH RULE
     * ========================= */

    private function match_rule(
        $rule,
        $product_id
    ) {

        $trigger =
            $rule['trigger_type']
            ?? 'all_products';

        if (
            'all_products'
            === $trigger
        ) {
            return true;
        }

        if (
            'specific_products'
            === $trigger
        ) {

            $products = array_map(
                'intval',
                $rule['products']
                ?? []
            );

            return in_array(
                $product_id,
                $products,
                true
            );
        }

        if (
            'specific_categories'
            === $trigger
        ) {

            $categories =
                array_map(
                    'intval',
                    $rule['categories']
                    ?? []
                );

            return has_term(
                $categories,
                'product_cat',
                $product_id
            );
        }

        return false;
    }

    /* =========================
     * SETTINGS
     * ========================= */

    private function get_settings(
        $product_id,
        $rule
    ) {

        $override = get_post_meta(
            $product_id,
            '_th_preorder_override',
            true
        );

        if (
            'yes' !== $override
        ) {
            return $rule;
        }

        return array_merge(
            $rule,
            [
                'button_text' =>
                    get_post_meta(
                        $product_id,
                        '_th_preorder_button_text',
                        true
                    ),

                'preorder_message' =>
                    get_post_meta(
                        $product_id,
                        '_th_preorder_message',
                        true
                    ),

                'availability_date' =>
                    get_post_meta(
                        $product_id,
                        '_th_preorder_available_date',
                        true
                    ),

                'date_mode' =>
                    get_post_meta(
                        $product_id,
                        '_th_preorder_date_mode',
                        true
                    ),

                'price_type' =>
                    get_post_meta(
                        $product_id,
                        '_th_preorder_price_type',
                        true
                    ),

                'price_value' =>
                    get_post_meta(
                        $product_id,
                        '_th_preorder_price',
                        true
                    ),

                'logged_in_only' =>
                    get_post_meta(
                        $product_id,
                        '_th_preorder_logged_in',
                        true
                    ),

                'preorder_limit' =>
                    get_post_meta(
                        $product_id,
                        '_th_preorder_limit',
                        true
                    ),

                'preorder_mode' =>
                    get_post_meta(
                        $product_id,
                        '_th_preorder_mode',
                        true
                    ),
            ]
        );
    }

    /* =========================
     * USER VALIDATION
     * ========================= */

    private function validate_user(
        $settings
    ) {

        if (
            empty(
                $settings['logged_in_only']
            )
        ) {
            return true;
        }

        return is_user_logged_in();
    }

    /* =========================
     * BUTTON TEXT
     * ========================= */

    public function button_text(
        $text
    ) {

        global $product;

        if (
            ! $product instanceof WC_Product
        ) {
            return $text;
        }

        foreach (
            $this->rules as $rule
        ) {

            if (
                ! $this->match_rule(
                    $rule,
                    $product->get_id()
                )
            ) {
                continue;
            }

            $settings =
                $this->get_settings(
                    $product->get_id(),
                    $rule
                );

            $mode =
                $settings['preorder_mode']
                ?? 'preorder';

            if (
                'coming_soon'
                === $mode
            ) {

                return __(
                    'Coming Soon',
                    'th-store-one'
                );
            }

            $button =
                $settings['button_text']
                ?? '';

            if (
                ! empty($button)
            ) {

                return sanitize_text_field(
                    $button
                );
            }
        }

        return $text;
    }

    /* =========================
     * LOOP BUTTON
     * ========================= */

    public function loop_button(
        $html,
        $product
    ) {

        if (
            ! $product instanceof WC_Product
        ) {
            return $html;
        }

        foreach (
            $this->rules as $rule
        ) {

            if (
                ! $this->match_rule(
                    $rule,
                    $product->get_id()
                )
            ) {
                continue;
            }

            $settings =
                $this->get_settings(
                    $product->get_id(),
                    $rule
                );

            $mode =
                $settings['preorder_mode']
                ?? 'preorder';

            if (
                'coming_soon'
                === $mode
            ) {

                return preg_replace(
                    '/>(.*?)</',
                    '>Coming Soon<',
                    $html,
                    1
                );
            }

            $button =
                $settings['button_text']
                ?? '';

            if (
                empty($button)
            ) {
                continue;
            }

            $btn = $this->get_preorder_button_style(
                $settings
            );

            $class = esc_attr(
                $btn['class']
            );

            $style = esc_attr(
                $btn['style']
            );

            /* add class */
            $html = preg_replace(
                '/class="([^"]*)"/',
                'class="$1 ' . $class . '"',
                $html,
                1
            );

            /* add inline style */
            $html = preg_replace(
                '/<a /',
                '<a style="' . $style . '" ',
                $html,
                1
            );

            /* replace text */
            $html = preg_replace(
                '/>(.*?)</',
                '>' .
                esc_html($button) .
                '<',
                $html,
                1
            );
        }

        return $html;
    }

    /* =========================
     * VARIABLE BUTTON
     * ========================= */

    public function variation_button(
        $data,
        $product,
        $variation
    ) {

        foreach (
            $this->rules as $rule
        ) {

            if (
                ! $this->match_rule(
                    $rule,
                    $product->get_id()
                )
            ) {
                continue;
            }

            $settings =
                $this->get_settings(
                    $product->get_id(),
                    $rule
                );

            $mode =
                $settings['preorder_mode']
                ?? 'preorder';

            if (
                'coming_soon'
                === $mode
            ) {

                $data['add_to_cart_text'] =
                    __(
                        'Coming Soon',
                        'th-store-one'
                    );

                return $data;
            }

            if (
                ! empty(
                    $settings['button_text']
                )
            ) {

                $data['add_to_cart_text'] =
                    esc_html(
                        $settings['button_text']
                    );
            }
        }

        return $data;
    }

    /* =========================
     * DISABLE PURCHASE
     * ========================= */

    public function disable_purchase(
        $purchasable,
        $product
    ) {

        if (
            ! $product instanceof WC_Product
        ) {
            return $purchasable;
        }

        foreach (
            $this->rules as $rule
        ) {

            if (
                ! $this->match_rule(
                    $rule,
                    $product->get_id()
                )
            ) {
                continue;
            }

            $settings =
                $this->get_settings(
                    $product->get_id(),
                    $rule
                );

            $mode =
                $settings['preorder_mode']
                ?? 'preorder';

            if (
                'coming_soon'
                === $mode
            ) {

                return false;
            }
        }

        return $purchasable;
    }

    /* =========================
     * CART DATA
     * ========================= */

    /**
 * Add Cart Data
 */
    public function add_cart_item_data(
        $cart_item_data,
        $product_id,
        $variation_id
    ) {

        foreach (
            $this->rules as $rule
        ) {

            if (
                ! $this->match_rule(
                    $rule,
                    $product_id
                )
            ) {
                continue;
            }

            $settings =
                $this->get_settings(
                    $product_id,
                    $rule
                );

            $product =
                wc_get_product(
                    $variation_id ?: $product_id
                );

            if (! $product) {
                continue;
            }

            $base_price =
                (float)
                $product->get_regular_price();

            if (! $base_price) {

                $base_price =
                    (float)
                    $product->get_price();
            }

            $new_price =
                $this->calculate_preorder_price(
                    $base_price,
                    $settings
                );

            $cart_item_data[
    'th_preorder'
] = [
    'enabled' => true,

    'mode' =>
        $settings['preorder_mode']
        ?? 'preorder',

    'price_type' =>
        $settings['price_type']
        ?? 'product_price',

    'date_mode' =>
        $settings['date_mode']
        ?? 'manual',

    'date' =>
        $settings['availability_date']
        ?? '',

    'original_price' =>
        $base_price,

    'preorder_price' =>
        $new_price,

    'message' =>
        $settings['preorder_message']
        ?? '',
];

            return $cart_item_data;
        }

        return $cart_item_data;
    }
    /* =========================
     * CART DISPLAY
     * ========================= */

    public function cart_item_display(
        $item_data,
        $cart_item
    ) {

        if (
            empty(
                $cart_item['th_preorder']
            )
        ) {
            return $item_data;
        }

        $preorder =
            $cart_item['th_preorder'];

        $mode =
            $preorder['mode']
            ?? 'preorder';

        $label =
            'coming_soon' === $mode
            ? __(
                'Coming Soon',
                'th-store-one'
            )
            : __(
                'Pre Order',
                'th-store-one'
            );

        /* =========================
         * PREORDER LABEL
         * ========================= */

        $item_data[] = [
            'key'   => '',
            'value' => '',
            'display' => sprintf(
                '
            <div class="th-preorder-cart-label">

                <span class="th-preorder-badge">
                    %s
                </span>

            </div>
            ',
                esc_html($label)
            ),
        ];

        /* =========================
         * PREORDER PRICE
         * ========================= */

        if (
            ! empty(
                $preorder['price_type']
            )
            &&
            'product_price'
            !== $preorder['price_type']
        ) {

            $item_data[] = [
                'key' => '',

                'display' => sprintf(
                    '
                <div class="th-preorder-cart-price-wrap">

                    <span class="th-preorder-price-label">
                        %s
                    </span>

                    <div class="th-preorder-cart-price">

                        <ins>%s</ins>

                    </div>

                </div>
                ',
                    esc_html__(
                        'Pre-order Price',
                        'th-store-one'
                    ),
                    wc_price(
                        $preorder['preorder_price']
                    )
                ),
            ];
        }

        return $item_data;
    }
    /* =========================
     * ORDER META
     * ========================= */

    public function order_item_meta(
        $item,
        $cart_item_key,
        $values,
        $order
    ) {

        if (
            empty(
                $values['th_preorder']
            )
        ) {
            return;
        }

        $preorder =
            $values['th_preorder'];

        $mode =
            $preorder['mode']
            ?? 'preorder';

        $label =
            'coming_soon' === $mode
            ? __(
                'Coming Soon Product',
                'th-store-one'
            )
            : __(
                'Pre-Order Product',
                'th-store-one'
            );

        $text = $label;

        $date_mode =
            $preorder['date_mode']
            ?? 'manual';

        $date =
            $preorder['date']
            ?? '';

        if (
            'calendar'
            === $date_mode
            &&
            ! empty($date)
        ) {

            $formatted_date =
                wp_date(
                    get_option(
                        'date_format'
                    ) .
                    ' ' .
                    get_option(
                        'time_format'
                    ),
                    strtotime($date)
                );

            $text .=
                ' | ' .
                sprintf(
                    __(
                        'Available On: %s',
                        'th-store-one'
                    ),
                    $formatted_date
                );

        } else {

            $text .=
                ' | ' .
                __(
                    'Release Date Pending',
                    'th-store-one'
                );
        }

        $item->add_meta_data(
            '_th_preorder',
            $text
        );

        $item->add_meta_data(
            __(
                'Pre-Order',
                'th-store-one'
            ),
            $text
        );
    }
    /* =========================
     * PRICE
     * ========================= */

    /**
 * Modify Cart Price
 */
    public function modify_price(
        $cart
    ) {

        if (
            is_admin()
            && ! defined('DOING_AJAX')
        ) {
            return;
        }

        if (
            empty(
                $cart->get_cart()
            )
        ) {
            return;
        }

        foreach (
            $cart->get_cart() as $cart_item_key => &$cart_item
        ) {

            if (
                empty(
                    $cart_item['th_preorder']
                )
            ) {
                continue;
            }

            $preorder =
                $cart_item['th_preorder'];

            if (
                empty(
                    $preorder['preorder_price']
                )
            ) {
                continue;
            }

            $cart_item['data']->set_price(
                (float)
                $preorder['preorder_price']
            );
        }
    }
    /* =========================
     * COMING SOON MODE
     * ========================= */

    public function coming_soon_mode()
    {

        if (! is_product()) {
            return;
        }

        global $product;

        if (
            ! $product instanceof WC_Product
        ) {
            return;
        }

        foreach (
            $this->rules as $rule
        ) {

            if (
                ! $this->match_rule(
                    $rule,
                    $product->get_id()
                )
            ) {
                continue;
            }

            $settings =
                $this->get_settings(
                    $product->get_id(),
                    $rule
                );

            $mode =
                $settings[
                    'preorder_mode'
                ] ?? 'preorder';

            if (
                'coming_soon'
                === $mode
            ) {

                remove_action(
                    'woocommerce_single_product_summary',
                    'woocommerce_template_single_add_to_cart',
                    30
                );

                add_action(
                    'woocommerce_single_product_summary',
                    function () {

                        ?>

						<div class="th-preorder-coming-soon-badge">

							<?php esc_html_e(
							    'Coming Soon',
							    'th-store-one'
							); ?>

						</div>

						<?php
                    },
                    30
                );
            }
        }
    }

    /* =========================
     * RENDER
     * ========================= */

    private function render_preorder(
        $product,
        $settings
    ) {

        $date =
            $settings[
                'availability_date'
            ] ?? '';

        $date_mode =
            $settings[
                'date_mode'
            ] ?? 'manual';

        $message =
            $settings[
                'preorder_message'
            ] ?? '';

        $bg =
            $settings[
                'bg_color'
            ] ?? '#ffffff';

        $text =
            $settings[
                'text_color'
            ] ?? '#111827';

        $border =
            $settings[
                'border_color'
            ] ?? '#e5e7eb';

        $price_type =
            $settings[
                'price_type'
            ] ?? 'product_price';

        $product_price =
            (float)
            $product->get_regular_price();

        if (! $product_price) {

            $product_price =
                (float)
                $product->get_price();
        }

        $new_price =
            $this->calculate_preorder_price(
                $product_price,
                $settings
            );

        $msg   = $this->get_message_style($settings);

        ?>

	<div
		class="th-preorder-box"
		style="<?php echo esc_attr($msg); ?>"
	>

		<?php if (! empty($message)) : ?>

			<div class="th-preorder-message">

				<?php
                            echo wp_kses_post(
                                $message
                            );
		    ?>

			</div>

		<?php endif; ?>

		<?php if (
		    'calendar'
		    === $date_mode
		    &&
		    ! empty($date)
		) : ?>

			<div class="th-preorder-date">

				<strong>

					<?php esc_html_e(
					    'Available On:',
					    'th-store-one'
					); ?>

				</strong>

				<span>

					<?php
					echo esc_html(
					    date_i18n(
					        get_option(
					            'date_format'
					        ) .
					        ' ' .
					        get_option(
					            'time_format'
					        ),
					        strtotime(
					            $date
					        )
					    )
					);
		    ?>

				</span>

			</div>

		<?php endif; ?>

		<?php if (
		    'product_price'
		    !== $price_type
		) : ?>

			<!-- <div class="th-preorder-price-wrap">

				<span class="th-preorder-price-label">

					<?php esc_html_e(
					    'Pre-order Price',
					    'th-store-one'
					); ?>

				</span>

				<div class="th-preorder-price">

					<?php if (
					    $new_price < $product_price
					) : ?>

						<del>

							<?php
					        echo wc_price(
					            $product_price
					        );
					    ?>

						</del>

					<?php endif; ?>

					<ins>

						<?php
					    echo wc_price(
					        $new_price
					    );
		    ?>

					</ins>

				</div>

			</div> -->

		<?php endif; ?>

	</div>

	<?php
    }

    /**
 * Calculate Preorder Price
 */
    private function calculate_preorder_price(
        $price,
        $settings
    ) {

        $price_type =
            $settings['price_type']
            ?? 'product_price';

        $value = floatval(
            $settings['price_value']
            ?? 0
        );

        $new_price = $price;

        switch ($price_type) {

            case 'fixed_price':

                $new_price = $value;

                break;

            case 'discount_percentage':

                $new_price =
                    $price -
                    (
                        (
                            $price * $value
                        ) / 100
                    );

                break;

            case 'discount_fixed':

                $new_price =
                    $price - $value;

                break;

            case 'increase_percentage':

                $new_price =
                    $price +
                    (
                        (
                            $price * $value
                        ) / 100
                    );

                break;

            case 'increase_fixed':

                $new_price =
                    $price + $value;

                break;
        }

        return max(
            0,
            $new_price
        );
    }
    /**
     * Product Price HTML
     */
    public function price_html(
        $price_html,
        $product
    ) {

        global $wp_query;

        if (
            ! $product instanceof WC_Product
        ) {
            return $price_html;
        }

        foreach (
            $this->rules as $rule
        ) {

            if (
                ! $this->match_rule(
                    $rule,
                    $product->get_id()
                )
            ) {
                continue;
            }

            $settings =
                $this->get_settings(
                    $product->get_id(),
                    $rule
                );

            $original_price =
                (float)
                $product->get_regular_price();

            if (! $original_price) {

                $original_price =
                    (float)
                    $product->get_price();
            }

            $new_price =
                $this->calculate_preorder_price(
                    $original_price,
                    $settings
                );

            if (
                $new_price == $original_price
            ) {

                return wc_price(
                    $original_price
                );
            }

            $is_main_single_price =
    is_product()
    &&
    isset($wp_query->queried_object_id)
    &&
    $wp_query->queried_object_id
    === $product->get_id();

            if (
                $is_main_single_price
            ) {

                return sprintf(
                    '
        <span class="price th-preorder-price-html">

            <del>%s</del>

            <ins>%s</ins>

            %s

        </span>
        ',
                    wc_price($original_price),
                    wc_price($new_price),
                    $this->render_top_badge(
                        $settings
                    )
                );
            }

            return sprintf(
                '
    <span class="price th-preorder-price-html">

        <del>%s</del>

        <ins>%s</ins>

    </span>
    ',
                wc_price($original_price),
                wc_price($new_price)
            );
        }

        return $price_html;
    }
    /**
     * Cart Price HTML
     */
    public function cart_price_html(
        $price_html,
        $cart_item,
        $cart_item_key
    ) {

        if (
            empty(
                $cart_item['th_preorder']
            )
        ) {
            return $price_html;
        }

        $preorder =
            $cart_item['th_preorder'];

        $original =
            (float)
            $preorder['original_price'];

        $new =
            (float)
            $preorder['preorder_price'];

        if (
            $original === $new
        ) {

            return wc_price($new);
        }

        return sprintf(
            '<span class="th-preorder-cart-price">
            <del>%s</del>
            <ins>%s</ins>
        </span>',
            wc_price($original),
            wc_price($new)
        );
    }
    /**
 * Cart Subtotal
 */
    public function cart_subtotal_html(
        $subtotal,
        $cart_item,
        $cart_item_key
    ) {

        if (
            empty(
                $cart_item['th_preorder']
            )
        ) {
            return $subtotal;
        }

        $preorder =
            $cart_item['th_preorder'];

        $new =
            (float)
            $preorder['preorder_price'];

        return wc_price(
            $new *
            $cart_item['quantity']
        );
    }

    private function render_top_badge($settings)
    {

        $mode = $settings['preorder_mode']
            ?? 'preorder';

        $badge = 'coming_soon' === $mode
            ? (
                $settings['badges_coming_text']
                ?? __('Coming Soon', 'th-store-one')
            )
            : (
                $settings['badges_text']
                ?? __('Pre Order', 'th-store-one')
            );

        $style = $this->get_badge_style(
            $settings
        );

        return sprintf(
            '
        <span
            class="th-preorder-inline-badge"
            style="%s"
        >
            %s
        </span>
        ',
            esc_attr($style),
            esc_html($badge)
        );
    }

    private function get_preorder_button_style($settings)
    {

        $classes = [ 'th-preorder-btn', 'button' ];
        $style   = '';

        $is_block_theme = function_exists('wp_is_block_theme') && wp_is_block_theme();

        if ($is_block_theme) {
            $classes[] = 'wp-element-button';
        }

        if (
            ! empty($settings['btn_style']) &&
            'custom_btn_style' === $settings['btn_style']
        ) {

            $classes[] = 'th-preorder-custom-btn';

            $padding = $settings['btn_padding'] ?? [];
            $border  = $settings['btn_border'] ?? [];

            $style = sprintf(
                '
             --th-pre-btn-bg:%s;
    --th-pre-btn-color:%s;

    --th-pre-btn-pad-top:%s;
    --th-pre-btn-pad-right:%s;
    --th-pre-btn-pad-bottom:%s;
    --th-pre-btn-pad-left:%s;

    --th-pre-btn-border-style:%s;
    --th-pre-btn-border-color:%s;

    --th-pre-btn-border-top:%s;
    --th-pre-btn-border-right:%s;
    --th-pre-btn-border-bottom:%s;
    --th-pre-btn-border-left:%s;

    --th-pre-btn-radius-top:%s;
    --th-pre-btn-radius-right:%s;
    --th-pre-btn-radius-bottom:%s;
    --th-pre-btn-radius-left:%s;
            ',
                esc_attr($settings['btn_bg_clr'] ?? '#111'),
                esc_attr($settings['btn_text_clr'] ?? '#fff'),
                th_store_one_with_unit($padding['top'] ?? '12px'),
                th_store_one_with_unit($padding['right'] ?? '18px'),
                th_store_one_with_unit($padding['bottom'] ?? '12px'),
                th_store_one_with_unit($padding['left'] ?? '18px'),
                esc_attr($border['style'] ?? 'solid'),
                esc_attr($border['color'] ?? '#111'),
                th_store_one_with_unit($border['width']['top'] ?? '1px'),
                th_store_one_with_unit($border['width']['right'] ?? '1px'),
                th_store_one_with_unit($border['width']['bottom'] ?? '1px'),
                th_store_one_with_unit($border['width']['left'] ?? '1px'),
                th_store_one_with_unit($border['radius']['top'] ?? '0px'),
                th_store_one_with_unit($border['radius']['right'] ?? '0px'),
                th_store_one_with_unit($border['radius']['bottom'] ?? '0px'),
                th_store_one_with_unit($border['radius']['left'] ?? '0px')
            );
        }

        return [
            'class' => implode(' ', $classes),
            'style' => trim($style),
        ];
    }

    private function get_badge_style(
        $settings
    ) {

        return sprintf(
            '
        --th-preorder-badge-bg:%s;
        --th-preorder-badge-color:%s;
        ',
            esc_attr(
                $settings['btn_bdge_bg_clr']
                ?? '#111'
            ),
            esc_attr(
                $settings['btn_clr']
                ?? '#fff'
            )
        );
    }
    private function get_message_style(
        $settings
    ) {

        return sprintf(
            '
        --th-preorder-msg-bg:%s;
        --th-preorder-msg-color:%s;
        ',
            esc_attr(
                $settings['msg_bg_clr']
                ?? '#fff'
            ),
            esc_attr(
                $settings['msg_clr']
                ?? '#111'
            )
        );
    }

    public function open_single_wrap()
    {

        global $product;

        if (
            ! $product instanceof WC_Product
        ) {
            return;
        }

        foreach ($this->rules as $rule) {

            if (
                ! $this->match_rule(
                    $rule,
                    $product->get_id()
                )
            ) {
                continue;
            }

            ?>

        <div
            class="th-preorder-single-wrap"
        >

        <?php

            break;
        }
    }

    public function close_single_wrap()
    {

        global $product;

        if (
            ! $product instanceof WC_Product
        ) {
            return;
        }

        foreach ($this->rules as $rule) {

            if (
                ! $this->match_rule(
                    $rule,
                    $product->get_id()
                )
            ) {
                continue;
            }

            ?>

        </div>

        <?php

            break;
        }
    }

}
