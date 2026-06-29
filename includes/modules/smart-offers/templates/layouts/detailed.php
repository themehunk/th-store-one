<?php
if (!defined('ABSPATH')) {
    exit;
}

$product = wc_get_product(get_the_ID());
if (!$product) {
    return;
}

$regular_price = floatval($product->get_regular_price());
$sale_price    = floatval($product->get_sale_price());

/* VARIABLE PRODUCT HANDLING */
if ($product->is_type('variable')) {
    $default_attributes = $product->get_default_attributes();
    $variation_id = 0;

    if (!empty($default_attributes)) {
        $variation_data = wc_get_matching_product_variation($product, $default_attributes);
        if ($variation_data) {
            $variation_id = $variation_data;
        }
    }

    if ($variation_id) {
        $variation = wc_get_product($variation_id);
        if ($variation) {
            $regular_price = floatval($variation->get_regular_price());
            $sale_price    = floatval($variation->get_sale_price());
        }
    }

    if (!$regular_price) {
        $prices = $product->get_variation_prices(true);
        if (!empty($prices['regular_price'])) {
            $regular_price = floatval(current($prices['regular_price']));
        }
        if (!empty($prices['sale_price'])) {
            $sale_price = floatval(current($prices['sale_price']));
        }
    }
}

$base_display_price = !empty($sale_price) ? $sale_price : $regular_price;
?>
<div class="th-offer-skeleton">
    <div class="th-skel-row">
        <div class="th-skel-left">
            <div class="th-skel-title"></div>
        </div>
        <div class="th-skel-right">
            <div class="th-skel-price"></div>
        </div>
    </div>
</div>
<div class="th-offer-wrapper th-offer-loading"
     data-base="<?php echo esc_attr($base_display_price); ?>"
     data-regular-base="<?php echo esc_attr($regular_price); ?>"
     data-sale-base="<?php echo esc_attr($sale_price); ?>"
     data-original="<?php echo esc_attr($base_display_price); ?>">
<?php
$auto_selected = false;
foreach ($rules as $rule):

    if (($rule['status'] ?? '') !== 'active') {
        continue;
    }
    $rule_id   = $rule['flexible_id'] ?? '';
    $rule_type = $rule['rule_type'] ?? 'bogo';

    $x        = intval($rule['x_quantity'] ?? 1);
    $y        = intval($rule['y_quantity'] ?? 1);
    $type     = $rule['reward_type'] ?? 'free_product';
    $discount = floatval($rule['discount_value'] ?? 0);
    $apply_on = $rule['apply_on'] ?? 'regular_price';

    if ($rule_type === 'bogo') {
        $x = 1;
        $y = 1;
        $type = 'free_product';
    }

    /* ================= DISPLAY SETTINGS ================= */
    $offer_heading       = $rule['offer_heading'] ?? 'Buy {x} Get {y}';
    $offer_subheading    = $rule['offer_subheading'] ?? '';
    $show_product_image  = !empty($rule['show_product_image']);
    $show_product_title  = !empty($rule['show_product_title']);
    $show_discount_badge = !empty($rule['show_discount_badge']);
    $badge_text          = $rule['badge_text'] ?? 'BEST DEAL';
    $auto_add            = !empty($rule['auto_add']);

    $display_target_ids = [];
    if ($rule_type === 'bogo') {
        $display_target_ids = [get_the_ID()];
    }

    if (empty($display_target_ids)) {
        $display_target_ids = [get_the_ID()];
    }



    /* ================= 2. BUY X GET Y / BOGO LAYOUT ROUTING ================= */
    foreach ($display_target_ids as $rid):
        $r = wc_get_product($rid);
        if (!$r) {
            continue;
        }

        $r_reg   = floatval($r->get_regular_price());
        $r_sale  = floatval($r->get_sale_price());
        $r_base  = !empty($r_sale) ? $r_sale : $r_reg;

        $product_image = wp_get_attachment_image_src($r->get_image_id(), 'thumbnail');
        $img_src = $product_image ? $product_image[0] : wc_placeholder_img_src();
        $product_title = $r->get_name();

        $formatted_discount = ($type === 'discount_percent') ? $discount . '%' : get_woocommerce_currency_symbol() . $discount;

        // CALCULATE INITIAL PRICING STRUCTURES FOR RENDER FALLBACKS
        $delPriceCalculated = 0;
        $actualPriceCalculated = 0;
        if ($type === 'free_product' || floatval($discount) === 100) {
            $delPriceCalculated = $r_base * ($x + $y);
            $actualPriceCalculated = $r_base * $x;
        } elseif ($type === 'discount_percent') {
            $delPriceCalculated = $r_base * $x;
            $actualPriceCalculated = ($r_base * $x) - (($r_base * $x) * ($discount / 100));
        } elseif ($type === 'discount_fixed') {
            $delPriceCalculated = $r_base * $x;
            $actualPriceCalculated = max(0, ($r_base * $x) - $discount);
        }

        $initial_del_html   = wc_price($delPriceCalculated);
        $initial_price_html = wc_price($actualPriceCalculated);
        $initial_each_html  = wc_price($actualPriceCalculated / ($x ?: 1));
        $initial_discount   = wc_price(max(0, $delPriceCalculated - $actualPriceCalculated));

        if ($rule_type === 'bogo') {
            $heading_raw = $rule['bogo_offer_title'] ?? 'Buy One, Get One';
        } elseif ($rule_type === 'buyxgety') {
            $heading_raw = $rule['bxgy_offer_title'] ?? 'Buy {XQTY} Products & Get This Gift FREE';
        } else {
            $heading_raw = $offer_heading;
        }

        // Mapping structural updates for title input text fields
        $heading = str_replace(
            ['{XQTY}', '{YQTY}', '{x}', '{y}', '{discount}', '{DISCOUNT}', '{product}', '{DELPRICE}', '{PRICE}', '{EACHPRICE}'],
            [$x, $y, $x, $y, $formatted_discount, $formatted_discount, $product_title, $initial_del_html, $initial_price_html, $initial_each_html],
            $heading_raw
        );

        $checked = false;
        if (!$auto_selected && $auto_add) {
            $checked = true;
            $auto_selected = true;
        }

        $offer_meta = ($rule_type === 'bogo') ? ($rule['bogo_badge_text'] ?? 'BEST DEAL') : ($rule['bxgy_badge_text'] ?? 'FREE GIFT');
        //    $offer_meta = str_replace(
        //        ['{XQTY}', '{YQTY}', '{x}', '{y}', '{discount}', '{DISCOUNT}', '{DELPRICE}', '{PRICE}'],
        //        [$x, $y, $x, $y, $formatted_discount, $formatted_discount, $initial_del_html, $initial_price_html],
        //        $offer_meta
        //    );

        $bxgy_price_tpl = $rule['bxgy_price_text'] ?? '{DELPRICE} Worth {PRICE}';
        $bxgy_desc_tpl  = $rule['bxgy_short_description'] ?? '';

        // --- GENERATING STATIC PRICE HTML NATIVELY ---
        $final_price_layout_html = '';

        if ($rule_type === 'bogo') {
            $bogo_price_text = $rule['bogo_price_text'] ?: '';
            $bogo_del_price  = $r_base; // Default base price for initial quantity
            $initial_bogo_del_html = wc_price($bogo_del_price);

            $final_price_layout_html = '
        <div class="th-price-wrap">
            <del>' . $initial_bogo_del_html . '</del>
            <span>' . esc_html($bogo_price_text) . '</span>
        </div>';
        }
        ?>

<div class="th-offer-card th-offer-radio-card <?php echo $checked ? 'active offer_select th-card-active' : ''; ?>"
         data-rule-type="<?php echo esc_attr($rule_type); ?>"
         data-x-qty="<?php echo esc_attr($x); ?>"
         data-y-qty="<?php echo esc_attr($y); ?>"
         data-reward-type="<?php echo esc_attr($type); ?>"
         data-discount-value="<?php echo esc_attr($discount); ?>"
         data-apply-on="<?php echo esc_attr($apply_on); ?>"
         data-reward-base="<?php echo esc_attr($r_base); ?>"
         data-reward-regular="<?php echo esc_attr($r_reg); ?>"
         data-reward-sale="<?php echo esc_attr($r_sale); ?>"
         data-success="<?php echo esc_attr($rule['success_message'] ?? ''); ?>"
         data-rule="<?php echo esc_attr($rule_id); ?>"
         data-bogo-price-text="<?php echo esc_attr($rule['bogo_price_text'] ?: ''); ?>"
         data-price-text="<?php echo esc_attr($bxgy_price_tpl); ?>"
         data-short-desc="<?php echo esc_attr($bxgy_desc_tpl); ?>"
         data-msg="<?php echo esc_attr($rule['offer_heading'] ?? 'Add {remaining} more to unlock'); ?>"
         style="
            --th-card-bg: <?php echo esc_attr($rule['card_bg'] ?? '#fff'); ?>;
           
            --th-heading-color: <?php echo esc_attr($rule['heading_color'] ?? '#111827'); ?>;
            --th-text-color: <?php echo esc_attr($rule['text_color'] ?? '#6b7280'); ?>;
            --th-price-color: <?php echo esc_attr($rule['price_color'] ?? '#111827'); ?>;
            --th-badge-bg: <?php echo esc_attr($rule['badge_bg'] ?? '#111827'); ?>;
            --th-badge-color: <?php echo esc_attr($rule['badge_color'] ?? '#fff'); ?>;
           
            --th-padding-top: <?php echo esc_attr(th_store_one_with_unit($rule['padding']['top'] ?? 14)); ?>;
            --th-padding-right: <?php echo esc_attr(th_store_one_with_unit($rule['padding']['right'] ?? 14)); ?>;
            --th-padding-bottom: <?php echo esc_attr(th_store_one_with_unit($rule['padding']['bottom'] ?? 14)); ?>;
            --th-padding-left: <?php echo esc_attr(th_store_one_with_unit($rule['padding']['left'] ?? 14)); ?>;
            --th-border-top-width: <?php echo esc_attr(th_store_one_with_unit($rule['card_border']['width']['top'] ?? 1)); ?>;
            --th-border-right-width: <?php echo esc_attr(th_store_one_with_unit($rule['card_border']['width']['right'] ?? 1)); ?>;
            --th-border-bottom-width: <?php echo esc_attr(th_store_one_with_unit($rule['card_border']['width']['bottom'] ?? 1)); ?>;
            --th-border-left-width: <?php echo esc_attr(th_store_one_with_unit($rule['card_border']['width']['left'] ?? 1)); ?>;
            --th-border-style: <?php echo esc_attr($rule['card_border']['style'] ?? 'solid'); ?>;
            --th-border-color: <?php echo esc_attr($rule['card_border']['color'] ?? '#e7e7e7'); ?>;
            --th-card-radius-top: <?php echo esc_attr(th_store_one_with_unit($rule['card_border']['radius']['top'] ?? 16)); ?>;
            --th-card-radius-right: <?php echo esc_attr(th_store_one_with_unit($rule['card_border']['radius']['right'] ?? 16)); ?>;
            --th-card-radius-bottom: <?php echo esc_attr(th_store_one_with_unit($rule['card_border']['radius']['bottom'] ?? 16)); ?>;
            --th-card-radius-left: <?php echo esc_attr(th_store_one_with_unit($rule['card_border']['radius']['left'] ?? 16)); ?>;
         "
         
            --th-highlight-color: <?php echo esc_attr($rule['highlight_color'] ?? '#111'); ?>;
            --th-card-active-bg: <?php echo esc_attr($rule['card_active_bg'] ?? '#fff'); ?>;
     >
<label class="th-offer-label">
    <input
        type="radio"
        class="th-offer-radio"
        name="th_offer_select"
        value="<?php echo esc_attr($rid); ?>"
        data-rule="<?php echo esc_attr($rule_id); ?>"
        <?php checked($checked); ?>
    >
    <span class="th-radio-mark" style="--th-radio-color:<?php echo esc_attr($rule['highlight_color'] ?? '#11'); ?>;"></span>
    <div class="th-offer-content">
        <div class="th-offer-left">
           
            <?php if ($rule_type === 'bogo') {
                echo '🎉';
            } ?>
            <h4 class="th-offer-title">
                <?php echo wp_kses_post($heading); ?>
            </h4>
        </div>
        <div class="th-offer-right">
            <div class="th-offer-center">
                <?php if (!empty($offer_meta)): ?>
                    <span class="th-save-badge">
                        <?php echo wp_kses_post($offer_meta); ?>
                    </span>
                <?php endif; ?>
            </div>
            <span class="th-price">
                <?php echo $final_price_layout_html; ?>
            </span>
        </div>
    </div>
</label>
</div>
<?php
    endforeach;
endforeach;
?>
</div>