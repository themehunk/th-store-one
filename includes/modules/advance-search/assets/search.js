/**
 * Store One - Advance Search
 * Product autocomplete frontend.
 *
 * Product data comes from:
 * TH_Store_One_Product_Search_API
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     categories: [],
 *     products: [],
 *     total: 0
 *   }
 * }
 */

(function () {
  "use strict";

  var config = window.storeOneAdvanceSearch || {};

  var dropdownId = config.dropdownId || "store-one-advance-search-dropdown";

  var ajaxUrl = config.ajaxUrl || "";
  var action = config.action || "store_one_product_search";

  var nonce = config.nonce || "";

  var minChars = parseInt(config.minChars, 10);

  if (isNaN(minChars) || minChars < 1) {
    minChars = 1;
  }

  var dropdown = null;
  var activeInput = null;
  var activeWrapper = null;

  var activeItems = [];
  var activeIndex = -1;

  var request = null;
  var requestToken = 0;

  var debounceTimer = null;
  var positionTimer = null;

  var lastSearchTerm = "";
  var lastSearchResponse = null;

  var searchCache = {};
  var SEARCH_CACHE_LIMIT = 20;

  /**
   * Default settings.
   */
  var DEFAULTS = {
    result_length: 5,

    no_reult_label: "No Result Found",

    more_reult_label: "See All Results",

    enable_group_heading: true,

    show_category_in: false,

    enable_cat_image: true,

    tapsp_enable_product_image: true,

    tapsp_enable_product_price: true,

    tapsp_enable_product_desc: false,

    tapsp_enable_product_sku: true,

    tapsp_enable_cart_btn: false,

    tapsp_highlight_sale: true,

    tapsp_highlight_featured: true,

    tapsp_stock_availability: true,

    desc_excpt_length: 120,
  };

  /**
   * Initialize.
   */
  function init() {
    dropdown = document.getElementById(dropdownId);

    if (!dropdown) {
      return;
    }

    bindInputs();
    bindGlobalEvents();
  }

  /**
   * Bind search inputs.
   */
  function bindInputs() {
    var inputs = document.querySelectorAll(
      ".store-one-advance-search .store-one-search-input",
    );

    Array.prototype.forEach.call(inputs, function (input) {
      if (input.getAttribute("data-store-one-search-ready") === "1") {
        return;
      }

      input.setAttribute("data-store-one-search-ready", "1");

      input.addEventListener("input", handleInput);

      input.addEventListener("focus", handleFocus);

      input.addEventListener("keydown", handleKeydown);
    });
  }

  /**
   * Global events.
   */
  function bindGlobalEvents() {
    document.addEventListener("mousedown", handleDocumentMouseDown);

    document.addEventListener("click", handleDocumentClick);

    window.addEventListener("resize", schedulePosition);

    window.addEventListener("scroll", schedulePosition, true);
  }

  /**
   * Input.
   */
  function handleInput(event) {
    var input = event.currentTarget;

    var value = input.value.trim();

    activeInput = input;

    activeWrapper = getWrapper(input);

    clearTimeout(debounceTimer);

    abortRequest();

    if (value.length < minChars) {
      hideDropdown();

      setLoading(false);

      return;
    }

    setLoading(true);

    debounceTimer = setTimeout(function () {
      search(value, input);
    }, 150);
  }

  /**
   * Focus.
   */
  function handleFocus(event) {
    activeInput = event.currentTarget;

    activeWrapper = getWrapper(activeInput);

    var value = activeInput.value.trim();

    if (value.length >= minChars) {
      clearTimeout(debounceTimer);

      setLoading(true);

      debounceTimer = setTimeout(function () {
        search(value, activeInput);
      }, 50);

      return;
    }

    // console.log("Store One Focus:", {
    //   value: value,
    //   settings: getSettings(),
    //   mode: getSettings().tapsp_specific_key_search,
    //   specific: getSettings().specific_searches,
    //   popular: getSettings().popular_searches,
    // });

    renderSuggestedSearches(activeInput);
  }

  /**
   * Keyboard navigation.
   */
  function handleKeydown(event) {
    if (!dropdown || !dropdown.classList.contains("is-open")) {
      if (
        event.key === "ArrowDown" &&
        event.currentTarget.value.trim().length >= minChars
      ) {
        search(event.currentTarget.value.trim(), event.currentTarget);

        event.preventDefault();
      }

      return;
    }

    switch (event.key) {
      case "ArrowDown":
        moveActive(1);

        event.preventDefault();

        break;

      case "ArrowUp":
        moveActive(-1);

        event.preventDefault();

        break;

      case "Enter":
        if (activeIndex >= 0 && activeItems[activeIndex]) {
          var selected = activeItems[activeIndex];

          if (selected.href) {
            window.location.href = selected.href;

            event.preventDefault();
          }
        }

        break;

      case "Escape":
        hideDropdown();

        event.preventDefault();

        break;

      case "Tab":
        hideDropdown();

        break;
    }
  }

  /**
   * Outside click.
   */
  function handleDocumentMouseDown(event) {
    if (!dropdown || !dropdown.classList.contains("is-open")) {
      return;
    }

    var target = event.target;

    if (
      activeInput &&
      (target === activeInput || activeInput.contains(target))
    ) {
      return;
    }

    if (dropdown.contains(target)) {
      return;
    }

    hideDropdown();
  }

  /**
   * Result clicks.
   */
  function handleDocumentClick(event) {
    var suggested = closest(event.target, ".store-one-search-suggested-item");

    if (suggested) {
      event.preventDefault();
      event.stopPropagation();

      var keyword = suggested.getAttribute("data-search-keyword");

      if (keyword && activeInput) {
        activeInput.value = keyword;

        activeInput.dispatchEvent(
          new Event("input", {
            bubbles: true,
          }),
        );
      }

      return;
    }

    var cart = closest(event.target, ".store-one-search-product-cart");

    if (cart) {
      event.preventDefault();
      event.stopPropagation();

      addSearchProductToCart(cart);

      return;
    }

    var result = closest(
      event.target,
      ".store-one-search-product-link, .store-one-search-category, .store-one-search-see-all",
    );

    if (result) {
      saveRecentSearch();
    }
  }

  /**
   * AJAX search.
   */
  function search(term, input) {
    if (!ajaxUrl || !input) {
      setLoading(false);
      return;
    }

    term = String(term || "").trim();

    if (!term) {
      hideDropdown();
      setLoading(false);
      return;
    }

    // Check cached result.
    if (searchCache[term]) {
      renderResults(searchCache[term], term, input);
      setLoading(false);
      return;
    }

    // Same term ka cached result use karo.
    if (lastSearchTerm === term && lastSearchResponse) {
      renderResults(lastSearchResponse, term, input);
      setLoading(false);
      return;
    }

    activeInput = input;
    activeWrapper = getWrapper(input);

    /*
     * Cancel previous request first.
     * abortRequest() invalidates the previous request.
     */
    abortRequest();

    /*
     * Create token for this new request.
     */
    var currentToken = ++requestToken;

    var body = new URLSearchParams();

    body.append("action", action);
    body.append("nonce", nonce);
    body.append("term", term);

    var customPostType = input.getAttribute("data-custom-post-type") || "";

    if (customPostType) {
      body.append("custom_post_type", customPostType);
    }

    var category = "";

    if (
      window.storeOneAdvanceSearchCategoryFilter &&
      window.storeOneAdvanceSearchCategoryFilter.getCategory
    ) {
      category = window.storeOneAdvanceSearchCategoryFilter.getCategory(input);
    }

    body.append("product_category", category);

    request = new XMLHttpRequest();

    request.open("POST", ajaxUrl, true);

    request.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded; charset=UTF-8",
    );

    request.onreadystatechange = function () {
      if (request.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      /*
       * Ignore an old/stale request.
       */
      if (currentToken !== requestToken) {
        return;
      }

      var xhr = request;

      request = null;

      setLoading(false);

      if (xhr.status < 200 || xhr.status >= 300) {
        hideDropdown();
        return;
      }

      var response;

      try {
        response = JSON.parse(xhr.responseText);
      } catch (error) {
        hideDropdown();
        return;
      }

      /*
       * WordPress wp_send_json_success()
       * returns:
       *
       * {
       *   success: true,
       *   data: {...}
       * }
       */
      if (!response || response.success !== true || !response.data) {
        hideDropdown();
        return;
      }
      searchCache[term] = response.data;
      lastSearchTerm = term;
      lastSearchResponse = response.data;

      renderResults(response.data, term, input);
    };

    request.onerror = function () {
      if (currentToken !== requestToken) {
        return;
      }

      request = null;

      setLoading(false);

      hideDropdown();
    };

    request.send(body.toString());
  }

  function getCachedSearch(term) {
    return searchCache[term] || null;
  }

  function setCachedSearch(term, data) {
    searchCache[term] = data;

    var keys = Object.keys(searchCache);

    if (keys.length > SEARCH_CACHE_LIMIT) {
      delete searchCache[keys[0]];
    }
  }

  /**
   * Render specific / popular search keywords.
   */
  function renderSuggestedSearches(input) {
    if (!dropdown || !input) {
      return;
    }

    var settings = getSettings();

    if (!toBoolean(settings.tapsp_trending_enable, true)) {
      hideDropdown();
      return;
    }

    var mode = settings.tapsp_specific_key_search || "specific";

    var searches = [];

    if (mode === "popular") {
      searches = Array.isArray(settings.popular_searches)
        ? settings.popular_searches
        : [];
    } else {
      searches = Array.isArray(settings.specific_searches)
        ? settings.specific_searches
        : [];
    }

    if (!searches.length) {
      hideDropdown();
      return;
    }

    activeItems = [];
    activeIndex = -1;

    dropdown.className = "store-one-advance-search-dropdown";

    var style = getSearchStyle(input);

    if (style) {
      dropdown.classList.add(style);
    }

    var label =
      settings.tapsp_trending_label ||
      (mode === "popular" ? "Popular Searches" : "Suggested Searches");

    var html = "";

    html += '<div class="store-one-search-results">';
    html += '<section class="store-one-search-results-section">';

    html +=
      '<h3 class="store-one-search-section-title">' +
      escapeHTML(String(label)) +
      "</h3>";

    html += '<div class="store-one-search-suggested-list">';

    searches.forEach(function (item) {
      var keyword = "";

      if (typeof item === "string") {
        keyword = item;
      } else if (item && item.keyword) {
        keyword = item.keyword;
      }

      keyword = String(keyword || "").trim();

      if (!keyword) {
        return;
      }

      html +=
        '<button type="button" class="store-one-search-suggested-item" data-search-keyword="' +
        escapeAttribute(keyword) +
        '">' +
        '<span class="store-one-search-suggested-keyword">' +
        escapeHTML(keyword) +
        "</span>";

      if (
        mode === "popular" &&
        item &&
        typeof item === "object" &&
        item.search_count
      ) {
        html +=
          '<span class="store-one-search-suggested-count">' +
          escapeHTML(String(item.search_count)) +
          "</span>";
      }

      html += "</button>";
    });

    html += "</div>";
    html += "</section>";
    html += "</div>";

    dropdown.innerHTML = html;

    bindSuggestedSearches(input);

    positionDropdown(input);
    showDropdown();
  }

  function bindSuggestedSearches(input) {
    if (!dropdown || !input) {
      return;
    }

    var items = dropdown.querySelectorAll(".store-one-search-suggested-item");

    Array.prototype.forEach.call(items, function (item) {
      item.addEventListener("mouseenter", function () {
        items.forEach(function (node) {
          node.classList.remove("store-one-search-active");
        });

        item.classList.add("store-one-search-active");
      });
    });
  }

  /**
   * Render results.
   */
  function renderResults(data, term, input) {
    if (!dropdown || !input) {
      return;
    }

    var categories = Array.isArray(data.categories) ? data.categories : [];

    var products = Array.isArray(data.products) ? data.products : [];

    var total = parseInt(data.total, 10);

    if (isNaN(total)) {
      total = products.length;
    }

    activeItems = [];

    activeIndex = -1;

    dropdown.className = "store-one-advance-search-dropdown";

    var style = getSearchStyle(input);

    if (style) {
      dropdown.classList.add(style);
    }

    var html = "";

    html += '<div class="store-one-search-results">';

    if (categories.length) {
      html += renderCategorySection(categories, term);
    }

    if (products.length) {
      html += renderProductSection(products, term);
    }

    if (!categories.length && !products.length) {
      html += renderEmptyState();
    }

    if (products.length && total > products.length) {
      html += renderSeeAll(term, input);
    }

    html += "</div>";

    dropdown.innerHTML = html;

    registerActiveItems();

    positionDropdown(input);

    showDropdown();
  }

  /**
   * Category section.
   */
  function renderCategorySection(categories, term) {
    var settings = getSettings();

    var headingEnabled = toBoolean(settings.enable_group_heading, true);

    var html = "";

    html += '<section class="store-one-search-results-section">';

    if (headingEnabled) {
      html +=
        '<h3 class="store-one-search-section-title">' +
        escapeHTML("Categories") +
        "</h3>";
    }

    html += '<div class="store-one-search-category-list">';

    categories.forEach(function (category) {
      category = category || {};

      var title = category.title ? String(category.title) : "";

      if (!title) {
        return;
      }

      var url = category.url ? String(category.url) : "#";

      var image = category.image ? String(category.image) : "";

      html +=
        '<a class="store-one-search-category" href="' +
        escapeAttribute(url) +
        '" data-search-value="' +
        escapeAttribute(title) +
        '">';

      if (image && toBoolean(settings.enable_cat_image, true)) {
        html +=
          '<span class="store-one-search-category-image">' +
          '<img src="' +
          escapeAttribute(image) +
          '" alt="' +
          escapeAttribute(title) +
          '">' +
          "</span>";
      }

      html +=
        '<span class="store-one-search-category-title">' +
        highlightMatch(title, term) +
        "</span>";

      html += "</a>";
    });

    html += "</div>";

    html += "</section>";

    return html;
  }

  /**
   * Product section.
   */
  function renderProductSection(products, term) {
    var settings = getSettings();

    var headingEnabled = toBoolean(settings.enable_group_heading, true);

    var html = "";

    html +=
      '<section class="store-one-search-results-section store-one-search-product-section">';

    if (headingEnabled) {
      html +=
        '<h3 class="store-one-search-section-title">' +
        escapeHTML("Products") +
        "</h3>";
    }

    html += '<div class="store-one-search-product-list">';

    products.forEach(function (product) {
      html += renderProduct(product, term, settings);
    });

    html += "</div>";

    html += "</section>";

    return html;
  }

  /**
   * Product.
   */
  function renderProduct(product, term, settings) {
    product = product || {};

    var id = product.id ? parseInt(product.id, 10) : 0;
    var title = product.title ? String(product.title) : "";
    var url = product.url ? String(product.url) : "#";
    var image = product.image ? String(product.image) : "";
    var price = product.price ? String(product.price) : "";

    var style = getSearchStyle(activeInput);
    var isModern = style === "th-modern";

    var html = "";

    html +=
      '<div class="store-one-search-product" data-product-id="' +
      escapeAttribute(String(id)) +
      '" data-search-value="' +
      escapeAttribute(title) +
      '">';

    /*
     * ---------------------------------------------------------
     * Product link.
     * ---------------------------------------------------------
     */

    html +=
      '<a class="store-one-search-product-link" href="' +
      escapeAttribute(url) +
      '" aria-label="' +
      escapeAttribute(title) +
      '">';

    /*
     * ---------------------------------------------------------
     * Product image.
     * ---------------------------------------------------------
     */

    html += '<span class="store-one-search-product-media">';

    if (image && toBoolean(settings.tapsp_enable_product_image, true)) {
      html +=
        '<img class="store-one-search-product-image" src="' +
        escapeAttribute(image) +
        '" alt="' +
        escapeAttribute(title) +
        '">';
    } else {
      html += renderImagePlaceholder();
    }

    html += "</span>";

    /*
     * ---------------------------------------------------------
     * Product content.
     * ---------------------------------------------------------
     */

    html += '<span class="store-one-search-product-content">';

    /*
     * ---------------------------------------------------------
     * Title row.
     * ---------------------------------------------------------
     */

    html += '<span class="store-one-search-product-title-row">';

    /*
     * Featured - Pro.
     */

    var featuredExtension = {
      product: product,
      term: term,
      settings: settings,
      html: "",
    };

    document.dispatchEvent(
      new CustomEvent("storeOneAdvanceSearchFeatured", {
        detail: featuredExtension,
      }),
    );

    html += featuredExtension.html || "";

    /*
     * ---------------------------------------------------------
     * Title.
     * ---------------------------------------------------------
     */

    html +=
      '<span class="store-one-search-product-title">' +
      highlightMatch(title, term) +
      "</span>";

    /*
     * ---------------------------------------------------------
     * SKU - Pro.
     * ---------------------------------------------------------
     */

    var skuExtension = {
      product: product,
      term: term,
      settings: settings,
      html: "",
    };

    document.dispatchEvent(
      new CustomEvent("storeOneAdvanceSearchSKU", {
        detail: skuExtension,
      }),
    );

    html += skuExtension.html || "";

    /*
     * ---------------------------------------------------------
     * Sale - Pro.
     * ---------------------------------------------------------
     */

    var saleExtension = {
      product: product,
      term: term,
      settings: settings,
      html: "",
    };

    document.dispatchEvent(
      new CustomEvent("storeOneAdvanceSearchSale", {
        detail: saleExtension,
      }),
    );

    html += saleExtension.html || "";

    html += "</span>";

    /*
     * ---------------------------------------------------------
     * Description - Pro.
     * ---------------------------------------------------------
     */

    html += '<span class="store-one-search-product-meta">';

    var descriptionExtension = {
      product: product,
      term: term,
      settings: settings,
      html: "",
    };

    document.dispatchEvent(
      new CustomEvent("storeOneAdvanceSearchDescription", {
        detail: descriptionExtension,
      }),
    );

    html += descriptionExtension.html || "";

    html += "</span>";

    /*
     * ---------------------------------------------------------
     * MODERN ONLY
     *
     * Price goes inside content.
     * ---------------------------------------------------------
     */

    if (
      isModern &&
      price &&
      toBoolean(settings.tapsp_enable_product_price, true)
    ) {
      html +=
        '<span class="store-one-search-product-price">' + price + "</span>";
    }

    /*
     * Close product content.
     */

    html += "</span>";

    /*
     * Close product link.
     */

    html += "</a>";

    /*
     * ---------------------------------------------------------
     * TRADITIONAL / NORMAL
     *
     * Price stays outside the link.
     * ---------------------------------------------------------
     */

    if (
      !isModern &&
      price &&
      toBoolean(settings.tapsp_enable_product_price, true)
    ) {
      html +=
        '<span class="store-one-search-product-price">' + price + "</span>";
    }

    /*
     * ---------------------------------------------------------
     * Stock - Pro.
     *
     * Keep outside link for existing styles.
     * ---------------------------------------------------------
     */

    var stockExtension = {
      product: product,
      term: term,
      settings: settings,
      html: "",
    };

    document.dispatchEvent(
      new CustomEvent("storeOneAdvanceSearchStock", {
        detail: stockExtension,
      }),
    );

    html += stockExtension.html || "";

    /*
     * ---------------------------------------------------------
     * Cart - Lite.
     * ---------------------------------------------------------
     */

    var cart = product.cart || {};

    if (
      cart &&
      toBoolean(cart.enabled, false) &&
      toBoolean(settings.tapsp_enable_cart_btn, false)
    ) {
      html += renderCartButton(cart, title);
    }

    html += "</div>";

    return html;
  }

  /**
   * Cart button.
   */
  function renderCartButton(cart, title) {
    var productId = cart.product_id ? parseInt(cart.product_id, 10) : 0;
    var text = cart.text ? String(cart.text) : "Add to cart";

    if (!productId) {
      return "";
    }

    return (
      '<button type="button"' +
      ' class="store-one-search-product-cart"' +
      ' data-product-id="' +
      escapeAttribute(String(productId)) +
      '"' +
      ' aria-label="' +
      escapeAttribute(text + ": " + title) +
      '"' +
      ' title="' +
      escapeAttribute(text) +
      '">' +
      '<span class="store-one-search-cart-icon" aria-hidden="true">' +
      cartIcon() +
      "</span>" +
      '<span class="store-one-search-cart-check" aria-hidden="true">' +
      checkIcon() +
      "</span>" +
      '<span class="store-one-search-cart-loader" aria-hidden="true"></span>' +
      "</button>"
    );
  }

  /**
   * Image placeholder.
   */
  function renderImagePlaceholder() {
    return (
      '<span class="store-one-search-product-image store-one-search-product-image-placeholder">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
      '<circle cx="8.5" cy="8.5" r="1.5"/>' +
      '<path d="m21 15-5-5L5 21"/>' +
      "</svg>" +
      "</span>"
    );
  }

  /**
   * Cart icon.
   */
  function cartIcon() {
    return (
      '<svg class="s1-cart-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>' +
      '<line x1="3" y1="6" x2="21" y2="6"></line>' +
      '<path d="M16 10a4 4 0 0 1-8 0"></path>' +
      "</svg>"
    );
  }
  function checkIcon() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg"' +
      ' viewBox="0 0 24 24"' +
      ' fill="none"' +
      ' stroke="currentColor"' +
      ' stroke-width="2"' +
      ' stroke-linecap="round"' +
      ' stroke-linejoin="round"' +
      ' aria-hidden="true">' +
      '<path d="M20 6 9 17l-5-5"></path>' +
      "</svg>"
    );
  }
  function addSearchProductToCart(button) {
    if (!button) {
      return;
    }

    if (
      button.classList.contains("is-loading") ||
      button.classList.contains("is-added")
    ) {
      return;
    }

    var productId = parseInt(button.getAttribute("data-product-id"), 10);

    if (!productId) {
      return;
    }

    var originalTitle = button.getAttribute("title") || "Add to cart";

    button.classList.add("is-loading");
    button.disabled = true;

    var wcAjaxUrl = "";

    if (
      window.wc_add_to_cart_params &&
      window.wc_add_to_cart_params.wc_ajax_url
    ) {
      wcAjaxUrl = window.wc_add_to_cart_params.wc_ajax_url.replace(
        "%%endpoint%%",
        "add_to_cart",
      );
    }

    if (!wcAjaxUrl) {
      wcAjaxUrl = window.location.href.split("?")[0] + "?wc-ajax=add_to_cart";
    }

    var body = new URLSearchParams();

    body.append("product_id", String(productId));
    body.append("quantity", "1");

    var xhr = new XMLHttpRequest();

    xhr.open("POST", wcAjaxUrl, true);

    xhr.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded; charset=UTF-8",
    );

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      button.classList.remove("is-loading");
      button.disabled = false;

      if (xhr.status < 200 || xhr.status >= 300) {
        return;
      }

      var response;

      try {
        response = JSON.parse(xhr.responseText);
      } catch (error) {
        return;
      }

      if (!response || response.error) {
        return;
      }

      /*
       * Product added successfully.
       */
      button.classList.add("is-added");

      button.setAttribute("title", "Added to cart");

      button.setAttribute("aria-label", "Added to cart");

      /*
       * Refresh WooCommerce cart fragments.
       */
      refreshWooCommerceCart();

      /*
       * Reset button.
       */
      window.setTimeout(function () {
        button.classList.remove("is-added");

        button.setAttribute("title", originalTitle);

        button.setAttribute("aria-label", originalTitle);
      }, 1500);
    };

    xhr.onerror = function () {
      button.classList.remove("is-loading");
      button.disabled = false;
    };

    xhr.send(body.toString());
  }
  function refreshWooCommerceCart() {
    if (
      typeof window.jQuery !== "undefined" &&
      window.jQuery(document.body).trigger
    ) {
      window.jQuery(document.body).trigger("wc_fragment_refresh");
    }
  }
  /**
   * See all results.
   */
  function renderSeeAll(term, input) {
    var settings = getSettings();

    var label = settings.more_reult_label || DEFAULTS.more_reult_label;

    var url = buildSearchUrl(term, input);

    return (
      '<a class="store-one-search-see-all" href="' +
      escapeAttribute(url) +
      '">' +
      "<span>" +
      escapeHTML(String(label)) +
      "</span>" +
      '<span class="store-one-search-see-all-arrow">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M5 12h14"/>' +
      '<path d="m13 6 6 6-6 6"/>' +
      "</svg>" +
      "</span>" +
      "</a>"
    );
  }

  /**
   * Empty state.
   */
  function renderEmptyState() {
    var settings = getSettings();

    var label = settings.no_reult_label || DEFAULTS.no_reult_label;

    return (
      '<section class="store-one-search-results-section">' +
      '<div class="store-one-search-section-title">' +
      escapeHTML(String(label)) +
      "</div>" +
      "</section>"
    );
  }

  /**
   * Highlight search term.
   */
  function highlightMatch(value, term) {
    var safeValue = escapeHTML(String(value || ""));

    if (!term) {
      return safeValue;
    }

    var safeTerm = escapeRegExp(String(term).trim());

    if (!safeTerm) {
      return safeValue;
    }

    var pattern = new RegExp("(" + safeTerm + ")", "gi");

    return safeValue.replace(
      pattern,
      '<span class="store-one-search-highlight">$1</span>',
    );
  }

  /**
   * Register keyboard items.
   */
  function registerActiveItems() {
    activeItems = [];

    if (!dropdown) {
      return;
    }

    var selectors = [
      ".store-one-search-category",
      ".store-one-search-product-link",

      ".store-one-search-see-all",
      ".store-one-search-suggested-item",
    ];

    var nodes = dropdown.querySelectorAll(selectors.join(","));

    Array.prototype.forEach.call(nodes, function (node) {
      var href = node.getAttribute("href");

      if (!href || href === "#") {
        return;
      }

      activeItems.push({
        element: node,
        href: href,
      });
    });

    activeItems.forEach(function (item, index) {
      item.element.addEventListener("mouseenter", function () {
        setActiveItem(index);
      });
    });
  }

  /**
   * Move active item.
   */
  function moveActive(direction) {
    if (!activeItems.length) {
      return;
    }

    var next = activeIndex + direction;

    if (next >= activeItems.length) {
      next = 0;
    }

    if (next < 0) {
      next = activeItems.length - 1;
    }

    setActiveItem(next);
  }

  /**
   * Set active item.
   */
  function setActiveItem(index) {
    if (!activeItems.length) {
      return;
    }

    activeItems.forEach(function (item) {
      item.element.classList.remove("store-one-search-active");
    });

    activeIndex = index;

    var item = activeItems[index];

    if (!item || !item.element) {
      return;
    }

    item.element.classList.add("store-one-search-active");

    try {
      item.element.scrollIntoView({
        block: "nearest",
      });
    } catch (error) {}
  }

  /**
   * Show dropdown.
   */
  function showDropdown() {
    if (!dropdown || !dropdown.innerHTML.trim()) {
      return;
    }

    dropdown.classList.add("is-open");

    dropdown.setAttribute("aria-hidden", "false");

    positionDropdown(activeInput);
  }

  /**
   * Hide dropdown.
   */
  function hideDropdown() {
    if (!dropdown) {
      return;
    }

    dropdown.classList.remove("is-open");

    dropdown.setAttribute("aria-hidden", "true");

    dropdown.innerHTML = "";

    activeItems = [];

    activeIndex = -1;
  }

  /**
   * Position dropdown.
   */
  function positionDropdown(input) {
    if (!dropdown || !input) {
      return;
    }

    var rect = input.getBoundingClientRect();

    var width = rect.width;

    var left = rect.left;

    /*
     * Use complete search field width.
     */
    var field = input.closest(".store-one-search-field");

    if (field) {
      var fieldRect = field.getBoundingClientRect();

      if (fieldRect.width) {
        left = fieldRect.left;

        width = fieldRect.width;
      }
    }

    if (!width || width < 1) {
      var wrapper = getWrapper(input);

      if (wrapper) {
        width = wrapper.getBoundingClientRect().width;
      }
    }

    if (!width || width < 1) {
      return;
    }

    var maxWidth = window.innerWidth - 20;

    if (width > maxWidth) {
      width = maxWidth;
    }

    if (left + width > window.innerWidth - 10) {
      left = window.innerWidth - width - 10;
    }

    if (left < 10) {
      left = 10;
    }

    dropdown.style.left = Math.round(left) + "px";

    dropdown.style.top = Math.round(rect.bottom + 6) + "px";

    dropdown.style.width = Math.round(width) + "px";
  }

  /**
   * Position on scroll/resize.
   */
  function schedulePosition() {
    if (!dropdown || !dropdown.classList.contains("is-open")) {
      return;
    }

    if (positionTimer) {
      return;
    }

    positionTimer = window.requestAnimationFrame(function () {
      positionTimer = null;

      if (activeInput) {
        positionDropdown(activeInput);
      }
    });
  }

  /**
   * Loader.
   */
  function setLoading(isLoading) {
    if (!activeWrapper) {
      return;
    }

    var button = activeWrapper.querySelector(".store-one-search-submit");

    if (!button) {
      return;
    }

    if (isLoading && getShowLoader()) {
      button.classList.add("is-loading");
    } else {
      button.classList.remove("is-loading");
    }
  }

  /**
   * Show loader setting.
   */
  function getShowLoader() {
    if (typeof config.showLoader !== "undefined") {
      return toBoolean(config.showLoader, false);
    }

    var settings = getSettings();

    return toBoolean(settings.show_loader, false);
  }

  /**
   * Get search style.
   */
  function getSearchStyle(input) {
    if (!input) {
      return "";
    }

    var wrapper = getWrapper(input);

    if (!wrapper) {
      return "";
    }

    var style = wrapper.getAttribute("data-style") || "";

    if (
      style !== "th-normal" &&
      style !== "th-traditional" &&
      style !== "th-modern"
    ) {
      return "";
    }

    return style;
  }

  /**
   * Get wrapper.
   */
  function getWrapper(input) {
    if (!input) {
      return null;
    }

    return input.closest(".store-one-advance-search");
  }

  /**
   * Settings.
   */
  function getSettings() {
    var settings = config.settings;

    if (!settings || typeof settings !== "object") {
      settings = {};
    }

    return Object.assign({}, DEFAULTS, settings);
  }
  /*
   * Public utilities for Store One Advance Search Pro.
   */
  window.storeOneAdvanceSearchUtils = {
    toBoolean: toBoolean,
    highlightMatch: highlightMatch,
    escapeHTML: escapeHTML,
  };

  /**
   * Search URL.
   */
  function buildSearchUrl(term, input) {
    var form = input ? input.closest(".store-one-search-form") : null;

    var base = form ? form.getAttribute("action") : "";

    if (!base) {
      base = window.location.href;
    }

    var url;

    try {
      url = new URL(base, window.location.origin);
    } catch (error) {
      url = new URL(window.location.href);
    }

    url.searchParams.set("s", term);

    var customPostType = input
      ? input.getAttribute("data-custom-post-type")
      : "";

    if (customPostType) {
      url.searchParams.set("post_type", customPostType);
    } else {
      url.searchParams.set("post_type", "product");
    }

    return url.toString();
  }

  /**
   * Save recent search.
   */
  function saveRecentSearch() {
    if (!activeInput) {
      return;
    }

    var keyword = activeInput.value.trim();

    if (!keyword) {
      return;
    }

    try {
      var key = "store_one_recent_searches";

      var recent = JSON.parse(window.localStorage.getItem(key) || "[]");

      if (!Array.isArray(recent)) {
        recent = [];
      }

      recent = recent.filter(function (item) {
        return item !== keyword;
      });

      recent.unshift(keyword);

      recent = recent.slice(0, 5);

      window.localStorage.setItem(key, JSON.stringify(recent));
    } catch (error) {}
  }

  /**
   * Abort current request.
   */
  function abortRequest() {
    if (request && request.readyState !== XMLHttpRequest.DONE) {
      try {
        request.abort();
      } catch (error) {}
    }

    request = null;
  }

  /**
   * Boolean helper.
   */
  function toBoolean(value, fallback) {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value === 1;
    }

    if (typeof value === "string") {
      var normalized = value.toLowerCase().trim();

      if (
        normalized === "1" ||
        normalized === "true" ||
        normalized === "yes" ||
        normalized === "on"
      ) {
        return true;
      }

      if (
        normalized === "0" ||
        normalized === "false" ||
        normalized === "no" ||
        normalized === "off" ||
        normalized === ""
      ) {
        return false;
      }
    }

    return fallback;
  }

  /**
   * Escape HTML.
   */
  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Escape attribute.
   */
  function escapeAttribute(value) {
    return escapeHTML(value);
  }

  /**
   * Escape regex.
   */
  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Closest helper.
   */
  function closest(element, selector) {
    if (!element) {
      return null;
    }

    if (element.closest) {
      return element.closest(selector);
    }

    return null;
  }

  /**
   * Start.
   */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /**
   * Support dynamically rendered search forms.
   */
  if (window.MutationObserver) {
    var observer = new MutationObserver(function () {
      bindInputs();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
})();
