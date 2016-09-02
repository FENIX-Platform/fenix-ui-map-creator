var webpackConfig = require('./webpack.config');

var preprocessors = {};
preprocessors["src/**/*.js"] = ['webpack', 'coverage'];
preprocessors["test/**/*.js"] = ['webpack'];

module.exports = function (config) {

    config.set({

        basePath: __dirname,

        frameworks: ['chai', 'mocha'],

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatchBatchDelay: 300,

        files: [
            "./test/**/*.js"
         //   "./src/js/index.js"
        ],

        exclude: [],

        preprocessors: preprocessors,

        webpack: webpackConfig,
        webpackMiddleware: {noInfo: true},

        //autoWatch: !ci,

        browsers: ['Chrome'], //['Firefox'],

        singleRun: true,

        browserNoActivityTimeout: 180000,

        reporters : ['progress', 'coverage'],

        coverageReporter: {
            reporters: [
                {type: 'lcov', dir: 'coverage/', subdir: '.'},
                {type: 'json', dir: 'coverage/', subdir: '.'},
                {type: 'text-summary'}
            ]
        },

        plugins: [
            'karma-webpack',
            'karma-mocha',
            'karma-chai',
            'karma-coverage',
            'karma-chrome-launcher',
            'karma-firefox-launcher'
        ]
    });
};