const path = require("path");

module.exports = {
    stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
    addons: ["@storybook/addon-links", "@storybook/addon-essentials", "storybook-dark-mode"],
    staticDirs: ["../public"],

    framework: {
        name: "@storybook/react-webpack5",
        options: {},
    },

    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.scss$/,
            use: [
                "style-loader",
                "css-loader",
                {
                    loader: "sass-loader",
                    options: {
                        additionalData: `@import "@/styles/helpers.scss";`,
                    },
                },
            ],
            include: path.resolve(__dirname, "../src/"),
        });

        config.module.rules.push({
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: require.resolve("babel-loader"),
                    options: {
                        presets: [require.resolve("@babel/preset-react"), require.resolve("@babel/preset-env")],
                        plugins: [require.resolve("@babel/plugin-transform-runtime")],
                    },
                },
            ],
        });

        config.resolve.extensions.push(".js", ".jsx", ".ts", ".tsx");
        config.resolve.alias = {
            ...config.resolve.alias,
            "@": path.resolve(__dirname, "../src/"),
        };

        return config;
    },
};
