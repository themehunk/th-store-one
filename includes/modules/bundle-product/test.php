<?php 
public function render_bundle() {

    global $product;
    if ( ! $product ) return;

    $items = get_post_meta(
        $product->get_id(),
        '_storeone_bundle_products',
        true
    );

    if ( empty( $items ) || ! is_array( $items ) ) return;

    $scope = get_post_meta(
        $product->get_id(),
        '_storeone_discount_scope',
        true
    ) ?: 'store_bundle';

    $bundle_min = absint( get_post_meta( $product->get_id(), '_storeone_min_qty', true ) );
    $bundle_max = absint( get_post_meta( $product->get_id(), '_storeone_max_qty', true ) );
    
    ?>

    <div class="storeone-bundle-frontend"
         data-discount-scope="<?php echo esc_attr( $scope ); ?>"
         data-bundle-min="<?php echo esc_attr( $bundle_min ); ?>"
         data-bundle-max="<?php echo esc_attr( $bundle_max ); ?>">

        <h3 class="s1-bundle-title"><?php esc_html_e( 'Bundle includes', 'store-one' ); ?></h3>

        <?php
        $above = get_post_meta( $product->get_id(), '_storeone_above_text', true );
        if ( $above ) :
        ?>
            <div class="storeone-bundle-above-text">
                <?php echo wp_kses_post( wpautop( $above ) ); ?>
            </div>
        <?php endif; ?>

        <div class="s1-bundle-items">

            <?php foreach ( $items as $item ) :

                if ( empty( $item['id'] ) ) continue;

                $p = wc_get_product( $item['id'] );
                if ( ! $p ) continue;

                $price = (float) $p->get_price();
                $qty   = max( 1, absint( $item['qty'] ?? 1 ) );
            ?>

            <div class="s1-bundle-item"
                 data-id="<?php echo esc_attr( $p->get_id() ); ?>"
                 data-price="<?php echo esc_attr( $price ); ?>"
                 data-qty="<?php echo esc_attr( $qty ); ?>"
                 data-optional="<?php echo esc_attr( $item['optional'] ?? 0 ); ?>"
                 data-discount-type="<?php echo esc_attr( $item['discount_type'] ?? 'percent' ); ?>"
                 data-discount-percent="<?php echo esc_attr( $item['discount_percent'] ?? 0 ); ?>"
                 data-discount-fixed="<?php echo esc_attr( $item['discount_fixed'] ?? 0 ); ?>">

                <?php if ( ! empty( $item['optional'] ) ) : ?>
                    <label class="s1-check-wrap">
                        <input type="checkbox"
                               class="s1-bundle-check"
                               checked>
                    </label>
                <?php endif; ?>

                <div class="s1-thumb">
                    <?php echo wp_kses_post( $p->get_image( 'woocommerce_thumbnail' ) ); ?>
                </div>

                <div class="s1-info">
                    <div class="s1-name">
                        <a href="<?php echo esc_url( $p->get_permalink() ); ?>" target="_blank">
                            <?php echo esc_html( $p->get_name() ); ?>
                        </a>
                    </div>

                    <div class="s1-unit-price">
                    <div class="s1-line-price"
                        data-unit-price="<?php echo esc_attr( $price ); ?>">
                        <span class="s1-line-qty"><?php echo esc_html( $qty ); ?></span>
                        <span class="s1-line-multiply">×</span>
                        <span class="s1-line-unit"><?php echo wc_price( $price ); ?></span>
                        <span class="s1-line-equal">=</span>
                        <strong class="s1-line-total">
                            <?php echo wc_price( $price * $qty ); ?>
                        </strong>
                    </div>
                    </div>
                    <?php
                $allow_qty = ! empty( $item['allow_change_quantity'] );

                $min = max( 1, absint( $item['min_qty'] ?? 1 ) );
                $max = absint( $item['max_qty'] ?? 0 );

                // SHOW INPUT only if real range exists
                $show_qty_input = $allow_qty && $max > $min;
                ?>

                <?php if ( $show_qty_input ) : ?>
                    <div class="s1-qty-wrap">
                        <button type="button" class="s1-qty-btn minus">−</button>

                        <input type="number"
                            class="s1-qty-input"
                            name="storeone_bundle_qty[]"
                            min="<?php echo esc_attr( $min ); ?>"
                            max="<?php echo esc_attr( $max ); ?>"
                            value="<?php echo esc_attr( max( $min, $qty ) ); ?>">

                        <button type="button" class="s1-qty-btn plus">+</button>
                    </div>
                <?php endif; ?>

                </div>

            </div>

            <?php endforeach; ?>

        </div>

        <?php
        $below = get_post_meta( $product->get_id(), '_storeone_below_text', true );
        if ( $below ) :
        ?>
            <div class="storeone-bundle-below-text">
                <?php echo wp_kses_post( wpautop( $below ) ); ?>
            </div>
        <?php endif; ?>

        <input type="hidden" id="storeone_bundle_data" name="storeone_bundle_data">
    </div>
    <?php
}