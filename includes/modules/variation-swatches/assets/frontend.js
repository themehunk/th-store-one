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
  // $(document).on("click", ".th-store-one-shop-clear", function (event) {
  //   event.preventDefault();

  //   const $container = $(this).closest(".th-store-one-shop-swatches");

  //   $container
  //     .find(".th-store-one-selected")
  //     .removeClass("th-store-one-selected");
  // });

  /**
   * Shop swatch click.
   *
   * Shop/catalog is primarily visual in this
   * first implementation.
   */
  // $(document).on(
  //   "click",
  //   ".th-store-one-shop-swatches .th-store-one-swatch",
  //   function (event) {
  //     event.preventDefault();

  //     const $swatch = $(this);

  //     if ($swatch.hasClass("th-store-one-disabled")) {
  //       return;
  //     }

  //     const $group = $swatch.closest(".th-store-one-shop-swatches-group");

  //     $group
  //       .find(".th-store-one-selected")
  //       .removeClass("th-store-one-selected");

  //     $swatch.addClass("th-store-one-selected");
  //   },
  // );

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
/**
 * Store One - Catalog Variation Swatches
 *
 * Catalog/shop only.
 * Does NOT interfere with single product variation logic.
 */

jQuery(function ($) {
  "use strict";

  var catalogSelector = ".th-store-one-shop-swatches";
  var swatchSelector = ".th-store-one-swatch";
  var groupSelector = ".th-store-one-shop-swatches-group";

  /* ---------------------------------------------------------
   * Helpers
   * --------------------------------------------------------- */

  function getCatalogVariations($wrapper) {
    var variations = $wrapper.data("productVariations");

    if (Array.isArray(variations)) {
      return variations;
    }

    var raw = $wrapper.attr("data-product-variations");

    if (!raw) {
      return [];
    }

    try {
      variations = JSON.parse(raw);
      return Array.isArray(variations) ? variations : [];
    } catch (error) {
      console.warn("Store One: Unable to parse catalog variations.", error);
      return [];
    }
  }

  function normalizeValue(value) {
    if (value === null || typeof value === "undefined") {
      return "";
    }

    return String(value).trim().toLowerCase();
  }

  function normalizeAttributeName(name) {
    name = String(name || "").trim();

    if (!name) {
      return "";
    }

    return name.indexOf("attribute_") === 0 ? name : "attribute_" + name;
  }

  function getAttributeCount($wrapper) {
    return $wrapper.find(groupSelector).filter(function () {
      return !!($(this).attr("data-attribute") || $(this).data("attribute"));
    }).length;
  }

  function getSelectedAttributes($wrapper) {
    var attributes = {};

    $wrapper.find(groupSelector).each(function () {
      var $group = $(this);

      var attribute = normalizeAttributeName(
        $group.attr("data-attribute") || $group.data("attribute"),
      );

      if (!attribute) {
        return;
      }

      var $selected = $group
        .find(
          swatchSelector +
            ".selected, " +
            swatchSelector +
            ".th-store-one-selected",
        )
        .first();

      if (!$selected.length) {
        return;
      }

      var value = $selected.attr("data-value");

      if (typeof value === "undefined" || value === null) {
        return;
      }

      attributes[attribute] = String(value);
    });

    return attributes;
  }

  function variationMatchesSelection(variation, selectedAttributes) {
    if (!variation || !variation.attributes) {
      return false;
    }

    var variationAttributes = variation.attributes;

    var selectedKeys = Object.keys(selectedAttributes);

    for (var i = 0; i < selectedKeys.length; i++) {
      var attributeName = selectedKeys[i];

      var selectedValue = normalizeValue(selectedAttributes[attributeName]);

      var variationValue = "";

      if (
        Object.prototype.hasOwnProperty.call(variationAttributes, attributeName)
      ) {
        variationValue = normalizeValue(variationAttributes[attributeName]);
      } else {
        var shortName = attributeName.replace(/^attribute_/, "");

        if (
          Object.prototype.hasOwnProperty.call(variationAttributes, shortName)
        ) {
          variationValue = normalizeValue(variationAttributes[shortName]);
        }
      }

      /*
       * Empty WooCommerce variation
       * attribute means "any value".
       */
      if (variationValue !== "" && variationValue !== selectedValue) {
        return false;
      }
    }

    return true;
  }

  function isUsableVariation(variation) {
    if (!variation) {
      return false;
    }

    if (variation.variation_is_active === false) {
      return false;
    }

    if (variation.is_in_stock === false) {
      return false;
    }

    if (!variation.variation_id) {
      return false;
    }

    return true;
  }

  function findMatchingVariations(variations, selectedAttributes) {
    var matches = [];

    $.each(variations, function (index, variation) {
      if (!isUsableVariation(variation)) {
        return;
      }

      if (variationMatchesSelection(variation, selectedAttributes)) {
        matches.push(variation);
      }
    });

    return matches;
  }

  function findExactVariation(variations, selectedAttributes, attributeCount) {
    if (Object.keys(selectedAttributes).length !== attributeCount) {
      return null;
    }

    var matches = findMatchingVariations(variations, selectedAttributes);

    return matches.length ? matches[0] : null;
  }

  /* ---------------------------------------------------------
   * Swatch availability
   * --------------------------------------------------------- */

  function setSwatchAvailability($swatch, available, selected) {
    if (available || selected) {
      $swatch
        .removeClass("disabled unavailable")
        .removeAttr("disabled")
        .attr("aria-disabled", "false");
    } else {
      $swatch
        .addClass("disabled unavailable")
        .attr("disabled", "disabled")
        .attr("aria-disabled", "true");
    }
  }

  function updateCatalogSwatchAvailability(
    $wrapper,
    variations,
    selectedAttributes,
  ) {
    $wrapper.find(groupSelector).each(function () {
      var $group = $(this);

      var attribute = normalizeAttributeName(
        $group.attr("data-attribute") || $group.data("attribute"),
      );

      if (!attribute) {
        return;
      }

      $group.find(swatchSelector).each(function () {
        var $swatch = $(this);

        var value = $swatch.attr("data-value");

        if (typeof value === "undefined") {
          return;
        }

        var testSelection = $.extend({}, selectedAttributes);

        testSelection[attribute] = String(value);

        var matches = findMatchingVariations(variations, testSelection);

        setSwatchAvailability(
          $swatch,
          matches.length > 0,
          $swatch.hasClass("selected") ||
            $swatch.hasClass("th-store-one-selected"),
        );
      });
    });
  }

  /* ---------------------------------------------------------
   * Product image
   * --------------------------------------------------------- */

  function getCatalogProductCard($wrapper) {
    var $card = $wrapper.closest(".product");

    if (!$card.length) {
      $card = $wrapper.closest("li");
    }

    return $card;
  }

  function getCatalogProductImage($wrapper) {
    var $card = getCatalogProductCard($wrapper);

    if (!$card.length) {
      return $();
    }

    var $image = $card.find(".woocommerce-loop-product__link img").first();

    if (!$image.length) {
      $image = $card.find("img").first();
    }

    return $image;
  }

  function saveOriginalImage($image) {
    if (
      !$image.length ||
      typeof $image.data("store-one-original-image") !== "undefined"
    ) {
      return;
    }

    $image.data("store-one-original-image", {
      src: $image.attr("src") || "",
      srcset: $image.attr("srcset") || "",
      sizes: $image.attr("sizes") || "",
      alt: $image.attr("alt") || "",
      dataSrc: $image.attr("data-src") || "",
      dataLazySrc: $image.attr("data-lazy-src") || "",
    });
  }

  function updateCatalogImage($wrapper, variation) {
    if (!variation || !variation.image) {
      return;
    }

    var image = variation.image;

    var src = image.src || image.full_src || "";

    if (!src) {
      return;
    }

    var $image = getCatalogProductImage($wrapper);

    if (!$image.length) {
      return;
    }

    saveOriginalImage($image);

    $image.attr("src", src);

    if (image.srcset) {
      $image.attr("srcset", image.srcset);
    } else {
      $image.removeAttr("srcset");
    }

    if (image.sizes) {
      $image.attr("sizes", image.sizes);
    }

    if (image.alt) {
      $image.attr("alt", image.alt);
    }

    $image.attr("data-src", src);
  }

  function restoreCatalogImage($wrapper) {
    var $image = getCatalogProductImage($wrapper);

    if (!$image.length) {
      return;
    }

    var original = $image.data("store-one-original-image");

    if (!original) {
      return;
    }

    if (original.src) {
      $image.attr("src", original.src);
    }

    if (original.srcset) {
      $image.attr("srcset", original.srcset);
    } else {
      $image.removeAttr("srcset");
    }

    if (original.sizes) {
      $image.attr("sizes", original.sizes);
    } else {
      $image.removeAttr("sizes");
    }

    if (original.alt) {
      $image.attr("alt", original.alt);
    }

    if (original.dataSrc) {
      $image.attr("data-src", original.dataSrc);
    } else {
      $image.removeAttr("data-src");
    }

    if (original.dataLazySrc) {
      $image.attr("data-lazy-src", original.dataLazySrc);
    } else {
      $image.removeAttr("data-lazy-src");
    }
  }
  /* ---------------------------------------------------------
   * Catalog Add to Cart Button
   * --------------------------------------------------------- */
  function getCatalogWrapperFromButton($button) {
    if (!$button || !$button.length) {
      return $();
    }

    var $card = $button.closest(".product");

    if (!$card.length) {
      $card = $button.closest("li.product");
    }

    if (!$card.length) {
      $card = $button.closest("li");
    }

    if (!$card.length) {
      return $();
    }

    return $card.find(catalogSelector).first();
  }
  function getCatalogCartButton($wrapper) {
    var $card = getCatalogProductCard($wrapper);

    if (!$card.length) {
      return $();
    }

    /*
     * Important:
     * After converting the WooCommerce button we remove
     * .add_to_cart_button / .product_type_variable.
     *
     * Therefore always search our converted button first.
     */
    var $button = $card.find(".th-store-one-catalog-add-to-cart").first();

    if (!$button.length) {
      $button = $card
        .find(".add_to_cart_button, .product_type_variable")
        .first();
    }

    if (!$button.length) {
      return $();
    }

    /*
     * Save the original WooCommerce button state
     * only once.
     */
    if (!$button.data("store-one-original-state")) {
      $button.data("store-one-original-state", {
        className: $button.attr("class") || "",

        text: $.trim($button.text()),

        href: $button.attr("href") || "",

        ariaLabel: $button.attr("aria-label") || "",

        rel: $button.attr("rel") || "",

        target: $button.attr("target") || "",

        style: $button.attr("style") || "",
      });
    }

    return $button;
  }

  function restoreCatalogCartButton($wrapper) {
    var $button = getCatalogCartButton($wrapper);

    if (!$button.length) {
      return;
    }

    var original = $button.data("store-one-original-state");

    if (!original) {
      return;
    }

    /*
     * Restore the exact original WooCommerce
     * button state.
     */
    $button.attr("class", original.className);

    $button.text(original.text);

    if (original.href) {
      $button.attr("href", original.href);
    } else {
      $button.removeAttr("href");
    }

    if (original.ariaLabel) {
      $button.attr("aria-label", original.ariaLabel);
    } else {
      $button.removeAttr("aria-label");
    }

    if (original.rel) {
      $button.attr("rel", original.rel);
    } else {
      $button.removeAttr("rel");
    }

    if (original.target) {
      $button.attr("target", original.target);
    } else {
      $button.removeAttr("target");
    }

    if (original.style) {
      $button.attr("style", original.style);
    } else {
      $button.removeAttr("style");
    }

    $button
      .removeData("store-one-variation")
      .removeData("store-one-product-id")
      .removeData("store-one-variation-id")
      .removeData("store-one-selected-attributes")
      .removeData("store-one-cart-request");

    $button
      .prop("disabled", false)
      .removeAttr("aria-disabled")
      .removeClass("loading added");
  }

  function showCatalogAddToCart($wrapper, variation) {
    if (!variation || !variation.variation_id) {
      restoreCatalogCartButton($wrapper);
      return;
    }

    var $button = getCatalogCartButton($wrapper);

    if (!$button.length) {
      return;
    }

    var $card = getCatalogProductCard($wrapper);

    /*
     * Prefer variation.product_id.
     * Fall back to wrapper/card product ID.
     */
    var productId =
      variation.product_id ||
      $wrapper.attr("data-product-id") ||
      $wrapper.data("product-id") ||
      $card.attr("data-product-id") ||
      $card.data("product-id") ||
      "";

    var variationId = variation.variation_id;

    /*
     * Store everything on the existing WooCommerce
     * button. No second button is created.
     */
    $button
      .data("store-one-variation", variation)
      .data("store-one-product-id", productId)
      .data("store-one-variation-id", variationId)
      .data("store-one-selected-attributes", getSelectedAttributes($wrapper));

    /*
     * Remove WooCommerce variable-product classes
     * while our catalog variation is active.
     *
     * This prevents the normal WooCommerce
     * "Please choose product options" handler
     * from intercepting our click.
     */
    $button
      .removeClass("add_to_cart_button " + "product_type_variable")
      .addClass("th-store-one-catalog-add-to-cart");

    /*
     * Keep it as the existing button.
     */
    $button
      .attr("href", "#")
      .removeAttr("data-product_id")
      .removeAttr("data-product-id")
      .removeAttr("data-variation_id")
      .removeAttr("data-variation-id");

    /*
     * Change only the label.
     */
    var addText = $button.data("store-one-add-text");

    if (!addText) {
      addText = "Add to cart";

      $button.data("store-one-add-text", addText);
    }

    $button.text(addText);

    $button
      .prop("disabled", false)
      .attr("aria-disabled", "false")
      .removeClass("loading added");
  }

  /* ---------------------------------------------------------
   * Catalog Variation Update
   * --------------------------------------------------------- */

  function updateCatalogVariation($wrapper) {
    var variations = getCatalogVariations($wrapper);

    if (!variations.length) {
      return;
    }

    var selectedAttributes = getSelectedAttributes($wrapper);

    var selectedCount = Object.keys(selectedAttributes).length;

    var attributeCount = getAttributeCount($wrapper);

    /*
     * Nothing selected.
     */
    if (!selectedCount) {
      restoreCatalogImage($wrapper);

      restoreCatalogCartButton($wrapper);

      updateCatalogSwatchAvailability($wrapper, variations, {});

      return;
    }

    /*
     * Update available/unavailable swatches
     * according to the current selection.
     */
    updateCatalogSwatchAvailability($wrapper, variations, selectedAttributes);

    /*
     * If not all attributes are selected,
     * do NOT select a variation yet.
     */
    if (selectedCount < attributeCount) {
      restoreCatalogCartButton($wrapper);

      /*
       * We don't know the exact variation yet,
       * so keep the original product image.
       */
      restoreCatalogImage($wrapper);

      return;
    }

    /*
     * All required attributes selected.
     */
    var variation = findExactVariation(
      variations,
      selectedAttributes,
      attributeCount,
    );

    /*
     * No exact variation found.
     */
    if (!variation) {
      restoreCatalogCartButton($wrapper);

      restoreCatalogImage($wrapper);

      return;
    }

    /*
     * Exact variation found.
     */
    updateCatalogImage($wrapper, variation);

    showCatalogAddToCart($wrapper, variation);
  }

  /* ---------------------------------------------------------
   * Clear Catalog Selection
   * --------------------------------------------------------- */

  function clearCatalogSelection($wrapper) {
    if (!$wrapper.length) {
      return;
    }

    /*
     * Remove selected classes.
     */
    $wrapper
      .find(swatchSelector)
      .removeClass("selected th-store-one-selected")
      .attr("aria-selected", "false");

    /*
     * Reset availability based on no selection.
     */
    var variations = getCatalogVariations($wrapper);

    updateCatalogSwatchAvailability($wrapper, variations, {});

    /*
     * Restore original product image.
     */
    restoreCatalogImage($wrapper);

    /*
     * Restore original WooCommerce
     * "Select options" button.
     */
    restoreCatalogCartButton($wrapper);
  }

  /* ---------------------------------------------------------
   * WooCommerce AJAX Add To Cart
   * --------------------------------------------------------- */

  function catalogAddToCart($button, $wrapper) {
    if (!$button.length || !$wrapper.length) {
      return;
    }

    var variation = $button.data("store-one-variation");

    var variationId = parseInt($button.data("store-one-variation-id"), 10);

    var productId = parseInt($button.data("store-one-product-id"), 10);

    if (!variation || !variationId || !productId) {
      return;
    }

    /*
     * Always read the currently selected swatches.
     */
    var selectedAttributes = getSelectedAttributes($wrapper);

    console.log("STORE ONE selected attributes:", selectedAttributes);
    console.log("STORE ONE variation:", variation);
    console.log("STORE ONE variation attributes:", variation.attributes);

    /*
     * Fallback to the attributes saved when
     * the exact variation was activated.
     */
    if (!Object.keys(selectedAttributes).length) {
      selectedAttributes = $button.data("store-one-selected-attributes") || {};
    }

    var attributeCount = getAttributeCount($wrapper);

    /*
     * Safety check:
     * never add until all attributes are selected.
     */
    if (Object.keys(selectedAttributes).length !== attributeCount) {
      return;
    }

    /*
     * Prevent double click / duplicate AJAX request.
     */
    if ($button.data("store-one-cart-request")) {
      return;
    }

    $button.data("store-one-cart-request", true);

    $button
      .addClass("loading")
      .prop("disabled", true)
      .attr("aria-disabled", "true");

    /*
     * WooCommerce AJAX endpoint.
     */
    var ajaxUrl = "";

    /*
     * IMPORTANT:
     * WooCommerce expects the selected
     * attributes as:
     *
     * attribute_pa_color
     * attribute_pa_size
     *
     * Do NOT send variation.attributes here,
     * because WooCommerce variation data can
     * contain empty wildcard attributes.
     */
    var data = {
      action: "th_store_one_catalog_add_to_cart",
      product_id: productId,
      variation_id: variationId,
      quantity: 1,
    };

    $.each(selectedAttributes, function (attributeName, attributeValue) {
      var key = normalizeAttributeName(attributeName);

      if (!key) {
        return;
      }

      if (attributeValue === null || typeof attributeValue === "undefined") {
        return;
      }

      attributeValue = String(attributeValue);

      if (!attributeValue) {
        return;
      }

      data[key] = attributeValue;
    });

    $.ajax({
      type: "POST",
      url: THStoreOneVariationSwatches.ajax_url,
      data: data,
      dataType: "json",
      success: function (response) {
        console.log("STORE ONE catalog response:", response);

        if (!response.success) {
          console.warn("Store One:", response.data);
          return;
        }

        $(document.body).trigger("added_to_cart", [
          response.data.fragments,
          response.data.cart_hash,
          $button,
        ]);

        $button.text("Added to cart");
      },
    });
  } /* ---------------------------------------------------------
   * Swatch Click
   * --------------------------------------------------------- */

  $(document).on(
    "click",
    catalogSelector + " " + swatchSelector,
    function (event) {
      event.preventDefault();
      event.stopPropagation();

      var $swatch = $(this);

      /*
       * Ignore unavailable swatches.
       */
      if (
        $swatch.hasClass("disabled") ||
        $swatch.hasClass("unavailable") ||
        $swatch.attr("aria-disabled") === "true"
      ) {
        return;
      }

      var $wrapper = $swatch.closest(catalogSelector);

      if (!$wrapper.length) {
        return;
      }

      var $group = $swatch.closest(groupSelector);

      if (!$group.length) {
        return;
      }

      /*
       * Single selection per attribute.
       */
      $group
        .find(swatchSelector)
        .removeClass("selected th-store-one-selected")
        .attr("aria-selected", "false");

      /*
       * Select clicked swatch.
       */
      $swatch
        .addClass("selected th-store-one-selected")
        .attr("aria-selected", "true");

      /*
       * Find/update the exact variation.
       */
      updateCatalogVariation($wrapper);

      /*
       * Let other Store One scripts know
       * catalog selection changed.
       */
      $wrapper.trigger("store_one_catalog_variation_changed");
    },
  );

  /* ---------------------------------------------------------
   * Clear Button
   * --------------------------------------------------------- */

  $(document).on(
    "click",
    catalogSelector +
      " .th-store-one-shop-clear, " +
      catalogSelector +
      " .th-store-one-clear",
    function (event) {
      event.preventDefault();
      event.stopPropagation();

      var $clear = $(this);

      var $wrapper = $clear.closest(catalogSelector);

      if (!$wrapper.length) {
        return;
      }

      clearCatalogSelection($wrapper);

      $wrapper.trigger("store_one_catalog_variation_cleared");
    },
  );

  /* ---------------------------------------------------------
   * Existing WooCommerce Button Click
   * --------------------------------------------------------- */
  /* ---------------------------------------------------------
   * Existing WooCommerce Button Click
   * --------------------------------------------------------- */

  $(document).on(
    "click",
    ".th-store-one-catalog-add-to-cart",
    function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      var $button = $(this);
      var $wrapper = getCatalogWrapperFromButton($button);

      if (!$wrapper.length) {
        console.warn("Store One: Catalog wrapper not found.");
        return false;
      }

      /*
       * The exact variation was already resolved when
       * the swatch selection was made.
       */
      var variation = $button.data("store-one-variation");
      var variationId = parseInt($button.data("store-one-variation-id"), 10);

      var productId = parseInt($button.data("store-one-product-id"), 10);

      if (!variation || !variationId || !productId) {
        console.warn("Store One: Missing variation data.", {
          variation: variation,
          variationId: variationId,
          productId: productId,
        });

        return false;
      }

      /*
       * Make sure the selected attributes are still present.
       */
      var selectedAttributes = getSelectedAttributes($wrapper);

      if (!Object.keys(selectedAttributes).length) {
        selectedAttributes =
          $button.data("store-one-selected-attributes") || {};
      }

      /*
       * Save the latest values before AJAX.
       */
      $button
        .data("store-one-variation", variation)
        .data("store-one-variation-id", variationId)
        .data("store-one-product-id", productId)
        .data("store-one-selected-attributes", selectedAttributes);

      /*
       * REAL WooCommerce AJAX add to cart.
       */
      catalogAddToCart($button, $wrapper);

      return false;
    },
  );
  /* ---------------------------------------------------------
   * Initialize Catalog Wrapper
   * --------------------------------------------------------- */

  function initializeCatalogWrapper($wrapper) {
    if (!$wrapper.length) {
      return;
    }

    /*
     * Prevent duplicate initialization.
     */
    if ($wrapper.data("store-one-catalog-initialized")) {
      return;
    }

    $wrapper.data("store-one-catalog-initialized", true);

    /*
     * Save original product image.
     */
    var $image = getCatalogProductImage($wrapper);

    if ($image.length) {
      saveOriginalImage($image);
    }

    /*
     * Make sure the original WooCommerce
     * button state is stored.
     */
    getCatalogCartButton($wrapper);

    /*
     * Initial swatch availability.
     */
    var variations = getCatalogVariations($wrapper);

    if (variations.length) {
      updateCatalogSwatchAvailability($wrapper, variations, {});
    }

    /*
     * Make sure initial state remains
     * WooCommerce's original Select options.
     */
    restoreCatalogCartButton($wrapper);
  }

  function initializeAllCatalogWrappers(context) {
    var $context = context ? $(context) : $(document);

    /*
     * Context itself may be a wrapper.
     */
    if ($context.is(catalogSelector)) {
      initializeCatalogWrapper($context);
    }

    /*
     * Initialize all catalog wrappers
     * inside the context.
     */
    $context.find(catalogSelector).each(function () {
      initializeCatalogWrapper($(this));
    });
  }

  /* ---------------------------------------------------------
   * WooCommerce / AJAX Refresh Support
   * --------------------------------------------------------- */

  $(document.body).on("updated_wc_div", function () {
    initializeAllCatalogWrappers(document);
  });

  $(document.body).on("wc_fragments_loaded", function () {
    initializeAllCatalogWrappers(document);
  });

  $(document.body).on("wc_fragments_refreshed", function () {
    initializeAllCatalogWrappers(document);
  });

  /*
   * Some themes replace product cards through
   * AJAX/filter/infinite-scroll.
   */
  $(document.body).on("products_loaded", function () {
    initializeAllCatalogWrappers(document);
  });

  $(document.body).on("berocket_ajax_products_loaded", function () {
    initializeAllCatalogWrappers(document);
  });

  $(document.body).on("yith-wcan-ajax-filtered", function () {
    initializeAllCatalogWrappers(document);
  });

  /* ---------------------------------------------------------
   * Mutation Observer
   * --------------------------------------------------------- */

  var catalogObserverTimer = null;

  if (typeof MutationObserver !== "undefined") {
    var observer = new MutationObserver(function (mutations) {
      var shouldInitialize = false;

      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];

        if (mutation.type !== "childList") {
          continue;
        }

        if (mutation.addedNodes && mutation.addedNodes.length) {
          shouldInitialize = true;

          break;
        }
      }

      if (!shouldInitialize) {
        return;
      }

      /*
       * Debounce initialization so multiple
       * DOM mutations don't run the same code.
       */
      window.clearTimeout(catalogObserverTimer);

      catalogObserverTimer = window.setTimeout(function () {
        initializeAllCatalogWrappers(document);
      }, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /* ---------------------------------------------------------
   * Initial Load
   * --------------------------------------------------------- */

  initializeAllCatalogWrappers(document);
});
