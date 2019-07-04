import { default as freePort } from "get-port"

export default class ChromeBrowserConfig {
  /**
   *
   * @param {ChromeBrowserConfigBuilder} config
   */
  async init(config) {
    /**
     * @type {number}
     */
    this.automationPort = config.presetAutomationPort || (await freePort())
    this.emulation = config.isEmulation
    this.headless = config.isHeadless
    this.height = config.height
    this.mobile = config.isMobile
    this.scaleFactor = config.scaleFactor
    this.touch = config.isTouchDevice
    this.width = config.width
    return this
  }

  getAutomationPort() {
    return this.automationPort
  }

  toJSON() {
    return {
      automationPort: this.automationPort,
      emulation: this.emulation,
      headless: this.headless,
      height: this.height,
      mobile: this.mobile,
      scaleFactor: this.scaleFactor,
      touch: this.touch,
      width: this.width,
    }
  }

  output() {
    let browserString = "chrome"
    if (this.headless) {
      browserString = browserString + ":headless"
    }
    if (this.emulation) {
      browserString =
        browserString +
        `:emulation:width=${this.width};height=${this.height};scaleFactor=${this.scaleFactor};touch=${this.touch}`
      if (this.automationPort) {
        browserString = browserString + `;cdpPort=${this.automationPort}`
      }
    } else {
      browserString =
        browserString + ` --window-size=${this.width},${this.height}`
    }

    return browserString
  }

  static get Builder() {
    return ChromeBrowserConfigBuilder
  }
}

class ChromeBrowserConfigBuilder {
  constructor() {
    this.isHeadless = true
    this.isTouchDevice = true
    this.isMobile = true
    this.scaleFactor = 1
    this.width = 1280
    this.height = 1024
    this.isEmulation = true
    /** @type {number | undefined} */
    this.presetAutomationPort = undefined
  }

  withHeadless() {
    this.isHeadless = true
    return this
  }

  withoutHeadless() {
    this.isHeadless = false
    return this
  }

  withMobile() {
    this.isMobile = true
    return this
  }

  withDesktop() {
    this.isMobile = false
    return this
  }

  withTouch() {
    this.isTouchDevice = true
    return this
  }

  withoutTouch() {
    this.isTouchDevice = false
    return this
  }
  /**
   *
   * @param {number} scaleFactor
   */
  withScaleFactor(scaleFactor) {
    this.scaleFactor = scaleFactor
    return this
  }
  /**
   *
   * @param {number} pixels
   */
  withWidth(pixels) {
    this.width = pixels
    return this
  }
  /**
   *
   * @param {number} pixels
   */
  withHeight(pixels) {
    this.height = pixels
    return this
  }

  withEmulation() {
    this.isEmulation = true
    return this
  }

  withoutEmulation() {
    this.isEmulation = false
    return this
  }

  /**
   *
   * @param {number} automationPort
   */
  withPresetPort(automationPort) {
    this.presetAutomationPort = automationPort
    return this
  }

  withoutPresetPort() {
    this.presetAutomationPort = undefined
    return this
  }

  async build() {
    return await new ChromeBrowserConfig().init(this)
  }
}
