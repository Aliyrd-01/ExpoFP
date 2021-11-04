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
const S3Plugin = require("webpack-s3-plugin");
const AWS = require("aws-sdk");

// const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin");

// const basePackageValues = {
//     name: "expofp",
//     main: "./expofp.js",
//     license: "UNLICENSED"
// };

// const versionsPackageFilename = __dirname + "/package.json";

const isProd = process.env.NODE_ENV === "production";
if (!isProd) process.env.NODE_ENV = "development";

const defaultExpo = process.env.EFP_EXPO || argv["expo"] || (isProd ? "expo" : "eventscase");

const config = {
    mode: isProd ? "production" : "development",
    entry: {
        expofp: "./src/expofp.tsx",
    },
    output: {
        path: resolve(__dirname, "dist"),
        filename: "[name].js",
        library: "ExpoFP",
        crossOriginLoading: isProd ? "anonymous" : false,
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    performance: {
        maxAssetSize: 500000,
        assetFilter: function (assetFilename) {
            return assetFilename.endsWith(".js");
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "babel-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.txt$/i,
                use: "raw-loader",
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            insert: function insertStyle(element) {
                                window["__efpStyleElements"].push(element);
                                var event = new CustomEvent("__efpStyleLoad");
                                window.dispatchEvent(event);
                            },
                        },
                    },
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
        ],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({ eslint: true, async: false }),
        new CleanWebpackPlugin(),

        new webpack.BannerPlugin({
            banner: `${require("./package.json").version} ${git.long()} ${dateFormat(
                "ddd mmm dd yyyy HH:MM:ss Z"
            )} (${username.sync()})`,
        }),
        new HtmlWebpackPlugin({
            title: "ExpoFP",
            template: "src/index.html",
        }),
        new webpack.DefinePlugin({
            "process.env.EFP_DEFAULT_EXPO": JSON.stringify(defaultExpo),
        }),
    ],
};

if (isProd) {
    config.optimization = {
        // sideEffects: false,
        minimizer: [new TerserWebpackPlugin({ extractComments: false })],
    };
    config.plugins.push(
        new BundleAnalyzerPlugin({ analyzerMode: "static", openAnalyzer: false, reportFilename: "../bundle-report.html" }),
        new CopyPlugin([
            { from: "public", to: "" },
            { from: "src/public.d.ts", to: "index.d.ts" },
            { from: "src/data.schema.json", to: "../docs" },
            { from: "src/public.d.ts", to: "../docs/typings.d.ts" },
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
            "Access-Control-Allow-Methods": "GET, HEAD",
        },
    };
    config.devtool = "cheap-module-source-map";
    config.plugins.push(new DashboardPlugin());
}

if (process.env.AWS_DEPLOY === "true") {
    let options = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    if (!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)) {
        options = {
            credentials: new AWS.SharedIniFileCredentials({ profile: "efp-deploy-fp" }),
        };
    }
    let forlderName = !process.env.AWS_FOLDER_NAME ? "packages/default" : "packages/" + process.env.AWS_FOLDER_NAME;
    let plugin = new S3Plugin({
        s3Options: options,
        s3UploadOptions: {
            Bucket: "efp-data/" + forlderName,
        },
    });
    if (process.env.CLOUDFRONT_DISTRIBUTION_ID) {
        plugin.cloudfrontInvalidateOptions = {
            DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
            Items: [`/${forlderName}/*`],
        };
    }

    config.plugins.push(plugin);
}

module.exports = config;
