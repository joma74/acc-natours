let postcss_config = {
  plugins: [
    // @ts-ignore
    require("postcss-easy-import"),
    // @ts-ignore
    require("postcss-advanced-variables")({
      variables: { cssenv: process.env.NODE_ENV },
    }),
    // @ts-ignore
    require("postcss-calc"),
    // @ts-ignore
    require("postcss-color-mod-function"),
    // @ts-ignore
    require("postcss-atrule-bem"),
    // @ts-ignore
    require("postcss-nesting"),
    // @ts-ignore
    require("postcss-custom-media"),
    // @ts-ignore
    require("tailwindcss")("config/postcss/tailwind.js"),
    // @ts-ignore
    require("autoprefixer"),
  ],
}

if (process.env.NODE_ENV === "production") {
  postcss_config.plugins.push(
    require("@fullhuman/postcss-purgecss")({
      whitelist: ["html", "body", "acc-nat-touchevents"],
      content: ["./app.html", "./src/**/*.html"],
    }),
  )
  postcss_config.plugins.push(
    require("cssnano")({
      preset: [
        "default",
        {
          discardComments: {
            removeAll: true,
          },
        },
      ],
    }),
  )
}

module.exports = postcss_config
