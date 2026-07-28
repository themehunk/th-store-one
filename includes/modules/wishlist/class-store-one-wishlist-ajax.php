<?php

/**
 * Wishlist AJAX Handler
 *
 * @package Store One
 */

if (! defined('ABSPATH')) {
    exit;
}

class Th_Store_One_Wishlist_Ajax
{
    /**
     * Constructor.
     */
    private $settings = array();
    public function __construct($settings)
    {

        $this->settings = $settings;

        add_action(
            'wp_ajax_store_one_add_to_wishlist',
            array( $this, 'add_to_wishlist' )
        );

        add_action(
            'wp_ajax_nopriv_store_one_add_to_wishlist',
            array( $this, 'add_to_wishlist' )
        );

        add_action(
            'wp_ajax_store_one_remove_from_wishlist',
            array( $this, 'remove_from_wishlist' )
        );

        add_action(
            'wp_ajax_store_one_update_item_quantity',
            array( $this, 'update_item_quantity' )
        );

        add_action(
            'wp_ajax_store_one_add_all_to_cart',
            array( $this, 'add_all_to_cart' )
        );

        add_action(
            'wp_ajax_nopriv_store_one_add_all_to_cart',
            array( $this, 'add_all_to_cart' )
        );

        add_action(
            'wp_ajax_store_one_add_to_cart_and_manage',
            array( $this, 'add_to_cart_and_manage' )
        );

        add_action(
            'wp_ajax_nopriv_store_one_add_to_cart_and_manage',
            array( $this, 'add_to_cart_and_manage' )
        );
    }

    /**
     * Add product to wishlist.
     */
    public function add_to_wishlist()
    {
        if (
            ! empty($this->settings['thw_require_login']) &&
            ! is_user_logged_in()
        ) {

            wp_send_json_error(
                array(
                    'message' => 'login_required',
                )
            );
        }

        check_ajax_referer(
            'store-one-add-nonce',
            'nonce'
        );

        $product_id = isset($_POST['product_id'])
            ? absint(wp_unslash($_POST['product_id']))
            : 0;

        if (! $product_id) {

            wp_send_json_error(
                array(
                    'message' => 'invalid_product',
                )
            );
        }

        $wishlist = Th_Store_One_Wishlist_Data::get_or_create_wishlist();

        if (! $wishlist) {

            wp_send_json_error(
                array(
                    'message' => 'wishlist_not_found',
                )
            );
        }

        $result = Th_Store_One_Wishlist_Data::add_item(
            $wishlist->id,
            $product_id
        );

        if ($result) {

            wp_send_json_success(
                array(
                    'message' => 'added',
                )
            );
        }

        wp_send_json_error(
            array(
                'message' => 'failed',
            )
        );
    }
    /**
     * Remove product from wishlist.
     *
     * @return void
     */
    public function remove_from_wishlist()
    {

        check_ajax_referer(
            'store-one-remove-nonce',
            'nonce'
        );

        $item_id = isset($_POST['item_id'])
            ? absint(wp_unslash($_POST['item_id']))
            : 0;

        if (! $item_id) {

            wp_send_json_error(
                array(
                    'message' => 'invalid_item',
                )
            );
        }

        $item = Th_Store_One_Wishlist_Data::get_item($item_id);

        if (! $item) {

            wp_send_json_error(
                array(
                    'message' => 'item_not_found',
                )
            );
        }

        $wishlist = Th_Store_One_Wishlist_Data::get_wishlist_by_id(
            $item->wishlist_id
        );

        if (! $wishlist) {

            wp_send_json_error(
                array(
                    'message' => 'wishlist_not_found',
                )
            );
        }

        $current_user_id = get_current_user_id();

        $guest_token = isset($_COOKIE['thwl_guest_uniqid'])
            ? sanitize_text_field(
                wp_unslash($_COOKIE['thwl_guest_uniqid'])
            )
            : '';

        // Logged-in owner.
        if (
            $wishlist->user_id &&
            (int) $wishlist->user_id === (int) $current_user_id
        ) {

            $owner_id = $current_user_id;

        } elseif (
            $wishlist->session_id &&
            $wishlist->session_id === $guest_token
        ) {

            // Guest owner.
            $owner_id = 0;

        } else {

            wp_send_json_error(
                array(
                    'message' => 'unauthorized',
                )
            );
        }

        $result = Th_Store_One_Wishlist_Data::remove_item(
            $item_id,
            $owner_id,
            $guest_token
        );

        if ($result) {

            wp_send_json_success(
                array(
                    'message' => 'removed',
                )
            );
        }

        wp_send_json_error(
            array(
                'message' => 'remove_failed',
            )
        );
    }
    /**
     * Update wishlist item quantity.
     *
     * @return void
     */
    public function update_item_quantity()
    {

        if (! is_user_logged_in()) {

            wp_send_json_error(
                array(
                    'message' => 'not_logged_in',
                )
            );
        }

        check_ajax_referer(
            'store-one-update-qty-nonce',
            'nonce'
        );

        $item_id = isset($_POST['item_id'])
            ? absint(wp_unslash($_POST['item_id']))
            : 0;

        $quantity = isset($_POST['quantity'])
            ? absint(wp_unslash($_POST['quantity']))
            : 1;

        if (! $item_id || $quantity < 1) {

            wp_send_json_error(
                array(
                    'message' => 'invalid_input',
                )
            );
        }

        $item = Th_Store_One_Wishlist_Data::get_item($item_id);

        if (! $item) {

            wp_send_json_error(
                array(
                    'message' => 'item_not_found',
                )
            );
        }

        $wishlist = Th_Store_One_Wishlist_Data::get_wishlist_by_id(
            $item->wishlist_id
        );

        if (! $wishlist) {

            wp_send_json_error(
                array(
                    'message' => 'wishlist_not_found',
                )
            );
        }

        $current_user_id = get_current_user_id();

        $guest_token = isset($_COOKIE['thwl_guest_uniqid'])
            ? sanitize_text_field(
                wp_unslash($_COOKIE['thwl_guest_uniqid'])
            )
            : '';

        // Logged-in owner.
        if ($wishlist->user_id) {

            if ((int) $wishlist->user_id !== (int) $current_user_id) {

                wp_send_json_error(
                    array(
                        'message' => 'unauthorized',
                    )
                );
            }

        } elseif ($wishlist->session_id) {

            // Guest owner.
            if (
                empty($guest_token) ||
                $wishlist->session_id !== $guest_token
            ) {

                wp_send_json_error(
                    array(
                        'message' => 'unauthorized',
                    )
                );
            }

        } else {

            wp_send_json_error(
                array(
                    'message' => 'invalid_wishlist_owner',
                )
            );
        }

        $result = Th_Store_One_Wishlist_Data::update_item_quantity(
            $item_id,
            $quantity
        );

        if (false !== $result) {

            wp_send_json_success(
                array(
                    'message' => 'updated',
                )
            );
        }

        wp_send_json_error(
            array(
                'message' => 'update_failed',
            )
        );
    }	/**
     * Add selected wishlist items to cart.
     *
     * @return void
     */
    public function add_all_to_cart()
    {

        if (! is_user_logged_in()) {

            wp_send_json_error(
                array(
                    'message' => 'not_logged_in',
                )
            );
        }

        check_ajax_referer(
            'store-one-add-all-nonce',
            'nonce'
        );

        $item_ids = isset($_POST['items'])
            ? array_map(
                'absint',
                wp_unslash($_POST['items'])
            )
            : array();

        if (empty($item_ids)) {

            wp_send_json_error(
                array(
                    'message' => 'no_items_selected',
                )
            );
        }

        $added_count     = 0;
        $current_user_id = get_current_user_id();

        $guest_token = isset($_COOKIE['thwl_guest_uniqid'])
            ? sanitize_text_field(
                wp_unslash($_COOKIE['thwl_guest_uniqid'])
            )
            : '';

        foreach ($item_ids as $item_id) {

            $item = Th_Store_One_Wishlist_Data::get_item($item_id);

            if (! $item) {
                continue;
            }

            $wishlist = Th_Store_One_Wishlist_Data::get_wishlist_by_id(
                $item->wishlist_id
            );

            if (! $wishlist) {
                continue;
            }

            // Ownership validation.
            if ($wishlist->user_id) {

                if ((int) $wishlist->user_id !== (int) $current_user_id) {
                    continue;
                }

            } elseif ($wishlist->session_id) {

                if (
                    empty($guest_token) ||
                    $wishlist->session_id !== $guest_token
                ) {
                    continue;
                }

            } else {
                continue;
            }

            $result = WC()->cart->add_to_cart(
                $item->product_id,
                $item->quantity,
                $item->variation_id
            );

            if ($result) {
                ++$added_count;
            }
        }

        if ($added_count > 0) {

            wp_send_json_success(
                array(
                    'message'     => __('Products added to cart.', 'th-store-one'),
                    'added_count' => $added_count,
                )
            );
        }

        wp_send_json_error(
            array(
                'message' => 'failed_to_add',
            )
        );
    }
    /**
     * Add product to cart and manage wishlist.
     *
     * @return void
     */
    public function add_to_cart_and_manage()
    {

        check_ajax_referer(
            'store-one-wishlist-redirect-nonce',
            'nonce'
        );

        $product_id = isset($_POST['product_id'])
            ? absint(wp_unslash($_POST['product_id']))
            : 0;

        $quantity = isset($_POST['quantity'])
            ? max(1, absint(wp_unslash($_POST['quantity'])))
            : 1;

        $item_id = isset($_POST['item_id'])
            ? absint(wp_unslash($_POST['item_id']))
            : 0;

        if (! $product_id || ! $item_id) {

            wp_send_json_error(
                array(
                    'message' => 'invalid_input',
                )
            );
        }

        $product = wc_get_product($product_id);

        if (! $product || ! $product->is_purchasable()) {

            wp_send_json_error(
                array(
                    'message' => 'not_purchasable',
                )
            );
        }

        if (! $product->is_in_stock()) {

            wp_send_json_error(
                array(
                    'message' => 'out_of_stock',
                )
            );
        }

        // Add product to cart.
        WC()->cart->add_to_cart(
            $product_id,
            $quantity
        );

        // Guests: don't remove DB item.
        if (! is_user_logged_in()) {

            wp_send_json_success(
                array(
                    'message'  => 'added_to_cart',
                    'cart_url' => wc_get_cart_url(),
                )
            );
        }

        $item = Th_Store_One_Wishlist_Data::get_item(
            $item_id
        );

        if (! $item) {

            wp_send_json_error(
                array(
                    'message' => 'item_not_found',
                )
            );
        }

        $wishlist = Th_Store_One_Wishlist_Data::get_wishlist_by_id(
            $item->wishlist_id
        );

        if (! $wishlist) {

            wp_send_json_error(
                array(
                    'message' => 'wishlist_not_found',
                )
            );
        }

        if (
            (int) $wishlist->user_id !==
            (int) get_current_user_id()
        ) {

            wp_send_json_error(
                array(
                    'message' => 'unauthorized',
                )
            );
        }



        if (
            ! empty($this->settings['thw_redirect_to_cart'])
        ) {

            Th_Store_One_Wishlist_Data::remove_item(
                $item_id
            );
        }

        wp_send_json_success(
            array(
                'message'  => 'added_to_cart',
                'cart_url' => wc_get_cart_url(),
            )
        );
    }
}
