<?php

/**
 * Cart Icons Helper.
 *
 * @package StoreOne
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('Th_Store_One_Cart_Icons')) {

    class Th_Store_One_Cart_Icons
    {
        /**
         * Cached Icons.
         *
         * @var array|null
         */
        private static $icons = null;

        /**
         * Render Icon.
         *
         * @param array $settings Cart settings.
         *
         * @return void
         */
        public static function render($settings = array())
        {

            $icon_type = $settings['taiowc_icontype'] ?? 'icon';

            // Image.
            if ('image' === $icon_type && ! empty($settings['taiowc_image_url'])) {

                printf(
                    '<img class="s1-preview-cart-img" src="%s" alt="%s">',
                    esc_url($settings['taiowc_image_url']),
                    esc_attr__('Cart', 'th-store-one')
                );

                return;
            }

            // Custom SVG.
            if ('custom_svg' === $icon_type && ! empty($settings['taiowc_custom_svg'])) {

                echo '<span class="s1-preview-cart-svg">';
                echo wp_kses_post($settings['taiowc_custom_svg']);
                echo '</span>';

                return;
            }

            $icon_id = $settings['taiowc_cart_icon'] ?? 'icon-1';

            $icons = self::get_icons();

            echo '<span class="s1-preview-cart-svg">';

            echo wp_kses(
                $icons[ $icon_id ] ?? $icons['icon-1'],
                self::allowed_svg_tags()
            );

            echo '</span>';
        }

        /**
         * Get Icons.
         *
         * @return array
         */
        private static function get_icons()
        {

            if (null !== self::$icons) {
                return self::$icons;
            }

            self::$icons = array(

                'icon-1' => '
				<svg viewBox="0 0 24 24" fill="none">
					<path
						d="M4.153 4L6.01 15.146a.993.993 0 0 0 .327.603.997.997 0 0 0 .679.251H18a1 1 0 0 0 .949-.684l3-9A1 1 0 0 0 21 5H6.347L5.99 2.85a.993.993 0 0 0-.357-.625A.998.998 0 0 0 4.984 2H3a1 1 0 0 0 0 2h1.153zm3.694 10L6.68 7h12.933l-2.334 7H7.847zM10 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm9 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
						fill="currentColor"
					/>
				</svg>',

                'icon-2' => '
				<svg viewBox="0 0 24 24" fill="none">
					<path
						d="M4 6H20V22H4V6Z"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linejoin="round"
					/>
					<path
						d="M9 9V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V9"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>',

                'icon-3' => '
				<svg viewBox="0 0 24 24" fill="currentColor">
					<path d="M8.5,19A1.5,1.5,0,1,0,10,20.5,1.5,1.5,0,0,0,8.5,19ZM19,16H7a1,1,0,0,1,0-2h8.49121A3.0132,3.0132,0,0,0,18.376,11.82422L19.96143,6.2749A1.00009,1.00009,0,0,0,19,5H6.73907A3.00666,3.00666,0,0,0,3.92139,3H3A1,1,0,0,0,3,5h.92139a1.00459,1.00459,0,0,1,.96142.7251l.15552.54474.00024.00506L6.6792,12.01709A3.00006,3.00006,0,0,0,7,18H19a1,1,0,0,0,0-2ZM17.67432,7l-1.2212,4.27441A1.00458,1.00458,0,0,1,15.49121,12H8.75439l-.25494-.89221L7.32642,7ZM16.5,19A1.5,1.5,0,1,0,18,20.5,1.5,1.5,0,0,0,16.5,19Z"/>
				</svg>',				'icon-4' => '
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M5.6 5.5h12.8A1.6 1.6 0 0 1 20 7.1v9.6A3.3 3.3 0 0 1 16.7 20H7.3A3.3 3.3 0 0 1 4 16.7V7.1a1.6 1.6 0 0 1 1.6-1.6Z"/>
					<path d="M9 9.2a3 3 0 0 0 6 0"/>
				</svg>',

                'icon-5' => '
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M8.6 8.6 10.7 3.6"/>
					<path d="M15.4 8.6 13.3 3.6"/>
					<path d="M2.8 8.6h18.4l-1.6 9.9A2 2 0 0 1 17.6 20.2H6.4a2 2 0 0 1-2-1.7Z"/>
					<path d="M9.2 12.1v4.6"/>
					<path d="M12 12.1v4.6"/>
					<path d="M14.8 12.1v4.6"/>
				</svg>',

                'icon-6' => '
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M2.4 3.4h2.3l2.6 11.4a1.7 1.7 0 0 0 1.7 1.3h8.4a1.7 1.7 0 0 0 1.7-1.3l1.5-6.6H5.9"/>
					<circle cx="9.6" cy="19.6" r="1.5"/>
					<circle cx="17.4" cy="19.6" r="1.5"/>
				</svg>',

            );

            return self::$icons;
        }		/**
         * Allowed SVG tags.
         *
         * @return array
         */
        private static function allowed_svg_tags()
        {

            return array(

                'svg' => array(
                    'xmlns'             => true,
                    'viewBox'           => true,
                    'fill'              => true,
                    'width'             => true,
                    'height'            => true,
                    'stroke'            => true,
                    'stroke-width'      => true,
                    'stroke-linecap'    => true,
                    'stroke-linejoin'   => true,
                    'class'             => true,
                ),

                'path' => array(
                    'd'                 => true,
                    'fill'              => true,
                    'stroke'            => true,
                    'stroke-width'      => true,
                    'stroke-linecap'    => true,
                    'stroke-linejoin'   => true,
                ),

                'circle' => array(
                    'cx'                => true,
                    'cy'                => true,
                    'r'                 => true,
                    'fill'              => true,
                    'stroke'            => true,
                    'stroke-width'      => true,
                ),

                'rect' => array(
                    'x'                 => true,
                    'y'                 => true,
                    'width'             => true,
                    'height'            => true,
                    'rx'                => true,
                    'ry'                => true,
                    'fill'              => true,
                    'stroke'            => true,
                    'stroke-width'      => true,
                ),

                'line' => array(
                    'x1'                => true,
                    'y1'                => true,
                    'x2'                => true,
                    'y2'                => true,
                    'stroke'            => true,
                    'stroke-width'      => true,
                    'stroke-linecap'    => true,
                ),

                'polyline' => array(
                    'points'            => true,
                    'fill'              => true,
                    'stroke'            => true,
                    'stroke-width'      => true,
                    'stroke-linecap'    => true,
                    'stroke-linejoin'   => true,
                ),

                'polygon' => array(
                    'points'            => true,
                    'fill'              => true,
                    'stroke'            => true,
                    'stroke-width'      => true,
                    'stroke-linecap'    => true,
                    'stroke-linejoin'   => true,
                ),

                'g' => array(
                    'fill'              => true,
                    'stroke'            => true,
                    'transform'         => true,
                ),
            );
        }
    }
}
