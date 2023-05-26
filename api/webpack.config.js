const path = require('path');

module.exports = {
  entry: './server.ts',
  mode: 'production',
  target: 'node',
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'server.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // TypeScript loading for .ts and .tsx files
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // Added resolve for .ts and .tsx files
  },
};
