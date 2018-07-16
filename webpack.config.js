const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");

const entry = process.env.NODE_ENV === 'production' ? {
    touchScroll: './src/index.js'
  } : {
    vendor: [
      'react',
      'react-dom'
    ],
    index: './src/index.js',
    demo: './demo/index.js'
  };

const plugins = (function () {
  return ['demo'].map(item => {
    return new HtmlWebPackPlugin({
      filename: item,
      template: './template/index.hbs',
      chunks: ['vendor', item],
      inject: true
    });
  })
})();

module.exports = {
  entry,
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "js/[name].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test:  /\.less$/,
        use: [{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader",
          options: {
            sourceMap: true,
            modules: false,
            localIdentName: '[name]__[local]__[hash:base64:5]'
          }
        }, {
          loader: "less-loader",
          options: {
            outputStyle: 'expanded',
          }
        }]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[hash].[ext]',
            limit: 10000, // 10kb
          }
        }
      },
    ]
  },
  plugins
};