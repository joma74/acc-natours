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
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")

/**
 * set MODE first!!
 */
const ENV_MODE = ENVMODE.setToProduction()

const publicPath = "/"

const stats = ENVLL.isTraceEnabled()
  ? "verbose"
  : ENVLL.isDebugEnabled()
  ? "normal"
  : "errors-only"

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
        ident: "vuetpl",
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
          ident: "file-imgs",
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
          ident: "file-svgs",
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
          ident: "file-vids",
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
      ident: "url-fonts",
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
  devtool: false,
  entry: {
    app: "./src/js/index",
  },
  module: {
    rules: otherLoaders.concat({
      exclude: /node_modules/,
      test: /\.css$/,
      use: [
        ...extractCSS.extract({
          fallback: { loader: "style-loader", options: { ident: "style" } },
          use: [
            {
              loader: "css-loader",
              options: {
                ident: "css",
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
      ],
    }),
  },
  node,
  output: {
    chunkFilename: "[name].[chunkhash].js",
    filename: "[name].[chunkhash].js",
    hashDigestLength: 6,
    hashFunction: "md5",
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
      minChunks: function(module) {
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
      minChunks: Infinity,
    }),
    new HtmlWebpackPlugin({
      template: "src/template.html",
      title: "Natours | Exciting tours for adventurous people",
    }),

    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.optimize.ModuleConcatenationPlugin(),

    new webpack.HashedModuleIdsPlugin(),

    // @ts-ignore
    // see https://github.com/webpack-contrib/uglifyjs-webpack-plugin/tree/v1.2.1
    new UglifyJsPlugin({
      sourceMap: true,
      // https://github.com/angular/angular/issues/10618
      uglifyOptions: {
        compress: {
          passes: 1,
          warnings: false,
        },
        mangle: {
          keep_fnames: true,
        },
        nameCache: {},
        output: {
          comments: false,
        },
        // @ts-ignore
        parallel: true,
      },
    }),

    // For options see node_modules/webpack/lib/SourceMapDevToolPlugin.js
    new webpack.SourceMapDevToolPlugin({
      // only accepted param is [url]
      // append: `\n//# sourceMappingURL=http://localhost:${ENVAPPSRVPORT.getVProd()}/[url]`,
      filename: "sourcemaps/[file].map[query]",
      // onec css is included in regex, all breaks?!
      test: /\.(js|jsx)($|\?)/i,
      // See https://stackoverflow.com/a/55282204 for options
      append: null,
      module: true,
      columns: true,
      lineToLine: false,
      noSources: false,
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
    extractCSS,

    // @ts-ignore
    // Write out asset files to disk.
    new DiskPlugin({
      files: [
        { asset: new RegExp(helpers.escapeRegExp(webpackStatsFileName)) },
        {
          asset: /\.css$/,
          output: {
            filename: "app.css",
          },
        },
      ],
      output: {
        path: "build",
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
