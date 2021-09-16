import { Selector } from "testcafe"

/**
 * Selects
 *
 * @param {string} imgSelector
 * @return the selected img element by the given imgSelector
 */
const selectImg = async (imgSelector) => {
  /** @type { SelectorAPI & HTMLImageElement} */
  const result = await /** @type { ? } */ (
    Selector(imgSelector)
  ).addCustomDOMProperties({
    // @ts-ignore
    complete: (/** @type {HTMLImageElement} */ el) => {
      return el.complete
    },
    // @ts-ignore
    naturalHeight: (/** @type {HTMLImageElement} */ el) => el.naturalHeight,
    // @ts-ignore
    naturalWidth: (/** @type {HTMLImageElement} */ el) => el.naturalWidth,
    // @ts-ignore
    currentSrc: (/** @type {HTMLImageElement} */ el) => el.currentSrc,
  })
  return result
}

export { selectImg }
