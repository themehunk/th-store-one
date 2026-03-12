<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Store_One_Admin {

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		// global admin css
	     add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_css' ) );
		add_action( 'admin_init', array( $this, 'handle_upgrade_redirect' ) );
	}

	public function register_menu() {
		
		add_menu_page(
			esc_html__( 'Store One', 'store-one' ),
			esc_html__( 'Store One', 'store-one' ),
			'manage_options',
			'store-one',
			array( $this, 'render_admin_page' ),
			STORE_ONE_PLUGIN_URL . 'assets/images/storeone-icon.svg',
			56
		);

		// Dashboard
		add_submenu_page(
			'store-one',
			esc_html__( 'Dashboard', 'store-one' ),
			esc_html__( 'Dashboard', 'store-one' ),
			'manage_options',
			'store-one',
			array( $this, 'render_admin_page' )
		);

		$license_status = false;
	     if ( class_exists( 'StoreOnePro_License' ) ) {
		$license_status = StoreOnePro_License::is_active();
		}
		if ( ! $license_status ) {
			add_submenu_page(
				'store-one',
				esc_html__( 'Upgrade', 'store-one' ),
				'<span class="storeone-upgrade-btn">' . esc_html__( 'Upgrade', 'store-one' ) . '</span>',
				'manage_options',
				'store-one-upgrade',
				'__return_false'
			);

		}
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

	public function handle_upgrade_redirect() {

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( isset( $_GET['page'] ) && 'store-one-upgrade' === $_GET['page'] ) {

		wp_safe_redirect( 'https://themehunk.com' );
		exit;

	}
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
			array(),
			$css_ver
		);

		wp_register_style(
			'store-one-admin-style',
			STORE_ONE_PLUGIN_URL . $css_path_style,
			array( 'wp-components' ),
			$css_path_style_var
		);

		// IMPORTANT: apiFetch({ path })
		
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
				'homeUrl' => home_url('/'), 
				'adminUrl' => admin_url(),
			)
		);

		wp_enqueue_script( 'store-one-admin' );
		wp_enqueue_style( 'store-one-admin' );
		wp_enqueue_style( 'store-one-admin-style' );
	}

	public function enqueue_admin_css() {

	$css_path = 'assets/css/storeone-admin.css';

	$css_ver = file_exists( STORE_ONE_PLUGIN_DIR . $css_path )
		? filemtime( STORE_ONE_PLUGIN_DIR . $css_path )
		: STORE_ONE_VERSION;

	wp_enqueue_style(
		'storeone-admin-menu',
		STORE_ONE_PLUGIN_URL . $css_path,
		array(),
		$css_ver
	);
}
}