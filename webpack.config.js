const path = require('path');

module.exports = {
  entry: path.join(__dirname, '/src/index.ts'),
  output: {
    filename: 'index.js',
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
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
};