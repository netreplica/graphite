const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Set deployment mode for template processing
process.env.DEPLOYMENT_MODE = 'docker';

module.exports = merge(common, {
  mode: 'production',
  
  output: {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, '../dist/docker'),
    clean: true,
  },
  
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, '../dist/docker/**/*')]
    }),
    
    // Copy feature modules - all features enabled for Docker
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../src/js/features'),
          to: 'js/features'
        },
        {
          from: path.resolve(__dirname, '../src/js/config'),
          to: 'js/config'
        }
      ]
    })
  ]
});