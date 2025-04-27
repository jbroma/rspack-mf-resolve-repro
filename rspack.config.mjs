import path from 'path';
import { fileURLToPath } from 'url';
import { ModuleFederationPlugin as RspackMFPlugin } from '@module-federation/enhanced/rspack';
import { ModuleFederationPlugin as WebpackMFPlugin } from '@module-federation/enhanced/webpack';
import {
  getAssetTransformRules,
  getJsTransformRules,
  getResolveOptions,
} from '@callstack/repack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isRunningWebpack = !!process.env.WEBPACK;
const isRunningRspack = !!process.env.RSPACK;
if (!isRunningRspack && !isRunningWebpack) {
  throw new Error('Unknown bundler');
}

const MFPlugin = isRunningRspack ? RspackMFPlugin : WebpackMFPlugin;

const moduleRules = isRunningRspack
  ? [...getJsTransformRules(), ...getAssetTransformRules()]
  : [
      {
        test: /\.[cm]?[jt]sx?$/,
        type: 'javascript/auto',
        use: {
          loader: 'babel-loader',
          options: { presets: ['@react-native/babel-preset'] },
        },
      },
      ...getAssetTransformRules(),
    ];

/**
 * @type {import('webpack').Configuration | import('@rspack/cli').Configuration}
 */
const config = {
  mode: 'development',
  context: __dirname,
  devtool: false,
  entry: './src/index',
  resolve: getResolveOptions('ios'),
  module: {
    rules: moduleRules,
  },
  output: {
    clean: true,
    path: isRunningWebpack
      ? path.resolve(__dirname, 'webpack-dist')
      : path.resolve(__dirname, 'rspack-dist'),
    filename: '[name].js',
  },
  plugins: [
    new MFPlugin({
      name: 'test',
      shared: {
        '@react-navigation/native-stack': {
          singleton: true,
          eager: true,
        },
      },
    }),
  ],
  ignoreWarnings: [/@react-native-masked-view/],
};

export default config;
