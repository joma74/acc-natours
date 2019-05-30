import { ClientFunction, Selector } from "testcafe"
import { createElementSelector } from "./std-func"

/**
 * @param {TestController} t
 * @param {SelectorAPI} selectedElm
 */
const checkElement = async (t, selectedElm) => {
  await t.expect(selectedElm.exists).ok()
}

/**
 * @param {string} selector
 * @param {ScrollIntoViewOptions=} options
 */
const scrollIntoView = (
  selector,
  options = { inline: "center", block: "center", behavior: "smooth" },
) => {
  const elm = document.querySelector(selector)
  // @ts-ignore
  elm.scrollIntoView(options)
}

const scrollClientFunction = ClientFunction(scrollIntoView)

/**
 * @param {TestController} t
 * @param {string} selector
 * @param {ScrollIntoViewOptions=} options
 */
const scrollTo = async (t, selector, options) => {
  await checkElement(t, createElementSelector(selector))
  await scrollClientFunction(selector, options)
}

export { scrollTo }
