const defaultConfig = require("@wordpress/scripts/config/webpack.config");

const path = require("path");

/* =========================
 * REMOVE RTL
 * ========================= */

defaultConfig.plugins = defaultConfig.plugins.filter(
  (plugin) => plugin.constructor.name !== "RtlCssPlugin",
);

module.exports = {
  ...defaultConfig,

  entry: {
    index: path.resolve(__dirname, "src/admin/index.js"),
  },

  output: {
    ...defaultConfig.output,

    filename: "[name].js",

    clean: true,
  },

  resolve: {
    ...defaultConfig.resolve,

    alias: {
      "@th-storeone": path.resolve(__dirname, "src/admin/components"),

      "@th-storeone-control": path.resolve(
        __dirname,
        "src/admin/components/componentsControl",
      ),

      "@th-storeone-global": path.resolve(
        __dirname,
        "src/admin/components/GlobalSettings",
      ),

      "@th-storeone-header": path.resolve(
        __dirname,
        "src/admin/components/Header",
      ),

      "@th-storeone-modulecard": path.resolve(
        __dirname,
        "src/admin/components/ModuleCard",
      ),

      "@th-storeone-modulegrid": path.resolve(
        __dirname,
        "src/admin/components/ModuleGrid",
      ),

      "@th-storeone-modulesettings": path.resolve(
        __dirname,
        "src/admin/components/ModuleSettings",
      ),

      "@th-storeone-modulepreviewpane": path.resolve(
        __dirname,
        "src/admin/components/PreviewPane",
      ),
    },
  },

  performance: {
    hints: false,
  },
};
