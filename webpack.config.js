const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const S3Plugin = require("webpack-s3-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const AWS = require("aws-sdk");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const ESLintPlugin = require("eslint-webpack-plugin");
const BundleJsonPlugin = require("./BundleJsonPlugin");

function createConfig(env) {
    const isProd = process.env.NODE_ENV === "production";
    if (!isProd) process.env.NODE_ENV = "development";

    const defaultExpo = process.env.EFP_EXPO || env["expo"] || (isProd ? "expo" : "eventscase");

    const config = {
        mode: isProd ? "production" : "development",
        entry: {
            expofp: "./src/expofp.tsx",
        },
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "[name].js",
            chunkFilename: "[name].[contenthash].js",
            library: "ExpoFP",
            crossOriginLoading: isProd ? "anonymous" : false,
        },
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx"],
            alias: {
                "@styles": path.resolve(__dirname, "src/styles/"),
            },
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
                    test: /\.svg/,
                    use: {
                        loader: "svg-url-loader",
                    },
                },
                {
                    test: /\.(png|jpg|gif)$/i,
                    type: "asset/resource",
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        {
                            loader: "style-loader",
                            options: {
                                insert: require.resolve("./style-injector.js"),
                            },
                        },
                        "css-loader",
                        "sass-loader",
                    ],
                },
            ],
        },
        plugins: [
            new ESLintPlugin(),
            new ForkTsCheckerWebpackPlugin({ async: false }),
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                title: "ExpoFP",
                template: "src/index.html",
                inject: "body",
            }),
            new webpack.DefinePlugin({
                "process.env.EFP_DEFAULT_EXPO": JSON.stringify(defaultExpo),
            }),
            new BundleJsonPlugin({
                filename: "bundle.json",
                exclude: ["sw.js", ".DS_Store"],
                publicPath: "public",
            }),
        ],
    };

    if (isProd) {
        config.optimization = {
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
        config.devServer = {
            port: 8081,
            open: true,
            hot: true,
            compress: true,
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                    runtimeErrors: true,
                },
            },
            static: {
                directory: path.join(__dirname, "public"),
            },
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD",
            },
        };
        config.devtool = "cheap-module-source-map";
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
        let folderName = !process.env.AWS_FOLDER_NAME ? "packages/default" : "packages/" + process.env.AWS_FOLDER_NAME;
        let plugin = new S3Plugin({
            s3Options: options,
            s3UploadOptions: {
                Bucket: "efp-data/" + folderName,
            },
            log: true,
        });
        if (process.env.CLOUDFRONT_DISTRIBUTION_ID && process.env.CLOUDFRONT_INVALIDATION_ENABLED === "true") {
            plugin.cloudfrontInvalidateOptions = {
                DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
                Items: [`/${folderName}/*`],
            };
        }

        config.plugins.push(plugin);
    }

    return config;
}

module.exports = (env) => createConfig(env);
