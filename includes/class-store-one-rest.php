<?php
if (!defined('ABSPATH')) exit;

class Store_One_REST {

    private $namespace = 'store-one/v1';

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {

        register_rest_route(
            $this->namespace,
            '/modules',
            array(
                'methods'  => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_modules'),
                'permission_callback' => function() {
                    return current_user_can('manage_options');
                }
            )
        );

        register_rest_route(
            $this->namespace,
            '/modules',
            array(
                'methods'  => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'update_modules'),
                'permission_callback' => function() {
                    return current_user_can('manage_options');
                }
            )
        );
    }

    public function get_modules() {
        $modules = get_option('store_one_module_option', array());

        return rest_ensure_response(array(
            'modules' => $modules,
        ));
    }

    public function update_modules($request) {
        $modules = $request->get_param('modules');

        $clean = array();
        foreach ($modules as $key => $value) {
            $clean[$key] = !empty($value) ? true : false;
        }

        update_option('store_one_module_option', $clean, false);

        return rest_ensure_response(array(
            'modules' => $clean,
            'updated' => true,
        ));
    }
}
