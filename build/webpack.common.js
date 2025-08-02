const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    graphite: path.resolve(__dirname, '../src/js/core/topology.js')
  },
  
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/templates/index.html'),
      filename: 'index.html',
      minify: false,
      templateParameters: (compilation, assets, assetTags, options) => {
        return {
          deploymentMode: process.env.DEPLOYMENT_MODE || 'static',
          bootstrapPath: process.env.DEPLOYMENT_MODE === 'docker' ? '/bootstrap-3.4.1-dist/' : './vendor/bootstrap-3.4.1-dist/',
          nextuiPath: process.env.DEPLOYMENT_MODE === 'docker' ? '/next-bower/' : './vendor/next-bower/'
        };
      }
    }),
    
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../src/assets'),
          to: 'assets'
        },
        {
          from: path.resolve(__dirname, '../src/css'),
          to: 'css'
        },
        {
          from: path.resolve(__dirname, '../src/js/core'),
          to: 'js',
          globOptions: {
            ignore: ['**/topology.js'] // Exclude main entry file
          }
        }
      ]
    })
  ],
  
  resolve: {
    extensions: ['.js', '.json'],
  },
};