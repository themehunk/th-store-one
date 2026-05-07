jQuery(function($){

    // datetime init
    $('.th-datetime').datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'HH:mm'
    });

    // global → variation sync
    $('[name="th_discount_qty"]').on('input', function(){
        if (!$('[name="th_variation_global"]').is(':checked')) {
            $('.th_discount_qty').val($(this).val());
        }
    });

    $('[name="th_sold_qty"]').on('input', function(){
        if (!$('[name="th_variation_global"]').is(':checked')) {
            $('.th_sold_qty').val($(this).val());
        }
    });

});