/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/admin/AdminMain.js":
/*!********************************!*\
  !*** ./src/admin/AdminMain.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_Header_Header__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/Header/Header */ "./src/admin/components/Header/Header.js");
/* harmony import */ var _components_ModuleGrid_ModuleGrid__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/ModuleGrid/ModuleGrid */ "./src/admin/components/ModuleGrid/ModuleGrid.js");
/* harmony import */ var _components_ModuleSettings_ModuleSettings__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/ModuleSettings/ModuleSettings */ "./src/admin/components/ModuleSettings/ModuleSettings.js");
/* harmony import */ var _components_PreviewPane_PreviewPane__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/PreviewPane/PreviewPane */ "./src/admin/components/PreviewPane/PreviewPane.js");
/* harmony import */ var _components_GlobalSettings_GlobalSettings__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/GlobalSettings/GlobalSettings */ "./src/admin/components/GlobalSettings/GlobalSettings.js");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _admin_scss__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./admin.scss */ "./src/admin/admin.scss");











const modulesList = [{
  id: 'pre-order',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Pre Oreder', 'store-one'),
  description: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Boost product discovery.', 'store-one'),
  icon: '🔍'
}, {
  id: 'cart',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Smart Cart', 'store-one'),
  description: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Elegant AJAX mini cart.', 'store-one'),
  icon: '🛒'
}, {
  id: 'frequently-bought',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Frequently Bought', 'store-one'),
  description: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('AI-powered combos.', 'store-one'),
  icon: '🤝'
}];
const tabs = [{
  name: 'all',
  title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('All Modules', 'store-one'),
  modules: ['pre-order', 'cart', 'frequently-bought']
}, {
  name: 'recommended',
  title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Recommended', 'store-one'),
  modules: ['pre-order', 'cart']
}, {
  name: 'trending',
  title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Trending', 'store-one'),
  modules: ['frequently-bought']
}];
const AdminMain = () => {
  const [loading, setLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [success, setSuccess] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [currentPage, setCurrentPage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('dashboard');
  const [activeModule, setActiveModule] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [modulesState, setModulesState] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    'pre-order': true,
    cart: true,
    'frequently-bought': true
  });
  const currentModule = activeModule ? modulesList.find(m => m.id === activeModule) : null;

  // Attach nonce middleware.
  _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().use(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().createNonceMiddleware(StoreOneAdmin.nonce));

  /**
   * Load modules state from REST.
   */
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    setLoading(true);
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `${StoreOneAdmin.restUrl}modules`
    }).then(res => {
      if (res?.modules) {
        const newState = {
          ...modulesState
        };
        modulesList.forEach(mod => {
          newState[mod.id] = res.modules[mod.id] !== undefined ? !!res.modules[mod.id] : true;
        });
        setModulesState(newState);
      }
    }).catch(() => {
      setError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Failed to load settings.', 'store-one'));
    }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Save whole modulesState to REST.
   */
  const saveModules = nextState => {
    setSaving(true);
    setError('');
    setSuccess('');
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `${StoreOneAdmin.restUrl}modules`,
      method: 'POST',
      data: {
        modules: nextState
      }
    }).then(() => {
      setSuccess((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Saved successfully!', 'store-one'));
    }).catch(() => {
      setError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Failed to save settings.', 'store-one'));
    }).finally(() => setSaving(false));
  };

  /**
   * Toggle single module (auto-saves).
   */
  const handleToggleModule = (moduleId, enabled) => {
    setModulesState(prev => {
      const next = {
        ...prev,
        [moduleId]: !!enabled
      };
      saveModules(next);
      return next;
    });
  };

  /**
   * Master switch (Enable all / Disable all).
   */
  const handleToggleAllModules = enableAll => {
    setModulesState(prev => {
      const next = {};
      modulesList.forEach(mod => {
        next[mod.id] = !!enableAll;
      });
      saveModules(next);
      return next;
    });
  };
  const [hideToast, setHideToast] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (success || error) {
      setHideToast(false);
      const timer = setTimeout(() => setHideToast(true), 2500);
      const removeTimer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => {
        clearTimeout(timer);
        clearTimeout(removeTimer);
      };
    }
  }, [success, error]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "store-one-admin"
  }, success && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: `storeone-toast toast-success ${hideToast ? 'hide' : ''}`
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "toast-icon success-icon"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, success)), error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: `storeone-toast toast-error ${hideToast ? 'hide' : ''}`
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "toast-icon error-icon"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, error)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_Header_Header__WEBPACK_IMPORTED_MODULE_4__["default"], {
    currentPage: currentPage,
    setCurrentPage: setCurrentPage,
    setActiveModule: setActiveModule
  }), currentPage === 'dashboard' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, !loading && !activeModule && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ModuleGrid_ModuleGrid__WEBPACK_IMPORTED_MODULE_5__["default"], {
    modulesList: modulesList,
    modulesState: modulesState,
    tabs: tabs,
    setActiveModule: setActiveModule
  }), !loading && activeModule && currentModule && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "store-module-wrap"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_9__.Button, {
    isTertiary: true,
    className: "back-btn",
    onClick: () => setActiveModule(null)
  }, "\u2190 ", (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Go Back', 'store-one')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "settings-grid"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ModuleSettings_ModuleSettings__WEBPACK_IMPORTED_MODULE_6__["default"], {
    currentModule: currentModule,
    modulesState: modulesState,
    onToggleModule: handleToggleModule,
    saving: saving
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_PreviewPane_PreviewPane__WEBPACK_IMPORTED_MODULE_7__["default"], null))), loading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "store-loader"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_9__.Spinner, null), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Loading…', 'store-one'))), currentPage === 'settings' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_GlobalSettings_GlobalSettings__WEBPACK_IMPORTED_MODULE_8__["default"], {
    modulesList: modulesList,
    modulesState: modulesState,
    onToggleAllModules: handleToggleAllModules
  }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AdminMain);

/***/ }),

/***/ "./src/admin/admin.scss":
/*!******************************!*\
  !*** ./src/admin/admin.scss ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/admin/components/GlobalSettings/GlobalSettings.js":
/*!***************************************************************!*\
  !*** ./src/admin/components/GlobalSettings/GlobalSettings.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);



const GlobalSettings = ({
  modulesList,
  modulesState,
  onToggleAllModules
}) => {
  const allEnabled = modulesList.every(mod => !!modulesState[mod.id]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "settings-global-wrap"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Card, {
    className: "settings-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Plugin Status', 'store-one'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Enable all modules (master switch)', 'store-one'),
    checked: allEnabled,
    onChange: enableAll => onToggleAllModules(enableAll)
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    style: {
      marginTop: '12px'
    }
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('This switch quickly turns all modules on or off.', 'store-one')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Card, {
    className: "settings-card",
    style: {
      marginTop: 16
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Support & Documentation', 'store-one'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Need help? Visit documentation or contact support.', 'store-one')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
    isSecondary: true,
    href: "#",
    style: {
      marginRight: '8px'
    }
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('View Docs', 'store-one')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
    isSecondary: true,
    href: "#"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Contact Support', 'store-one')))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GlobalSettings);

/***/ }),

/***/ "./src/admin/components/Header/Header.js":
/*!***********************************************!*\
  !*** ./src/admin/components/Header/Header.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);



const Header = ({
  currentPage,
  setCurrentPage,
  setActiveModule
}) => {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("header", {
    className: "store-one-header"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "store-one-header-left"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "store-one-logo"
  }, "S1"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h1", {
    className: "store-one-title"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Store One', 'store-one')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "store-one-subtitle"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('WooCommerce Enhancement Toolkit', 'store-one')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("nav", {
    className: "store-one-header-nav"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    className: `nav-btn ${currentPage === 'dashboard' ? 'is-active' : ''}`,
    onClick: () => {
      setCurrentPage('dashboard');
      setActiveModule(null);
    }
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Dashboard', 'store-one')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    className: `nav-btn ${currentPage === 'settings' ? 'is-active' : ''}`,
    onClick: () => {
      setCurrentPage('settings');
      setActiveModule(null);
    }
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Settings', 'store-one'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: "#",
    className: "components-button is-secondary upgrade-btn"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Upgrade', 'store-one')));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Header);

/***/ }),

/***/ "./src/admin/components/ModuleCard/ModuleCard.js":
/*!*******************************************************!*\
  !*** ./src/admin/components/ModuleCard/ModuleCard.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);



const ModuleCard = ({
  mod,
  modulesState,
  setActiveModule
}) => {
  const isActive = modulesState[mod.id];
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Card, {
    className: "module-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "mod-top"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "mod-icon"
  }, mod.icon), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: `badge ${isActive ? 'on' : 'off'}`
  }, isActive ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Active', 'store-one') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Inactive', 'store-one'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, mod.label), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, mod.description), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
    className: "try-now",
    isPrimary: true,
    onClick: () => setActiveModule(mod.id)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Try now', 'store-one'), " \u2192")));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ModuleCard);

/***/ }),

/***/ "./src/admin/components/ModuleGrid/ModuleGrid.js":
/*!*******************************************************!*\
  !*** ./src/admin/components/ModuleGrid/ModuleGrid.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ModuleCard_ModuleCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ModuleCard/ModuleCard */ "./src/admin/components/ModuleCard/ModuleCard.js");



const ModuleGrid = ({
  modulesList,
  modulesState,
  tabs,
  setActiveModule
}) => {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "modules-wrapper"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TabPanel, {
    className: "module-tabs",
    tabs: tabs
  }, tab => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "modules-grid"
  }, modulesList.filter(m => tab.modules.includes(m.id)).map(mod => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ModuleCard_ModuleCard__WEBPACK_IMPORTED_MODULE_2__["default"], {
    key: mod.id,
    mod: mod,
    modulesState: modulesState,
    setActiveModule: setActiveModule
  })))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ModuleGrid);

/***/ }),

/***/ "./src/admin/components/ModuleSettings/ModuleSettings.js":
/*!***************************************************************!*\
  !*** ./src/admin/components/ModuleSettings/ModuleSettings.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _modules_PreOrdersSettings__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../modules/PreOrdersSettings */ "./src/admin/modules/PreOrdersSettings.js");
/* harmony import */ var _modules_SmartCartSettings__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../modules/SmartCartSettings */ "./src/admin/modules/SmartCartSettings.js");




// dynamic module UIs


const ModuleSettings = ({
  currentModule,
  modulesState,
  onToggleModule,
  saving
}) => {
  const enabled = !!modulesState[currentModule.id];

  /**
   * Decide which module settings panel to show
   */
  const renderModuleContent = () => {
    switch (currentModule.id) {
      case 'pre-order':
        // ✔ correct module ID
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_modules_PreOrdersSettings__WEBPACK_IMPORTED_MODULE_3__["default"], null);
      case 'cart':
        // ✔ new smart cart UI
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_modules_SmartCartSettings__WEBPACK_IMPORTED_MODULE_4__["default"], null);
      default:
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('More settings will appear here…', 'store-one'));
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Card, {
    className: "settings-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Flex, {
    justify: "space-between",
    align: "center"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.FlexBlock, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", {
    className: "settings-title"
  }, currentModule.label), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "settings-desc"
  }, currentModule.description)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.FlexItem, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
    label: enabled ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Enabled', 'store-one') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Disabled', 'store-one'),
    checked: enabled,
    disabled: saving,
    onChange: val => onToggleModule(currentModule.id, val)
  })))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, renderModuleContent()));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ModuleSettings);

/***/ }),

/***/ "./src/admin/components/PreviewPane/PreviewPane.js":
/*!*********************************************************!*\
  !*** ./src/admin/components/PreviewPane/PreviewPane.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);



const PreviewPane = () => {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Card, {
    className: "preview-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", {
    className: "preview-title"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Preview', 'store-one'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "preview-box"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "preview-browser-bar"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "dot"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "dot"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "dot"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "preview-content"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "preview-thumb"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "preview-line lg"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "preview-line"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "preview-line"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "preview-highlight-text"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Ships on November 26, 2025.', 'store-one')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
    isSecondary: true,
    className: "preview-btn"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Pre Order Now!', 'store-one'))))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PreviewPane);

/***/ }),

/***/ "./src/admin/modules/PreOrdersSettings.js":
/*!************************************************!*\
  !*** ./src/admin/modules/PreOrdersSettings.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);

// src/admin/modules/PreOrdersSettings.js




const MODULE_ID = 'pre-orders';
const PreOrdersSettings = () => {
  const [loading, setLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [success, setSuccess] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');

  // yaha sirf kuch example fields rakhe hain:
  const [mode, setMode] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('unified_order');
  const [helpText, setHelpText] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  // rules ko simple array form me rakh sakte ho (aage UI banayenge):
  const [rules, setRules] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);

  // 1) LOAD settings from REST
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    setLoading(true);
    setError('');
    setSuccess('');
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().use(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().createNonceMiddleware(StoreOneAdmin.nonce));
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
      method: 'GET'
    }).then(res => {
      const s = res?.settings || {};
      if (s.modes) {
        setMode(s.modes);
      }
      if (typeof s.helping_instructions_only_pre_orders === 'string') {
        setHelpText(s.helping_instructions_only_pre_orders);
      }
      if (Array.isArray(s.rules)) {
        setRules(s.rules);
      }
    }).catch(() => {
      setError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Failed to load pre-order settings.', 'store-one'));
    }).finally(() => setLoading(false));
  }, []);

  // 2) SAVE settings
  const handleSave = () => {
    setSaving(true);
    setError('');
    setSuccess('');
    const payload = {
      settings: {
        modes: mode,
        helping_instructions_only_pre_orders: helpText,
        rules // abhi jo bhi array hai woh as-is jayega
      }
    };
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
      method: 'POST',
      data: payload
    }).then(() => {
      setSuccess((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Settings saved successfully.', 'store-one'));
    }).catch(() => {
      setError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Failed to save settings.', 'store-one'));
    }).finally(() => setSaving(false));
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "settings-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", {
    className: "settings-title"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Pre-orders Settings', 'store-one')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "settings-desc"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Configure how pre-orders behave in your store.', 'store-one'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, loading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "store-loader-inline"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, null), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Loading…', 'store-one')), !loading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "storeone-toast toast-error"
  }, error), success && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "storeone-toast toast-success"
  }, success), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Pre-order mode', 'store-one'),
    value: mode,
    options: [{
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Unified order (all together)', 'store-one'),
      value: 'unified_order'
    }, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Separate order for pre-orders', 'store-one'),
      value: 'separate_order_for_pre_orders'
    }, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Group pre-orders into one order', 'store-one'),
      value: 'group_pre_order_into_one_order'
    }],
    onChange: setMode
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Helping instructions (customers)', 'store-one'),
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Shown near the pre-order options to explain how it works.', 'store-one'),
    value: helpText,
    onChange: setHelpText
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    isPrimary: true,
    onClick: handleSave,
    disabled: saving,
    style: {
      marginTop: '16px'
    }
  }, saving ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Saving…', 'store-one') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Save settings', 'store-one')))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PreOrdersSettings);

/***/ }),

/***/ "./src/admin/modules/SmartCartSettings.js":
/*!************************************************!*\
  !*** ./src/admin/modules/SmartCartSettings.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);





const MODULE_ID = 'cart';
const SmartCartSettings = () => {
  const [loading, setLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);

  // toast
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [success, setSuccess] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');

  // module fields
  const [cartPosition, setCartPosition] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('right');
  const [animation, setAnimation] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('slide');
  const [showSubtotal, setShowSubtotal] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [buttonText, setButtonText] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('Checkout Now');

  // Load settings
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().use(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().createNonceMiddleware(StoreOneAdmin.nonce));
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`
    }).then(res => {
      var _s$cart_position, _s$animation, _s$button_text;
      const s = res.settings;
      setCartPosition((_s$cart_position = s.cart_position) !== null && _s$cart_position !== void 0 ? _s$cart_position : 'right');
      setAnimation((_s$animation = s.animation) !== null && _s$animation !== void 0 ? _s$animation : 'slide');
      setShowSubtotal(!!s.show_subtotal);
      setButtonText((_s$button_text = s.button_text) !== null && _s$button_text !== void 0 ? _s$button_text : 'Checkout Now');
    }).catch(() => setError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Failed to load Smart Cart settings.', 'store-one'))).finally(() => setLoading(false));
  }, []);

  // Save settings
  const handleSave = () => {
    setSaving(true);
    setError('');
    setSuccess('');
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
      method: 'POST',
      data: {
        settings: {
          cart_position: cartPosition,
          animation: animation,
          show_subtotal: showSubtotal,
          button_text: buttonText
        }
      }
    }).then(() => setSuccess((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Settings saved successfully!', 'store-one'))).catch(() => setError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Failed to save settings.', 'store-one'))).finally(() => setSaving(false));
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "settings-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Smart Cart Settings', 'store-one')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Configure the behavior and style of the Smart Cart.', 'store-one'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, loading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "store-loader-inline"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, null), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Loading…', 'store-one')), !loading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "storeone-toast toast-error"
  }, error), success && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "storeone-toast toast-success"
  }, success), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Cart Position', 'store-one'),
    value: cartPosition,
    onChange: setCartPosition,
    options: [{
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Right', 'store-one'),
      value: 'right'
    }, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Left', 'store-one'),
      value: 'left'
    }]
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Open Animation', 'store-one'),
    value: animation,
    onChange: setAnimation,
    options: [{
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Slide', 'store-one'),
      value: 'slide'
    }, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Fade', 'store-one'),
      value: 'fade'
    }, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Zoom', 'store-one'),
      value: 'zoom'
    }]
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Show Subtotal', 'store-one'),
    checked: showSubtotal,
    onChange: setShowSubtotal
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Checkout Button Text', 'store-one'),
    value: buttonText,
    onChange: setButtonText
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    isPrimary: true,
    disabled: saving,
    onClick: handleSave,
    style: {
      marginTop: 16
    }
  }, saving ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Saving…', 'store-one') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Save Settings', 'store-one')))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SmartCartSettings);

/***/ }),

/***/ "@wordpress/api-fetch":
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["apiFetch"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!****************************!*\
  !*** ./src/admin/index.js ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _AdminMain__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AdminMain */ "./src/admin/AdminMain.js");

// src/admin/index.jsx


document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('store-one-admin-app');
  if (container) {
    const root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createRoot)(container);
    root.render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_AdminMain__WEBPACK_IMPORTED_MODULE_2__["default"], null));
  }
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map