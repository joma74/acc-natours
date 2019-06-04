import { Selector, ClientFunction } from "testcafe"

/**
 * @param {string} selector
 */
const createElementSelector = (selector) => {
  return Selector(selector)
}

const readUserAgent = ClientFunction(() => navigator.userAgent)

const readDevicePixelRatio = ClientFunction(() => {
  return {
    dpr: window.devicePixelRatio,
  }
})

const readClientDimensions = ClientFunction(() => {
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  }
})

export {
  createElementSelector,
  readUserAgent,
  readDevicePixelRatio,
  readClientDimensions,
}
