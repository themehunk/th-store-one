<?php
if (!defined('ABSPATH')) exit;

$x = intval($rule['x_qty']);
$y = intval($rule['y_qty']);
$type = $rule['reward_type'] ?? 'free_product';
$reward_products = $rule['reward_products'] ?? [];

// पहला reward product
$reward_name = '';
if (!empty($reward_products)) {
    $r = wc_get_product($reward_products[0]);
    if ($r) {
        $reward_name = $r->get_name();
    }
}
?>

<div class="th-offer-cart">

    <?php if ($type === 'free_product'): ?>

        <div class="th-cart-msg success">
            You got <strong><?php echo esc_html($reward_name); ?></strong> FREE  
            (Buy <?php echo esc_html($x); ?> → Get <?php echo esc_html($y); ?>)
        </div>

    <?php else: ?>

        <div class="th-cart-msg discount">
            Discount applied on your purchase  
            (Buy <?php echo esc_html($x); ?>)
        </div>

    <?php endif; ?>

</div>