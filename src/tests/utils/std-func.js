import { Selector, ClientFunction } from "testcafe"

/**
 * @param {string} selector
 */
const createElementSelector = (selector) => {
  return Selector(selector)
}

const readUserAgent = ClientFunction(() => navigator.userAgent)

const readDevicePixelRatio = ClientFunction(() => window.devicePixelRatio)

export { createElementSelector, readUserAgent, readDevicePixelRatio }
