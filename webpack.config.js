const path = require('path');

module.exports = {
  entry: {
    index: path.join(__dirname, 'examples', 'index.js')
  },
  output: {
    path: './js',
    publicPath: '/js',
    filename: 'bundle.js'
  },
  devServer: {
    inline: true,
    port: 3333
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'     
      }      
    ]
  }
};
