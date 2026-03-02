# Store One Plugin - Structure Reference

> **Version:** 1.0.65 | **WP:** 6.0+ | **PHP:** 7.4+ | **WooCommerce:** 3.0+

## Directory Tree

```
store-one/
├── store-one.php                    [MAIN PLUGIN FILE - Entry Point]
├── package.json                     [Build config - wp-scripts v27.1.0]
├── webpack.config.js                [Webpack aliases: @storeone, @storeone-control]
├── readme.txt                       [Plugin docs]
│
├── includes/                        [CORE PHP BACKEND]
│   ├── class-store-one.php          [Main singleton class]
│   ├── store-one-function.php       [Helpers: normalize_radius, normalize_color]
│   │
│   ├── admin/                       [ADMIN MANAGEMENT]
│   │   ├── class-store-one-admin.php          [Admin menu, React mount, asset enqueue]
│   │   ├── class-store-one-modules.php        [Module on/off - option: store_one_module_option]
│   │   ├── class-store-one-module-settings.php [Per-module settings - option: store_one_module_set]
│   │   ├── class-store-one-rest.php           [REST: /store-one/v1/users]
│   │   └── bundle-product/
│   │       └── class-admin.php                [WC Product Bundle type, tabs, meta]
│   │
│   └── modules/                     [FRONTEND MODULE PHP]
│       ├── frequently-bought/
│       │   └── class-frontend.php   [FBT: rules, AJAX cart, shortcode [storeone_fbt]]
│       ├── bundle-product/
│       │   ├── class-frontend.php   [Bundle: cart/checkout integration, pricing]
│       │   ├── class-bundle-extended.php
│       │   └── test.php
│       ├── buy-to-list/
│       │   └── class-frontend.php   [Buy-to-List: rules-based rendering]
│       └── quick-social/
│           └── class-frontend.php   [Social sharing links]
│
├── src/                             [REACT SOURCE]
│   └── admin/
│       ├── index.js                 [React DOM root → #store-one-admin-app]
│       ├── AdminMain.js             [Main app: state, modules list, REST, tabs, save bar]
│       ├── admin.scss               [Global admin styles]
│       │
│       ├── components/
│       │   ├── Header/Header.js              [Top nav: page switcher]
│       │   ├── ModuleGrid/ModuleGrid.js      [Module cards grid]
│       │   ├── ModuleCard/ModuleCard.js      [Single module card + toggle]
│       │   ├── ModuleSettings/ModuleSettings.js [Settings router per module]
│       │   ├── PreviewPane/PreviewPane.js    [Live preview container]
│       │   ├── StoreOneBackgroundPanel/index.js [Background control]
│       │   │
│       │   ├── GlobalSettings/              [GLOBAL SETTINGS UI]
│       │   │   ├── GlobalSettings.js        [Master settings page]
│       │   │   ├── DeviceControl.js         [Responsive breakpoints]
│       │   │   ├── ExcludeWooCondition.js   [WooCommerce conditions]
│       │   │   ├── UserCondition.js         [User role conditions]
│       │   │   ├── TabSwitcher.js           [Tab navigation]
│       │   │   ├── S1Field.js               [Standard field component]
│       │   │   ├── S1Accordion.js           [Accordion container]
│       │   │   ├── UniversalRangeControl.js [Responsive range + device]
│       │   │   ├── MultiWooSearchSelector.js [Product search selector]
│       │   │   ├── MiniColorPicker.js       [Compact color picker]
│       │   │   ├── icons.js                 [SVG icon definitions]
│       │   │   └── globalsetting.scss
│       │   │
│       │   ├── componentsControl/           [FORM CONTROLS]
│       │   │   ├── color.js                 [Color picker + gradient]
│       │   │   ├── isGradient.js            [Gradient toggle]
│       │   │   ├── rangeControl.js          [Responsive range slider]
│       │   │   └── style.css
│       │   │
│       │   ├── store/
│       │   │   └── device-store.js          [Zustand: responsive device state]
│       │   │
│       │   └── utils/
│       │       ├── detectType.js            [Data type detection]
│       │       ├── normalizeColor.js        [Color normalization]
│       │       ├── parseRawValue.js         [Parse complex values]
│       │       ├── styleHelpers.js          [CSS generation helpers]
│       │       └── index.js                 [Utility exports]
│       │
│       └── modules/                         [MODULE SETTINGS UI]
│           ├── frequentlyBoughtTogether/
│           │   ├── FrequentlyBoughtSettings.js    [Main rules editor]
│           │   ├── FrequentlyBoughtRulesEditor.js [Rule builder]
│           │   ├── SingleProductSettings.js       [Product page rules]
│           │   ├── CartPageSettings.js            [Cart page settings]
│           │   ├── CheckoutPageSettings.js        [Checkout settings]
│           │   └── livepreview/                   [Style1, Style2, Style3, PreviewFBT]
│           │
│           ├── BundleProductSetting/
│           │   ├── BundleProductSettings.js       [Main settings]
│           │   └── livepreview/                   [Product/Cart/MiniCart previews]
│           │
│           ├── BuytoList/
│           │   ├── BuytoListSettings.js           [Main settings]
│           │   ├── BuytoListRules.js              [Rule editor]
│           │   └── livepreview/PreviewBuyToList.js
│           │
│           ├── QuickSocial/
│           │   ├── QuickSocialSettings.js         [Social links config]
│           │   ├── QuickSocialRule.js             [Rule management]
│           │   └── livepreview/PreviewQuickSocial.js
│           │
│           ├── PreOrdersSettings.js               [Pre-Orders settings]
│           ├── PreOrderRulesEditor.js             [Pre-Orders rules]
│           └── SmartCartSettings.js               [Smart Cart settings]
│
├── build/                           [BUILD OUTPUT - Do not edit directly]
│   └── admin/
│       ├── index.js                 [Compiled React bundle]
│       ├── index.css / index-rtl.css
│       ├── style-index.css / style-index-rtl.css
│       └── index.asset.php          [Dependency manifest]
│
└── assets/                          [COMPILED FRONTEND ASSETS]
    ├── css/
    │   ├── bundle-admin.css         [Admin bundle styles]
    │   ├── bundle-front.css         [Frontend bundle styles]
    │   ├── buy-to-list.css          [Buy-to-list styles]
    │   └── storeone-fbt.css         [FBT styles]
    ├── js/
    │   ├── bundle-admin.js          [Admin JS]
    │   ├── bundle-front.js          [Frontend bundle JS]
    │   └── storeone-fbt.js          [FBT frontend JS]
    └── images/
        ├── prd1.png, prd2.png, prd3.png  [Preview images]
        └── th-placeholder.png
```

## Key Flows

### Plugin Init (store-one.php)
1. Define constants → 2. Require `class-store-one.php` + `store-one-function.php`
3. `plugins_loaded` → `Store_One::get_instance()` (singleton)
4. Admin: loads `Store_One_Admin` → React app
5. Always: loads Modules, Module_Settings, REST
6. Frontend: conditionally loads FBT, Bundle, Buy-to-List, Quick Social

### REST API Endpoints
| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/store-one/v1/modules` | Module enable/disable state |
| GET/POST | `/store-one/v1/module/{id}` | Per-module settings |
| GET | `/store-one/v1/users` | User search |

### WordPress Options
- `store_one_module_option` — Module on/off toggles (array)
- `store_one_module_set` — All module settings `{ 'module-id': { ...settings } }`

### Build Commands
```bash
npm run build   # wp-scripts build src/admin/index.js --output-path=build/admin
npm run start   # wp-scripts start (dev mode with watch)
```

## Module Patterns

### React Module Settings Pattern
1. Load settings from REST on mount
2. Local state for form fields
3. `onSettingsChange` callback to parent
4. `onRegisterSave` to register save handler
5. Save via REST POST when top save triggered

### PHP Frontend Module Pattern
1. Singleton/static init
2. Register WooCommerce hooks in constructor
3. Load settings from `store_one_module_set` option
4. Enqueue CSS/JS with `STORE_ONE_VERSION`
5. Inline CSS from settings + handle AJAX

## Tech Stack
- **Backend:** PHP 7.4+, WordPress REST API, WooCommerce hooks
- **Frontend Admin:** React 18, WordPress Components, Zustand, SASS
- **Build:** @wordpress/scripts v27.1.0, Webpack
- **Namespace:** `store-one/v1`
