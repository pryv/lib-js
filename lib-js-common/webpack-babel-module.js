/**
 * Babel configuration for webpack
 */

module.exports = {
  rules: [
    {
      test: /\.m?js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'entry',
                corejs: '3.0.0',
                targets: {
                  browsers: '> 0.25%, not dead'
                }
              }
            ]
          ]
        }
      }
    }
  ]
};