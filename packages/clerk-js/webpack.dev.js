/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const packageJSON = require('./package.json');
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const crypto = require('crypto');
const hash = crypto.createHash('sha1').update(packageJSON.version).digest('hex');

module.exports = env => {
  const mode = env.production ? 'production' : 'development';
  const isProduction = mode === 'production';
  console.log(`--- Building for ${mode} ---`);

  return {
    mode,
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    ...(isProduction ? getProductionConfig(mode, env) : getDevelopmentConfig(mode, env)),
  };
};

const cacheGroups = {
  reactDomVendor: {
    test: /[\\/]node_modules[\\/](react-dom)[\\/]/,
    name: 'vendor-react-dom',
    chunks: 'all',
  },
  floatUiVendor: {
    test: /[\\/]node_modules[\\/](@floating-ui)[\\/]/,
    name: 'vendor-floating-ui',
    chunks: 'all',
  },
};

const getProductionConfig = (mode = 'production', env) => {
  return {
    plugins: [...defineConstants({ mode, packageJSON }), ...(env.serveAnalyzer ? [new BundleAnalyzerPlugin()] : [])],
    devtool: undefined,
    entry: {
      clerk: './src/index.ts',
      'clerk.browser': './src/index.browser.ts',
      'clerk.headless': './src/index.headless.ts',
      'clerk.headless.browser': './src/index.headless.browser.ts',
    },
    module: {
      rules: [loadSvgs, tsLoaderProd],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      chunkFilename: `[id].${hash}.js`,
      filename: '[name].js',
      libraryTarget: 'umd',
      globalObject: 'globalThis',
    },
    optimization: {
      splitChunks: {
        cacheGroups,
      },
    },
  };
};

const getDevelopmentConfig = (mode = 'development', env) => {
  return {
    plugins: [
      new ReactRefreshWebpackPlugin({ overlay: { sockHost: 'js.lclclerk.com' } }),
      ...defineConstants({ mode, packageJSON }),
      ...(env.serveAnalyzer ? [new BundleAnalyzerPlugin()] : []),
    ],
    devtool: 'eval-cheap-source-map',
    entry: './src/index.browser.ts',
    module: {
      rules: [loadSvgs, tsLoaderDev],
    },
    ...devServerOutput,
    optimization: {
      splitChunks: {
        name: (module, chunks) => chunks.map(chunk => chunk.name).join('-'),
        cacheGroups,
      },
    },
  };
};

const tsLoaderProd = {
  test: /\.(ts|js)x?$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'ts-loader',
      options: { transpileOnly: true },
    },
  ],
};

const tsLoaderDev = {
  test: /\.(ts|js)x?$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'ts-loader',
      options: {
        configFile: 'tsconfig.dev.json',
        transpileOnly: true,
        getCustomTransformers: () => ({
          before: [ReactRefreshTypeScript()],
        }),
      },
    },
  ],
};

const loadSvgs = {
  test: /\.svg$/,
  use: ['@svgr/webpack'],
};

const defineConstants = ({ mode, packageJSON }) => [
  new webpack.DefinePlugin({
    __DEV__: mode !== 'production',
    __PKG_VERSION__: JSON.stringify(packageJSON.version),
    __PKG_NAME__: JSON.stringify(packageJSON.name),
  }),
  new webpack.EnvironmentPlugin({
    CLERK_ENV: mode,
    NODE_ENV: mode,
  }),
];

const devServerOutput = {
  output: {
    publicPath: 'https://js.lclclerk.com/npm/',
    // publicPath: 'https://192.168.1.102/',
    crossOriginLoading: 'anonymous',
    filename: 'clerk.browser.js',
    libraryTarget: 'umd',
    chunkFilename: '[name].chunk.js',
  },
  devServer: {
    // https: true,
    allowedHosts: ['all'],
    headers: { 'Access-Control-Allow-Origin': '*' },
    host: '0.0.0.0',
    port: 4000,
    hot: true,
    liveReload: false,
    client: {
      webSocketURL: 'auto://js.lclclerk.com/ws',
      // webSocketURL: 'auto://192.168.1.102/ws',
    },
  },
};
