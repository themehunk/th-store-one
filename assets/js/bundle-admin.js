jQuery(function ($) {

    /* --------------------------------
     * Tell Woo this product type exists
     * -------------------------------- */
    if (typeof wc_product_types !== 'undefined') {
        if (!wc_product_types.includes('storeone_bundle')) {
            wc_product_types.push('storeone_bundle');
        }
    }

    $('.options_group.pricing').addClass('show_if_storeone_bundle').removeClass('hide_if_external hide_if_grouped hide_if_variable');

    /* -----------------------------
     * Auto open Bundle tab
     * ----------------------------- */
    function openTab() {
        if ($('#product-type').val() === 'storeone_bundle') {
            $('.product_data_tabs li.storeone_bundle_tab a').trigger('click');
        }
    }
    openTab();
    $('#product-type').on('change', openTab);

    /* -----------------------------
     * Show / Hide selected box
     * ----------------------------- */

    function toggleSelectedBox() {
        if ($('.storeone-bundle-selected .bundle-item').length) {
            $('.storeone-bundle-selected-wrap').slideDown(150);
        } else {
            $('.storeone-bundle-selected-wrap').slideUp(150);
        }
    }

    function calculateBundleRegularPrice() {

    let baseTotal = 0;

    const scope = $('#_storeone_discount_scope').val() || 'store_bundle';

    const $list = $('.storeone-bundle-selected:visible').first();

    /* --------------------------------
     * 1️⃣ BASE PRICE (NO DISCOUNT)
     * -------------------------------- */
    $list.children('li.bundle-item').each(function () {

        const $item  = $(this);
        const price  = parseFloat(
            $item.find('.bundle-price').data('price')
        ) || 0;

        let qty = parseInt($item.find('.qty').val(), 10);
        if (!qty || qty < 1) qty = 1;

        // sync hidden qty
        $item.find('.qty-hidden').val(qty);

        baseTotal += price * qty;
    });

    baseTotal = Math.max(0, baseTotal);

    let finalTotal = baseTotal;

    /* --------------------------------
     * 2️⃣ BUNDLE WIDE DISCOUNT
     * -------------------------------- */
    if (scope === 'store_bundle') {

        const type    = $('#_storeone_discount_type').val();
        const percent = parseFloat($('#_storeone_discount_percent').val()) || 0;
        const fixed   = parseFloat($('#_storeone_discount_fixed').val()) || 0;

        if (type === 'percent' && percent > 0) {
            finalTotal -= baseTotal * percent / 100;
        }

        if (type === 'fixed' && fixed > 0) {
            finalTotal -= fixed;
        }
    }

    finalTotal = Math.max(0, finalTotal);

    const regularPrice = baseTotal.toFixed(2);
    const salePrice    = finalTotal.toFixed(2);

    /* --------------------------------
     * 3️⃣ WC PRICE FIELDS (🔥 CORRECT)
     * -------------------------------- */

    // 🔹 Regular = always base
    $('#_regular_price').val(regularPrice);

    if (scope === 'store_bundle' && finalTotal < baseTotal) {
        // 🔹 Sale only when bundle discount exists
        $('#_sale_price').val(salePrice);
        $('#_price').val(salePrice).trigger('change');
    } else {
        // 🔹 No sale
        $('#_sale_price').val('');
        $('#_price').val(regularPrice).trigger('change');
    }

    // 🔹 Custom readonly field
    $('.storeone-bundle-regular-input').val(regularPrice);
}

    /* -----------------------------
     * Add product from search
     * ----------------------------- */
    $('.storeone-bundle-search').on('select2:select', function (e) {

        const id = e.params.data.id;

        // Prevent duplicate
        if ($('.bundle-item[data-id="' + id + '"]').length) {
            $(this).val(null).trigger('change');
            return;
        }

        $.post(StoreOneBundle.ajax, {
            action: 'storeone_get_product_data',
            nonce: StoreOneBundle.nonce,
            id: id
        }, function (res) {

            if (!res.success) return;

            const p = res.data;

            $('.storeone-bundle-selected').append(`
                <li class="bundle-item" data-id="${p.id}">
                    <span class="drag">☰</span>

                    <input type="number" class="qty" min="1" value="1">

                    <img src="${p.image}" alt="">

                    <a href="${p.edit}" target="_blank" class="title">${p.title}</a>

                    <span class="bundle-price" data-price="${p.regular_price}">
                        ${p.price_html}
                    </span>

                    <span class="type">${p.type}</span>

                    <a href="#" class="remove">×</a>

                    <input type="hidden"
                           name="_storeone_bundle_products[${p.id}][id]"
                           value="${p.id}">

                    <input type="hidden"
                           class="qty-hidden"
                           name="_storeone_bundle_products[${p.id}][qty]"
                           value="1">
                </li>
            `);

            toggleSelectedBox();

            // Delay ensures DOM is ready
            setTimeout(calculateBundleRegularPrice, 50);

            // Reset search field
            $('.storeone-bundle-search').val(null).trigger('change');
        });
    });

    /* -----------------------------
     * Qty change (keyup + change)
     * ----------------------------- */
    $(document).on('keyup change', '.bundle-item .qty', function () {
        calculateBundleRegularPrice();
    });

    /* -----------------------------
     * Remove item
     * ----------------------------- */
    $(document).on('click', '.bundle-item .remove', function (e) {
        e.preventDefault();
        $(this).closest('.bundle-item').remove();

        toggleSelectedBox();
        calculateBundleRegularPrice();
    });

    /* -----------------------------
     * Sortable
     * ----------------------------- */
    if ($('.storeone-bundle-selected').length) {
        $('.storeone-bundle-selected').sortable({
            handle: '.drag',
            update: calculateBundleRegularPrice
        });
    }

});


jQuery(function ($) {

    /* =====================================================
     * 1. HELPERS
     * ===================================================== */

    function getScope() {
        // store_bundle | store_product
        return $('#_storeone_discount_scope').val();
    }

    /* =====================================================
     * 2. TOP BUNDLE-LEVEL FIELDS
     * ===================================================== */

    // Fixed price (bundle scope only)
    function toggleFixedPriceField() {
        $('.show_if_storeone_bundle_scope')
            .toggle(getScope() === 'store_bundle');
    }

    // Global discount percent / fixed toggle
    function toggleBundleDiscountFields() {

        // 🔥 Only relevant in bundle scope
        if (getScope() !== 'store_bundle') return;

        const type = $('#_storeone_discount_type').val();

        $('#_storeone_discount_percent')
            .closest('.form-field')
            .toggle(type === 'percent');

        $('#_storeone_discount_fixed')
            .closest('.form-field')
            .toggle(type === 'fixed');
    }

    // 🔥 Hide / show GLOBAL discount fields by scope
    function toggleTopDiscountByScope() {

        const scope = getScope();

        const $type    = $('#_storeone_discount_type').closest('.form-field');
        const $percent = $('#_storeone_discount_percent').closest('.form-field');
        const $fixed   = $('#_storeone_discount_fixed').closest('.form-field');

        if (scope === 'store_product') {
            // ❌ per-product → no global discount
            $type.hide();
            $percent.hide();
            $fixed.hide();
        } else {
            // ✅ bundle → global discount allowed
            $type.show();
            toggleBundleDiscountFields();
        }
    }

    /* =====================================================
     * 3. PER-ITEM SETTINGS
     * ===================================================== */

    function toggleSettingsByScope() {

        const scope = getScope();

        $('.bundle-item-settings').each(function () {

            const $wrap = $(this);
            const $perProduct = $wrap.find('.bundle-settings-per-product');
            const $bundleWide = $wrap.find('.bundle-settings-bundle');

            // Sections always visible
            $perProduct.show();
            $bundleWide.show();

            // State classes
            $wrap
                .toggleClass('is-per-product', scope === 'store_product')
                .toggleClass('is-bundle-wide', scope === 'store_bundle');

            // Per-item discount allowed only in store_product
            if (scope === 'store_bundle') {
                hidePerItemDiscount($perProduct);
            } else {
                showPerItemDiscount($perProduct);
            }
        });
    }

    /* ---------- Quantity ---------- */

    function syncQuantityFields($section) {
        const enabled = $section.find('.s1-qty-toggle').is(':checked');
        $section.find('.s1-qty-field').toggle(enabled);
    }

    /* ---------- Discount ---------- */

    function hidePerItemDiscount($section) {
        $section.find('.s1-discount-type').closest('.form-field').hide();
        $section.find('.s1-discount-percent').hide();
        $section.find('.s1-discount-fixed').hide();
    }

    function showPerItemDiscount($section) {
        $section.find('.s1-discount-type').closest('.form-field').show();
        syncDiscountFields($section);
    }

    function syncDiscountFields($section) {

        // 🔥 Safety: bundle scope → per-item discount never show
        if (getScope() === 'store_bundle') {
            hidePerItemDiscount($section);
            return;
        }

        const type = $section.find('.s1-discount-type').val();

        $section.find('.s1-discount-percent').toggle(type === 'percent');
        $section.find('.s1-discount-fixed').toggle(type === 'fixed');
    }

    function syncItemSettings($section) {
        syncQuantityFields($section);
        syncDiscountFields($section);
    }

    /* =====================================================
     * 4. INIT
     * ===================================================== */

    function initAll() {

        // Top bundle fields
        toggleFixedPriceField();
        toggleTopDiscountByScope();

        // Per-item behaviour
        toggleSettingsByScope();

        // Sync existing items
        $('.bundle-settings-per-product').each(function () {
            syncItemSettings($(this));
        });
    }

    /* =====================================================
     * 5. EVENTS
     * ===================================================== */

    // Woo panel ready
    $(document).on('woocommerce-product-data-panel-loaded', initAll);

    // Fallback
    setTimeout(initAll, 300);

    // Discount scope change
    $(document).on('change', '#_storeone_discount_scope', function () {
        toggleFixedPriceField();
        toggleTopDiscountByScope();
        toggleSettingsByScope();
    });

    // Global discount type
    $(document).on('change', '#_storeone_discount_type', function () {
        toggleBundleDiscountFields();
    });

    // Item settings toggle
    $(document).on('click', '.bundle-item-settings-toggle', function () {
        $(this).siblings('.bundle-item-settings').slideToggle(150);
    });

    // Quantity toggle
    $(document).on('change', '.s1-qty-toggle', function () {
        syncQuantityFields(
            $(this).closest('.bundle-settings-per-product')
        );
    });

    // Per-item discount type
    $(document).on('change', '.s1-discount-type', function () {
        syncDiscountFields(
            $(this).closest('.bundle-settings-per-product')
        );
    });

});
