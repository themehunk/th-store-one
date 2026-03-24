const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
    ...defaultConfig, 

    resolve: {
        ...defaultConfig.resolve,
        alias: {
            '@th-storeone': path.resolve(__dirname, 'src/admin/components'),
            '@th-storeone-control': path.resolve(__dirname, 'src/admin/components/componentsControl'),
            '@th-storeone-global': path.resolve(__dirname, 'src/admin/components/GlobalSettings'),
            '@th-storeone-header': path.resolve(__dirname, 'src/admin/components/Header'),
            '@th-storeone-modulecard': path.resolve(__dirname, 'src/admin/components/ModuleCard'),
            '@th-storeone-modulegrid': path.resolve(__dirname, 'src/admin/components/ModuleGrid'),
            '@th-storeone-modulesettings': path.resolve(__dirname, 'src/admin/components/ModuleSettings'),
            '@th-storeone-modulepreviewpane': path.resolve(__dirname, 'src/admin/components/PreviewPane'),
        },
    },
};

