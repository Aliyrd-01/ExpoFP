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
        library: "ExpoFP"
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
    },
    performance: {
        maxAssetSize: 500000,
        assetFilter: function(assetFilename) {
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
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: "style-loader"
                        // options: {
                        //   insert: function insertAtTop(element) {
                        //     // eslint-disable-next-line no-underscore-dangle
                        //     window._efpAddStyle = element;
                        //     // var parent = document.querySelector("head");
                        //     //
                        //     // var lastInsertedElement =
                        //     //   window._lastElementInsertedByStyleLoader;

                        //     // if (!lastInsertedElement) {
                        //     //   parent.insertBefore(element, parent.firstChild);
                        //     // } else if (lastInsertedElement.nextSibling) {
                        //     //   parent.insertBefore(element, lastInsertedElement.nextSibling);
                        //     // } else {
                        //     //   parent.appendChild(element);
                        //     // }

                        //     // // eslint-disable-next-line no-underscore-dangle
                        //     // window._lastElementInsertedByStyleLoader = element;
                        //   }
                        // }
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
        new HtmlWebpackPlugin({
            title: "ExpoFP",
            template: "src/index.html",
            inject: "head"
        }),
        new ForkTsCheckerWebpackPlugin({ eslint: true, async: false }),
        new CleanWebpackPlugin(),
        new CopyPlugin([{ from: "public", to: "" }]),
        new webpack.BannerPlugin({
            banner: `${require("./package.json").version} ${git.long()} ${dateFormat(
                "ddd mmm dd yyyy HH:MM:ss Z"
            )} (${username.sync()})`,
            entryOnly: true
        })
        // new GeneratePackageJsonPlugin(basePackageValues, versionsPackageFilename)
    ]
};

if (isProd) {
    config.optimization = {
        minimizer: [new TerserWebpackPlugin({ extractComments: false })]
    };
    config.plugins.push(
        new BundleAnalyzerPlugin({ analyzerMode: "static", openAnalyzer: false, reportFilename: "../bundle-report.html" })
    );
} else {
    // for more information, see https://webpack.js.org/configuration/dev-server
    config.devServer = {
        port: 8080,
        open: true,
        hot: true,
        compress: true,
        stats: "minimal",
        overlay: true,
        contentBase: "public"
    };
    config.devtool = "cheap-module-source-map";
    config.plugins.push(new DashboardPlugin());
}

module.exports = config;
