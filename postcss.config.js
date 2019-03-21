module.exports = {
  plugins: [
    // @ts-ignore
    require("postcss-import"),
    // @ts-ignore
    require("postcss-advanced-variables")({
      variables: { cssenv: process.env.NODE_ENV },
    }),
    // @ts-ignore
    require("postcss-calc"),
    // @ts-ignore
    require("postcss-nesting"),
    // @ts-ignore
    require("tailwindcss")("./tailwind.js"),
    // @ts-ignore
    require("autoprefixer"),
  ],
}
