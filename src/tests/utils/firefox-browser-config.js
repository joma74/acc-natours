import Firefox_Temp_Profile from "./firefox-temp-profile"
import { default as freePort } from "get-port"

export default class FirefoxBrowserConfig {
  /**
   *
   * @param {FirefoxBrowserConfigBuilder} config
   */
  async init(config) {
    this.headless = config.isHeadless
    this.touch = config.isTouchDevice
    this.scaleFactor = config.scaleFactor
    this.width = config.width
    this.height = config.height
    /**
     * @type {number}
     */
    this.automationPort = config.presetAutomationPort || (await freePort())
    this.ff_profile = new Firefox_Temp_Profile(
      this.automationPort,
    ).generatePreferences({
      scaleFactor: this.scaleFactor,
      touch: this.touch,
    })
    this.automationPort = this.ff_profile.marionettePort
    this.profileDir = this.ff_profile.profileDir
    return this
  }

  getAutomationPort() {
    return this.automationPort
  }

  getProfileDir() {
    return this.profileDir
  }

  toJSON() {
    return {
      headless: this.headless,
      touch: this.touch,
      scaleFactor: this.scaleFactor,
      width: this.width,
      height: this.height,
      automationPort: this.automationPort,
      profileDir: this.profileDir,
    }
  }

  output() {
    let browserString
    if (this.headless) {
      browserString = `firefox:headless:marionettePort=${this.automationPort} -profile ${this.profileDir} -width=${this.width} -height=${this.height} -scaleFactor=${this.scaleFactor} -touch=${this.touch}`
    } else {
      browserString = `firefox -profile=${this.profileDir} -width=${this.width} -height=${this.height} -scaleFactor=${this.scaleFactor} -touch=${this.touch}`
    }
    return browserString
  }

  static get Builder() {
    return FirefoxBrowserConfigBuilder
  }
}

class FirefoxBrowserConfigBuilder {
  constructor() {
    this.isHeadless = true
    this.isTouchDevice = true
    this.scaleFactor = 1
    this.width = 1280
    this.height = 1024
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
    return new FirefoxBrowserConfig().init(this)
  }
}
