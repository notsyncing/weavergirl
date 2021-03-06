const webpack = require("webpack");

module.exports = {
    // entry: ["./main.js"],
    // output: {
    //     filename: "weavergirl-core.js"
    // }
    entry: ["babel-polyfill", "./main.js"],
    output: {
        filename: "weavergirl-core.js"
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     sourceMap: true
        // })
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                query: {
                    presets: ["es2015"]
                }
            }
        ]
    }
};