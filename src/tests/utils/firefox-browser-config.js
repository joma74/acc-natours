import Firefox_Temp_Profile from "./firefox-temp-profile"
import { default as freePort } from "get-port"
import { render } from "./templater"

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
    if (this.headless) {
      this.ff_profile = await new Firefox_Temp_Profile(
        await freePort(),
      ).generatePreferences({
        scaleFactor: this.scaleFactor,
        touch: this.touch,
      })
    }
    return this
  }

  getMarionettePort() {
    return this.ff_profile != null ? this.ff_profile.marionettePort : null
  }

  getProfileDir() {
    return this.ff_profile != null ? this.ff_profile.profileDir.name : null
  }

  toJSON() {
    return {
      headless: this.headless,
      touch: this.touch,
      scaleFactor: this.scaleFactor,
      width: this.width,
      height: this.height,
      marionettePort:
        this.ff_profile != null ? this.ff_profile.marionettePort : null,
      profileDir:
        this.ff_profile != null ? this.ff_profile.profileDir.name : null,
    }
  }

  print() {
    let browserString
    let configJson = this.toJSON()
    if (this.headless) {
      browserString = render(
        "firefox:headless:marionettePort={{{ marionettePort }}} -profile {{{ profileDir }}} -width={{{ width }}} -height={{{ height }}} -scaleFactor={{{ scaleFactor }}} -touch={{{ touch }}}",
        configJson,
      )
    } else {
      browserString = render(
        "firefox -profile={{{ profileDir }}} -width={{{ width }}} -height={{{ height }}} -scaleFactor={{{ scaleFactor }}} -touch={{{ touch }}}",
        configJson,
      )
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

  async build() {
    return await new FirefoxBrowserConfig().init(this)
  }
}
