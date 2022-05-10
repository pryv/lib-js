/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { webpackBabelConfig } = require('@pryv/lib-js-common');

module.exports = [
  { // ES6
    mode: 'production',
    entry: {
      pryv: {
        import: componentPath('pryv', 'src/index.js'),
        library: {
          name: 'Pryv',
          type: 'var'
        }
      },
      'pryv-monitor': componentPath('pryv-monitor', 'src/browser-index.js'),
      'pryv-socket.io': componentPath('pryv-socket.io', 'src/browser-index.js')
    },
    output: {
      filename: '[name]-es6.js',
      path: distPath()
    },
    devtool: 'source-map'
  },
  { // ES5
    mode: 'production',
    entry: {
      pryv: {
        import: componentPath('pryv', 'src/index.js'),
        library: {
          name: 'Pryv',
          type: 'var'
        }
      },
      'pryv-monitor': ['core-js/stable', componentPath('pryv-monitor', 'src/browser-index.js')],
      'pryv-socket.io': componentPath('pryv-socket.io', 'src/browser-index.js')
    },
    output: {
      filename: '[name].js',
      path: distPath()
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'examples', to: 'examples' }
        ]
      })
    ],
    devtool: 'source-map',
    module: webpackBabelConfig
  },
  { // ES5 all-in-one bundle (with socket.io and monitor)
    mode: 'production',
    entry: {
      'pryv-socket.io-monitor': {
        import: componentPath('pryv', 'src/index-socket.io-monitor.js'),
        library: {
          name: 'Pryv',
          type: 'var'
        }
      }
    },
    output: {
      filename: '[name].js',
      path: distPath()
    },
    devtool: 'source-map',
    module: webpackBabelConfig,
    resolve: {
      fallback: {
        fs: false,
        path: false
      }
    }
  },
  { // browser test suite (ES6) TODO consider moving out of dist/
    mode: 'development',
    entry: {
      'browser-tests': componentPath('pryv', 'test/browser-index.js')
    },
    output: {
      filename: '[name].js',
      path: distPath('tests/'),
      libraryTarget: 'var',
      library: 'browserTest'
    },
    plugins: [
      new webpack.IgnorePlugin({ resourceRegExp: /zombie/ }),
      new CopyPlugin({
        patterns: [
          { from: componentPath('pryv', 'test/browser-tests.html') }
        ]
      })
    ],
    devtool: 'source-map',
    resolve: {
      fallback: {
        fs: false,
        path: false
      }
    }
  }
];

function componentPath (component, ...subPath) {
  return './' + path.join('./components', component, ...subPath);
}

function distPath (...subPath) {
  return path.join(__dirname, 'dist', ...subPath);
}
