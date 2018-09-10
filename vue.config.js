const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const expo = require('./scripts/expo')

module.exports = {
    devServer: {
        contentBase: [path.join(__dirname, 'public'), path.join(__dirname, `expos/${expo}`)]
    },
    configureWebpack: {
        plugins: [
            new CopyWebpackPlugin(
                [
                    {
                        from: path.join(__dirname, `expos/${expo}/fp.js`),
                        to: path.join(__dirname, 'dist'),
                        ignore: ['.DS_Store']
                    }
                ]
            ),
        ]
    }
}
