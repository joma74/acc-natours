const ENVLL = require("../env/ENVLL")
const ENVMODE = require("../env/ENVMODE")

const helpers = require("../helpers")
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const webpack = require("webpack")

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
 * @type {import("webpack").Loader[]}
 */
const commonCssLoader = [
  {
    loader: "css-loader",
    options: {
      importLoaders: 1,
      minimize: ENVMODE.hasVProduction(),
      sourceMap: ENVMODE.hasVProduction(),
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
 * @type {import("webpack").Rule[]}
 */
const rules = [
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
          name: ENVMODE.hasVDevelopment()
            ? "[name].[ext]"
            : "[name][hash:6].[ext]",
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
 * @type {import ("webpack").Configuration}
 */
const commonDevProdConfig = {
  module: {
    rules: rules,
  },
  node,
  resolve: {
    alias: {
      vue: "vue/dist/vue.runtime.min.js",
      ...webpack_aliase,
    },
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      chunks: ["app"],
      minChunks: function(module) {
        if (ENVLL.isTraceEnabled()) {
          // tslint:disable-next-line:no-console
          console.debug("[vendor] " + JSON.stringify(module.resource))
        }
        const result =
          module.context && module.context.indexOf("node_modules") !== -1
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
    new HtmlWebpackPlugin({
      hunksSortMode: function(a, b) {
        const chunksNamePart = ["wp-runtime", "vendor", "app"]
        return (
          (chunksNamePart.indexOf(a.names[0]) -
          chunksNamePart.indexOf(b.names[0]))
        )
      },
      hash: false,
      inject: true,
      template: "src/template.html",
      title: "Natours | Exciting tours for adventurous people",
    }),
  ],
}

module.exports = { commonDevProdConfig, commonCssLoader }
