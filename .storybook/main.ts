import type { StorybookConfig } from "@storybook/react-webpack5";
import path from "path";

const config: StorybookConfig = {
    stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        "@storybook/addon-webpack5-compiler-swc",
        "@storybook/addon-essentials",
        "@chromatic-com/storybook",
        "@storybook/addon-interactions",
        "@storybook/addon-links",
        "storybook-dark-mode",
    ],
    staticDirs: ["../public"],
    framework: {
        name: "@storybook/react-webpack5",
        options: {},
    },
    webpackFinal: async (config) => {
        config.module?.rules?.push({
            test: /\.scss$/,
            use: [
                "style-loader",
                "css-loader",
                {
                    loader: "sass-loader",
                },
            ],
            include: path.resolve(__dirname, "../src/"),
        });

        config.module?.rules?.push({
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

        config.resolve = {
            ...config.resolve,
            extensions: [...(config.resolve?.extensions || []), ".js", ".jsx", ".ts", ".tsx"],
            alias: {
                ...(config.resolve?.alias || {}),
                "@": path.resolve(__dirname, "../src/"),
                "@styles": path.resolve(__dirname, "../src/styles/"),
            },
        };

        return config;
    },
};

export default config;
