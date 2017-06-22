const path = require('path')

const buildPath = path.resolve(__dirname, 'dist')

module.exports = {
    target: 'node',
    entry: './src/main.js',
    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules'
        ]
    },
    output: {
        filename: 'main.js',
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
                test: /\.(md|txt|pdf|html)$/,
                loader: 'raw-loader'
            }
        ]
    }
}
