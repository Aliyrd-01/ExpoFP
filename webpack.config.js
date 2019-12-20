const webpack = require("webpack");
const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const DashboardPlugin = require("webpack-dashboard/plugin");
const CopyPlugin = require("copy-webpack-plugin");
const git = require("git-rev-sync");
const dateFormat = require("dateformat");
const username = require("username");
const argv = require("minimist")(process.argv.splice(process.execArgv.length + 2));

const defaultExpo = process.env.EFP_EXPO || argv["expo"] || "eventscase";
// const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin");

// const basePackageValues = {
//     name: "expofp",
//     main: "./expofp.js",
//     license: "UNLICENSED"
// };

// const versionsPackageFilename = __dirname + "/package.json";

const isProd = process.env.NODE_ENV === "production";
if (!isProd) process.env.NODE_ENV = "development";

const config = {
    mode: isProd ? "production" : "development",
    entry: {
        expofp: "./src/expofp.tsx"
    },
    output: {
        path: resolve(__dirname, "dist"),
        filename: "[name].js",
        library: "ExpoFP",
        crossOriginLoading: isProd ? "anonymous" : false
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
    },
    performance: {
        maxAssetSize: 500000,
        assetFilter: function (assetFilename) {
            return assetFilename.endsWith(".js");
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.txt$/i,
                use: "raw-loader"
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            insert: function insertStyle(element) {
                                window['__efpStyleElements'].push(element);
                                var event = new CustomEvent("__efpStyleLoad");
                                window.dispatchEvent(event);
                            }
                        }
                    },
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader"
                ]
            }
        ]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({ eslint: true, async: false }),
        new CleanWebpackPlugin(),

        new webpack.BannerPlugin({
            banner: `${require("./package.json").version} ${git.long()} ${dateFormat(
                "ddd mmm dd yyyy HH:MM:ss Z"
            )} (${username.sync()})`
        }),
        new HtmlWebpackPlugin({
            title: "ExpoFP",
            template: "src/index.html"
        }),
        new webpack.DefinePlugin({
            "process.env.EFP_DEFAULT_EXPO": JSON.stringify(defaultExpo)
        })
    ]
};

if (isProd) {
    config.optimization = {
        // sideEffects: false,
        minimizer: [new TerserWebpackPlugin({ extractComments: false })]
    };
    config.plugins.push(
        new BundleAnalyzerPlugin({ analyzerMode: "static", openAnalyzer: false, reportFilename: "../bundle-report.html" }),
        new CopyPlugin([
            { from: "public", to: "" },
            { from: "src/data.schema.json", to: "../docs" }
        ])
    );
} else {
    // config.optimization = {
    //     minimize: true,
    //     minimizer: [new TerserWebpackPlugin({ extractComments: false })]
    // };
    // for more information, see https://webpack.js.org/configuration/dev-server
    config.devServer = {
        port: 8080,
        open: true,
        hot: true,
        host: process.platform === "win32" ? "localhost" : "0.0.0.0",
        compress: true,
        stats: "minimal",
        overlay: true,
        contentBase: "public",
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD"
        }
    };
    config.devtool = "cheap-module-source-map";
    config.plugins.push(new DashboardPlugin());
}

module.exports = config;
