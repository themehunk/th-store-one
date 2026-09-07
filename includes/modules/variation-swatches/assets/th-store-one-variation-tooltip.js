jQuery(function ($) {
  "use strict";

  const config = window.THStoreOneVariationTooltip || {};

  const $container = $("#th-store-one-product-variable-swatches-options");

  /**
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */

  function getOptionsContainer() {
    return $container.find(".thvs-pro-product-variable-swatches-options");
  }

  function getAttributeTypes() {
    /*
     * Same concept as reference:
     * THVSPluginMetaObject.attribute_types
     *
     * Store One localizes this as:
     * config.attribute_types
     */
    return config.attribute_types || {};
  }

  function getVisibilityClasses(prefix) {
    return Object.keys(getAttributeTypes())
      .map(function (type) {
        return prefix + type;
      })
      .join(" ");
  }

  function blockContainer() {
    $container.block({
      message: null,
      overlayCSS: {
        background: "#fff",
        opacity: 0.6,
        cursor: "wait",
      },
    });
  }

  function unblockContainer() {
    $container.unblock();
  }

  /**
   * ---------------------------------------------------------
   * Load Product Attributes
   * ---------------------------------------------------------
   */

  function loadProductAttributes() {
    wp.ajax.send("th_store_one_load_product_attributes", {
      success: function (data) {
        $container.html(data);

        /*
         * Re-initialize all controls after AJAX HTML replacement.
         */
        initializeControls();

        $(document.body).trigger(
          "th_store_one_product_swatches_variation_loaded",
        );
      },

      error: function (error) {
        console.error(error);
      },

      data: {
        post_id: config.post_id || $("#post_ID").val(),

        nonce: config.nonce,
      },
    });
  }

  /**
   * ---------------------------------------------------------
   * WooCommerce Variations Loaded
   * ---------------------------------------------------------
   */

  $("#woocommerce-product-data").on(
    "woocommerce_variations_loaded",
    function () {
      loadProductAttributes();
    },
  );

  /**
   * ---------------------------------------------------------
   * Save Product Attributes
   * ---------------------------------------------------------
   */

  $(document.body).on(
    "click",
    ".thvs_pro_save_product_attributes",
    function (event) {
      event.preventDefault();

      const $button = $(this);

      if ($button.hasClass("disabled")) {
        return;
      }

      const data = $container.find(":input:not(.thvs-skip-field)").serialize();

      $button.addClass("disabled").prop("disabled", true);

      blockContainer();

      wp.ajax.send("th_store_one_save_product_attributes", {
        success: function (response) {
          unblockContainer();

          $button.removeClass("disabled").prop("disabled", false);

          const message =
            response && response.message
              ? response.message
              : "Settings saved successfully.";

          const noticeClass =
            response && response.class ? response.class : "updated";

          $("#thvs-pro-product-variable-swatches-options-notice")
            .removeClass(
              "notice updated error woocommerce-message woocommerce-error",
            )
            .html(message)
            .addClass(noticeClass);
        },

        error: function (error) {
          console.error(error);

          unblockContainer();

          $button.removeClass("disabled").prop("disabled", false);

          $("#thvs-pro-product-variable-swatches-options-notice")
            .removeClass(
              "notice updated error woocommerce-message woocommerce-error",
            )
            .html("Ajax error. Please check console.")
            .addClass("error");
        },

        data: {
          post_id: config.post_id || $("#post_ID").val(),

          nonce: config.nonce,

          data: data,
        },
      });
    },
  );

  /**
   * ---------------------------------------------------------
   * Reset Product Attributes
   * ---------------------------------------------------------
   */

  $(document.body).on(
    "click",
    ".thvs_pro_reset_product_attributes",
    function (event) {
      event.preventDefault();

      const $button = $(this);

      if ($button.hasClass("disabled")) {
        return;
      }

      if (
        !window.confirm(
          config.reset_notice ||
            "Are you sure you want to reset it to default setting?",
        )
      ) {
        return;
      }

      $button.addClass("disabled").prop("disabled", true);

      blockContainer();

      wp.ajax.send("th_store_one_reset_product_attributes", {
        success: function () {
          /*
           * Reference behavior:
           * Reload the complete swatch settings.
           */
          loadProductAttributes();
        },

        error: function (error) {
          console.error(error);

          unblockContainer();

          $button.removeClass("disabled").prop("disabled", false);
        },

        complete: function () {
          /*
           * loadProductAttributes() handles its own
           * re-rendering. Keep button state safe.
           */
          $button.removeClass("disabled").prop("disabled", false);
        },

        data: {
          post_id: config.post_id || $("#post_ID").val(),

          nonce: config.nonce,
        },
      });
    },
  );

  /**
   * ---------------------------------------------------------
   * Attribute Type
   * ---------------------------------------------------------
   *
   * Reference behavior:
   *
   * Attribute Type
   *       ↓
   * Taxonomy Type
   *       ↓
   * Visibility
   *
   */

  $.fn.thvs_pro_product_attribute_type = function () {
    return this.each(function () {
      const $field = $(this);

      const $wrapper = $field.closest(
        ".thvs-pro-variable-swatches-attribute-wrapper",
      );

      function changeClasses() {
        const value = String($field.val() || "");

        const visibleClass = "visible_if_" + value;

        const existingClasses = getVisibilityClasses("visible_if_");

        /*
         * Remove all previous type classes.
         */
        if (existingClasses) {
          $wrapper.removeClass(existingClasses);
        }

        /*
         * Explicitly remove custom as reference does.
         */
        $wrapper.removeClass("visible_if_custom");

        /*
         * Add currently selected type.
         */
        if (value) {
          $wrapper.addClass(visibleClass);
        }

        return value;
      }

      /*
       * Normal change.
       */
      $field.on("change", function () {
        const value = changeClasses();

        /*
         * IMPORTANT:
         * Keep taxonomy type synchronized
         * with main Attribute Type.
         */
        $wrapper
          .find(".thvs-pro-swatch-tax-type")
          .val(value)
          .trigger("change.taxonomy");
      });

      /*
       * Internal attribute update.
       */
      $field.on("change.attribute", function () {
        changeClasses();
      });

      /*
       * Initial state.
       */
      changeClasses();
    });
  };

  /**
   * ---------------------------------------------------------
   * Taxonomy / Term Type
   * ---------------------------------------------------------
   *
   * Reference behavior:
   *
   * All term types same
   *       ↓
   * Main Attribute Type = same type
   *
   * Different term types
   *       ↓
   * Main Attribute Type = custom
   *
   */

  $.fn.thvs_pro_product_taxonomy_type = function () {
    return this.each(function () {
      const $field = $(this);

      const $wrapper = $field.closest(
        ".thvs-pro-variable-swatches-attribute-tax-wrapper",
      );

      const $mainWrapper = $field.closest(
        ".thvs-pro-variable-swatches-attribute-wrapper",
      );

      function changeClasses() {
        const value = String($field.val() || "");

        const visibleClass = "visible_if_tax_" + value;

        const existingClasses = getVisibilityClasses("visible_if_tax_");

        if (existingClasses) {
          $wrapper.removeClass(existingClasses);
        }

        if (value) {
          $wrapper.addClass(visibleClass);
        }

        return value;
      }

      /*
       * Normal taxonomy type change.
       */
      $field.on("change", function () {
        changeClasses();

        const allValues = [];

        $mainWrapper.find(".thvs-pro-swatch-tax-type").each(function () {
          const value = String($(this).val() || "");

          if (value) {
            allValues.push(value);
          }
        });

        /*
         * Remove duplicates.
         */
        const uniqueValues = _.uniq(allValues);

        const isAllTaxSame = uniqueValues.length === 1;

        /*
         * If every term uses same type,
         * main Attribute Type follows it.
         *
         * Otherwise main type becomes custom.
         */
        if (isAllTaxSame) {
          $mainWrapper
            .find(".thvs-pro-swatch-option-type")
            .val(uniqueValues[0])
            .trigger("change.attribute");
        } else {
          $mainWrapper
            .find(".thvs-pro-swatch-option-type")
            .val("custom")
            .trigger("change.attribute");
        }
      });

      /*
       * Attribute Type -> Taxonomy Type
       *
       * Do NOT execute the reverse logic here.
       */
      $field.on("change.taxonomy", function () {
        changeClasses();
      });

      /*
       * Initial state.
       */
      changeClasses();
    });
  };

  /**
   * ---------------------------------------------------------
   * Tooltip Type
   * ---------------------------------------------------------
   */

  $.fn.thvs_pro_product_taxonomy_item_tooltip_type = function () {
    return this.each(function () {
      const $field = $(this);

      const $wrapper = $field.closest("tbody");

      function changeClasses() {
        const value = String($field.val() || "");

        const visibleClass = "visible_if_item_tooltip_type_" + value;

        const existingClasses = ["", "text", "image", "no"]
          .map(function (type) {
            return "visible_if_item_tooltip_type_" + type;
          })
          .join(" ");

        $wrapper
          .find(".thvs-pro-item-tooltip-type-item")
          .removeClass(existingClasses)
          .addClass(visibleClass);
      }

      $field.on("change", function () {
        changeClasses();
      });

      changeClasses();
    });
  };

  /**
   * ---------------------------------------------------------
   * Dual Color
   * ---------------------------------------------------------
   */

  $.fn.thvs_pro_product_taxonomy_item_dual_color = function () {
    return this.each(function () {
      const $field = $(this);

      const $wrapper = $field.closest("tbody");

      function changeClasses() {
        const value = String($field.val() || "");

        const visibleClass = "visible_if_item_dual_color_" + value;

        const existingClasses = ["", "yes", "no"]
          .map(function (type) {
            return "visible_if_item_dual_color_" + type;
          })
          .join(" ");

        $wrapper
          .find(".thvs-pro-item-secondary-color-item")
          .removeClass(existingClasses)
          .addClass(visibleClass);
      }

      $field.on("change", function () {
        changeClasses();
      });

      changeClasses();
    });
  };

  /**
   * ---------------------------------------------------------
   * Color Picker
   * ---------------------------------------------------------
   */

  function initializeColorPicker() {
    if (typeof $.fn.wpColorPicker !== "function") {
      return;
    }

    $container.find(".thvs-color-picker").each(function () {
      const $input = $(this);

      if (!$input.hasClass("wp-color-picker")) {
        $input.wpColorPicker();
      }
    });
  }

  /**
   * ---------------------------------------------------------
   * WordPress Media Uploader
   * ---------------------------------------------------------
   */
  function initializeMediaUploader() {
    $(document)
      .off("click.thStoreOne", ".thvs_upload_image_button")
      .on("click.thStoreOne", ".thvs_upload_image_button", function (event) {
        event.preventDefault();

        const $button = $(this);
        const $wrapper = $button.closest(".meta-image-field-wrapper");
        const $input = $wrapper.find('input[type="hidden"]');
        const $preview = $wrapper.find(".image-preview");
        const $removeButton = $wrapper.find(".thvs_remove_image_button");

        if (typeof wp === "undefined" || !wp.media) {
          console.error("WordPress Media Library is not available.");
          return;
        }

        const frame = wp.media({
          title: "Select Image",
          button: {
            text: "Use this image",
          },
          multiple: false,
          library: {
            type: "image",
          },
        });

        frame.on("select", function () {
          const attachment = frame.state().get("selection").first().toJSON();

          if (!attachment || !attachment.id) {
            return;
          }

          $input.val(attachment.id);

          const imageUrl =
            attachment.sizes && attachment.sizes.thumbnail
              ? attachment.sizes.thumbnail.url
              : attachment.url;

          $preview.html(
            $("<img>", {
              src: imageUrl,
              width: 60,
              height: 60,
              alt: "",
            }),
          );

          $removeButton.show();
        });

        frame.open();
      });

    $(document)
      .off("click.thStoreOne", ".thvs_remove_image_button")
      .on("click.thStoreOne", ".thvs_remove_image_button", function (event) {
        event.preventDefault();

        const $button = $(this);
        const $wrapper = $button.closest(".meta-image-field-wrapper");

        $wrapper.find('input[type="hidden"]').val("");
        $wrapper.find(".image-preview").empty();

        $button.hide();
      });
  }

  /**
   * ---------------------------------------------------------
   * Initialize All Controls
   * ---------------------------------------------------------
   */

  function initializeControls() {
    const $context = getOptionsContainer();

    if (!$context.length) {
      return;
    }

    /*
     * Attribute Type
     */
    $context
      .find(".thvs-pro-swatch-option-type")
      .thvs_pro_product_attribute_type();

    /*
     * Taxonomy Type
     */
    $context.find(".thvs-pro-swatch-tax-type").thvs_pro_product_taxonomy_type();

    /*
     * Tooltip Type
     */
    $context
      .find(".thvs-pro-item-tooltip-type")
      .thvs_pro_product_taxonomy_item_tooltip_type();

    /*
     * Dual Color
     */
    $context
      .find(".thvs-pro-item-tooltip-is-dual-color")
      .thvs_pro_product_taxonomy_item_dual_color();

    /*
     * Color picker
     */
    initializeColorPicker();
    initializeMediaUploader();
  }

  /**
   * ---------------------------------------------------------
   * Re-init after AJAX Load
   * ---------------------------------------------------------
   */

  $(document.body).on(
    "th_store_one_product_swatches_variation_loaded",
    function () {
      initializeControls();
    },
  );

  /*
   * Also support the reference event name.
   * This makes migration easier if any old code
   * still triggers it.
   */
  $(document.body).on(
    "thvs_pro_product_swatches_variation_loaded",
    function () {
      initializeControls();
    },
  );

  /**
   * ---------------------------------------------------------
   * Initial Init
   * ---------------------------------------------------------
   */

  initializeControls();
});
