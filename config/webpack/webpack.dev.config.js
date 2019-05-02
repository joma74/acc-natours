const ENVLL = require("../env/ENVLL")
const ENVMODE = require("../env/ENVMODE")

const helpers = require("../helpers")
const webpack = require("webpack")
const ENVAPPSRVPORT = require("../env/ENVAPPSRVPORT")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin")
const DiskPlugin = require("webpack-disk-plugin")
const prettyFormat = require("pretty-format")

/**
 * @type {import("webpack-dev-server").Configuration}
 */
const devServer = {
  port: parseInt(ENVAPPSRVPORT.getVDev()),
  watchContentBase: false,
  hot: true,
  stats: "normal",
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
    test: /\.(png|jpe?g|gif|svg|mov|mp4|webm)(#.*)?(\?.*)?$/,
    use: [
      {
        loader: "file-loader",
        options: {
          emitFile: true,
          name: "[name].[ext]",
          useRelativePath: true,
        },
      },
    ],
  },
  {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    loader: "url-loader",
    options: {
      limit: 10000,
      emitFile: true,
      name: "[name].[ext]",
      useRelativePath: true,
    },
  },
]

/**
 * @type {import("webpack").Loader[]}
 */
const cssLoader = [
  {
    loader: "css-loader",
    options: {
      importLoaders: 1,
    },
  },
  {
    loader: "postcss-loader",
    options: {
      ident: "postcss",
      config: {
        path: "./config/postcss/",
      },
    },
  },
]

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

/**
 * set MODE first!!
 */
const ENV_MODE = ENVMODE.setToDevelopment()

/**
 * @type {import ("webpack").Configuration[]}
 */
const webpackConfig = [
  {
    entry: {
      app: "./src/js/index",
    },
    output: {
      path: helpers.rootAbs("dist"),
      filename: "[name].js",
    },
    devServer,
    resolve: {
      alias: {
        vue: "vue/dist/vue.runtime.min.js",
        ...webpack_aliase,
      },
    },
    // devtool: "source-map",
    module: {
      rules: otherLoaders.concat({
        test: /\.css$/,
        use: [
          {
            loader: "extracted-loader",
          },
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              config: {
                path: "./config/postcss/",
              },
            },
          },
        ],
      }),
    },
    node,
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          ENV: JSON.stringify(ENV_MODE),
        },
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: "vendor",
        minChunks: function(module) {
          return module.context && module.context.indexOf("node_modules") !== -1
        },
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
        configHash: function() {
          return process.env.NODE_ENV
        },
        info: {
          // 'debug', 'log', 'info', 'warn', or 'error'.
          level: "debug",
          // 'none' or 'test'.
          mode: "none",
        },
      }),
      // @ts-ignore
      // Write out asset files to disk.
      new DiskPlugin({
        files: [
          {
            asset: /\.css$/,
            output: {
              filename: "styles.css",
            },
          },
        ],
        output: {
          path: helpers.rootAbs("build"),
        },
      }),
    ],
    stats: ENVLL.isDebugEnabled() ? "verbose" : "normal",
  },
]

if (ENVLL.isDebugEnabled()) {
  const output = prettyFormat(webpackConfig, {
    highlight: true,
    maxDepth: ENVLL.isTraceEnabled() ? Infinity : 5,
  })
  // tslint:disable-next-line:no-console
  console.debug(output)
}

module.exports = webpackConfig
