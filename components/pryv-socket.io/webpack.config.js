const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { webpackBabelConfig } = require('@pryv/lib-js-common');

module.exports = [
	{ // es6 
	mode: 'production',
	entry: {
		'pryv-socket.io': './src/browser-index.js'
	},
	output: {
		filename: '[name]-es6.js',
		path: path.resolve(__dirname, 'dist')
	},
	devtool: 'source-map'
},
	{ // es5 
		mode: 'production',
		entry: {
			'pryv-socket.io': ['./src/browser-index.js']
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