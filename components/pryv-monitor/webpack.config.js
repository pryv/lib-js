const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { webpackBabelConfig } = require('@pryv/lib-js-common');

module.exports = [
	{ // es6 not transpiled version
		mode: 'production',
		entry: {
			'pryv-monitor': './src/browser-index.js'
		},
		output: {
			filename: '[name]-es6.js',
			path: path.resolve(__dirname, 'dist')
		},
		devtool: 'source-map'
	},
	{ // es5  version
		mode: 'production',
		entry: {
			'pryv-monitor': ['core-js/stable','./src/browser-index.js']
		},
		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, 'dist')
		},
		plugins: [
			new CopyPlugin({
				patterns: [
					{ from: 'examples/index.html', to: 'index.html' },
				],
			}),
		],
		module: webpackBabelConfig,
		devtool: 'source-map'
	}

];