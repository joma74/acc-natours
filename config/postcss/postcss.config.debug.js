module.exports = function (postcss) {
  return postcss([
    // @ts-ignore
    require("postcss-easy-import"),
    // @ts-ignore
    require("postcss-advanced-variables")({
      variables: { cssenv: "iamdevlper" },
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
  ])
}
