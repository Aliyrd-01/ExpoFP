const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const webpack = require('webpack');
const expo = require('./scripts/expo')
const config = require(`./expos/${expo}/config`)

const replaceDataBase = config.dataUrl || `https://${expo}.expofp.com/data`;
const devDataBase = config.dataUrl || `https://s3.amazonaws.com/efp-data-dev/expos/${expo}/data`;

const define = {
    EFP_DATA_URL_BASE: JSON.stringify(replaceDataBase),
    EFP_EXPO: JSON.stringify(expo),
    EFP_TITLE: JSON.stringify(config.title),
    EFP_HOME_URL: JSON.stringify(config.homeUrl),
    EFP_LOGO_URL: JSON.stringify(config.logoUrl),
    GTAG: JSON.stringify(config.gTag)
}


module.exports = {
    devServer: {
        contentBase: [path.join(__dirname, 'public'), path.join(__dirname, `expos/${expo}`)]
    },
    publicPath: './',
    configureWebpack: {
        plugins: [
            new CopyWebpackPlugin(
                [
                    {
                        from: path.join(__dirname, `expos/${expo}/{settings.js,fp.js,*.png,*logo.svg}`),
                        to: path.join(__dirname, 'dist'),
                        context: path.join(__dirname, `expos/${expo}`)
                    }
                ]
            ),
            new webpack.DefinePlugin(define),
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                        if (!fs.existsSync(path.join(__dirname, 'dist'))) return;
                        const prodIndex = path.join(__dirname, 'dist', 'index.html');
                        const devIndex = path.join(__dirname, 'dist', 'index.dev.html');
                        const data = fs.readFileSync(prodIndex, 'utf-8');
                        fs.writeFileSync(devIndex, data.replace(replaceDataBase, devDataBase));
                    });
                }
            }
        ],
        resolve: {
            alias: {
                'styles': path.resolve(__dirname, './src/styles/')
            }
        },
    },
    css: {
        loaderOptions: {
            sass: {
                data: '@import "~styles/vars.scss"; @import "~styles/mixins.scss";'
            }
        }
    }
}
