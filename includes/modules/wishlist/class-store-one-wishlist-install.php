<?php

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Installation-related functions and hooks for Store One Wishlist.
 *
 * @class Th_Store_One_Wishlist_Install
 */
class Th_Store_One_Wishlist_Install
{
    public function __construct()
    {
        self::install();
    }

    public static function install()
    {
        self::create_tables();
        self::create_page();
    }

    /**
     * Create database tables if they don't already exist.
     */
    private static function create_tables()
    {

        global $wpdb;

        $wishlist_table = $wpdb->prefix . 'thwl_wishlists';
        $items_table    = $wpdb->prefix . 'thwl_wishlist_items';

        // Check if both tables already exist.
        $wishlist_exists = $wpdb->get_var(
            $wpdb->prepare(
                'SHOW TABLES LIKE %s',
                $wishlist_table
            )
        );

        $items_exists = $wpdb->get_var(
            $wpdb->prepare(
                'SHOW TABLES LIKE %s',
                $items_table
            )
        );

        // Tables already exist, nothing to do.
        if ($wishlist_exists === $wishlist_table && $items_exists === $items_table) {
            return;
        }

        $wpdb->hide_errors();

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $collate = $wpdb->get_charset_collate();

        // Wishlist table.
        $sql = "
		CREATE TABLE {$wishlist_table} (
			id BIGINT(20) NOT NULL AUTO_INCREMENT,
			user_id BIGINT(20) NULL,
			session_id VARCHAR(255) NULL,
			wishlist_name VARCHAR(255) NOT NULL,
			wishlist_token VARCHAR(64) NOT NULL UNIQUE,
			privacy VARCHAR(20) NOT NULL DEFAULT 'private',
			is_default TINYINT(1) NOT NULL DEFAULT 1,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id)
		) {$collate};
		";

        dbDelta($sql);

        // Wishlist items table.
        $sql = "
		CREATE TABLE {$items_table} (
			id BIGINT(20) NOT NULL AUTO_INCREMENT,
			wishlist_id BIGINT(20) NOT NULL,
			product_id BIGINT(20) NOT NULL,
			variation_id BIGINT(20) DEFAULT 0,
			quantity INT(11) NOT NULL DEFAULT 1,
			added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY wishlist_id (wishlist_id),
			KEY product_id (product_id)
		) {$collate};
		";

        dbDelta($sql);
    }

    /**
     * Create wishlist page if it doesn't already exist.
     */
    private static function create_page()
    {

        $page_id = get_option('thwl_page_id');

        if ($page_id && get_post($page_id)) {
            return;
        }

        $page_id = wp_insert_post(
            array(
                'post_title'     => __('Wishlist', 'th-store-one'),
                'post_content'   => '[thwl_wishlist]',
                'post_status'    => 'publish',
                'post_type'      => 'page',
                'comment_status' => 'closed',
            )
        );

        if (! is_wp_error($page_id) && $page_id) {
            update_option('thwl_page_id', $page_id);
        }
    }
}
