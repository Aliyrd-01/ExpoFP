const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    devServer: {
        contentBase: [path.join(__dirname, 'public'), path.join(__dirname, 'expos/in-cosmetics-2018')]
    },
    configureWebpack: {
        plugins: [
            new CopyWebpackPlugin(
                [
                    {
                        from: path.join(__dirname, 'expos/in-cosmetics-2018/fp.js'),
                        to: path.join(__dirname, 'dist'),
                        ignore: ['.DS_Store']
                    }
                ]
            ),
        ]
    }

}
