<?php
if (!defined('ABSPATH')) {
    exit;
}

$rule_type = $rule['rule_type'] ?? 'bogo';
$x         = intval($rule['x_quantity'] ?? 1);
$y         = intval($rule['y_quantity'] ?? 1);
$type      = $rule['reward_type'] ?? 'free_product';
$discount  = floatval($rule['discount_value'] ?? 0);

$reward_name = '';
if ($rule_type === 'buyxgety' && !empty($rule['y_product'])) {
    $first_reward = current($rule['y_product']);
    if (!empty($first_reward['id'])) {
        $r = wc_get_product($first_reward['id']);
        if ($r) {
            $reward_name = $r->get_name();
        }
    }
}
?>
<div class="th-offer-cart" data-rule-type="<?php echo esc_attr($rule_type); ?>" data-x-qty="<?php echo esc_attr($x); ?>">

    <?php if ($rule_type === 'bogo'): ?>
        
        <div class="th-cart-msg success">
            <?php _e('🎉 <strong>Buy 1 Get 1 Free</strong> offer applied to your cart!', 'th-store-one'); ?>
        </div>

    <?php elseif ($rule_type === 'buyxgety'): ?>

        <?php if ($type === 'free_product'): ?>
            <div class="th-cart-msg success">
                <?php printf(
                    __('You got <strong>%1$s</strong> FREE! (Buy %2$d → Get %3$d)', 'th-store-one'),
                    esc_html($reward_name ? $reward_name : 'Reward Item'),
                    $x,
                    $y
                ); ?>
            </div>
        <?php else: ?>
            <div class="th-cart-msg discount">
                <?php printf(
                    __('<strong>Special Discount Active:</strong> Buy %1$d Get %2$d on items!', 'th-store-one'),
                    $x,
                    $y
                ); ?>
            </div>
        <?php endif; ?>

    <?php elseif ($rule_type === 'dynamicoffer'): ?>

        <div class="th-cart-msg discount">
            <?php _e('<strong>Volume/Tier Discount</strong> applied based on your cart quantity!', 'th-store-one'); ?>
        </div>

    <?php endif; ?>

</div>