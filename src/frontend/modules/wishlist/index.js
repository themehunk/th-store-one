const $ = window.jQuery;

const StoreOneWishlist = {
  icons: {
    "heart-outline":
      '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>',

    "heart-filled":
      '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>',

    "star-outline":
      '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21L12 17.77L5.82 21L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>',

    "star-filled":
      '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21L12 17.77L5.82 21L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>',

    "bookmark-outline":
      '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M6.32 2.577c2.83-.33 5.66-.33 8.49 0 1.497.174 2.57 1.46 2.57 2.93V21l-6.165-3.583-7.165 3.583V5.507c0-1.47 1.073-2.756 2.57-2.93Z"/></svg>',

    "bookmark-filled":
      '<svg class="th-wishlist-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"/></svg>',
  },

  init() {
    this.bindEvents();
  },

  bindEvents() {
    $(document).on(
      "click",
      ".thw-add-to-wishlist-button:not(.thw-login-required)",
      (e) => this.addToWishlist(e),
    );

    $(document).on("click", ".thwl-remove-item", (e) => this.removeItem(e));

    $(document).on("change", ".thw-qty", (e) => this.updateQuantity(e));

    $(document).on("change", "#thw-select-all", (e) => this.selectAll(e));

    $(document).on("click", ".thw-add-all-to-cart", (e) =>
      this.addAllToCart(e),
    );

    $(document).on("click", ".thw-copy-link-button", (e) => this.copyLink(e));

    $(document).on("click", ".thwl-add-to-cart-manage", (e) =>
      this.addToCart(e),
    );

    $(document).on("click", ".thw-login-required", (e) =>
      this.loginRequired(e),
    );
  },

  addToWishlist(e) {
    e.preventDefault();

    const $button = $(e.currentTarget);

    if ($button.hasClass("create-multi")) {
      return;
    }

    const isShortcode = $button.hasClass("is-shortcode");
    const product_id = $button.data("product-id");
    const variation_id = $button.data("variation-id");

    if ($button.hasClass("in-wishlist")) {
      if (storeOneWishlist.wishlist_page_url) {
        window.location.href = storeOneWishlist.wishlist_page_url;
      }
      return;
    }

    $.ajax({
      type: "POST",
      url: storeOneWishlist.ajax_url,

      data: {
        action: "store_one_add_to_wishlist",
        nonce: storeOneWishlist.add_nonce,
        product_id,
        variation_id,
      },

      beforeSend() {
        $button.addClass("loading");

        $button.find(".thw-icon").html('<span class="thw-loader"></span>');
      },

      success: (response) => {
        if (!response.success) {
          console.log(storeOneWishlist.i18n_error);
          return;
        }

        if (storeOneWishlist.icon_style !== "icon") {
          if (isShortcode) {
            const browseText = $button.attr("data-browse-text");

            if (browseText) {
              $button
                .find("span")
                .last()
                .text(browseText)
                .attr("class", "thw-to-browse-text");
            } else {
              $button.find("span").last().attr("class", "thw-to-browse-text");
            }
          } else {
            $button
              .find("span")
              .last()
              .text(storeOneWishlist.i18n_added)
              .attr("class", "thw-to-browse-text");
          }
        }

        $button.addClass("in-wishlist");

        if ($button.data("enable-tooltip")) {
          $button.attr("data-tooltip", $button.attr("data-browse-text"));
        }

        if (
          ["icon", "icon_text", "icon_only_no_style"].includes(
            storeOneWishlist.icon_style,
          )
        ) {
          let iconHtml = "";

          if (isShortcode) {
            const browseIcon = $button.data("browse-icon");

            if (browseIcon) {
              const decoded = $("<textarea/>").html(browseIcon).text();

              iconHtml =
                '<span class="thw-icon browse"><span class="' +
                decoded +
                '"></span></span>';
            }
          }

          if (!iconHtml) {
            const icon = storeOneWishlist.browse_icon || "heart-filled";

            iconHtml =
              '<span class="thw-icon browse">' +
              (this.icons[icon] || this.icons["heart-filled"]) +
              "</span>";
          }

          $button.find(".thw-icon").replaceWith(iconHtml);
        }
      },

      complete() {
        $button.removeClass("loading");
      },
    });
  },
  removeItem(e) {
    e.preventDefault();

    const $this = $(e.currentTarget);
    const $parent = $this.closest(
      ".thwl-item-row, .s1-tr-row, .thwl-modern-card",
    );

    if (!$parent.length) return;

    const item_id = $parent.data("item-id");

    if (!item_id) return;

    $.ajax({
      type: "POST",
      url: storeOneWishlist.ajax_url,

      data: {
        action: "store_one_remove_from_wishlist",
        nonce: storeOneWishlist.remove_nonce,
        item_id,
      },

      beforeSend() {
        $parent.css("opacity", "0.5");
      },

      success: (response) => {
        if (!response.success) {
          $parent.css("opacity", "1");
          return;
        }

        $parent.fadeOut(300, () => {
          if ($parent.is("tr") && $parent.siblings().length === 0) {
            const colspan = $parent.children().length;

            $parent
              .closest("tbody")
              .html(
                `<tr><td colspan="${colspan}">${storeOneWishlist.i18n_empty_wishlist}</td></tr>`,
              );
          }

          if (
            $parent.hasClass("thwl-wishlist-item") &&
            $parent.siblings(".thwl-wishlist-item").length === 0
          ) {
            $parent
              .closest(".thw-wishlist-items")
              .html(`<p>${storeOneWishlist.i18n_empty_wishlist}</p>`);
          }

          if (
            $parent.hasClass("thw-wishlist-card") &&
            $parent.siblings(".thw-wishlist-card").length === 0
          ) {
            $parent
              .closest(".thw-wishlist-grid")
              .html(`<p>${storeOneWishlist.i18n_empty_wishlist}</p>`);
          }

          if ($parent.hasClass("s1-tr-row")) {
            const $wrapper = $parent.closest(".s1-traditional");

            $parent.remove();

            if ($wrapper.find(".s1-tr-row").length === 0) {
              $wrapper.append(`
            <div class="s1-tr-row">
                <div class="info">
                    <h4>${storeOneWishlist.i18n_empty_wishlist}</h4>
                </div>
            </div>
            `);
            }

            return;
          }

          if ($parent.hasClass("thwl-modern-card")) {
            const $grid = $parent.closest(".thwl-modern-grid");

            $parent.remove();

            if ($grid.find(".thwl-modern-card").length === 0) {
              $grid.html(`
      <div class="thwl-modern-empty">
        ${storeOneWishlist.i18n_empty_wishlist}
      </div>
    `);
            }

            return;
          }

          $parent.remove();
        });
      },

      error() {
        $parent.css("opacity", "1");
      },
    });
  },

  updateQuantity(e) {
    const $input = $(e.currentTarget);

    const item_id = $input.data("item-id");
    const quantity = $input.val();

    const $row = $input.closest("tr");
    const $button = $row.find(".add_to_cart_button");

    if ($button.length) {
      $button.attr("data-quantity", quantity);
    }

    $.post(storeOneWishlist.ajax_url, {
      action: "store_one_update_item_quantity",
      nonce: storeOneWishlist.update_qty_nonce,
      item_id,
      quantity,
    });
  },

  selectAll(e) {
    $(".thwl-wishlist-item input[type='checkbox']").prop(
      "checked",
      e.currentTarget.checked,
    );
  },

  addAllToCart(e) {
    e.preventDefault();

    const $button = $(e.currentTarget);

    const items = [];

    $(".thwl-wishlist-item input[type='checkbox']:checked").each(function () {
      items.push($(this).val());
    });

    if (!items.length) {
      alert("Please select products.");
      return;
    }

    $.ajax({
      type: "POST",
      url: storeOneWishlist.ajax_url,

      data: {
        action: "store_one_add_all_to_cart",
        nonce: storeOneWishlist.add_all_nonce,
        items,
      },

      beforeSend() {
        $button.addClass("loading");
      },

      success() {
        if (storeOneWishlist.redirect_to_cart) {
          window.location.href = storeOneWishlist.cart_url;
        } else {
          $button.text("Added to Cart!");
        }
      },

      complete() {
        $button.removeClass("loading");
      },
    });
  },

  copyLink(e) {
    const link = $(e.currentTarget).data("link");

    navigator.clipboard.writeText(link);

    alert("Wishlist link copied to clipboard!");
  },

  addToCart(e) {
    e.preventDefault();

    const $btn = $(e.currentTarget);

    const product_id = $btn.data("product-id");
    const quantity = $btn.data("quantity") || 1;
    const item_id = $btn.data("item-id");
    const token = $btn.data("wishlist-token");

    const $row = $(
      `.thwl-item-row[data-item-id="${item_id}"],
   .s1-tr-row[data-item-id="${item_id}"],
   .thwl-modern-card[data-item-id="${item_id}"]`,
    );

    $btn.prop("disabled", true).addClass("loading");

    $.ajax({
      type: "POST",
      url: storeOneWishlist.ajax_url,

      data: {
        action: "store_one_add_to_cart_and_manage",
        nonce: storeOneWishlist.redirect_nonce,
        product_id,
        quantity,
        item_id,
        token,
      },

      success: (response) => {
        if (!response.success) {
          $btn.prop("disabled", false).removeClass("loading");

          return;
        }

        $row.fadeOut(300, () => {
          if ($row.hasClass("thwl-modern-card")) {
            const $grid = $row.closest(".thwl-modern-grid");

            $row.remove();

            if ($grid.find(".thwl-modern-card").length === 0) {
              $grid.html(`
      <div class="thwl-modern-empty">
        ${storeOneWishlist.i18n_empty_wishlist}
      </div>
    `);
            }

            if (storeOneWishlist.redirect_to_cart) {
              window.location.href = storeOneWishlist.cart_url;
            }

            return;
          }

          if ($row.hasClass("s1-tr-row")) {
            const $wrapper = $row.closest(".s1-traditional");

            $row.remove();

            if ($wrapper.find(".s1-tr-row").length === 0) {
              $wrapper.append(`
                <div class="s1-tr-row">
                    <div class="info">
                        <h4>${storeOneWishlist.i18n_empty_wishlist}</h4>
                    </div>
                </div>
            `);
            }

            if (storeOneWishlist.redirect_to_cart) {
              window.location.href = storeOneWishlist.cart_url;
            }

            return;
          }

          const $tbody = $row.closest("tbody");

          $row.remove();

          if ($tbody.find("tr").length === 0) {
            const colspan = $btn.closest("table").find("thead th").length;

            $tbody.html(
              `<tr><td colspan="${colspan}">${storeOneWishlist.i18n_empty_wishlist}</td></tr>`,
            );
          }

          if (storeOneWishlist.redirect_to_cart) {
            window.location.href = storeOneWishlist.cart_url;
          }
        });
      },

      error() {
        $btn.prop("disabled", false).removeClass("loading");
      },
    });
  },

  loginRequired(e) {
    e.preventDefault();
  },
};

export default StoreOneWishlist;
