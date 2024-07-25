const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";
if (!isProd) process.env.NODE_ENV = "development";

module.exports = {
    mode: isProd ? "production" : "development",
    entry: {
        expofp: "./src/expofp.tsx",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        library: "ExpoFP",
        crossOriginLoading: isProd ? "anonymous" : false,
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
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
                            insert: require.resolve('./style-injector.js'),
                        },
                    },
                    "css-loader",
                    "sass-loader",
                ],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "ExpoFP",
            template: "src/index.html",
        }),
    ],
    devServer: {
        port: 8080,
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
            directory: path.join(__dirname, 'public'),
        },
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD",
        },
    },
    devtool: isProd ? "source-map" : "cheap-module-source-map",
};
