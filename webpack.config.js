const webpack = require('webpack');
const path = require('path');
const buildPath = path.resolve(__dirname, 'dist')

module.exports = {
    entry: './src/index.js',
    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules'
        ]
    },
    output: {
        filename: 'index.js',
        path: buildPath,
        publicPath: '/'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        [
                            'es2015', {
                                modules: false
                            }
                        ],
                        'react',
                        'stage-0'
                    ]
                }
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.(md|txt|pdf)$/,
                loader: 'raw-loader'
            },
        ]
    }
}
