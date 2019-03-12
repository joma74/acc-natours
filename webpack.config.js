const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin")
const DiskPlugin = require("webpack-disk-plugin")
const prettyFormat = require("pretty-format")

/**
 * @type {import("webpack-dev-server").Configuration}
 */
const devServer = {
  port: 8080,
  watchContentBase: false,
  hot: true,
  stats: "errors-only",
  host: "0.0.0.0",
}

const webpack_aliase = {
  "@components": path.resolve(__dirname, "src/js/components/"),
  "@css": path.resolve(__dirname, "src/assets/css/"),
  "@font": path.resolve(__dirname, "src/assets/fonts/"),
  "@home": path.resolve(__dirname),
  "@html": path.resolve(__dirname, "src/html/"),
  "@icon": path.resolve(__dirname, "src/assets/icons/"),
  "@img": path.resolve(__dirname, "src/assets/img/"),
  "@js": path.resolve(__dirname, "src/js/"),
  "@svg": path.resolve(__dirname, "src/assets/svg/"),
}

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
    test: /\.(png|jpe?g|gif|svg)(#.*)?(\?.*)?$/,
    use: [
      {
        loader: "file-loader",
        options: {
          limit: 10000,
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
  "postcss-loader",
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
 * @type {import ("webpack").Configuration[]}
 */
const webpackConfig = [
  {
    entry: "./src/js/index",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
    },
    devServer,
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm.js",
        ...webpack_aliase,
      },
    },
    // devtool: "source-map",
    module: {
      rules: rules.concat({
        test: /\.css$/,
        use: /** @type {import("webpack").Loader[]} */ ([
          {
            loader: "style-loader",
          },
        ]).concat(cssLoader),
      }),
    },
    node,
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: "vendor",
        minChunks: function(module) {
          return module.context && module.context.indexOf("node_modules") !== -1
        },
      }),
      new HtmlWebpackPlugin({
        template: "src/template.html",
        title: "Template",
      }),
      new webpack.NamedModulesPlugin(),
      new HardSourceWebpackPlugin({
        // Clean up large, old caches automatically.
        cachePrune: {
          // Caches younger than `maxAge` are not considered for deletion. They must
          // be at least this (default: 2 days) old in milliseconds.
          maxAge: 2 * 24 * 60 * 60 * 1000,
          // All caches together must be larger than `sizeThreshold` before any
          // caches will be deleted. Together they must be at least this
          // (default: 10 MB) big in bytes.
          sizeThreshold: 10 * 1024 * 1024,
        },
        info: {
          // 'debug', 'log', 'info', 'warn', or 'error'.
          level: "debug",
          // 'none' or 'test'.
          mode: "none",
        },
      }),
    ],
  },
  {
    entry: "./src/js/dummy",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "dummy.js",
    },
    resolve: {
      alias: {
        ...webpack_aliase,
      },
    },
    module: {
      rules: rules.concat({
        test: /\.css$/,
        use: ExtractTextPlugin.extract({ use: cssLoader }),
      }),
    },
    node,
    plugins: [
      new webpack.NamedModulesPlugin(),
      new ExtractTextPlugin("styles.css"),
      // Write out asset files to disk.
      // @ts-ignore
      new DiskPlugin({
        output: {
          path: path.resolve(__dirname, "build"),
        },
        files: [
          {
            asset: /\.css$/,
            output: {
              filename: "styles.css",
            },
          },
        ],
      }),
    ],
  },
]

const output = prettyFormat(webpackConfig, { highlight: true })

console.log(output)

module.exports = webpackConfig
