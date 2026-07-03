<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Th_Store_One_Smart_Offers_Frontend {

	private $rules      = [];
	private $processing = false;

	public function __construct() {

		$modules = get_option( 'th_store_one_module_option', [] );
		if ( empty( $modules['smart-offers'] ) ) {
			return;
		}

		$all          = get_option( 'th_store_one_module_set', [] );
		$this->rules  = $all['smart-offers']['rules'] ?? [];

		if ( empty( $this->rules ) ) {
			return;
		}

		add_action( 'woocommerce_add_to_cart', [ $this, 'on_add_to_cart' ], 20, 6 );
		add_action( 'woocommerce_before_calculate_totals', [ $this, 'set_free_prices' ], 20 );
		add_filter( 'woocommerce_cart_item_price', [ $this, 'render_free_price' ], 10, 3 );
		add_filter( 'woocommerce_cart_item_subtotal', [ $this, 'render_free_subtotal' ], 10, 3 );
		add_filter( 'woocommerce_cart_item_name', [ $this, 'render_bogo_badge' ], 10, 3 );
		add_action( 'woocommerce_remove_cart_item', [ $this, 'on_remove_cart_item' ], 10, 2 );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ] );
	}

	public function enqueue_assets() {
		wp_enqueue_style(
			'th-smart-offers',
			TH_STORE_ONE_PLUGIN_URL . 'assets/css/smart-offers.css',
			[],
			TH_STORE_ONE_VERSION
		);
	}

	/* ========================================
	   ADD TO CART HOOK
	======================================== */

	public function on_add_to_cart( $cart_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data ) {

		if ( $this->processing ) {
			return;
		}

		// Never treat a free-offer item as a trigger.
		if ( ! empty( $cart_item_data['_th_smart_offer_free'] ) ) {
			return;
		}

		foreach ( $this->rules as $rule ) {

			if ( ( $rule['status'] ?? '' ) !== 'active' ) {
				continue;
			}

			$type = $rule['rule_type'] ?? 'bogo';

			if ( $type === 'bogo' ) {
				$this->apply_bogo( $rule, $product_id, $cart_key );
			} elseif ( $type === 'buyxgety' ) {
				$this->apply_buyxgety( $rule, $product_id, $cart_key );
			}
		}
	}

	/* ========================================
	   BOGO  (Buy X Get X — same product free)
	======================================== */

	private function apply_bogo( $rule, $product_id, $trigger_key ) {

		if ( ! $this->matches_bogo( $product_id, $rule ) ) {
			return;
		}

		$rule_id = $rule['flexible_id'] ?? '';

		// Already have a free item for this exact trigger cart row + rule?
		foreach ( WC()->cart->get_cart() as $item ) {
			if ( ! empty( $item['_th_smart_offer_free'] )
				&& ( $item['_th_smart_offer_rule_id'] ?? '' ) === $rule_id
				&& ( $item['_th_smart_offer_trigger_key'] ?? '' ) === $trigger_key ) {
				return;
			}
		}

		$product = wc_get_product( $product_id );
		if ( ! $product || ! $product->is_purchasable() ) {
			return;
		}

		$original = (float) ( $product->get_regular_price() ?: $product->get_price() );
		$this->add_free_item( $product_id, 1, $trigger_key, $rule, $original );
	}

	/* ========================================
	   BUY X GET Y
	======================================== */

	private function apply_buyxgety( $rule, $product_id, $trigger_key ) {

		if ( ! $this->matches_x_product( $product_id, $rule ) ) {
			return;
		}

		$x_qty     = max( 1, (int) ( $rule['x_quantity'] ?? 1 ) );
		$cart_qty  = $this->count_x_in_cart( $rule );

		if ( $cart_qty < $x_qty ) {
			return;
		}

		$y_id = $this->resolve_y_product( $rule, $product_id );
		if ( ! $y_id ) {
			return;
		}

		$rule_id = $rule['flexible_id'] ?? '';

		// Only one free reward per rule.
		foreach ( WC()->cart->get_cart() as $item ) {
			if ( ! empty( $item['_th_smart_offer_free'] )
				&& ( $item['_th_smart_offer_rule_id'] ?? '' ) === $rule_id ) {
				return;
			}
		}

		$y_product = wc_get_product( $y_id );
		if ( ! $y_product || ! $y_product->is_purchasable() ) {
			return;
		}

		$original = (float) ( $y_product->get_regular_price() ?: $y_product->get_price() );
		$y_qty    = max( 1, (int) ( $rule['y_quantity'] ?? 1 ) );
		$this->add_free_item( $y_id, $y_qty, $trigger_key, $rule, $original );
	}

	/* ========================================
	   ADD FREE ITEM TO CART
	======================================== */

	private function add_free_item( $product_id, $qty, $trigger_key, $rule, $original_price ) {

		$this->processing = true;

		WC()->cart->add_to_cart(
			$product_id,
			$qty,
			0,
			[],
			[
				'_th_smart_offer_free'           => '1',
				'_th_smart_offer_trigger_key'    => $trigger_key,
				'_th_smart_offer_rule_id'        => $rule['flexible_id'] ?? '',
				'_th_smart_offer_original_price' => $original_price,
				'_th_smart_offer_label'          => $rule['title'] ?? 'BOGO Sale',
				'_th_smart_offer_rule_type'      => $rule['rule_type'] ?? 'bogo',
			]
		);

		$this->processing = false;
	}

	/* ========================================
	   REMOVE LINKED FREE ITEM
	======================================== */

	public function on_remove_cart_item( $cart_key, $cart ) {

		foreach ( $cart->get_cart() as $key => $item ) {
			if ( ! empty( $item['_th_smart_offer_free'] )
				&& ( $item['_th_smart_offer_trigger_key'] ?? '' ) === $cart_key ) {
				$cart->remove_cart_item( $key );
				break;
			}
		}
	}

	/* ========================================
	   ZERO OUT FREE ITEM PRICES
	======================================== */

	public function set_free_prices( $cart ) {

		if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
			return;
		}

		foreach ( $cart->get_cart() as $item ) {
			if ( ! empty( $item['_th_smart_offer_free'] ) ) {
				$item['data']->set_price( 0 );
			}
		}
	}

	/* ========================================
	   CART DISPLAY — PRICE COLUMN
	======================================== */

	public function render_free_price( $html, $cart_item, $cart_item_key ) {

		if ( empty( $cart_item['_th_smart_offer_free'] ) ) {
			return $html;
		}

		$orig = (float) ( $cart_item['_th_smart_offer_original_price'] ?? 0 );

		return '<del class="th-so-orig">' . wc_price( $orig ) . '</del>'
			. '<span class="th-so-free">' . esc_html__( 'FREE', 'th-store-one' ) . '</span>';
	}

	/* ========================================
	   CART DISPLAY — SUBTOTAL COLUMN
	======================================== */

	public function render_free_subtotal( $html, $cart_item, $cart_item_key ) {

		if ( empty( $cart_item['_th_smart_offer_free'] ) ) {
			return $html;
		}

		$orig = (float) ( $cart_item['_th_smart_offer_original_price'] ?? 0 );
		$qty  = (int) ( $cart_item['quantity'] ?? 1 );

		return '<del class="th-so-orig">' . wc_price( $orig * $qty ) . '</del>'
			. '<span class="th-so-free">' . esc_html__( 'FREE', 'th-store-one' ) . '</span>';
	}

	/* ========================================
	   CART DISPLAY — OFFER LABEL BELOW NAME
	======================================== */

	public function render_bogo_badge( $name, $cart_item, $cart_item_key ) {

		if ( empty( $cart_item['_th_smart_offer_free'] ) ) {
			return $name;
		}

		$rule_type = $cart_item['_th_smart_offer_rule_type'] ?? 'bogo';
		$label     = $cart_item['_th_smart_offer_label'] ?? 'BOGO Sale';
		$orig      = (float) ( $cart_item['_th_smart_offer_original_price'] ?? 0 );

		$type_tag = $rule_type === 'buyxgety' ? '[BXGY]' : '[BXGX]';
		$discount = $orig > 0 ? ' (-' . strip_tags( wc_price( $orig ) ) . ')' : '';

		$offer_line = '<span class="th-so-offer-label">'
			. '<svg class="th-so-tag-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'
			. esc_html( $type_tag . ' ' . $label . $discount )
			. '</span>';

		return $name . $offer_line;
	}

	/* ========================================
	   MATCH HELPERS
	======================================== */

	private function matches_bogo( $pid, $rule ) {

		$trigger = $rule['bogo_trigger'] ?? 'bogo_allproduct';

		if ( $trigger === 'bogo_allproduct' ) {
			if ( ! empty( $rule['exclude_bogo_products_enabled'] ) && ! empty( $rule['exclude_bogo_products'] ) ) {
				$excl = array_map( 'intval', array_column( $rule['exclude_bogo_products'], 'id' ) );
				if ( in_array( (int) $pid, $excl, true ) ) {
					return false;
				}
			}
			return true;
		}

		if ( $trigger === 'bogo_specificproduct' ) {
			$ids = array_map( 'intval', array_column( $rule['bogo_product'] ?? [], 'id' ) );
			return in_array( (int) $pid, $ids, true );
		}

		if ( $trigger === 'bogo_category' ) {
			$cat_ids      = array_map( 'intval', array_column( $rule['bogo_categories'] ?? [], 'id' ) );
			$product_cats = wp_get_post_terms( $pid, 'product_cat', [ 'fields' => 'ids' ] );
			return ! empty( array_intersect( $cat_ids, (array) $product_cats ) );
		}

		if ( $trigger === 'bogo_tag' ) {
			$tag_ids      = array_map( 'intval', array_column( $rule['bogo_tags'] ?? [], 'id' ) );
			$product_tags = wp_get_post_terms( $pid, 'product_tag', [ 'fields' => 'ids' ] );
			return ! empty( array_intersect( $tag_ids, (array) $product_tags ) );
		}

		return false;
	}

	private function matches_x_product( $pid, $rule ) {

		$trigger = $rule['x_trigger'] ?? 'x_allproduct';

		if ( $trigger === 'x_allproduct' ) {
			if ( ! empty( $rule['x_exclude_products_enabled'] ) && ! empty( $rule['x_exclude_products'] ) ) {
				$excl = array_map( 'intval', array_column( $rule['x_exclude_products'], 'id' ) );
				if ( in_array( (int) $pid, $excl, true ) ) {
					return false;
				}
			}
			return true;
		}

		if ( $trigger === 'x_specificproduct' ) {
			$ids = array_map( 'intval', array_column( $rule['x_product'] ?? [], 'id' ) );
			return in_array( (int) $pid, $ids, true );
		}

		if ( $trigger === 'x_category' ) {
			$cat_ids      = array_map( 'intval', array_column( $rule['x_categories'] ?? [], 'id' ) );
			$product_cats = wp_get_post_terms( $pid, 'product_cat', [ 'fields' => 'ids' ] );
			return ! empty( array_intersect( $cat_ids, (array) $product_cats ) );
		}

		if ( $trigger === 'x_tag' ) {
			$tag_ids      = array_map( 'intval', array_column( $rule['x_tags'] ?? [], 'id' ) );
			$product_tags = wp_get_post_terms( $pid, 'product_tag', [ 'fields' => 'ids' ] );
			return ! empty( array_intersect( $tag_ids, (array) $product_tags ) );
		}

		return false;
	}

	private function count_x_in_cart( $rule ) {
		$total = 0;
		foreach ( WC()->cart->get_cart() as $item ) {
			if ( empty( $item['_th_smart_offer_free'] )
				&& $this->matches_x_product( $item['product_id'], $rule ) ) {
				$total += (int) $item['quantity'];
			}
		}
		return $total;
	}

	private function resolve_y_product( $rule, $fallback_pid ) {

		$trigger = $rule['y_trigger'] ?? 'y_specificproduct';

		if ( $trigger === 'y_same' ) {
			return (int) $fallback_pid;
		}

		if ( $trigger === 'y_specificproduct' ) {
			$ids = array_map( 'intval', array_column( $rule['y_product'] ?? [], 'id' ) );
			return ! empty( $ids ) ? $ids[0] : null;
		}

		if ( $trigger === 'y_category' ) {
			$cat_ids = array_map( 'intval', array_column( $rule['y_categories'] ?? [], 'id' ) );
			if ( empty( $cat_ids ) ) {
				return null;
			}
			$products = wc_get_products(
				[
					'limit'   => 1,
					'category' => $cat_ids,
					'return'  => 'ids',
					'status'  => 'publish',
				]
			);
			return ! empty( $products ) ? (int) $products[0] : null;
		}

		return null;
	}
}
