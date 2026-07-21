import "./style.scss";
import StoreOneSaleNotification from "./modules/sale-notification";
import StoreOneStickyCart from "./modules/sticky-cart";
import StoreOneBuyNow from "./modules/buynow-button";
import StoreOneCountDown from "./modules/sale-countdown";
import StoreOneInactiveTab from "./modules/Inactive-tab";
import StoreOneBrandSwiper from "./modules/product-brand";
import StoreOneRecentSlider from "./modules/recent-view";
import StoreOneProductVideo from "./modules/product-video";
import StoreOneQuickSocial from "./modules/quick-social";
import StoreOneSmartOffer from "./modules/smart-offers";
import StoreOneShopableList from "./modules/shopable-list";

document.addEventListener("DOMContentLoaded", () => {
  if (thStoreOne.modules.saleNotification) {
    StoreOneSaleNotification.init();
  }
  if (thStoreOne.modules.stickyCart) {
    StoreOneStickyCart.init();
  }
  if (thStoreOne.modules.buynowButton) {
    StoreOneBuyNow.init();
  }
  if (thStoreOne.modules.saleCountdown) {
    StoreOneCountDown.init();
  }
  if (thStoreOne.modules.inactiveTab) {
    StoreOneInactiveTab.init();
  }
  if (thStoreOne.modules.productBrand) {
    StoreOneBrandSwiper.init();
  }
  if (thStoreOne.modules.recentView) {
    StoreOneRecentSlider.init();
  }
  if (thStoreOne.modules.productVideo) {
    StoreOneProductVideo.init();
  }
  if (thStoreOne.modules.quickSocial) {
    StoreOneQuickSocial.init();
  }
  if (thStoreOne.modules.smartOffers) {
    StoreOneSmartOffer.init();
  }
  if (thStoreOne.modules.shopableList) {
    StoreOneShopableList.init();
  }
});
