<?php
if (!defined('ABSPATH')) {
    exit;
}

$product = wc_get_product(get_the_ID());

$price = wc_get_price_to_display($product);

/* VARIABLE PRODUCT */

if ($product->is_type('variable')) {

    $default_attributes =
        $product->get_default_attributes();

    $variation_id = 0;

    if (!empty($default_attributes)) {

        $variation_data =
            wc_get_matching_product_variation(
                $product,
                $default_attributes
            );

        if ($variation_data) {

            $variation_id =
                $variation_data;
        }
    }

    /* USE DEFAULT VARIATION PRICE */

    if ($variation_id) {

        $variation =
            wc_get_product($variation_id);

        if ($variation) {

            $price =
                wc_get_price_to_display(
                    $variation
                );
        }
    }

    /* FALLBACK */

    if (!$price) {

        $prices =
            $product->get_variation_prices(true);

        if (!empty($prices['price'])) {

            $price =
                current($prices['price']);
        }
    }
}
?>

<div class="th-offer-wrapper"
     data-base="<?php echo esc_attr($price); ?>">

<?php

$auto_selected = false;

foreach ($rules as $rule):

    $rule_id = $rule['flexible_id'] ?? '';

    $x = intval($rule['x_qty'] ?? 1);

    $y = intval($rule['y_qty'] ?? 1);

    $type = $rule['reward_type'] ?? 'free_product';

    $discount = floatval($rule['discount_value'] ?? 0);

    $apply_on = $rule['apply_on'] ?? 'same_product';

    /* ================= DISPLAY SETTINGS ================= */

    $offer_heading = $rule['offer_heading'] ?? 'Buy {x} Get {y}';

    $offer_subheading = $rule['offer_subheading'] ?? '';

    $show_product_image = !empty($rule['show_product_image']);

    $show_product_title = !empty($rule['show_product_title']);

    $show_discount_badge = !empty($rule['show_discount_badge']);

    $badge_text = $rule['badge_text'] ?? 'BEST DEAL';

    $auto_add = !empty($rule['auto_add']);

    /* =========================================================
     * STYLE SETTINGS
     * ========================================================= */

    $card_bg =
        $rule['card_bg']
        ?? 'linear-gradient(180deg,#ffffff 0%,#ffffff 100%)';

    $card_active_bg =
        $rule['card_active_bg']
        ?? 'linear-gradient(180deg,#f7fff9 0%,#ffffff 100%)';

    $heading_color =
        $rule['heading_color']
        ?? '#111827';

    $text_color =
        $rule['text_color']
        ?? '#6b7280';

    $price_color =
        $rule['price_color']
        ?? '#111827';

    $badge_bg =
        $rule['badge_bg']
        ?? 'linear-gradient(135deg,#22c55e,#16a34a)';

    $badge_color =
        $rule['badge_color']
        ?? '#ffffff';

    $progress_bg =
        $rule['progress_bg']
        ?? '#e5e7eb4d';

    $progress_fill =
        $rule['progress_fill']
        ?? '#22c55e';

    $message_color =
        $rule['message_color']
        ?? '#6b7280';

    $success_color =
        $rule['success_color']
        ?? '#16a34a';

    $highlight_color = $rule['highlight_color']
    ?? '#16a34a';


    $padding =
    $rule['padding'] ?? [];

    $padding_top =
        $padding['top'] ?? '14px';

    $padding_right =
        $padding['right'] ?? '14px';

    $padding_bottom =
        $padding['bottom'] ?? '14px';

    $padding_left =
        $padding['left'] ?? '14px';

    $image_radius =
        intval($rule['image_radius'] ?? 10);

    /* BORDER */

    $card_border =
        $rule['card_border'] ?? [];

    $border_top =
        $card_border['width']['top']
        ?? '1px';

    $border_right =
        $card_border['width']['right']
        ?? '1px';

    $border_bottom =
        $card_border['width']['bottom']
        ?? '1px';

    $border_left =
        $card_border['width']['left']
        ?? '1px';

    $border_style =
        $card_border['style']
        ?? 'solid';

    $border_color =
        $card_border['color']
        ?? '#e7e7e7';

    $radius_top_left =
        $card_border['radius']['top']
        ?? '16px';

    $radius_top_right =
        $card_border['radius']['right']
        ?? '16px';

    $radius_bottom_right =
        $card_border['radius']['bottom']
        ?? '16px';

    $radius_bottom_left =
        $card_border['radius']['left']
        ?? '16px';

    /* =========================================================
     * COMMON CARD STYLE
     * ========================================================= */

    $card_style = '
    --th-card-bg:' . esc_attr($card_bg) . ';
    --th-card-active-bg:' . esc_attr($card_active_bg) . ';

    --th-heading-color:' . esc_attr($heading_color) . ';
    --th-text-color:' . esc_attr($text_color) . ';
    --th-price-color:' . esc_attr($price_color) . ';

    --th-badge-bg:' . esc_attr($badge_bg) . ';
    --th-badge-color:' . esc_attr($badge_color) . ';

    --th-progress-bg:' . esc_attr($progress_bg) . ';
    --th-progress-fill:' . esc_attr($progress_fill) . ';

    --th-message-color:' . esc_attr($message_color) . ';
    --th-success-color:' . esc_attr($success_color) . ';

  
    --th-image-radius:' . esc_attr($image_radius) . 'px;

    --th-border-top:' . esc_attr($border_top) . ';
    --th-border-right:' . esc_attr($border_right) . ';
    --th-border-bottom:' . esc_attr($border_bottom) . ';
    --th-border-left:' . esc_attr($border_left) . ';

    --th-border-style:' . esc_attr($border_style) . ';
    --th-border-color:' . esc_attr($border_color) . ';

    --th-radius-top-left:' . esc_attr($radius_top_left) . ';
    --th-radius-top-right:' . esc_attr($radius_top_right) . ';
    --th-radius-bottom-right:' . esc_attr($radius_bottom_right) . ';
    --th-radius-bottom-left:' . esc_attr($radius_bottom_left) . ';
    --th-highlight-color:' . esc_attr($highlight_color) . ';
    --th-padding-top:' . esc_attr($padding_top) . ';
--th-padding-right:' . esc_attr($padding_right) . ';
--th-padding-bottom:' . esc_attr($padding_bottom) . ';
--th-padding-left:' . esc_attr($padding_left) . ';
    ';

    /* =========================================================
     * SAME PRODUCT
     * ========================================================= */

    if ($apply_on === 'same_product' && $type !== 'free_product') {

        $reward_products = [get_the_ID()];

    } elseif (

        (
            $apply_on === 'specific_product'
            || $type === 'free_product'
        )

        && !empty($rule['reward_products'])

    ) {

        $reward_products = $rule['reward_products'];

    } else {

        continue;
    }

    foreach ($reward_products as $rid):

        $r = wc_get_product($rid);

        if (!$r) {
            continue;
        }

        $img = wp_get_attachment_url($r->get_image_id());

        if (!$img) {
            $img = wc_placeholder_img_src();
        }

        /* ================= DYNAMIC HEADING ================= */

        $heading = str_replace(
            ['{x}', '{y}', '{discount}', '{product}'],
            [
                $x,
                $y,
                $discount,
                $r->get_name()
            ],
            $offer_heading
        );

        /* ================= AUTO SELECT ================= */

        $checked = false;

        if (
            !$auto_selected
            && $auto_add
        ) {

            $checked = true;

            $auto_selected = true;
        }
        ?>

<div class="th-offer-card th-detailed"
     data-x="<?php echo esc_attr($x); ?>"
     data-type="<?php echo esc_attr($type); ?>"
     data-discount="<?php echo esc_attr($discount); ?>"
     data-apply-on="<?php echo esc_attr($apply_on); ?>"
     data-reward-type="<?php echo esc_attr($type); ?>"
     data-msg="<?php echo esc_attr($rule['message']); ?>"
     data-success="<?php echo esc_attr($rule['success_message']); ?>"
     style="<?php echo esc_attr($card_style); ?>">

    <label>

        <input type="radio"
               name="th_offer_select"
               value="<?php echo esc_attr($rid); ?>"
               data-rule="<?php echo esc_attr($rule_id); ?>"
               <?php checked($checked); ?>>

        <div class="th-card-inner">

            <?php if ($show_discount_badge): ?>

                <div class="th-badge">
                    <?php echo esc_html($badge_text); ?>
                </div>

            <?php endif; ?>

            <div class="th-row">

                <?php if ($show_product_image): ?>

                    <div class="th-left">
                        <img src="<?php echo esc_url($img); ?>">
                    </div>

                <?php endif; ?>

                <div class="th-mid">

                    <strong class="th-offer-heading">
                        <?php echo esc_html($heading); ?>
                    </strong>

                    <?php if ($show_product_title): ?>

                        <div class="th-product-title">
                            <?php echo esc_html($r->get_name()); ?>
                        </div>

                    <?php endif; ?>

                    <?php if (!empty($offer_subheading)): ?>

                        <div class="th-offer-subheading">
                            <?php echo esc_html($offer_subheading); ?>
                        </div>

                    <?php endif; ?>

                    <div class="th-offer-meta">

<?php

        $offer_meta = '';

        if ($type === 'discount_percent') {

            $offer_meta = sprintf(
                __('%s%% OFF Same Product', 'th-store-one'),
                esc_html($discount)
            );

        } elseif (
            $type === 'discount_fixed'
            || $type === 'discount_fixed_cart'
        ) {

            if ($type === 'discount_fixed_cart') {

                if ($product->is_type('variable')) {

                    $offer_meta = sprintf(
                        __('%s OFF', 'th-store-one'),
                        wp_kses_post(wc_price($discount))
                    );

                } else {

                    $total = $price * $x;

                    $final = $total - $discount;

                    $offer_meta = sprintf(
                        __('Buy %1$s for %2$s', 'th-store-one'),
                        esc_html($x),
                        wp_kses_post(wc_price($final))
                    );
                }

            } else {

                $offer_meta = sprintf(
                    __('%s OFF Same Product', 'th-store-one'),
                    wp_kses_post(wc_price($discount))
                );
            }

        } elseif ($type === 'free_product') {

            $offer_meta = __('Free Product Offer', 'th-store-one');
        }

        echo wp_kses_post($offer_meta);

        ?>

                    </div>

                </div>

                <div class="th-right">
                    <span class="th-price"></span>
                </div>

            </div>

            <?php if (!empty($rule['show_progress'])): ?>

                <div class="th-progress">
                    <div class="th-bar"></div>
                </div>

            <?php endif; ?>

            <div class="th-msg"></div>

        </div>

    </label>

</div>

<?php
    endforeach;

endforeach;
?>

</div>