<?php

if (! defined('ABSPATH')) {
    exit;
}

class TH_Store_One_Pre_Order_Status
{
    /**
     * Constructor
     */
    public function __construct()
    {

        /* =========================
         * REGISTER STATUS
         * ========================= */

        add_action(
            'init',
            [ $this, 'register_status' ]
        );

        add_filter(
            'wc_order_statuses',
            [ $this, 'add_status' ]
        );

        /* =========================
         * AUTO PREORDER STATUS
         * ========================= */

        add_action(
            'woocommerce_order_status_pending',
            [ $this, 'maybe_set_preorder_status' ],
            999,
            2
        );

        add_action(
            'woocommerce_order_status_processing',
            [ $this, 'maybe_set_preorder_status' ],
            999,
            2
        );

        add_action(
            'woocommerce_order_status_on-hold',
            [ $this, 'maybe_set_preorder_status' ],
            999,
            2
        );

        add_action(
            'woocommerce_order_status_completed',
            [ $this, 'maybe_set_preorder_status' ],
            999,
            2
        );

        /* =========================
         * HPOS BULK ACTIONS
         * ========================= */

        add_filter(
            'bulk_actions-woocommerce_page_wc-orders',
            [ $this, 'bulk_actions' ]
        );

        add_filter(
            'handle_bulk_actions-woocommerce_page_wc-orders',
            [ $this, 'handle_bulk_actions' ],
            10,
            3
        );

        /* =========================
         * LEGACY BULK ACTIONS
         * ========================= */

        add_filter(
            'bulk_actions-edit-shop_order',
            [ $this, 'bulk_actions' ]
        );

        add_filter(
            'handle_bulk_actions-edit-shop_order',
            [ $this, 'handle_bulk_actions' ],
            10,
            3
        );
    }

    /* =========================
     * REGISTER STATUS
     * ========================= */

    public function register_status()
    {

        register_post_status(
            'wc-preordered',
            [
                'label' => _x(
                    'Pre Ordered',
                    'Order status',
                    'th-store-one'
                ),

                'public' => true,

                'exclude_from_search' => false,

                'show_in_admin_all_list' => true,

                'show_in_admin_status_list' => true,

                'label_count' => _n_noop(
                    'Pre Ordered <span class="count">(%s)</span>',
                    'Pre Ordered <span class="count">(%s)</span>',
                    'th-store-one'
                ),
            ]
        );
    }

    /* =========================
     * ADD STATUS
     * ========================= */

    public function add_status(
        $statuses
    ) {

        $new_statuses = [];

        foreach (
            $statuses as $key => $label
        ) {

            $new_statuses[ $key ] = $label;

            if (
                'wc-processing' === $key
            ) {

                $new_statuses[
                    'wc-preordered'
                ] = _x(
                    'Pre Ordered',
                    'Order status',
                    'th-store-one'
                );
            }
        }

        return $new_statuses;
    }

    /* =========================
     * AUTO STATUS
     * ========================= */

    public function maybe_set_preorder_status(
        $order_id,
        $order
    ) {

        if (
            ! $order instanceof WC_Order
        ) {

            $order = wc_get_order(
                $order_id
            );
        }

        if (! $order) {
            return;
        }

        /* avoid loops */
        if (
            'preordered'
            === $order->get_status()
        ) {
            return;
        }

        $has_preorder = false;

        foreach (
            $order->get_items() as $item
        ) {

            $meta = $item->get_meta(
                '_th_preorder',
                true
            );

            print_r($meta);

            if (
                empty($meta)
            ) {
                continue;
            }

            $has_preorder = true;

            break;
        }

        if (! $has_preorder) {
            return;
        }

        /* remove hooks to avoid loops */

        remove_action(
            'woocommerce_order_status_pending',
            [ $this, 'maybe_set_preorder_status' ],
            999
        );

        remove_action(
            'woocommerce_order_status_processing',
            [ $this, 'maybe_set_preorder_status' ],
            999
        );

        remove_action(
            'woocommerce_order_status_on-hold',
            [ $this, 'maybe_set_preorder_status' ],
            999
        );

        remove_action(
            'woocommerce_order_status_completed',
            [ $this, 'maybe_set_preorder_status' ],
            999
        );

        $order->update_status(
            'preordered'
        );
    }

    /* =========================
     * BULK ACTIONS
     * ========================= */

    public function bulk_actions(
        $actions
    ) {

        $actions[
            'mark_preordered'
        ] = __(
            'Change status to Pre Ordered',
            'th-store-one'
        );

        return $actions;
    }

    /* =========================
     * HANDLE BULK ACTIONS
     * ========================= */

    public function handle_bulk_actions(
        $redirect,
        $action,
        $order_ids
    ) {

        if (
            'mark_preordered'
            !== $action
        ) {
            return $redirect;
        }

        foreach (
            $order_ids as $order_id
        ) {

            $order = wc_get_order(
                $order_id
            );

            if (! $order) {
                continue;
            }

            $order->update_status(
                'preordered'
            );
        }

        return $redirect;
    }
}

new TH_Store_One_Pre_Order_Status();
