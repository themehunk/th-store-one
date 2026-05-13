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

            return preg_replace(
                '/>(.*?)</',
                '>' .
                esc_html(
                    $button
                ) .
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

            $cart_item_data[
                'th_preorder'
            ] = [
                'enabled' => true,

                'mode' =>
                    $settings[
                        'preorder_mode'
                    ] ?? 'preorder',

                'date_mode' =>
                    $settings[
                        'date_mode'
                    ] ?? 'manual',

                'date' =>
                    $settings[
                        'availability_date'
                    ] ?? '',

                'message' =>
                    $settings[
                        'preorder_message'
                    ] ?? '',
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

        $value = '';

        if (
            'calendar'
            === $preorder['date_mode']
            &&
            ! empty(
                $preorder['date']
            )
        ) {

            $value =
                sprintf(
                    __(
                        'Available On: %s',
                        'th-store-one'
                    ),
                    date_i18n(
                        get_option(
                            'date_format'
                        ),
                        strtotime(
                            $preorder['date']
                        )
                    )
                );

        } else {

            $value =
                __(
                    'Release date will be announced soon',
                    'th-store-one'
                );
        }

        $item_data[] = [
            'key' => __(
                'Pre-Order',
                'th-store-one'
            ),

            'value' => wp_kses_post(
                $value
            ),
        ];

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

        $text =
            __(
                'Pre-Order Product',
                'th-store-one'
            );

        if (
            'calendar'
            === $preorder['date_mode']
            &&
            ! empty(
                $preorder['date']
            )
        ) {

            $text .=
                ' | ' .
                sprintf(
                    __(
                        'Available On: %s',
                        'th-store-one'
                    ),
                    date_i18n(
                        get_option(
                            'date_format'
                        ),
                        strtotime(
                            $preorder['date']
                        )
                    )
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
            $cart->get_cart() as $cart_item_key => $item
        ) {

            if (
                ! empty(
                    $item[
                        'th_preorder_price_applied'
                    ]
                )
            ) {
                continue;
            }

            $product =
                $item['data'];

            $product_id =
                $item['product_id'];

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

                $price_type =
                    $settings['price_type']
                    ?? 'product_price';

                $value = floatval(
                    $settings['price_value']
                    ?? 0
                );

                $price = floatval(
                    $product->get_price()
                );

                $new_price = $price;

                if (
                    'fixed_price'
                    === $price_type
                ) {

                    $new_price = $value;

                } elseif (
                    'discount_percentage'
                    === $price_type
                ) {

                    $new_price =
                        $price -
                        (
                            (
                                $price *
                                $value
                            ) / 100
                        );

                } elseif (
                    'discount_fixed'
                    === $price_type
                ) {

                    $new_price =
                        $price - $value;

                } elseif (
                    'increase_percentage'
                    === $price_type
                ) {

                    $new_price =
                        $price +
                        (
                            (
                                $price *
                                $value
                            ) / 100
                        );

                } elseif (
                    'increase_fixed'
                    === $price_type
                ) {

                    $new_price =
                        $price + $value;
                }

                $product->set_price(
                    $new_price
                );

                $cart->cart_contents[
                    $cart_item_key
                ][
                    'th_preorder_price_applied'
                ] = true;
            }
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

        ?>

		<div
			class="th-preorder-box"
			style="
				background:
					<?php echo esc_attr($bg); ?>;
				color:
					<?php echo esc_attr($text); ?>;
				border:1px solid
					<?php echo esc_attr($border); ?>;
			"
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
			    'manual'
			    === $date_mode
			) : ?>

				<div class="th-preorder-badge">

					<?php esc_html_e(
					    'Pre-Order Available',
					    'th-store-one'
					); ?>

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

		</div>

		<?php
    }
}
