<?php 
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
if ( class_exists( 'WC_Product_Simple' ) && ! class_exists( 'WC_Product_StoreOne_Bundle' ) ) {

			class WC_Product_StoreOne_Bundle extends WC_Product_Simple {

				protected $product_type = array( 'product_type' => 'storeone_bundle' ); // safe fallback

				public function __construct( $product = 0 ) {
					parent::__construct( $product );
					$this->product_type = 'storeone_bundle';
				}

				public function get_type() {
					return 'storeone_bundle';
				}

				public function is_purchasable() {
					return true;
				}

				public function is_virtual() {
					return true;
				}

				public function is_in_stock() {
					return true;
				}

				public function get_price( $context = 'view' ) {
					$price = parent::get_price( $context );
					return '' === $price ? '0' : $price;
				}
			
			}
}