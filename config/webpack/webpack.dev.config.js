const ENVLL = require("../env/ENVLL")
const ENVMODE = require("../env/ENVMODE")
const ENVAPPSRVPORT = require("../env/ENVAPPSRVPORT")

const helpers = require("../helpers")
const prettyFormat = require("pretty-format")
const webpack = require("webpack")

const DiskPlugin = require("webpack-disk-plugin")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const StatsPlugin = require("stats-webpack-plugin")

/**
 * set MODE first!!
 */
const ENV_MODE = ENVMODE.setToDevelopment()

const publicPath = "/"

const stats = ENVLL.isTraceEnabled()
  ? "verbose"
  : ENVLL.isDebugEnabled()
  ? "normal"
  : "errors-only"

/**
 * @type {import("webpack-dev-server").Configuration}
 */
const devServer = {
  port: parseInt(ENVAPPSRVPORT.getVDev()),
  watchContentBase: false,
  hot: true,
  stats: stats,
  host: "localhost",
}

const webpack_aliase = {
  "@components": helpers.rootAbs("src/js/components/"),
  "@css": helpers.rootAbs("src/assets/css/"),
  "@font": helpers.rootAbs("src/assets/fonts/"),
  "@home": helpers.rootAbs(),
  "@html": helpers.rootAbs("src/html/"),
  "@icon": helpers.rootAbs("src/assets/icons/"),
  "@img": helpers.rootAbs("src/assets/img/"),
  "@js": helpers.rootAbs("src/js/"),
  "@svg": helpers.rootAbs("src/assets/svg/"),
}

/**
 * @type {import("webpack").Rule[]}
 */
const otherLoaders = [
  {
    test: /\.html$/,
    exclude: [/src\/template.html/],
    use: {
      loader: "vue-template-loader",
      options: {
        hmr: true,
        transformAssetUrls: {
          video: ["src", "poster"],
          source: "src",
          img: "src",
          image: "xlink:href",
          object: "data",
          use: ["href", "xlink:href"],
        },
      },
    },
  },
  {
    test: /\.(png|jpe?g|gif)(#.*)?(\?.*)?$/,
    use: [
      {
        loader: "file-loader",
        options: {
          emitFile: true,
          name: ENVMODE.hasVDevelopment()
            ? "assets/img/[name].[ext]"
            : "assets/img/[name].[hash:6].[ext]",
          publicPath,
        },
      },
    ],
  },
  {
    test: /\.(svg)(#.*)?(\?.*)?$/,
    use: [
      {
        loader: "file-loader",
        options: {
          emitFile: true,
          name: ENVMODE.hasVDevelopment()
            ? "assets/svg/[name].[ext]"
            : "assets/svg/[name].[hash:6].[ext]",
          publicPath,
        },
      },
    ],
  },
  {
    test: /\.(mov|mp4|webm)(#.*)?(\?.*)?$/,
    use: [
      {
        loader: "file-loader",
        options: {
          emitFile: true,
          name: ENVMODE.hasVDevelopment()
            ? "assets/vid/[name].[ext]"
            : "assets/vid/[name].[hash:6].[ext]",
          publicPath,
        },
      },
    ],
  },
  {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    loader: "url-loader",
    options: {
      limit: 10000,
      name: ENVMODE.hasVDevelopment()
        ? "assets/font/[name].[ext]"
        : "assets/font/[name].[hash:6].[ext]",
      publicPath,
    },
  },
]

const extractCSS = new ExtractTextPlugin({
  allChunks: true,
  filename: ENVMODE.hasVDevelopment()
    ? "assets/css/[name].css"
    : "assets/css/[name].[contenthash:6].css",
})

/**
 * @type {import("webpack").Node}
 */
const node = {
  // prevent webpack from injecting useless setImmediate polyfill because Vue
  // source contains it (although only uses it if it's native).
  setImmediate: false,
  // prevent webpack from injecting mocks to Node native modules
  // that does not make sense for the client
  dgram: "empty",
  fs: "empty",
  net: "empty",
  tls: "empty",
  child_process: "empty",
}

const webpackStatsFileName = `webpack-${
  ENVMODE.hasVDevelopment() ? "dev" : "prod"
}-stats.json`

/**
 * @type {import ("webpack").Configuration}
 */
const webpackConfig = {
  devServer,
  devtool: "eval-source-map",
  entry: {
    app: "./src/js/index",
  },
  module: {
    rules: otherLoaders.concat({
      exclude: /node_modules/,
      test: /\.css$/,
      use: [
        {
          loader: "extracted-loader",
          options: { sourceMap: true },
        },
        ...extractCSS.extract({
          fallback: { loader: "style-loader", options: { sourceMap: true } },
          use: [
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                sourceMap: true,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                ident: "postcss",
                config: {
                  path: "./config/postcss/",
                },
                sourceMap: "inline",
              },
            },
          ],
        }),
      ],
    }),
  },
  node,
  output: {
    chunkFilename: "[id].chunk.js",
    filename: "[name].js",
    path: helpers.rootAbs("dist"),
    publicPath,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(ENV_MODE),
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      minChunks: function (module) {
        if (ENVLL.isTraceEnabled()) {
          // tslint:disable-next-line:no-console
          console.debug("[vendor] " + JSON.stringify(module.resource))
        }
        const result = module.resource && /node_modules/.test(module.resource)
        if (ENVLL.isTraceEnabled()) {
          // tslint:disable-next-line:no-console
          console.debug("[vendor] Accepted ? " + result)
        }
        return result
      },
      name: "vendor",
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "wp-runtime",
    }),
    new HtmlWebpackPlugin({
      template: "src/template.html",
      title: "Natours | Exciting tours for adventurous people",
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HardSourceWebpackPlugin({
      // Clean up large, old caches automatically.
      cachePrune: {
        // Caches younger than `maxAge` are not considered for deletion. They must
        // be at least this (default: 2 days) old in milliseconds.
        maxAge: 1 * 60 * 60,
        // All caches together must be larger than `sizeThreshold` before any
        // caches will be deleted. Together they must be at least this
        // (default: 10 MB) big in bytes.
        sizeThreshold: 10 * 1024 * 1024,
      },
      configHash: function () {
        return process.env.NODE_ENV
      },
      info: {
        // 'debug', 'log', 'info', 'warn', or 'error'.
        level: "debug",
        // 'none' or 'test'.
        mode: "none",
      },
    }),
    extractCSS,

    // @ts-ignore
    // Write out asset files to disk.
    new DiskPlugin({
      files: [
        { asset: new RegExp(helpers.escapeRegExp(webpackStatsFileName) + "$") },
        {
          asset: /\.css$/,
          output: {
            filename: "app.css",
          },
        },
      ],
      output: {
        path: helpers.rootAbs("build"),
      },
    }),
  ],
  resolve: {
    alias: {
      vue: "vue/dist/vue.runtime.min.js",
      ...webpack_aliase,
    },
    extensions: [".js"],
    modules: [helpers.rootAbs("node_modules"), helpers.rootAbs("src/js")],
  },
  stats: stats,
}

if (ENVLL.isDebugEnabled()) {
  // @ts-ignore
  webpackConfig.plugins.push(new StatsPlugin(webpackStatsFileName))
}

if (ENVLL.isDebugEnabled()) {
  const output = prettyFormat(webpackConfig, {
    highlight: true,
    maxDepth: ENVLL.isTraceEnabled() ? Infinity : 5,
  })
  // tslint:disable-next-line:no-console
  console.debug(output)
}

module.exports = webpackConfig
