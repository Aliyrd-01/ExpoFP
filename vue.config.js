const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const webpack = require('webpack');
const expo = require('./scripts/expo');
let config;
try {
    config = require(`./expos/${expo}/config`);
} catch (ex) {
    config = {};
}

const localDataExists = fs.existsSync(`./expos/${expo}/data`);
const localDataUrl = localDataExists ? 'data' : null;

const dataUrlBase = localDataUrl || config.dataUrl || `https://${expo}.expofp.com/data`;
const dataUrlBaseDev = config.dataUrl || `https://s3.amazonaws.com/efp-data-dev/expos/${expo}/data`;
const dataUrlBaseShow = config.dataUrl || `https://s3.amazonaws.com/efp-data-show/expos/${expo}/data`;

console.info("Serving data from: ", dataUrlBase)
// const gTag = config.gTag || 'UA-857963-22';
//const logoUrl = config.logoUrl || `${expo}-logo.png`

const define = {
    EFP_DATA_URL_BASE: JSON.stringify(dataUrlBase),
    EFP_EXPO: JSON.stringify(expo),
    //EFP_TITLE: JSON.stringify(config.title),
    //EFP_HOME_URL: JSON.stringify(config.homeUrl),
    //EFP_LOGO_URL: JSON.stringify(logoUrl),
    // GTAG: JSON.stringify(gTag)
};

//const live = process.env.EFP_TARGET === "live";
const dist = 'dist'; // + (live ? 'live' : 'dev');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

module.exports = {
    devServer: {
        contentBase: [path.join(__dirname, 'public'), path.join(__dirname, `expos/${expo}`)]
    },
    outputDir: dist,
    publicPath: `./`,
    configureWebpack: {
        plugins: [
            new CopyWebpackPlugin(
                [{
                    from: path.join(__dirname, `expos/${expo}/{*.png,*.svg}`),
                    to: path.join(__dirname, dist),
                    context: path.join(__dirname, `expos/${expo}`)
                }]
            ),
            new webpack.DefinePlugin(define),
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                        if (!fs.existsSync(path.join(__dirname, dist))) return;
                        const prodIndex = path.join(__dirname, dist, 'index.html');
                        const devIndex = path.join(__dirname, dist, 'index.dev.html');
                        const showIndex = path.join(__dirname, dist, 'index.show.html');
                        const data = fs.readFileSync(prodIndex, 'utf-8');
                        fs.writeFileSync(devIndex, data.replace(new RegExp(escapeRegExp(dataUrlBase), 'g'), dataUrlBaseDev));
                        fs.writeFileSync(showIndex, data.replace(new RegExp(escapeRegExp(dataUrlBase), 'g'), dataUrlBaseShow));
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
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].minify = {
                    collapseWhitespace: true,
                    preserveLineBreaks: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true
                };
                return args;
            })
    },
    css: {
        loaderOptions: {
            sass: {
                data: '@import "~styles/vars.scss"; @import "~styles/mixins.scss";'
            }
        }
    }
}