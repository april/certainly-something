const CopyWebpackPlugin = require('copy-webpack-plugin');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
const path = require('path');
const webpack = require('webpack');

module.exports = {
  output: {
    path: path.resolve(__dirname, '..', 'build'),
    filename: '[name].js'
  },
  entry: {
    'background': path.resolve(__dirname, '..', 'src', 'background', 'entry.js'),
    'viewer/index': path.resolve(__dirname, '..', 'src', 'viewer', 'js', 'index.js'),
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, '..', 'src'),
        use: [{
          loader: 'babel-loader',
          options: {
            'presets': [
              ['env', {
                'targets': {
                  'firefox': 62
                }
              }]
            ]
          }
        }]
      },
      {
        test: /\.handlebars$/,
        include: [
          path.resolve(__dirname, '..', 'src', 'viewer'),
        ],
        use: [{
          loader: 'handlebars-loader',
          options: {
            'helperDirs': [
              path.resolve(__dirname, '..', 'src', 'viewer', 'helpers')
            ]
          }
        }]
      },
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, '..', 'src', 'viewer', 'css'),
        ],
        loaders: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'src/manifest.json'
      },
      {
        from: 'src/icons/*.svg',
        to: 'icons/',
        flatten: true
      },
      {
        from: 'src/viewer/index.html',
        to: 'viewer/index.html'
      },
      {
        from: 'src/viewer/css',
        to: 'viewer/index.css'
      }
    ]),
    new LicenseWebpackPlugin(
      {
        pattern: /.*/,
        outputFilename: '[name].license.txt'
      }
    )
  ]
};
