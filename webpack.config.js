const path = require('path');

module.exports = {
  entry: path.join(__dirname, '/src/index.ts'),
  output: {
    filename: 'index.js',
    publicPath: "lib/",
    path: path.join(__dirname, "/lib")
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.obj$/i,
        loader: 'file-loader',
      },
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
};