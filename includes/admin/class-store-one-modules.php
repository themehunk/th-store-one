<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Store_One_Modules {

	const OPTION_NAME = 'store_one_module_option';

	/**
	 * Singleton instance.
	 *
	 * @var Store_One_Modules|null
	 */
	private static $instance = null;

	/**
	 * Get singleton instance.
	 *
	 * @return Store_One_Modules
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest' ) );
	}

	/**
	 * Default module states.
	 *
	 * @return array
	 */
	public function get_default() {
		return array(
			'frequently-bought' => false,
			'bundle-product' => false,
			'buy-to-list' => false,
			'quick-social' => false,
			'product-brand' => false,
			'trust-badges' => false,
		);
	}
	/**
	 * Register option with sanitization.
	 */
	public function register_settings() {
		register_setting(
			'store_one_modules_group',
			self::OPTION_NAME,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize_modules' ),
				'default'           => $this->get_default(),
				'show_in_rest'      => false,
			)
		);
	}

	/**
	 * Sanitize modules before saving.
	 *
	 * @param mixed $value Raw value.
	 * @return array
	 */
	public function sanitize_modules( $value ) {
		$defaults = $this->get_default();
		$clean    = array();

		if ( ! is_array( $value ) ) {
			$value = array();
		}

		foreach ( $defaults as $mod_id => $state ) {
			$clean[ $mod_id ] = ! empty( $value[ $mod_id ] ) ? true : false;
		}

		return $clean;
	}

	/**
	 * Register REST routes for modules.
	 */
	public function register_rest() {

		register_rest_route(
			'store-one/v1',
			'/modules',
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
					'args'                => array(
						'modules' => array(
							'required'          => true,
							'validate_callback' => array( $this, 'validate_modules_param' ),
						),
					),
				),
			)
		);

		/* RESET MODULE ROUTE */
			register_rest_route(
				'store-one/v1',
				'/module/(?P<module>[a-zA-Z0-9-_]+)/reset',
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'rest_reset_module' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				)
			);
	}

	/**
	 * Only admins can manage modules.
	 *
	 * @return true|WP_Error
	 */
	public function permissions_check() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'store_one_forbidden',
				__( 'You do not have permission to manage Store One modules.', 'store-one' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return true;
	}

	/**
	 * Validate modules param.
	 *
	 * @param mixed $value Value.
	 * @return bool|WP_Error
	 */
	public function validate_modules_param( $value ) {
		if ( ! is_array( $value ) ) {
			return new WP_Error(
				'store_one_invalid_param',
				__( 'Modules must be an array.', 'store-one' ),
				array( 'status' => 400 )
			);
		}
		return true;
	}

	/**
	 * REST: GET /store-one/v1/modules
	 */
	public function rest_get() {
		$modules = get_option( self::OPTION_NAME, $this->get_default() );

		// Ensure all default keys exist.
		$modules = wp_parse_args( $modules, $this->get_default() );

		return rest_ensure_response(
			array(
				'modules' => $modules,
			)
		);
	}

	/**
	 * REST: POST /store-one/v1/modules
	 *
	 * @param WP_REST_Request $request Request.
	 */
	public function rest_update( $request ) {
		$modules = $request->get_param( 'modules' );
		$clean   = $this->sanitize_modules( $modules );

		$updated = update_option( self::OPTION_NAME, $clean );

		return rest_ensure_response(
			array(
				'modules' => $clean,
				'updated' => (bool) $updated,
			)
		);
	}
	public function rest_reset_module( $request ) {

	$module = sanitize_text_field( $request['module'] );

	$modules  = get_option( self::OPTION_NAME, $this->get_default() );
	$defaults = $this->get_default();

	if ( ! isset( $defaults[ $module ] ) ) {
		return new WP_Error(
			'store_one_invalid_module',
			__( 'Invalid module.', 'store-one' ),
			array( 'status' => 400 )
		);
	}

	/* reset only this module */
	$modules[ $module ] = $defaults[ $module ];

	update_option( self::OPTION_NAME, $modules );

	return rest_ensure_response(
		array(
			'success'  => true,
			'settings' => array(
				$module => $modules[ $module ],
			),
		)
	);
}
}
