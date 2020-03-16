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
        loader: 'source-map-loader'
      },
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
      // {
      //     test: /\.(png|svg|jpg|gif)$/,
      //     loader: "file-loader",
      //     options: { name: '/static/[name].[ext]' }
      // }
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
