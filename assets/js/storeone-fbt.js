(function ($) {
    'use strict';

    const FBT = {

        init() {
            this.bindEvents();
            this.recalculateAll(); // first load
        },

        bindEvents() {
            $(document).on('change', '.s1-fbt-checkbox', () => this.recalculateAll());
            $(document).on('change', '.s1-fbt-variation select', () => this.recalculateAll());
        },

        /* -------------------------------------------------------------
             MAIN — Recalculate TOTAL, SAVINGS, BUTTON LABEL, IDS
        ------------------------------------------------------------- */
        recalculateAll() {

            $('.s1-fbt-product-wrap').each((i, wrapEl) => {

                const wrap = $(wrapEl);

                let total = 0;
                let base_price = 0;
                let selected_ids = [];

                const $totalFinal = wrap.find('.s1-fbt-total-final-amount');
                const $savingText = wrap.find('.s1-fbt-saving-text');
                const $basePriceEl = wrap.find('.s1-fbt-base-price');
                const $selectedIdsEl = wrap.find('.s1-fbt-selected-ids');

                const mainId = $selectedIdsEl.data('main-id');

                /* ------------------------------------------
                   MAIN PRODUCT BASE PRICE (first item)
                ------------------------------------------ */
                const mainCheckbox = wrap.find(`.s1-fbt-checkbox[data-product-id="${mainId}"]`);

                if (mainCheckbox.length) {
                    const baseVal = parseFloat(mainCheckbox.data('price')) || 0;
                    base_price = baseVal;
                }

                /* ------------------------------------------
                    LOOP ALL CHECKED PRODUCTS
                ------------------------------------------ */
                wrap.find('.s1-fbt-checkbox').each((n, el) => {

                    if (!el.checked) return;

                    const pid = $(el).data('product-id');
                    const price = parseFloat($(el).data('price')) || 0;

                    selected_ids.push(pid);
                    total += price;
                });

                /* ------------------------------------------
                    UPDATE: FINAL PRICE
                ------------------------------------------ */

                $totalFinal.html(StoreOneFBT.currency_symbol + total.toFixed(2));

                /* ------------------------------------------
                    SAVING CALCULATION
                ------------------------------------------ */
                const saving = total - base_price;

                if (saving > 0) {
                    const template = $savingText.data('template');
                    const text = template.replace('{amount}', StoreOneFBT.currency_symbol + saving.toFixed(2));
                    $savingText.text(text).show();
                } else {
                    $savingText.text('').hide();
                }

                /* ------------------------------------------
                    UPDATE SELECTED IDs (for AJAX)
                ------------------------------------------ */
                $selectedIdsEl.val(selected_ids.join(','));

                /* ------------------------------------------
                    BUTTON LABEL UPDATE
                ------------------------------------------ */
                const btn = wrap.find('.s1-fbt-add-button');
                let count = selected_ids.length;

                if (count === 1) {
                    btn.text(StoreOneFBT.btn_single);
                } else if (count === 2) {
                    btn.text(StoreOneFBT.btn_double);
                } else {
                    btn.text(StoreOneFBT.btn_multi);
                }

                /* ------------------------------------------
                    INACTIVE / ACTIVE PRODUCT IMAGE
                ------------------------------------------ */

                wrap.find('.s1-fbt-product').each((x, productEl) => {
                    const pid = $(productEl).data('id') || productEl.className.match(/post-(\d+)/)?.[1];

                    if (selected_ids.includes(parseInt(pid))) {
                        $(productEl).removeClass('s1-fbt-inactive');
                    } else {
                        $(productEl).addClass('s1-fbt-inactive');
                    }
                });

            });
        }
    };

    $(document).ready(() => FBT.init());

})(jQuery);
