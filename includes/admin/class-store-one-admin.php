<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Store_One_Admin {

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	public function register_menu() {

		add_menu_page(
			__( 'Store One', 'store-one' ),
			__( 'Store One', 'store-one' ),
			'manage_options',
			'store-one',
			array( $this, 'render_admin_page' ),
			'dashicons-store',
			56
		);

		add_submenu_page(
			'store-one',
			__( 'Dashboard', 'store-one' ),
			__( 'Dashboard', 'store-one' ),
			'manage_options',
			'store-one',
			array( $this, 'render_admin_page' )
		);
	}

	public function render_admin_page() {

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'store-one' ) );
		}
		?>
		<div class="wrap store-one-wrap">
			<h1 class="screen-reader-text">
				<?php echo esc_html__( 'Store One Dashboard', 'store-one' ); ?>
			</h1>
			<div id="store-one-admin-app" aria-label="<?php echo esc_attr__( 'Store One Dashboard', 'store-one' ); ?>"></div>
		</div>
		<?php
	}

	public function enqueue_assets( $hook ) {

		if ( ! in_array( $hook, array( 'toplevel_page_store-one', 'store-one_page_store-one' ), true ) ) {
			return;
		}

		$js_path  = 'build/admin/index.js';
		$css_path = 'build/admin/index.css';
		$css_path_style = 'build/admin/style-index.css';

		$js_ver  = file_exists( STORE_ONE_PLUGIN_DIR . $js_path ) ? filemtime( STORE_ONE_PLUGIN_DIR . $js_path ) : STORE_ONE_VERSION;
		$css_ver = file_exists( STORE_ONE_PLUGIN_DIR . $css_path ) ? filemtime( STORE_ONE_PLUGIN_DIR . $css_path ) : STORE_ONE_VERSION;
		$css_path_style_var = file_exists( STORE_ONE_PLUGIN_DIR . $css_path_style ) ? filemtime( STORE_ONE_PLUGIN_DIR . $css_path_style ) : STORE_ONE_VERSION;

		wp_register_script(
			'store-one-admin',
			STORE_ONE_PLUGIN_URL . $js_path,
			array( 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n' ),
			$js_ver,
			true
		);

		wp_register_style(
			'store-one-admin',
			STORE_ONE_PLUGIN_URL . $css_path,
			array( 'wp-components' ),
			$css_ver
		);

			wp_register_style(
			'store-one-admin-style',
			STORE_ONE_PLUGIN_URL . $css_path_style,
			array( 'wp-components' ),
			$css_path_style_var
		);

		// IMPORTANT: apiFetch({ path }) me sirf relative path jata hai,
		// isliye yahan domain ke bina sirf "namespace/version" de rahe hain.
		wp_localize_script(
			'store-one-admin',
			'StoreOneAdmin',
			array(
				// e.g. "store-one/v1/"
				'restUrl' => 'store-one/v1/',

				// Nonce for REST security.
				'nonce'   => wp_create_nonce( 'wp_rest' ),

				'i18n'    => array(
					'saveSuccess' => esc_html__( 'Settings saved successfully.', 'store-one' ),
					'saveError'   => esc_html__( 'Failed to save settings. Please try again.', 'store-one' ),
				),
			)
		);

		wp_enqueue_script( 'store-one-admin' );
		wp_enqueue_style( 'store-one-admin' );
		wp_enqueue_style( 'store-one-admin-style' );
	}
}