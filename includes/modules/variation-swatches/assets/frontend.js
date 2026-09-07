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

  /**
   * Get the effective tooltip mode for a swatch.
   *
   * Product-level PHP resolves Global/Hide/Text/Image and term-level
   * Default/Text/Image/No/Text + Image into data-tooltip-type.
   */
  function getTooltipMode($swatch) {
    let mode = String($swatch.attr("data-tooltip-type") || "").toLowerCase();

    if (!mode || mode === "default" || mode === "global") {
      mode = toBool(settings.tooltip) ? "text" : "no";

      // Preserve the existing global image-tooltip attribute feature.
      if (
        mode === "text" &&
        toBool(settings.show_tootip_image) &&
        settings.show_tootip_image_attr
      ) {
        const wrapperAttribute = String(
          $swatch.closest(".th-store-one-swatches").data("attribute") || "",
        ).toLowerCase();

        const configuredAttribute = String(
          settings.show_tootip_image_attr || "",
        ).toLowerCase();

        if (
          wrapperAttribute &&
          configuredAttribute &&
          (wrapperAttribute === configuredAttribute ||
            wrapperAttribute === "pa-" + configuredAttribute ||
            "pa-" + wrapperAttribute === configuredAttribute)
        ) {
          mode = "image";
        }
      }
    }

    if (mode === "hide" || mode === "none" || mode === "false") {
      mode = "no";
    }

    if (mode === "text+image" || mode === "text_image") {
      mode = "text-image";
    }

    if (["no", "text", "image", "text-image"].indexOf(mode) === -1) {
      mode = toBool(settings.tooltip) ? "text" : "no";
    }

    return mode;
  }

  /**
   * Apply the effective tooltip mode to one swatch.
   *
   * This prevents the global tooltip behavior from overriding
   * Product Edit settings.
   */
  function applySwatchTooltip($swatch) {
    if (!$swatch || !$swatch.length) {
      return;
    }

    const mode = getTooltipMode($swatch);
    const text = String(
      $swatch.attr("data-tooltip-text") ||
        $swatch.attr("data-tooltip") ||
        $swatch.attr("aria-label") ||
        "",
    ).trim();

    const imageUrl = String($swatch.attr("data-tooltip-image") || "").trim();

    // Never allow the browser's native title tooltip to bypass "Hide".
    $swatch.removeAttr("title");

    $swatch.removeClass(
      "th-store-one-has-image-tooltip " + "th-store-one-image-tooltip-active",
    );

    if (mode === "no") {
      $swatch
        .removeAttr("data-tooltip")
        .removeAttr("data-tooltip-text")
        .removeAttr("data-tooltip-image");

      return;
    }

    if (mode === "image") {
      if (!imageUrl) {
        // Do not fall back to global text when Image is explicitly selected.
        $swatch
          .removeAttr("data-tooltip")
          .removeAttr("data-tooltip-text")
          .removeAttr("data-tooltip-image");
        return;
      }

      $swatch
        .removeAttr("data-tooltip")
        .removeAttr("data-tooltip-text")
        .attr("data-tooltip-image", imageUrl)
        .addClass("th-store-one-has-image-tooltip");

      return;
    }

    if (mode === "text-image") {
      if (text) {
        $swatch.attr("data-tooltip", text).attr("data-tooltip-text", text);
      } else {
        $swatch.removeAttr("data-tooltip").removeAttr("data-tooltip-text");
      }

      if (imageUrl) {
        $swatch
          .attr("data-tooltip-image", imageUrl)
          .addClass("th-store-one-has-image-tooltip");
      } else {
        $swatch.removeAttr("data-tooltip-image");
      }

      return;
    }

    // Text mode: explicitly remove the image source so a global image
    // tooltip cannot leak into Product Edit "Text".
    if (text) {
      $swatch.attr("data-tooltip", text).attr("data-tooltip-text", text);
    } else {
      $swatch.removeAttr("data-tooltip").removeAttr("data-tooltip-text");
    }

    $swatch.removeAttr("data-tooltip-image");
  }

  function initImageTooltip() {
    const width = parseInt(settings.image_tooltip_width || 120, 10);

    document.documentElement.style.setProperty(
      "--th-store-one-tooltip-image-width",
      width + "px",
    );

    // Apply Product Edit tooltip settings immediately.
    $(".th-store-one-swatch").each(function () {
      applySwatchTooltip($(this));
    });

    $(document).on("mouseenter", ".th-store-one-swatch", function () {
      const $swatch = $(this);
      const mode = getTooltipMode($swatch);

      if (mode !== "image" && mode !== "text-image") {
        return;
      }

      const imageUrl = $swatch.attr("data-tooltip-image");

      if (!imageUrl) {
        return;
      }

      $swatch.css(
        "--th-store-one-tooltip-image",
        'url("' + imageUrl.replace(/"/g, '\\"') + '")',
      );

      $swatch.addClass("th-store-one-image-tooltip-active");
    });

    $(document).on("mouseleave", ".th-store-one-swatch", function () {
      $(this).removeClass("th-store-one-image-tooltip-active");
    });
  }

  /**
   * Re-apply tooltip settings after WooCommerce/AJAX replaces swatches.
   */
  function refreshSwatchTooltips($scope) {
    const $root = $scope && $scope.length ? $scope : $(document);

    $root.find(".th-store-one-swatch").each(function () {
      applySwatchTooltip($(this));
    });
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

        refreshSwatchTooltips($wrapper);
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
      refreshSwatchTooltips($(this));
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
        refreshSwatchTooltips($(this));
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
