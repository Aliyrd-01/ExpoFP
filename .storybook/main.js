const path = require("path");

module.exports = {
    stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
    addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
    webpackFinal: async (config, { configType }) => {
        config.module.rules.push({
            test: /\.scss$/,
            use: [
                "style-loader",
                "css-loader",
                {
                    loader: "sass-loader",
                    options: {
                        prependData: `@import "@/styles/helpers.scss";`,
                    },
                },
            ],
            include: path.resolve(__dirname, "../src/"),
            resolve: {
                alias: {
                    "@": path.resolve(__dirname, "../src/"),
                },
            },
        });
        config.resolve.extensions.push(".ts", ".tsx");
        return config;
    },
};
