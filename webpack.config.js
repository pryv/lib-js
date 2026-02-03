/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const webpackBabelConfig = {
  rules: [
    {
      test: /\.m?js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          sourceType: 'unambiguous',
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'entry',
                corejs: '3.40',
                targets: {
                  browsers: '> 0.25%, not dead'
                }
              }
            ]
          ],
          plugins: ['@babel/plugin-transform-runtime']
        }
      }
    }
  ]
};

module.exports = [
  { // ES6
    mode: 'production',
    entry: {
      pryv: {
        import: componentPath('pryv', 'src/browser-index.js'),
        library: {
          name: 'pryv',
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
    devtool: 'source-map',
    resolve: {
      fallback: {
        fs: false,
        path: false
      }
    }
  },
  { // ES5
    mode: 'production',
    entry: {
      pryv: {
        import: componentPath('pryv', 'src/browser-index.js'),
        library: {
          name: 'pryv',
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
    module: webpackBabelConfig,
    resolve: {
      fallback: {
        fs: false,
        path: false
      }
    }
  },
  { // ES5 all-in-one bundle (with socket.io and monitor)
    mode: 'production',
    entry: {
      'pryv-socket.io-monitor': {
        import: componentPath('pryv', 'src/browser-index-bundle.js'),
        library: {
          name: 'pryv',
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
  { // browser test suite (ES6)
    mode: 'development',
    entry: {
      'browser-tests': './test/browser-tests.js'
    },
    output: {
      filename: 'tests.js',
      path: path.join(__dirname, 'test-browser/')
    },
    plugins: [
      new webpack.IgnorePlugin({ resourceRegExp: /jsdom/ }),
      new CopyPlugin({
        patterns: [
          { from: componentPath('pryv', 'test/browser-index.html'), to: 'index.html' },
          { from: distPath('pryv.js') },
          { from: distPath('pryv.js.map') }
        ]
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser'
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
