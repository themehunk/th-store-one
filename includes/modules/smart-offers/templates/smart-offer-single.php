<?php
if (!defined('ABSPATH')) exit;

$product = wc_get_product(get_the_ID());
$price = wc_get_price_to_display($product);
?>

<div class="th-offer-wrapper" data-base="<?php echo esc_attr($price); ?>">

<?php 
$first = true; // default select

foreach ($rules as $rule): 

    $rule_id = $rule['id'] ?? ''; // 🔥 stable id

    $x = intval($rule['x_qty']);
    $y = intval($rule['y_qty']);
    $type = $rule['reward_type'] ?? 'free_product';
    $discount = floatval($rule['discount_value'] ?? 0);

    if (empty($rule['reward_products'])) continue;

    foreach ($rule['reward_products'] as $rid):

        $r = wc_get_product($rid);
        if (!$r) continue;

        // 🔥 image fallback
        $img = wp_get_attachment_url($r->get_image_id());
        if (!$img) {
            $img = wc_placeholder_img_src();
        }
?>

<div class="th-offer-card"
     data-x="<?php echo esc_attr($x); ?>"
     data-type="<?php echo esc_attr($type); ?>"
     data-discount="<?php echo esc_attr($discount); ?>"
     data-msg="<?php echo esc_attr($rule['message']); ?>"
     data-success="<?php echo esc_attr($rule['success_message']); ?>"
     
     >

    <label>

        <input type="radio"
            name="th_offer_select"
            value="<?php echo esc_attr($rid); ?>"
            data-rule="<?php echo esc_attr($rule_id); ?>"
            <?php checked($first); ?>>

        <div class="th-card-inner">

            <div class="th-row">

                <div class="th-left">
                    <img src="<?php echo esc_url($img); ?>">
                </div>

                <div class="th-mid">
                    <strong>
                        Buy <?php echo $x; ?> → 
                        <?php 
                        if ($type === 'free_product') {

                         echo 'Get ' . esc_html($r->get_name()) . ' FREE';

                         } elseif ($type === 'discount_percent') {

                         echo esc_html($discount) . '% OFF';

                         } elseif ($type === 'discount_fixed') {

                         echo wc_price($discount) . ' OFF';

                         }
                        ?>
                    </strong>
                </div>

                <div class="th-right">
                    <span class="th-price"></span>
                </div>

            </div>

            <div class="th-progress">
                <div class="th-bar"></div>
            </div>

            <div class="th-msg"></div>

        </div>

    </label>

</div>

<?php 
$first = false; // only first auto selected
endforeach; endforeach; 
?>

</div>