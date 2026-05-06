<?php
if (!defined('ABSPATH')) {
    exit;
}

$product = wc_get_product(get_the_ID());

$price = wc_get_price_to_display($product);
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
     * SAME PRODUCT
     * ========================================================= */

    if ($apply_on === 'same_product' && $type !== 'free_product') {

        $rid = get_the_ID();

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

<div class="th-offer-card"
     data-x="<?php echo esc_attr($x); ?>"
     data-type="<?php echo esc_attr($type); ?>"
     data-discount="<?php echo esc_attr($discount); ?>"
     data-apply-on="<?php echo esc_attr($apply_on); ?>"
     data-reward-type="<?php echo esc_attr($type); ?>"
     data-msg="<?php echo esc_attr($rule['message']); ?>"
     data-success="<?php echo esc_attr($rule['success_message']); ?>">

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

                                if ($type === 'discount_percent') {

                                    echo esc_html($discount) . '% OFF Same Product';

                                } elseif ($type === 'discount_fixed') {

                                    echo wc_price($discount) . ' OFF Same Product';

                                } elseif ($type === 'free_product') {

                                    echo 'Free Product Offer';

                                }

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

    }

    /* =========================================================
     * SPECIFIC PRODUCT / FREE PRODUCT
     * ========================================================= */

    if (

        (
            $apply_on === 'specific_product'
            || $type === 'free_product'
        )

        && !empty($rule['reward_products'])

    ):

        foreach ($rule['reward_products'] as $rid):

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

<div class="th-offer-card"
     data-x="<?php echo esc_attr($x); ?>"
     data-type="<?php echo esc_attr($type); ?>"
     data-discount="<?php echo esc_attr($discount); ?>"
     data-apply-on="<?php echo esc_attr($apply_on); ?>"
     data-reward-type="<?php echo esc_attr($type); ?>"
     data-msg="<?php echo esc_attr($rule['message']); ?>"
     data-success="<?php echo esc_attr($rule['success_message']); ?>">

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

                                    if ($type === 'free_product') {

                                        echo 'Get ' . esc_html($r->get_name()) . ' FREE';

                                    } elseif ($type === 'discount_percent') {

                                        echo esc_html($discount) . '% OFF';

                                    } elseif ($type === 'discount_fixed') {

                                        echo wc_price($discount) . ' OFF';

                                    }

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

    endif;

endforeach;

?>

</div>