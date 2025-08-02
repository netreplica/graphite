const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

// Set deployment mode for template processing
process.env.DEPLOYMENT_MODE = 'static';

module.exports = merge(common, {
  mode: 'production',
  
  output: {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, '../dist/static'),
    clean: true,
  },
  
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, '../dist/static/**/*')]
    }),
    
    // Set deployment mode to static
    new webpack.DefinePlugin({
      'window.GRAPHITE_MODE': JSON.stringify('static')
    }),
    
    // Copy only static-compatible configuration
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../src/js/config'),
          to: 'js/config'
        },
        // Copy Bootstrap for local serving
        {
          from: path.resolve(__dirname, '../docker/bootstrap-3.4.1-dist/**'),
          to: 'vendor/[path][name][ext]',
          context: path.resolve(__dirname, '../docker')
        }
      ]
    }),
    
    // Download NextUI dependency if not available
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../docker/next-bower'),
          to: 'vendor/next-bower',
          noErrorOnMissing: true // Will be downloaded in pre-build step
        }
      ]
    })
  ]
});