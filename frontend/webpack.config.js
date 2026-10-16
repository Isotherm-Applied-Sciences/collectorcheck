import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const directory = path.dirname(filename);

export default {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(directory, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(directory, 'public')
    },
    historyApiFallback: true,
    port: 3001
  }
};
