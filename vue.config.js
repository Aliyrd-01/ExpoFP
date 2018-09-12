const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { expo } = require('./scripts/expo')
const expoDefine = require(`./expos/${expo}/define`)

// TODO: complete

const EFP_DATA_URL = `https://${expo}.expofp.com/data/data.js`

module.exports = {
    devServer: {
        contentBase: [path.join(__dirname, 'public'), path.join(__dirname, `expos/${expo}`)]
    },
    configureWebpack: {
        plugins: [
            new CopyWebpackPlugin(
                [
                    {
                        from: path.join(__dirname, `expos/${expo}/{settings.js,fp.js,*.png}`),
                        to: path.join(__dirname, 'dist'),
                        context: path.join(__dirname, `expos/${expo}`)
                    }
                ]
            ),
            new webpack.DefinePlugin(expoDefine)
        ]
    }
}
