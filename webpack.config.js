const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
    ...defaultConfig, 

    resolve: {
        ...defaultConfig.resolve,
        alias: {
            '@storeone': path.resolve(__dirname, 'src/admin/components'),
            '@storeone-control': path.resolve(__dirname, 'src/admin/components/componentsControl'),
            '@storeone-global': path.resolve(__dirname, 'src/admin/components/GlobalSettings'),
            '@storeone-header': path.resolve(__dirname, 'src/admin/components/Header'),
            '@storeone-modulecard': path.resolve(__dirname, 'src/admin/components/ModuleCard'),
            '@storeone-modulegrid': path.resolve(__dirname, 'src/admin/components/ModuleGrid'),
            '@storeone-modulesettings': path.resolve(__dirname, 'src/admin/components/ModuleSettings'),
            '@storeone-modulepreviewpane': path.resolve(__dirname, 'src/admin/components/PreviewPane'),
        },
    },
};

