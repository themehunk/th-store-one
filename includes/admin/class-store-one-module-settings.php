<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Th_Store_One_Module_Settings {

	const OPTION_NAME = 'th_store_one_module_set';

	private static $instance = null;
	private $namespace = 'th-store-one/v1';

	/**
	 * Singleton instance
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_rest' ) );
	}

	/**
	 * No defaults at all
	 */
	public function get_default() {
		return array(); // fully empty
	}

	/**
	 * Read ONLY saved settings (no merging)
	 */
	public function get_saved_settings_only() {
		$data = get_option( self::OPTION_NAME, array() );
		return is_array( $data ) ? $data : array();
	}

	/**
	 * GET: saved + defaults (defaults empty)
	 */
	public function get_settings() {
		$saved    = $this->get_saved_settings_only();
		$defaults = $this->get_default();
		return wp_parse_args( $saved, $defaults ); // basically same as saved
	}

	/**
	 * REST route
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
	 * Permission check
	 */
	public function permissions_check() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'store_one_forbidden',
				__( 'You do not have permission to manage Store One settings.', 'th-store-one' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}
		return true;
	}

	/**
	 * GET module settings
	 */
	public function rest_get( WP_REST_Request $request ) {
		$module = sanitize_key( $request['id'] );

		$saved = $this->get_saved_settings_only();

		// If module has never been saved — return empty object
		$module_data = isset( $saved[ $module ] ) ? $saved[ $module ] : array();

		return rest_ensure_response(
			array(
				'settings' => $module_data,
			)
		);
	}

	/**
	 * POST: Save only this module
	 */
	public function rest_update( WP_REST_Request $request ) {

		$module  = sanitize_key( $request['id'] );
		$params  = $request->get_json_params();
		$payload = isset( $params['settings'] ) ? $params['settings'] : array();

		if ( ! is_array( $payload ) ) {
			return new WP_Error(
				'invalid_format',
				__( 'Settings must be an array.', 'th-store-one' ),
				array( 'status' => 400 )
			);
		}

		// Load saved data only
		$all = $this->get_saved_settings_only();

		// Sanitization example
		if ( $module === 'pre-orders' ) {

			if ( isset( $payload['modes'] ) ) {
				$payload['modes'] = sanitize_text_field( $payload['modes'] );
			}

			if ( isset( $payload['helping_instructions_only_pre_orders'] ) ) {
				$payload['helping_instructions_only_pre_orders'] = wp_kses_post( $payload['helping_instructions_only_pre_orders'] );
			}

			// Rules sanitization (if needed later)
		}

		// Save only this module
		$all[ $module ] = $payload;

		update_option( self::OPTION_NAME, $all );

		return rest_ensure_response(
			array(
				'settings' => $payload,
				'updated'  => true,
			)
		);
	}
}