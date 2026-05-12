jQuery(function ($) {
  $(".th-people-view-wrapper").each(function () {
    const wrapper = $(this);

    const productId = wrapper.data("product-id");
    const ruleId = wrapper.data("rule-id");
    const interval = parseInt(wrapper.data("interval")) || 15;
    console.log(interval);

    setInterval(function () {
      $.ajax({
        url: thPeopleView.ajaxurl,
        type: "POST",

        data: {
          action: "th_update_people_view",
          product_id: productId,
          rule_id: ruleId,
        },

        success: function (response) {
          if (response.success) {
            wrapper.find(".th-people-view-message").html(response.data.message);
          }
        },
      });
    }, interval * 1000);
  });
});
