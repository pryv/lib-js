const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = [
	{
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
		plugins: [
			new CopyPlugin([
				{ from: 'web-demos', to: 'demos' },
			])],
		devtool: 'source-map',
	},
	{
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
	{
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
			new CopyPlugin([
				{ from: 'test/browser-tests.html' },
			])
		],
		devtool: 'source-map',
	}
];
