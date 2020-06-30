const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { webpackBabelConfig } = require('@pryv/lib-js-common');

module.exports = [
	{ // es6 version
		mode: 'production',
		entry: {
			'pryv': ['./src/index.js'],
		},
		output: { 
			filename: '[name]-es6.js',
			path: path.resolve(__dirname, 'dist'),
			libraryTarget: 'var',
			library: 'Pryv'
		},
		plugins: [
			new CopyPlugin({ patterns: [
				{ from: 'web-demos', to: 'demos' },
			]})],
		devtool: 'source-map',
	},
	{ // es5 version
		mode: 'production',
		entry: {
			'pryv': ['./src/index.js'],
		},
		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, 'dist'),
			libraryTarget: 'var',
			library: 'Pryv'
		},
		devtool: 'source-map',
		module: webpackBabelConfig
	},
	{ // es5 version including socket.io and monitors
		mode: 'production',
		entry: {
			'pryv-socket.io-monitor': ['./src/index-socket.io-monitor.js'],
		},
		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, 'dist'),
			libraryTarget: 'var',
			library: 'Pryv'
		},
		devtool: 'source-map',
		module: webpackBabelConfig
	},
	{ // development and test versions (es6)
		mode: 'development',
		entry: {
			'pryv': ['./src/index.js'],
		},
		output: {
			filename: '[name]-dev.js',
			path: path.resolve(__dirname, 'dist/tests/'),
			libraryTarget: 'var',
			library: 'Pryv'
		},
		devtool: 'source-map',
	},
	{ // browser test suite (es6)
		mode: 'development',
		entry: {
			'browser-tests': './test/browser-index.js',
		},
		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, 'dist/tests/'),
			libraryTarget: 'var',
			library: 'browserTest'
		},
		plugins: [
			new webpack.IgnorePlugin(/zombie/),
			new CopyPlugin({ patterns: [
				{ from: 'test/browser-tests.html' },
			]})
		],
		devtool: 'source-map',
	}
];
