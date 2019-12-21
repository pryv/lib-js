const path = require('path');

module.exports = {
	entry: {
		'pryv-light': './src/index.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'var',
		library: 'pryvLight'
	}
}