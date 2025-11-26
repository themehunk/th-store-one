<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Store_One_Module_Settings {

	const OPTION_NAME = 'store_one_module_set';

	/**
	 * Singleton.
	 *
	 * @var Store_One_Module_Settings|null
	 */
	private static $instance = null;

	/**
	 * REST namespace.
	 *
	 * @var string
	 */
	private $namespace = 'store-one/v1';

	/**
	 * Get instance.
	 *
	 * @return Store_One_Module_Settings
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_rest' ) );
	}

	/**
	 * Default settings for ALL modules.
	 *
	 * Yeh sirf skeleton hai. Baad me aur fields add kar sakte ho.
	 *
	 * @return array
	 */
	public function get_default() {
		return array(
			'pre-orders'           => array(
				'rules'  => array(), // yaha tumhara bada rules array jaayega.
				'modes'  => 'unified_order',
				// extra helping instructions bhi yahi add kar sakte ho:
				'helping_instructions_only_pre_orders' => '',
			),
			'frequently-bought'    => array(
				'offers'       => array(),
				'use_shortcode' => 0,
			),
			'quick-view'           => array(
				'button_type'   => 'icon-text',
				'button_text'   => 'Quick view',
				'modal_width'   => 900,
				'modal_height'  => 500,
			),
               'cart' => [
                    'cart_position' => 'right',
                    'animation'     => 'slide',
                    'show_subtotal' => true,
                    'button_text'   => 'Checkout Now',
               ],
		);
	}

	/**
	 * Read full settings.
	 *
	 * @return array
	 */
	public function get_settings() {
		$stored = get_option( self::OPTION_NAME, array() );

		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		// Default se merge.
		return wp_parse_args( $stored, $this->get_default() );
	}

	/**
	 * Register REST routes: /wp-json/store-one/v1/module/<id>
	 */
	public function register_rest() {
		register_rest_route(
			$this->namespace,
			'/module/(?P<id>[a-zA-Z0-9\-_]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'rest_get' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'rest_update' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	/**
	 * Basic permission check.
	 *
	 * @return true|WP_Error
	 */
	public function permissions_check() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'store_one_forbidden',
				__( 'You do not have permission to manage Store One settings.', 'store-one' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return true;
	}

	/**
	 * GET: Return settings for one module.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function rest_get( WP_REST_Request $request ) {
		$module = sanitize_key( $request['id'] ); // "pre-orders" etc.

		$all = $this->get_settings();

		if ( ! isset( $all[ $module ] ) ) {
			return new WP_Error(
				'module_not_found',
				__( 'Module not found.', 'store-one' ),
				array( 'status' => 404 )
			);
		}

		return rest_ensure_response(
			array(
				'settings' => $all[ $module ],
			)
		);
	}

	/**
	 * POST: Update one module settings.
	 *
	 * Body: { "settings": { ... } }
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function rest_update( WP_REST_Request $request ) {
		$module  = sanitize_key( $request['id'] );
		$params  = $request->get_json_params();
		$payload = isset( $params['settings'] ) ? $params['settings'] : array();

		if ( ! is_array( $payload ) ) {
			return new WP_Error(
				'invalid_format',
				__( 'Settings must be an array.', 'store-one' ),
				array( 'status' => 400 )
			);
		}

		$all = $this->get_settings();

		if ( ! isset( $all[ $module ] ) ) {
			return new WP_Error(
				'module_not_found',
				__( 'Module not found.', 'store-one' ),
				array( 'status' => 404 )
			);
		}

		// Defaults se merge + sanitize:
		$defaults     = $this->get_default();
		$module_defaults = isset( $defaults[ $module ] ) ? $defaults[ $module ] : array();

		// Simple merge (agar strict sanitization chahiye to yaha per-field kare).
		$merged = array_merge( $module_defaults, $all[ $module ], $payload );

		// Example: simple sanitization for some fields (pre-orders case).
		if ( 'pre-orders' === $module ) {
			if ( isset( $merged['modes'] ) ) {
				$merged['modes'] = sanitize_text_field( $merged['modes'] );
			}
			if ( isset( $merged['helping_instructions_only_pre_orders'] ) ) {
				$merged['helping_instructions_only_pre_orders'] = wp_kses_post( $merged['helping_instructions_only_pre_orders'] );
			}
			// rules array ko as-is store kar sakte ho (ya baad me deep sanitize).
		}

		$all[ $module ] = $merged;

		update_option( self::OPTION_NAME, $all );

		return rest_ensure_response(
			array(
				'settings' => $merged,
				'updated'  => true,
			)
		);
	}
}
