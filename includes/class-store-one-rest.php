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
            '/users',
            array(
                'methods'  => WP_REST_Server::READABLE,
                'callback' => array($this, 'search_users'),
                'permission_callback' => '__return_true',
            )
        );
    }

    public function search_users(WP_REST_Request $request) {

    $search = sanitize_text_field($request->get_param('search'));

    $args = array(
        'search'         => "*{$search}*",
        'search_columns' => array('user_login', 'display_name'),
        'number'         => 20,
    );

    $users = get_users($args);
    $data = array();

    foreach ($users as $user) {
        $data[] = array(
            'id'   => $user->ID,
            'name' => $user->display_name ?: $user->user_login,
        );
    }

    return rest_ensure_response($data);
}

}
