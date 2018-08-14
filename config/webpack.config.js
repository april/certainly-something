const CopyWebpackPlugin = require('copy-webpack-plugin');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
const path = require('path');
const webpack = require('webpack');
const production = process.env.NODE_ENV === 'production';

module.exports = {
  output: {
    path: path.resolve(__dirname, '..', 'build'),
    filename: '[name].js'
  },
  entry: {
    'background': path.resolve(__dirname, '..', 'src', 'background', 'entry.js'),
    'content_script/index': path.resolve(__dirname, '..', 'src', 'content_script', 'entry.js'),
    'viewer/index': path.resolve(__dirname, '..', 'src', 'viewer', 'js', 'index.js'),
  },
  mode: production ? 'production' : 'development',
  devtool: production ? undefined : 'source-map',
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
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'src/manifest.json'
      },
      {
        from: 'LICENSE.md'
      },
      {
        from: 'src/icons/*.svg',
        to: 'icons/',
        flatten: true
      },
      {
        from: 'src/viewer/*.html',
        to: 'viewer/',
        flatten: true
      },
      {
        // todo: eventually switch to sass + loaders, but this is easier for now
        from: 'src/content_script/*.css',
        to: 'content_script/index.css',
        flatten: true
      },
      {
        from: 'src/viewer/css/*.css',
        to: 'viewer/css/',
        flatten: true
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
