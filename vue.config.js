const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const webpack = require('webpack');
const expo = require('./scripts/expo')
const expoDefine = require(`./expos/${expo}/define`)

const replaceDataBase = `https://${expo}.expofp.com/data`;
const devDataBase = `https://s3.amazonaws.com/efp-data-dev/expos/${expo}/data`;

const EFP_DATA_URL_BASE = JSON.stringify(replaceDataBase);

const EFP_EXPO = JSON.stringify(expo);

module.exports = {
    devServer: {
        contentBase: [path.join(__dirname, 'public'), path.join(__dirname, `expos/${expo}`)]
    },
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
            new webpack.DefinePlugin({ EFP_DATA_URL_BASE, EFP_EXPO, ...expoDefine }),
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                        console.log('here');
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
