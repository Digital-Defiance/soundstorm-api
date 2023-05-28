const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './dist/server.js',
  mode: 'production',
  optimization: {
    minimize: true,
  },
  target: 'node',
  externals: {
    'realm': 'commonjs realm'
  },
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'server.bundle.js'
  }
};
