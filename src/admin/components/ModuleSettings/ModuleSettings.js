import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  FlexBlock,
  FlexItem,
  ToggleControl,
  Button,
} from "@wordpress/components";

import { __ } from "@wordpress/i18n";

/* =========================
 * DIRECT IMPORTS
 * ========================= */

import FrequentlyBoughtSettings from "../../modules/frequentlyBoughtTogether/FrequentlyBoughtSettings";

import BundleProductSettings from "../../modules/BundleProductSetting/BundleProductSettings";

import BuytoListSettings from "../../modules/BuytoList/BuytoListSettings";

import QuickSocialSettings from "../../modules/QuickSocial/QuickSocialSettings";

import ProductBrandSettings from "../../modules/ProductBrand/ProductBrandSettings";

import TrustBadgesSettings from "../../modules/TrustBadges/TrustBadgesSettings";

import ProductVideoSettings from "../../modules/ProductVideo/ProductVideoSettings";

import SaleNotificationSettings from "../../modules/SaleNotification/SaleNotificationSettings";

import StickyCartSettings from "../../modules/StickyCart/StickyCartSettings";

import BuyNowButtonSettings from "../../modules/BuyNowButton/BuyNowButtonSettings";

import InactiveTabSettings from "../../modules/InactiveTab/InactiveTabSettings";

import StockScarcitySettings from "../../modules/StockScarcity/StockScarcitySettings";

import SaleCountdownSettings from "../../modules/SaleCountdown/SaleCountdownSettings";

import RecentViewSettings from "../../modules/RecentView/RecentViewSettings";

import SmartOffersSettings from "../../modules/SmartOffers/SmartOffersSettings";

import PeopleViewSettings from "../../modules/PeopleView/PeopleViewSettings";

import PreOrderSettings from "../../modules/PreOrder/PreOrderSettings";

/* =========================
 * MODULE COMPONENT MAP
 * ========================= */

const moduleComponents = {
  "frequently-bought": FrequentlyBoughtSettings,

  "bundle-product": BundleProductSettings,

  "buy-to-list": BuytoListSettings,

  "quick-social": QuickSocialSettings,

  "product-brand": ProductBrandSettings,

  "trust-badges": TrustBadgesSettings,

  "product-video": ProductVideoSettings,

  "sale-notification": SaleNotificationSettings,

  "sticky-cart": StickyCartSettings,

  "buynow-button": BuyNowButtonSettings,

  "inactive-tab": InactiveTabSettings,

  "stock-scarcity": StockScarcitySettings,

  "sale-countdown": SaleCountdownSettings,

  "recent-view": RecentViewSettings,

  "smart-offers": SmartOffersSettings,

  "people-view": PeopleViewSettings,

  "pre-order": PreOrderSettings,
};

const ModuleSettings = ({
  currentModule,
  modulesState,
  onToggleModule,
  saving,
  onSettingsChange,
  onLivePreview,
  onRegisterSave,
  onModuleReady,
  licenseActive,
}) => {
  const enabled = !!modulesState[currentModule.id];

  const isPremium = currentModule.premium ?? false;

  const isLocked = isPremium && !licenseActive;

  /* =========================
   * COMMON PROPS
   * ========================= */

  const commonProps = {
    onSettingsChange,
    onLivePreview,
    onRegisterSave,
    onModuleReady,
  };

  /* =========================
   * ACTIVE COMPONENT
   * ========================= */

  const ActiveComponent = moduleComponents[currentModule.id];

  /* =========================
   * ACTION BUTTONS
   * ========================= */

  const renderActionButton = () => {
    const buttons = {
      "bundle-product": {
        label: __("Create Bundle", "th-store-one"),

        url: `${th_StoreOneAdmin.adminUrl}post-new.php?post_type=product`,
      },

      "product-video": {
        label: __("Add Video", "th-store-one"),

        url: `${th_StoreOneAdmin.adminUrl}edit.php?post_type=product`,
      },

      "sale-countdown": {
        label: __("Add Sale Countdown", "th-store-one"),

        url: `${th_StoreOneAdmin.adminUrl}edit.php?post_type=product`,
      },

      "pre-order": {
        label: __("Add Pre Order", "th-store-one"),

        url: `${th_StoreOneAdmin.adminUrl}edit.php?post_type=product`,
      },
    };

    const config = buttons[currentModule.id];

    if (!config) {
      return null;
    }

    return (
      <Button
        className="s1-settings__redirect-btn"
        onClick={() => window.open(config.url, "_blank")}
      >
        {config.label}
      </Button>
    );
  };

  return (
    <Card className="s1-settings">
      {/* =========================
       * HEADER
       * ========================= */}

      <CardHeader className="s1-settings__header">
        <Flex justify="space-between" align="center">
          <FlexBlock className="s1-settings__info">
            <h2 className="s1-settings__title">{currentModule.label}</h2>

            {isLocked && (
              <span className="s1-license-required-badge">
                <a
                  href="https://themehunk.com/storeone/?utm_campaign=free_plugin&utm_source=dashboard&utm_medium=upgrade_button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {__("Buy Pro", "th-store-one")}
                </a>
              </span>
            )}

            <p className="s1-settings__desc">{currentModule.description}</p>

            {renderActionButton()}
          </FlexBlock>

          <FlexItem className="s1-settings__toggle">
            <ToggleControl
              label={
                enabled
                  ? __("Enabled", "th-store-one")
                  : __("Disabled", "th-store-one")
              }
              checked={enabled}
              disabled={saving || isLocked}
              onChange={(val) => {
                onToggleModule(currentModule.id, val);
              }}
            />
          </FlexItem>
        </Flex>
      </CardHeader>

      {/* =========================
       * BODY
       * ========================= */}

      <CardBody className="s1-settings__body">
        {ActiveComponent ? (
          <ActiveComponent {...commonProps} />
        ) : (
          <p className="s1-settings__placeholder">
            {__("More settings will appear here…", "th-store-one")}
          </p>
        )}
      </CardBody>
    </Card>
  );
};

export default ModuleSettings;
