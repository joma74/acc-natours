// @ts-ignore
import renderFnkt from "@home/app.html?style=@home/app.css"

/** @typedef {import("vue").default} Vue */
/** @type {import("vue").ComponentOptions<Vue>} */
let vueComponentOptions = {
  name: "SPARoot",
  mounted() {
    /** @type {import("vue").default} */
    // @ts-ignore
    const compInst = this
    if (compInst.$el instanceof HTMLBodyElement)
      document.documentElement.replaceChild(compInst.$el, document.body)
    else
      console.error(
        `this.el having a value of >>${
          compInst.$el
        }<< should be an HTMLBodyElement but is not`,
      )
  },
}

export default renderFnkt(vueComponentOptions)
