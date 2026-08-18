<?php
/**
 * Cart Nav Menu.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Th_Store_One_Cart_Nav_Menu')) {

    class Th_Store_One_Cart_Nav_Menu
    {
        /**
         * Placeholder.
         */
        public const PLACEHOLDER = 'storeone-cart';

        /**
         * Legacy Placeholder.
         */
        public const LEGACY_PLACEHOLDER = 'taiowc';

        /**
         * Settings.
         *
         * @var array
         */
        private $settings = array();

        /**
         * Render.
         *
         * @var Th_Store_One_Cart_Render
         */
        private $render;

        /**
         * Constructor.
         *
         * @param array $settings Settings.
         */
        public function __construct($settings)
        {

            $this->settings = $settings;

            $this->render = new Th_Store_One_Cart_Render($settings);

            if (is_admin()) {

                add_action(
                    'admin_head-nav-menus.php',
                    array( $this, 'add_meta_box' )
                );

            } else {

                add_filter(
                    'walker_nav_menu_start_el',
                    array( $this, 'replace_menu_item' ),
                    50,
                    2
                );

                add_filter(
                    'megamenu_walker_nav_menu_start_el',
                    array( $this, 'replace_menu_item' ),
                    50,
                    2
                );
            }
        }

        /**
         * Add Menu Meta Box.
         */
        public function add_meta_box()
        {

            add_meta_box(
                'storeone-cart-menu',
                __('Store One Cart', 'th-store-one'),
                array( $this, 'meta_box_html' ),
                'nav-menus',
                'side',
                'low'
            );
        }

        /**
         * Meta box.
         */
        public function meta_box_html()
        {
            ?>

			<div class="posttypediv">

				<p>

					<?php esc_html_e('Add Store One Cart to your menu.', 'th-store-one'); ?>

				</p>

				<div class="tabs-panel tabs-panel-active">

					<ul class="categorychecklist form-no-clear">

						<li>

							<label>

								<input
									type="checkbox"
									class="menu-item-checkbox"
									name="menu-item[-1][menu-item-object-id]"
									value="-1"
								/>

								<?php esc_html_e('Store One Cart', 'th-store-one'); ?>

							</label>

							<input
								type="hidden"
								name="menu-item[-1][menu-item-type]"
								value="custom"
							/>

							<input
								type="hidden"
								name="menu-item[-1][menu-item-title]"
								value="<?php echo esc_attr(self::PLACEHOLDER); ?>"
							/>

							<input
								type="hidden"
								name="menu-item[-1][menu-item-classes]"
								value=""
							/>

						</li>

					</ul>

				</div>

				<p class="button-controls">

					<span class="add-to-menu">

						<button
							type="submit"
							class="button-secondary submit-add-to-menu right"
							name="add-post-type-menu-item"
						>

							<?php esc_html_e('Add to Menu', 'th-store-one'); ?>

						</button>

					</span>

				</p>

			</div>

			<?php
        }

        /**
         * Replace placeholder.
         *
         * @param string   $output Output.
         * @param \WP_Post $item Menu Item.
         *
         * @return string
         */
        public function replace_menu_item($output, $item)
        {

            if (empty($output)) {
                return $output;
            }

            $title = $item->post_title ?? '';

            if (
                self::PLACEHOLDER === $title ||
                self::LEGACY_PLACEHOLDER === $title
            ) {

                return $this->render->render('menu');
            }

            return $output;
        }
    }
}
