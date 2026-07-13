<?php
if (! defined('ABSPATH')) {
    exit;
}

/**
 * – Deactivation Feedback Popup
 * Shows a "Quick Feedback" modal when the user deactivates the plugin,
 * collects the reason, and sends it via REST API before deactivating.
 */

/* =========================================================
 * 1. ENQUEUE SCRIPTS / STYLES on the Plugins admin page
 * ========================================================= */
add_action('admin_enqueue_scripts', 'th_store_one_deactivate_feedback_assets');
function th_store_one_deactivate_feedback_assets($hook)
{
    if ($hook !== 'plugins.php') {
        return;
    }

    wp_enqueue_style(
        'th-store-one-deactivate-feedback-css',
        TH_STORE_ONE_PLUGIN_URL . 'assets/css/deactivate-feedback.css',
        array(),
        TH_STORE_ONE_VERSION
    );
    wp_enqueue_script(
        'th-store-one-deactivate-feedback-js',
        TH_STORE_ONE_PLUGIN_URL . 'assets/js/deactivate-feedback.js',
        array( 'jquery' ),
        TH_STORE_ONE_VERSION,
        true
    );
    $plugin_file = TH_STORE_ONE_PLUGIN_DIR . 'th-store-one.php';
    $plugin_data = get_plugin_data($plugin_file, false, false);

    wp_localize_script('th-store-one-deactivate-feedback-js', 'thStoreOneDeactivate', array(
        'pluginFile'     => 'th-store-one/th-store-one.php',
        'apiUrl'         => rest_url('th-store-one/v1/deactivate-feedback'),
        'nonce'          => wp_create_nonce('wp_rest'),
        'pluginName'     => $plugin_data['Name'],
        'pluginVersion'  => $plugin_data['Version'],
        'i18n'           => array(
            'submitting' => __('Submitting…', 'th-store-one'),
            'submit'     => __('Submit & Deactivate', 'th-store-one'),
        ),
    ));
}

/* =========================================================
 * 2. RENDER MODAL HTML in admin footer (plugins page only)
 * ========================================================= */
add_action('admin_footer', 'th_store_one_deactivate_feedback_modal');
function th_store_one_deactivate_feedback_modal()
{
    global $hook_suffix;
    if ('plugins.php' !== $hook_suffix) {
        return;
    }
    $reasons = array(
        'no_longer_needed'   => __('I no longer need the plugin', 'th-store-one'),
        'found_better'       => __('I found a better plugin', 'th-store-one'),
        'not_working'        => __('I couldn\'t get the plugin to work', 'th-store-one'),
        'temporary'          => __('It\'s a temporary deactivation', 'th-store-one'),
        'missing_feature'    => __('Plugin is missing a required feature', 'th-store-one'),
        'other'              => __('Other', 'th-store-one'),
    );
    ?>
    <div id="th-store-one-deactivate-overlay" class="th-store-one-df-overlay" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="th-store-one-df-title">
        <div class="th-store-one-df-modal">

            <div class="th-store-one-df-header">
                <span class="th-store-one-df-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="20" height="20" rx="4" fill="#e74c3c"/>
                        <text x="10" y="15" text-anchor="middle" font-size="13" font-weight="bold" fill="#fff">!</text>
                    </svg>
                </span>
                <strong id="th-store-one-df-title"><?php esc_html_e('QUICK FEEDBACK', 'th-store-one'); ?></strong>
            </div>

            <div class="th-store-one-df-body">
                <p><?php esc_html_e('If you have a moment, please share why you are deactivating Store One:', 'th-store-one'); ?></p>

                <ul class="th-store-one-df-reasons">
                    <?php foreach ($reasons as $value => $label) : ?>
                        <li>
                            <label>
                                <input type="radio" name="th_store_one_deactivate_reason" value="<?php echo esc_attr($value); ?>" />
                                <span><?php echo esc_html($label); ?></span>
                            </label>
                        </li>
                    <?php endforeach; ?>
                </ul>

                <div class="th-store-one-df-detail" id="th-store-one-df-detail-wrap" style="display:none;">
                    <textarea id="th-store-one-df-detail-text" rows="3" placeholder="<?php esc_attr_e('Please share more details (optional)…', 'th-store-one'); ?>"></textarea>
                </div>
            </div>

            <div class="th-store-one-df-footer">
                <button type="button" id="th-store-one-df-submit" class="button button-primary th-store-one-df-submit-btn">
                    <?php esc_html_e('Submit & Deactivate', 'th-store-one'); ?>
                </button>
                <a href="#" id="th-store-one-df-skip" class="th-store-one-df-skip-link">
                    <?php esc_html_e('Skip & Deactivate', 'th-store-one'); ?>
                </a>
            </div>

        </div>
    </div>
    <?php
}

/* =========================================================
 * 3. REST API ROUTE – receive feedback
 * ========================================================= */
add_action('rest_api_init', 'th_store_one_deactivate_feedback_rest_route');
function th_store_one_deactivate_feedback_rest_route()
{
    register_rest_route('th-store-one/v1', '/deactivate-feedback', array(
        'methods'             => WP_REST_Server::CREATABLE,
        'callback'            => 'th_store_one_rest_save_deactivate_feedback',
        'permission_callback' => function () {
            return current_user_can('manage_options');
        },
        'args' => array(
            'reason' => array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'required'          => true,
            ),
            'details' => array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_textarea_field',
                'default'           => '',
            ),
            'site_url' => array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            ),
            'plugin_version' => array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            ),
            'plugin_name' => array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            ),
        ),
    ));
}

function th_store_one_rest_save_deactivate_feedback($request)
{
    $data = array(
        'reason'         => $request->get_param('reason'),
        'details'        => $request->get_param('details'),
        'site_url'       => $request->get_param('site_url'),
        'plugin_version' => $request->get_param('plugin_version'),
        'plugin_name'    => $request->get_param('plugin_name'),
    );

    // Send to remote ThemeHunk server
    wp_remote_post(
        'https://themehunk.com/wp-json/wp/v2/themehunk/feedback',
        array(
            'method'   => 'POST',
            'timeout'  => 15,
            'blocking' => true,
            'headers'  => array(
                'Content-Type' => 'application/json',
                'Accept'       => 'application/json',
            ),
            'body'     => wp_json_encode($data),
        )
    );

    return rest_ensure_response(array(
        'success' => true,
        'message' => __('Thank you for your feedback!', 'th-store-one'),
    ));
}
