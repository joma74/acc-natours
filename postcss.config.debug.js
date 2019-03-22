module.exports = function(postcss) {
  return postcss([
    // @ts-ignore
    require("postcss-import"),
    // @ts-ignore
    require("postcss-advanced-variables")({
      variables: { cssenv: "iamdevlper" },
    }),
    // @ts-ignore
    require("postcss-calc"),
    // @ts-ignore
    require("postcss-atrule-bem"),
    // @ts-ignore
    require("postcss-nesting"),
    // @ts-ignore
    require("tailwindcss")("./tailwind.js"),
    // @ts-ignore
    require("autoprefixer"),
  ])
}
