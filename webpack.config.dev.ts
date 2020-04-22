import * as path from 'path';
import * as webpack from 'webpack';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import Dotenv from 'dotenv-webpack';

const htmlPlugin = new HtmlWebPackPlugin({
  template: './src/index.html',
  filename: './index.html',
  favicon: 'public/favicon.ico'
});

const dotEnvPlugin = new Dotenv({
  path: './.env'
});

const config: webpack.Configuration = {
  mode: 'development',
  entry: './src/index.tsx',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  devServer: {
    port: 3001,
    // to get private IP addresses to work to test on emulators
    host: '0.0.0.0',
    disableHostCheck: true,
    historyApiFallback: {
      rewrites: [
        {from: /^\/$/, to: '/index.html'},
        {from: /^\/subpage/, to: '/index.html'},
        {from: /./, to: '/index.html'}
      ]
    },
    contentBase: path.resolve(__dirname, 'src'),
    inline: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  plugins: [htmlPlugin, dotEnvPlugin],
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [
          (path.resolve(__dirname, 'node_modules') + '/ethereumjs-common'),
          (path.resolve(__dirname, 'node_modules') + '/ethereumjs-util'),
          (path.resolve(__dirname, 'node_modules') + '/ethereumjs-tx'),
          (path.resolve(__dirname, 'node_modules') + '/rlp')
        ]
      },
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
          test: /\.(png|jpg|gif)$/,
          loader: 'file-loader',
          options: {
            name: 'static/[name].[ext]'
          }
      },
      {
        test: /\.svg$/,
        use: [
          '@svgr/webpack', {
            loader: 'file-loader',
            options: {
              name: 'static/[name].[ext]'
            }
          }]
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }
    ]
  }
  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  // externals: {
  //     "react": "React",
  //     "react-dom": "ReactDOM"
  // }
};

export default config;
