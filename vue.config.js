const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const replace = require('replace-in-file');
const fs = require('fs');
// const WebpackShellPlugin = require('webpack-shell-plugin');
const webpack = require('webpack');
const expo = require('./scripts/expo')
const expoDefine = require(`./expos/${expo}/define`)


const dataUrlProd = `https://${expo}.expofp.com/data/data.js`;
const dataUrlDev = `https://s3.amazonaws.com/efp-data-dev/expos/${expo}/data/data.js`;

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
                        from: path.join(__dirname, `expos/${expo}/{settings.js,fp.js,*.png}`),
                        to: path.join(__dirname, 'dist'),
                        context: path.join(__dirname, `expos/${expo}`)
                    }
                ]
            ),
            new webpack.DefinePlugin({ EFP_EXPO, ...expoDefine }),
            // new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 2 }),
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                        console.log('here');
                        const prodIndex = path.join(__dirname, 'dist', 'index.html');
                        const devIndex = path.join(__dirname, 'dist', 'index.dev.html');
                        var data = fs.readFileSync(prodIndex, 'utf-8');
                        fs.writeFileSync(devIndex, data.replace('DATA_JS_SCRIPT_PLACEHOLDER', `<script src=${dataUrlDev}></script>`));
                        fs.writeFileSync(prodIndex, data.replace('DATA_JS_SCRIPT_PLACEHOLDER', `<script src=${dataUrlProd}></script>`));
                    });
                }
            }
        ],
        resolve: {
            alias: {
                'styles': path.resolve(__dirname, './src/styles/')
            }
        },
        // optimization: {
        //     splitChunks: {
        //         chunks: 'async',
        //         // minSize: 3000000,
        //         // maxSize: 0,
        //         // minChunks: 1,
        //         // maxAsyncRequests: 5,
        //         // maxInitialRequests: 3,
        //         // automaticNameDelimiter: '~',
        //         // name: true,
        //         // cacheGroups: {
        //         //     vendors: {
        //         //         test: /[\\/]node_modules[\\/]/,
        //         //         priority: -10
        //         //     },
        //         //     default: {
        //         //         minChunks: 2,
        //         //         priority: -20,
        //         //         reuseExistingChunk: true
        //         //     }
        //         // }
        //     }
        // }
    },
    // chainWebpack: config => {
    //     config.optimization.splitChunks.chunks = 'all'
    // },
    css: {
        loaderOptions: {
            sass: {
                data: '@import "~styles/vars.scss"; @import "~styles/mixins.scss";'
            }
        }
    }
    // pluginOptions: {
    //     'style-resources-loader': {
    //         preProcessor: 'scss',
    //         patterns: path.resolve(__dirname, 'src/styles/vars.scss'),
    //         injector: (source, resources) => {
    //             // const combineAll = type => resources
    //             //     .filter(({ file }) => file.includes(type))
    //             //     .map(({ content }) => content)
    //             //     .join('');

    //             return '@import "../styles/vars.scss"; @import "../styles/mixins.scss";' + source;
    //         }
    //         // patterns: [
    //         //     path.resolve(__dirname, 'src/styles/vars.scss'),
    //         //     path.resolve(__dirname, 'src/styles/mixins.scss')
    //         // ]
    //     }
    // }
}
