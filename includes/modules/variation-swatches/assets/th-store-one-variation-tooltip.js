(function ($) {
  "use strict";

  const config = window.THStoreOneVariationTooltip || {};

  const $panel = $("#th-store-one-product-variable-swatches-options");
  const $options = $panel.find(".thvs-pro-product-variable-swatches-options");
  const $notice = $("#thvs-pro-product-variable-swatches-options-notice");

  /**
   * Show notice.
   */
  function showNotice(message, type) {
    const noticeClass =
      type === "error" ? "woocommerce-error" : "woocommerce-message";

    $notice
      .removeClass("woocommerce-message woocommerce-error")
      .addClass(noticeClass)
      .html("<p>" + message + "</p>")
      .show();
  }

  /**
   * Convert serialized form data to object.
   *
   * PHP accepts both serialized string and array,
   * so sending serialize() is safe.
   */
  function getProductSwatchesData() {
    return $options.find(":input").serialize();
  }

  /**
   * Update visibility based on selected attribute type.
   */
  function updateAttributeVisibility($wrapper) {
    const type = $wrapper.find(".thvs-pro-swatch-option-type").val();

    $wrapper
      .removeClass(function (index, className) {
        return (className.match(/visible_if_[^\s]+/g) || []).join(" ");
      })
      .addClass("visible_if_" + type);

    $wrapper
      .find(".variable-swatches-attribute-data")
      .find("tr")
      .each(function () {
        const $row = $(this);

        const classes = $row.attr("class") || "";

        const visibleClasses = classes.match(/visible_if_[^\s]+/g) || [];

        if (!visibleClasses.length) {
          return;
        }

        let visible = false;

        visibleClasses.forEach(function (className) {
          if (className === "visible_if_" + type) {
            visible = true;
          }
        });

        $row.toggle(visible);
      });
  }

  /**
   * Update term visibility.
   */
  function updateTermVisibility($wrapper) {
    const type = $wrapper.find(".thvs-pro-swatch-tax-type").val();

    $wrapper
      .removeClass(function (index, className) {
        return (className.match(/visible_if_tax_[^\s]+/g) || []).join(" ");
      })
      .addClass("visible_if_tax_" + type);

    $wrapper.find(".variable-swatches-taxonomy-data tr").each(function () {
      const $row = $(this);
      const classes = $row.attr("class") || "";

      const visibleClasses = classes.match(/visible_if_tax_[^\s]+/g) || [];

      if (!visibleClasses.length) {
        return;
      }

      let visible = false;

      visibleClasses.forEach(function (className) {
        if (className === "visible_if_tax_" + type) {
          visible = true;
        }
      });

      $row.toggle(visible);
    });
  }

  /**
   * Tooltip type visibility.
   */
  function updateTooltipVisibility($wrapper) {
    const tooltipType = $wrapper.find(".thvs-pro-item-tooltip-type").val();

    $wrapper.find(".thvs-pro-item-tooltip-type-item").hide();

    if (!tooltipType) {
      return;
    }

    $wrapper.find(".thvs-pro-item-tooltip-type-" + tooltipType).show();
  }

  /**
   * Dual color visibility.
   */
  function updateDualColorVisibility($wrapper) {
    const value = $wrapper.find(".thvs-pro-item-tooltip-is-dual-color").val();

    $wrapper
      .find(".thvs-pro-item-secondary-color-item")
      .toggle(value === "yes");
  }

  /**
   * Initialize all controls.
   */
  function initializeControls(context) {
    const $context = context ? $(context) : $panel;

    $context.find(".thvs-pro-swatch-option-type").each(function () {
      updateAttributeVisibility(
        $(this).closest(".thvs-pro-variable-swatches-attribute-wrapper"),
      );
    });

    $context.find(".thvs-pro-swatch-tax-type").each(function () {
      updateTermVisibility(
        $(this).closest(".thvs-pro-variable-swatches-attribute-tax-wrapper"),
      );
    });

    $context.find(".thvs-pro-item-tooltip-type").each(function () {
      updateTooltipVisibility(
        $(this).closest(".thvs-pro-variable-swatches-attribute-tax-wrapper"),
      );
    });

    $context.find(".thvs-pro-item-tooltip-is-dual-color").each(function () {
      updateDualColorVisibility(
        $(this).closest(".thvs-pro-variable-swatches-attribute-tax-wrapper"),
      );
    });

    $context.find(".thvs-color-picker").each(function () {
      const $input = $(this);

      if (!$input.hasClass("wp-color-picker")) {
        $input.wpColorPicker();
      }
    });
  }

  /**
   * Attribute type change.
   */
  $(document).on("change", ".thvs-pro-swatch-option-type", function () {
    const $wrapper = $(this).closest(
      ".thvs-pro-variable-swatches-attribute-wrapper",
    );

    updateAttributeVisibility($wrapper);
  });

  /**
   * Term type change.
   */
  $(document).on("change", ".thvs-pro-swatch-tax-type", function () {
    const $wrapper = $(this).closest(
      ".thvs-pro-variable-swatches-attribute-tax-wrapper",
    );

    updateTermVisibility($wrapper);
  });

  /**
   * Tooltip type change.
   */
  $(document).on("change", ".thvs-pro-item-tooltip-type", function () {
    const $wrapper = $(this).closest(
      ".thvs-pro-variable-swatches-attribute-tax-wrapper",
    );

    updateTooltipVisibility($wrapper);
  });

  /**
   * Dual color change.
   */
  $(document).on("change", ".thvs-pro-item-tooltip-is-dual-color", function () {
    const $wrapper = $(this).closest(
      ".thvs-pro-variable-swatches-attribute-tax-wrapper",
    );

    updateDualColorVisibility($wrapper);
  });

  /**
   * Open media uploader.
   */
  $(document).on("click", ".thvs_upload_image_button", function (event) {
    event.preventDefault();

    const $button = $(this);
    const $wrapper = $button.closest(".meta-image-field-wrapper");

    const $input = $wrapper.find('input[type="hidden"]');

    const $image = $wrapper.find(".image-preview img");

    const $removeButton = $wrapper.find(".thvs_remove_image_button");

    const frame = wp.media({
      title: "Select image",
      button: {
        text: "Use this image",
      },
      multiple: false,
    });

    frame.on("select", function () {
      const attachment = frame.state().get("selection").first().toJSON();

      if (!attachment || !attachment.id) {
        return;
      }

      $input.val(attachment.id);

      $image.attr("src", attachment.url);

      $removeButton.show();
    });

    frame.open();
  });

  /**
   * Remove image.
   */
  $(document).on("click", ".thvs_remove_image_button", function (event) {
    event.preventDefault();

    const $button = $(this);
    const $wrapper = $button.closest(".meta-image-field-wrapper");

    const $input = $wrapper.find('input[type="hidden"]');

    const $image = $wrapper.find(".image-preview img");

    $input.val("");

    const placeholder = $image.data("placeholder");

    if (placeholder) {
      $image.attr("src", placeholder);
    }

    $button.hide();
  });

  /**
   * Save swatch settings.
   */
  $(document).on(
    "click",
    ".thvs_pro_save_product_attributes",
    function (event) {
      event.preventDefault();

      const $button = $(this);

      if ($button.hasClass("disabled")) {
        return;
      }

      const postId = config.post_id || $("#post_ID").val();

      if (!postId) {
        showNotice("Invalid product ID.", "error");
        return;
      }

      const data = getProductSwatchesData();

      $button.addClass("disabled").prop("disabled", true);

      $options.block({
        message: null,
        overlayCSS: {
          cursor: "wait",
        },
      });

      $.ajax({
        url: config.ajaxurl,
        type: "POST",
        data: {
          action: "th_store_one_save_product_attributes",
          nonce: config.nonce,
          post_id: postId,
          data: data,
        },
        success: function (response) {
          if (response && response.success) {
            showNotice(response.data.message || "Settings saved", "success");
          } else {
            showNotice(
              response && response.data
                ? response.data
                : "Unable to save settings.",
              "error",
            );
          }
        },
        error: function () {
          showNotice("Unable to save settings.", "error");
        },
        complete: function () {
          $button.removeClass("disabled").prop("disabled", false);

          $options.unblock();
        },
      });
    },
  );

  /**
   * Reset settings.
   */
  $(document).on(
    "click",
    ".thvs_pro_reset_product_attributes",
    function (event) {
      event.preventDefault();

      const $button = $(this);

      if (
        !window.confirm(
          config.reset_notice ||
            "Are you sure you want to reset it to default setting?",
        )
      ) {
        return;
      }

      const postId = config.post_id || $("#post_ID").val();

      if (!postId) {
        showNotice("Invalid product ID.", "error");
        return;
      }

      $button.addClass("disabled").prop("disabled", true);

      $options.block({
        message: null,
        overlayCSS: {
          cursor: "wait",
        },
      });

      $.ajax({
        url: config.ajaxurl,
        type: "POST",
        data: {
          action: "th_store_one_reset_product_attributes",
          nonce: config.nonce,
          post_id: postId,
        },
        success: function (response) {
          if (response && response.success) {
            loadProductAttributes();
          } else {
            showNotice("Unable to reset settings.", "error");
          }
        },
        error: function () {
          showNotice("Unable to reset settings.", "error");
        },
        complete: function () {
          $button.removeClass("disabled").prop("disabled", false);

          $options.unblock();
        },
      });
    },
  );

  /**
   * Load product swatch settings.
   */
  function loadProductAttributes() {
    const postId = config.post_id || $("#post_ID").val();

    if (!postId) {
      return;
    }

    $options.block({
      message: null,
      overlayCSS: {
        cursor: "wait",
      },
    });

    $.ajax({
      url: config.ajaxurl,
      type: "POST",
      data: {
        action: "th_store_one_load_product_attributes",
        nonce: config.nonce,
        post_id: postId,
      },
      success: function (response) {
        if (response && response.success) {
          $options.html(response.data);

          initializeControls($options);

          $(document.body).trigger("th_store_one_product_attributes_loaded");
        } else {
          showNotice(
            response && response.data
              ? response.data
              : "Unable to load settings.",
            "error",
          );
        }
      },
      error: function () {
        showNotice("Unable to load settings.", "error");
      },
      complete: function () {
        $options.unblock();
      },
    });
  }

  /**
   * WooCommerce variations loaded.
   *
   * Load swatch panel after variation data
   * has been loaded.
   */
  $(document.body).on("woocommerce_variations_loaded", function () {
    loadProductAttributes();
  });

  /**
   * Also initialize existing HTML.
   */
  $(function () {
    initializeControls($options);
  });
})(jQuery);
