const path = require("path");
const TerserWebpackPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    entry: {
        sw: "./src/offline/sw.ts",
    },
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "[name].js",
        crossOriginLoading: "anonymous",
    },
    resolve: {
        extensions: [".ts"],
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "babel-loader",
                exclude: /node_modules/,
            },
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserWebpackPlugin({
                extractComments: false,
            }),
        ],
    },
};
