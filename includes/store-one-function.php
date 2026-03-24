<?php 
if ( ! defined( 'ABSPATH' ) ) exit;

function th_store_one_normalize_radius( $value ) {

    if ( empty( $value ) ) {
        return '0px';
    }

    // If responsive object from JS
    if ( is_array( $value ) ) {
        return $value['Desktop']
            ?? $value['Tablet']
            ?? $value['Mobile']
            ?? '0px';
    }

    // If simple string ("15px")
    return $value;
}

function th_store_one_normalize_color( $value ) {

    // If empty fallback
    if ( empty( $value ) ) {
        return '';
    }

    // If THBackgroundControl gives array
    if ( is_array( $value ) && ! empty( $value['value'] ) ) {
        return $value['value']; // actual color / gradient
    }

    return $value; // simple string color
}

function th_store_one_get_hook_from_placement( $placement ) {

    $allowed_hooks = [
        'woocommerce_single_product_summary',
        'woocommerce_before_add_to_cart_form',
        'woocommerce_after_add_to_cart_form',
        'woocommerce_product_meta_start',
        'woocommerce_product_meta_end',
        'woocommerce_after_single_product_summary',
    ];

    if ( in_array( $placement, $allowed_hooks, true ) ) {
        return $placement;
    }

    // fallback
    return 'woocommerce_after_single_product_summary';
}

function th_store_one_with_unit( $val, $unit = 'px' ) {

    if ( $val === null || $val === '' ) {
        return null;
    }

    // already has unit (px, %, em, rem etc.)
    if ( is_string($val) && preg_match('/[a-z%]+$/i', $val) ) {
        return $val;
    }

    return $val . $unit;
}