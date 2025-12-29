jQuery(function ($) {

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

    // On page load (important for saved items)
    toggleSelectedBox();

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

                    <span class="price">${p.price}</span>

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

            // 🔥 Show selected box
            toggleSelectedBox();

            // 🔄 Reset search field
            $('.storeone-bundle-search').val(null).trigger('change');
        });
    });

    /* -----------------------------
     * Qty sync
     * ----------------------------- */
    $(document).on('input', '.bundle-item .qty', function () {
        $(this).closest('.bundle-item').find('.qty-hidden').val(this.value);
    });

    /* -----------------------------
     * Remove item
     * ----------------------------- */
    $(document).on('click', '.bundle-item .remove', function (e) {
        e.preventDefault();
        $(this).closest('.bundle-item').remove();

        // 🔥 Hide box if empty
        toggleSelectedBox();
    });

    /* -----------------------------
     * Sortable
     * ----------------------------- */
    if ($('.storeone-bundle-selected').length) {
        $('.storeone-bundle-selected').sortable({
            handle: '.drag'
        });
    }
});
