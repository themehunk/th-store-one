jQuery(function ($) {
    /* =====================================================
     * BASE ELEMENTS
     * ===================================================== */
    const $bundle = $('.storeone-bundle-frontend');
    if (!$bundle.length) return;

    const isStoreBundle =
    $bundle.data('discount-scope') === 'store_bundle';

    const $addToCartBtn = $('.single_add_to_cart_button');
    const $hiddenInput  = $('#storeone_bundle_data');

    /* =====================================================
     * PRICE FORMATTER (FROM PHP TEMPLATE)
     * ===================================================== */
    function formatPrice(amount) {
        amount = parseFloat(amount) || 0;

        const $tpl = $('.s1-currency-template');
        if (!$tpl.length) {
            return amount.toFixed(2);
        }

        const html = $tpl.html(); // e.g. ₹0.00
        return html.replace(/0+([.,]0+)?/, amount.toFixed(2));
    }

    /* =====================================================
     * HELPERS
     * ===================================================== */
    function getQty($item) {
        return parseInt($item.attr('data-qty'), 10) || 1;
    }

    function clampQty($item, qty) {
        const allow = parseInt($item.data('allow-qty'), 10) || 0;
        const min   = parseInt($item.data('min'), 10) || 0;
        const max   = parseInt($item.data('max'), 10) || 0;

        // Quantity change not allowed → fixed
        if (!allow) {
            return getQty($item);
        }

        if (min > 0 && qty < min) qty = min;
        if (max > 0 && qty > max) qty = max;

        return qty;
    }

    /* =====================================================
     * APPLY STRIKE (ONLY TOTAL)
     * ===================================================== */
    function applyStrikeToTotal() {
        if (!isStoreBundle) return;

        $bundle.find('.s1-line-total').each(function () {
            const $el = $(this);

            if ($el.find('del').length) return;

            const html = $el.html();
            if (!html) return;

            $el.html('<del>' + html + '</del>');
        });
    }

    /* =====================================================
     * UPDATE LINE PRICE (UNIT × QTY)
     * ===================================================== */
    function updateLinePrice($item) {
        const unit = parseFloat($item.data('price')) || 0;
        const qty  = getQty($item);

        $item.find('.s1-line-qty').text(qty);

        const totalHtml = formatPrice(unit * qty);
        $item.find('.s1-line-total').html(totalHtml);
    }

    /* =====================================================
     * BUILD BUNDLE JSON
     * ===================================================== */
    function buildBundleData() {

        let items = [];

        $('.s1-bundle-item').each(function () {

            const $item = $(this);
            const isOptional =
                $item.find('.s1-bundle-check').length
                    ? $item.find('.s1-bundle-check').is(':checked')
                    : true;

            if (!isOptional) return;

            const productId = $item.data('id');
            if (!productId) return;

            items.push({
                id: productId,
                qty: getQty($item),
                variation_id: $item.data('variation-id') || 0,
                variation: $item.data('variation-attrs') || {}
            });
        });

        if (!items.length) {
            $hiddenInput.val('');
            $addToCartBtn.prop('disabled', true);
            return;
        }

        $hiddenInput.val(JSON.stringify({ items }));
        $addToCartBtn.prop('disabled', false);
    }

    /* =====================================================
     * QTY BUTTONS (+ / -)
     * ===================================================== */
    $(document).on('click', '.s1-qty-btn', function () {

        const $item = $(this).closest('.s1-bundle-item');
        let qty = getQty($item);

        if ($(this).hasClass('plus'))  qty++;
        if ($(this).hasClass('minus')) qty--;

        qty = clampQty($item, qty);

        $item.attr('data-qty', qty);
        $item.find('.s1-line-qty').text(qty);

        updateLinePrice($item);
        buildBundleData();
        applyStrikeToTotal();
    });

    /* =====================================================
     * OPTIONAL ITEM TOGGLE
     * ===================================================== */
    $(document).on('change', '.s1-bundle-check', function () {
        buildBundleData();
        applyStrikeToTotal();
    });

   
        /* =====================================================
 * VARIABLE PRODUCT SUPPORT (BUNDLE SAFE) ✅ FIXED
 * ===================================================== */
$(document).on('change', '.s1-variation-form select', function () {

    const $form = $(this).closest('.s1-variation-form');
    const productId = $form.data('product-id');
    const variations = $form.data('variations');

    const attributes = {};

    // collect selected attributes
    $form.find('select').each(function () {
        if (this.value) {
            attributes[this.name] = this.value;
        }
    });

    // all attributes must be selected
    if (Object.keys(attributes).length !== $form.find('select').length) {
        return;
    }

    if (!variations || !variations.length) {
        console.warn('No variations found for', productId);
        return;
    }

    let matched = null;

    // find matching variation
    variations.forEach(function (v) {
        let match = true;
        for (const attr in attributes) {
            if (v.attributes[attr] !== attributes[attr]) {
                match = false;
                break;
            }
        }
        if (match) matched = v;
    });

    if (!matched) {
        console.warn('No matching variation for', productId);
        return;
    }

    const $item = $('.s1-bundle-item[data-id="' + productId + '"]');
    if (!$item.length) return;

    const price = parseFloat(matched.display_price) || 0;

    /* ===============================
     * 🔥 CRITICAL FIX (THIS WAS MISSING)
     * =============================== */
    // variation id
    $item.attr('data-variation-id', matched.variation_id);
    $item.data('variation-id', matched.variation_id);

    // variation attributes (FOR CART)
    $item.data('variation-attrs', matched.attributes);

    // price
    $item.attr('data-price', price);

    // price html
    $item.find('.s1-line-unit').html(matched.price_html);

    // image update
    if (matched.image && matched.image.src) {
        $item.find('.s1-thumb img').attr({
            src: matched.image.src,
            srcset: matched.image.srcset || '',
            sizes: matched.image.sizes || ''
        });
    }

    updateLinePrice($item);
    buildBundleData();
    applyStrikeToTotal();

    // debug (optional)
    console.log('BUNDLE VAR SET', {
        product: productId,
        variation_id: matched.variation_id,
        attrs: matched.attributes
    });
});


    /* =====================================================
     * INIT (IMPORTANT)
     * ===================================================== */
    $('.s1-bundle-item').each(function () {
        const $item = $(this);

        let qty = getQty($item);
        qty = clampQty($item, qty);

        $item.attr('data-qty', qty);
        $item.find('.s1-line-qty').text(qty);

        updateLinePrice($item);
    });

    buildBundleData();
    applyStrikeToTotal();
});
// ✅ STORE PRODUCT DISCOUNT SCOPE – FINAL FIXED
jQuery(function ($) {

    const $bundle = $('.storeone-bundle-frontend');
    if (!$bundle.length) return;

    const discountScope = $bundle.data('discount-scope');
    if (discountScope !== 'store_product') return;

    const bundleId  = $bundle.data('product-id');
    const $priceWrap = $('.summary.entry-summary .price');

    /* ---------------------------------
     * COLLECT SELECTED ITEMS
     * --------------------------------- */
    function getItems() {
        let items = [];

        $('.s1-bundle-item').each(function () {
            const $item = $(this);

            // optional unchecked → skip
            if (
                $item.find('.s1-bundle-check').length &&
                !$item.find('.s1-bundle-check').is(':checked')
            ) {
                return;
            }

            items.push({
                id:  $item.data('id'),
                qty: parseInt($item.attr('data-qty'), 10) || 1
            });
        });

        return items; // ✅ can be []
    }

    /* ---------------------------------
     * AJAX PRICE PREVIEW
     * --------------------------------- */
    function previewPrice() {

        const items = getItems(); // 🔥 EMPTY ARRAY ALLOWED

        $.ajax({
            url: storeOneBundle.ajaxurl,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'storeone_preview_bundle_price',
                nonce: storeOneBundle.nonce,
                bundle_id: bundleId,
                items: items
            },
            success: function (res) {
                if (!res || !res.success) return;

                // 🔥 SAFE REPLACE
                $priceWrap.html(res.data.price_html);
            }
        });
    }

    /* ---------------------------------
     * EVENTS
     * --------------------------------- */
    $('body').on(
        'click change',
        '.s1-qty-btn, .s1-bundle-check, .s1-variation-form select',
        function () {
            previewPrice();
        }
    );

    /* ---------------------------------
     * INIT
     * --------------------------------- */
    previewPrice();
});