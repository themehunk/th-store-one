jQuery(function ($) {
  "use strict";

  function initColorPickers() {
    $(".th-store-one-color-picker").each(function () {
      var $picker = $(this);

      if (!$picker.hasClass("wp-color-picker")) {
        $picker.wpColorPicker();
      }
    });
  }

  function toggleSecondaryColor() {
    var value = $("#is_dual_color").val();
    var $field = $(".th-store-one-secondary-color");

    if (!$field.length) {
      return;
    }

    if ("yes" === value) {
      $field.stop(true, true).slideDown(150);
    } else {
      $field.stop(true, true).slideUp(150);
    }
  }

  var mediaFrame = null;

  $(document).on("click", ".th-store-one-upload-image", function (event) {
    event.preventDefault();

    if (mediaFrame) {
      mediaFrame.open();
      return;
    }

    mediaFrame = wp.media({
      title: THStoreOneVariationSwatches.mediaTitle,
      button: {
        text: THStoreOneVariationSwatches.mediaButton,
      },
      multiple: false,
      library: {
        type: "image",
      },
    });

    mediaFrame.on("select", function () {
      var attachment = mediaFrame.state().get("selection").first().toJSON();

      var imageUrl = attachment.url;

      if (attachment.sizes && attachment.sizes.thumbnail) {
        imageUrl = attachment.sizes.thumbnail.url;
      }

      $("#product_attribute_image").val(attachment.id);

      $(".th-store-one-image-preview")
        .html(
          $("<img>", {
            src: imageUrl,
            alt: "",
          }),
        )
        .show();

      $(".th-store-one-remove-image").show();
    });

    mediaFrame.open();
  });

  $(document).on("click", ".th-store-one-remove-image", function (event) {
    event.preventDefault();

    $("#product_attribute_image").val("");

    $(".th-store-one-image-preview").empty().hide();

    $(this).hide();
  });

  $(document).on("change", "#is_dual_color", toggleSecondaryColor);

  initColorPickers();
  toggleSecondaryColor();
});
