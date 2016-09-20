var distFolderPath = "dist",
    demoFolderPath = "demo",
    devFolderPath = "dev",
    webpack = require('webpack'),
    packageJson = require("./package.json"),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    Path = require('path'),
    dependencies = Object.keys(packageJson.dependencies);

module.exports = {

    debug: isProduction(false, true),

    devtool: isProduction('source-map', 'eval'),

    entry: getEntry(),

    output: getOutput(),

    resolve: {
        root: Path.resolve(__dirname),
        alias: {
            handlebars: Path.join(__dirname, 'node_modules/handlebars/dist/handlebars.js'),
            jquery: Path.join(__dirname, 'node_modules/jquery/dist/jquery') //needed by eonasdan-bootstrap-datetimepicker
        }
    },

    externals: isProduction(dependencies, undefined),

    module: {
        loaders: [
            isProduction(
                {test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")},
                {test: /\.css$/, loader: "style-loader!css-loader"}
            ),
            {test: /\.hbs$/, loader: "handlebars-loader"},
            {test: /\.json/, loader: "json-loader"},
            {test: /\.png$/, loader: "url-loader?limit=100000"},
            {test: /\.jpg$/, loader: "file-loader?name=[name].[ext]&limit=100000"},
            {test: /\.svg/, loader: "file-loader?name=[name].[ext]&limit=100000"},
            {test: /\.gif/, loader: "file-loader?name=[name].[ext]&limit=100000"},

            //Bootstrap loader
            {test: /bootstrap\/js\//, loader: 'imports?jQuery=jquery'},
            {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/font-woff"},
            {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/font-woff"},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/octet-stream"},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file"}
        ]
    },

    plugins: clearArray([
        new webpack.ProvidePlugin({$: "jquery", jQuery: "jquery"}),
        isProduction(new CleanWebpackPlugin([distFolderPath]), undefined),
        isProduction(new webpack.optimize.UglifyJsPlugin({
            compress: {warnings: false},
            output: {comments: false}
        })),
        isProduction(new ExtractTextPlugin(packageJson.name + '.min.css')),
        isDevelop(new HtmlWebpackPlugin({
            inject: "body",
            template: devFolderPath + "/index.template.html"
        }))
    ])
};

function getEntry() {

    var entry = {};

    switch (getEnvironment()) {

        case "demo" :
            entry["app"] = ["demo/src/js/demo.js"];
            break;
        case "develop" :
            entry["app"] = ["dev/src/js/dev.js"];
            break;
        default :
            entry["app"] = ["./src/js/index.js"];
    }

    return entry;
}

function getOutput() {

    var output;

    switch (getEnvironment()) {

        case "demo" :
            output = {
                path: Path.join(__dirname, demoFolderPath),
                filename: "index.js"
            };
            break;
        case "production" :
            output = {
                path: Path.join(__dirname, distFolderPath),
                filename: packageJson.name + '.min.js',
                chunkFilename: 'chunk-[id].' + packageJson.name + '.min.js',
                libraryTarget: 'amd'
            };
            break;
        case "develop" :
            output = {
                path: Path.join(__dirname, devFolderPath),
                //publicPath: "/dev/",
                filename: "index.js"
            };
            break;
        default :
            output = {
                path: Path.join(__dirname, distFolderPath),
                filename: "index.js"
            };
            break;
    }

    return output;
}

// utils

function clearArray(array) {

    var result = [];

    array.forEach(function (s) {
        s ? result.push(s) : null;
    });

    return result;

}

function isProduction(valid, invalid) {

    return isEnvironment('production') ? valid : invalid;
}

function isDevelop(valid, invalid) {

    return isEnvironment('develop') ? valid : invalid;
}

function isTest(valid, invalid) {

    return isEnvironment('develop') ? valid : invalid;
}

function isDemo(valid, invalid) {

    return isEnvironment('demo') ? valid : invalid;
}

function isEnvironment(env) {
    return getEnvironment() === env;
}

function getEnvironment() {
    return process.env.NODE_ENV;
}