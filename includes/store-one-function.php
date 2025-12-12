<?php 
if ( ! defined( 'ABSPATH' ) ) exit;

function store_one_normalize_radius( $value ) {

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

function store_one_normalize_color( $value ) {

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
