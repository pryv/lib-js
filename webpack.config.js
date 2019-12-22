const path = require('path');

module.exports = [
	{
		mode: 'production',
		entry: {
			'pryv': './src/index.js',
		},
		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, 'dist'),
			libraryTarget: 'var',
			library: 'Pryv'
		}
	},
	{
		mode: 'development',
		entry: {
			'pryv': './src/index.js',
		},
		output: {
			filename: '[name]-dev.js',
			path: path.resolve(__dirname, 'dist/tests/'),
			libraryTarget: 'var',
			library: 'Pryv'
		}
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
		}
	}
];
