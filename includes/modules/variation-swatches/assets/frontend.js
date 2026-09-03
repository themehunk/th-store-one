(function ($) {
  "use strict";

  const config = window.THStoreOneVariationSwatches || {};

  const settings = config.settings || {};

  /**
   * Convert value to boolean.
   */
  function toBool(value) {
    if (typeof value === "boolean") {
      return value;
    }

    return (
      ["1", "true", "yes", "on"].indexOf(String(value).toLowerCase()) !== -1
    );
  }

  /**
   * Get CSS variables from settings.
   */
  function applySettings() {
    const root = document.documentElement;

    if (settings.width) {
      root.style.setProperty(
        "--th-store-one-width",
        parseInt(settings.width, 10) + "px",
      );
    }

    if (settings.font_size) {
      root.style.setProperty(
        "--th-store-one-font-size",
        parseInt(settings.font_size, 10) + "px",
      );
    }

    if (settings.border_color) {
      root.style.setProperty(
        "--th-store-one-border-color",
        settings.border_color,
      );
    }

    if (settings.hover_border_color) {
      root.style.setProperty(
        "--th-store-one-hover-border-color",
        settings.hover_border_color,
      );
    }

    if (settings.text_color) {
      root.style.setProperty("--th-store-one-text-color", settings.text_color);
    }

    if (settings.hover_text_color) {
      root.style.setProperty(
        "--th-store-one-hover-text-color",
        settings.hover_text_color,
      );
    }

    if (settings.background_color) {
      root.style.setProperty(
        "--th-store-one-button-background",
        settings.background_color,
      );
    }

    if (settings.hover_background_color) {
      root.style.setProperty(
        "--th-store-one-button-hover-background",
        settings.hover_background_color,
      );
    }

    if (settings.tooltip_background) {
      root.style.setProperty(
        "--th-store-one-tooltip-background",
        settings.tooltip_background,
      );
    }

    if (settings.tooltip_text) {
      root.style.setProperty(
        "--th-store-one-tooltip-text",
        settings.tooltip_text,
      );
    }

    if (settings.tooltip_border) {
      root.style.setProperty(
        "--th-store-one-tooltip-border",
        settings.tooltip_border,
      );
    }
  }

  function initImageTooltip() {
    if (!toBool(settings.image_tooltip)) {
      return;
    }

    const width = parseInt(settings.image_tooltip_width || 120, 10);

    document.documentElement.style.setProperty(
      "--th-store-one-tooltip-image-width",
      width + "px",
    );

    $(document).on(
      "mouseenter",
      ".th-store-one-swatch[data-tooltip-image]",
      function () {
        const $swatch = $(this);
        const imageUrl = $swatch.attr("data-tooltip-image");

        if (!imageUrl) {
          return;
        }

        $swatch.addClass("th-store-one-image-tooltip-active");
      },
    );

    $(document).on(
      "mouseleave",
      ".th-store-one-swatch[data-tooltip-image]",
      function () {
        $(this).removeClass("th-store-one-image-tooltip-active");
      },
    );
  }

  /**
   * Get matching select.
   */
  function getSelect($wrapper) {
    const attribute = $wrapper.data("attribute");

    if (!attribute) {
      return $();
    }

    return $wrapper
      .closest(".variations_form")
      .find('select[name="' + attribute + '"]')
      .first();
  }

  /**
   * Update variation attribute labels with selected value.
   *
   * Example:
   * Color : Yellow
   * Size : XL
   */
  function syncVariationLabels($form) {
    if (!$form || !$form.length) {
      return;
    }

    // Only single product page.
    if (!$form.closest(".single-product").length) {
      return;
    }

    const separator = settings.variation_label_separator || ":";

    $form.find(".th-store-one-swatches").each(function () {
      const $wrapper = $(this);
      const $select = getSelect($wrapper);

      if (!$select.length) {
        return;
      }

      const value = $select.val() || "";

      // WooCommerce attribute row.
      const $row = $select.closest("tr");

      if (!$row.length) {
        return;
      }

      const $label = $row.find("label").first();

      if (!$label.length) {
        return;
      }

      // Save original label only once.
      if (!$label.data("th-store-one-original-label")) {
        $label.data("th-store-one-original-label", $.trim($label.text()));
      }

      const originalLabel = $label.data("th-store-one-original-label");

      // No selected value → show original label.
      if (!value) {
        $label.text(originalLabel);
        return;
      }

      const $option = $select.find('option[value="' + cssEscape(value) + '"]');

      if (!$option.length) {
        $label.text(originalLabel);
        return;
      }

      const selectedText = $.trim($option.text());

      if (!selectedText) {
        $label.text(originalLabel);
        return;
      }

      $label.text(originalLabel + " " + separator + " " + selectedText);
    });
  }

  /**
   * Set selected state.
   */
  function syncSelected($wrapper) {
    const $select = getSelect($wrapper);

    if (!$select.length) {
      return;
    }

    const value = $select.val() || "";

    $wrapper
      .find(".th-store-one-swatch")
      .removeClass("th-store-one-selected")
      .attr("aria-pressed", "false");

    if (!value) {
      return;
    }

    $wrapper
      .find('.th-store-one-swatch[data-value="' + cssEscape(value) + '"]')
      .addClass("th-store-one-selected")
      .attr("aria-pressed", "true");
  }

  /**
   * CSS escape helper.
   */
  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(String(value));
    }

    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  /**
   * Get unavailable behavior.
   */
  function getBehaviorClass() {
    const behavior = settings.behavior || "blur";

    return "th-store-one-behavior-" + behavior;
  }

  /**
   * Render selected variation stock availability.
   */
  function renderStockAvailability($form, variation) {
    $form.find(".th-store-one-stock-availability").remove();

    if (!variation) {
      return;
    }

    const variationSettings = variation.th_store_one || {};

    // Stock display disabled from settings.
    if (!toBool(variationSettings.show_stock_available)) {
      return;
    }

    /*
     * Only show stock when WooCommerce
     * "Manage stock?" is enabled for this variation.
     */
    if (!variation.is_in_stock || !variation.manage_stock) {
      return;
    }

    const stockQuantity = Number(variation.max_qty);

    if (!Number.isFinite(stockQuantity)) {
      return;
    }

    const threshold = Number(variationSettings.stock_display_threshold || 0);

    /*
     * 0 = always show stock.
     * Otherwise show when stock reaches threshold.
     */
    if (threshold !== 0 && stockQuantity > threshold) {
      return;
    }

    const $stock = $('<div class="th-store-one-stock-availability"></div>');

    $stock.text("Stock: " + stockQuantity);

    $form.find(".variations").after($stock);
  }

  /**
   * Mark unavailable swatches.
   */
  function syncAvailability($wrapper) {
    const $select = getSelect($wrapper);

    if (!$select.length) {
      return;
    }

    $wrapper
      .removeClass(
        "th-store-one-behavior-blur " +
          "th-store-one-behavior-blur-no-cross " +
          "th-store-one-behavior-hide",
      )
      .addClass(getBehaviorClass());

    const availableValues = {};

    $select.find("option").each(function () {
      const value = $(this).val();

      if (value) {
        availableValues[value] = true;
      }
    });

    $wrapper.find(".th-store-one-swatch").each(function () {
      const $swatch = $(this);

      const value = $swatch.attr("data-value");

      $swatch.removeClass("th-store-one-disabled");

      if (value && !availableValues[value]) {
        $swatch.addClass("th-store-one-disabled");
      }
    });
  }

  /**
   * Initialize a single swatch wrapper.
   */
  function initWrapper($wrapper) {
    if ($wrapper.data("th-store-one-ready")) {
      return;
    }

    $wrapper.data("th-store-one-ready", true);

    syncSelected($wrapper);
    syncAvailability($wrapper);
  }

  /**
   * Initialize all single-product swatches.
   */
  function initSingleProduct() {
    $(".th-store-one-swatches").each(function () {
      initWrapper($(this));
    });
  }

  /**
   * Swatch click.
   */
  $(document).on(
    "click",
    ".th-store-one-swatches .th-store-one-swatch",
    function (event) {
      event.preventDefault();

      const $swatch = $(this);

      if ($swatch.hasClass("th-store-one-disabled")) {
        return;
      }

      const $wrapper = $swatch.closest(".th-store-one-swatches");

      const $select = getSelect($wrapper);

      if (!$select.length) {
        return;
      }

      const value = $swatch.attr("data-value");

      /*
       * Clear selected attribute when the same swatch
       * is clicked again, if the setting is enabled.
       */
      if (
        toBool(settings.clear_on_reselect) &&
        $swatch.hasClass("th-store-one-selected")
      ) {
        $select.val("").trigger("change");
      } else {
        $select.val(value).trigger("change");
      }

      syncSelected($wrapper);
      syncVariationLabels($swatch.closest(".variations_form"));
    },
  );

  /**
   * WooCommerce variation events.
   */
  $(document).on(
    "woocommerce_variation_has_changed",
    ".variations_form",
    function () {
      const $form = $(this);

      $form.find(".th-store-one-swatches").each(function () {
        const $wrapper = $(this);

        syncSelected($wrapper);

        syncAvailability($wrapper);
      });
      syncVariationLabels($form);
    },
  );

  $(document).on("reset_data", ".variations_form", function () {
    const $form = $(this);

    $form.find(".th-store-one-stock-availability").remove();

    $form.find(".th-store-one-swatches").each(function () {
      syncSelected($(this));
      syncAvailability($(this));
    });
    syncVariationLabels($form);
  });

  /**
   * WooCommerce found variation.
   */
  $(document).on(
    "found_variation",
    ".variations_form",
    function (event, variation) {
      const $form = $(this);

      $form.find(".th-store-one-swatches").each(function () {
        syncSelected($(this));
        syncAvailability($(this));
      });
      syncVariationLabels($form);
      renderStockAvailability($form, variation);
    },
  );

  /**
   * Clear shop swatches.
   */
  $(document).on("click", ".th-store-one-shop-clear", function (event) {
    event.preventDefault();

    const $container = $(this).closest(".th-store-one-shop-swatches");

    $container
      .find(".th-store-one-selected")
      .removeClass("th-store-one-selected");
  });

  /**
   * Shop swatch click.
   *
   * Shop/catalog is primarily visual in this
   * first implementation.
   */
  $(document).on(
    "click",
    ".th-store-one-shop-swatches .th-store-one-swatch",
    function (event) {
      event.preventDefault();

      const $swatch = $(this);

      if ($swatch.hasClass("th-store-one-disabled")) {
        return;
      }

      const $group = $swatch.closest(".th-store-one-shop-swatches-group");

      $group
        .find(".th-store-one-selected")
        .removeClass("th-store-one-selected");

      $swatch.addClass("th-store-one-selected");
    },
  );

  /**
   * Initial load.
   */
  $(function () {
    applySettings();
    initSingleProduct();
    initImageTooltip();

    $(".single-product .variations_form").each(function () {
      syncVariationLabels($(this));
    });

    setTimeout(function () {
      initSingleProduct();

      $(".single-product .variations_form").each(function () {
        syncVariationLabels($(this));
      });
    }, 100);
  });
})(jQuery);
