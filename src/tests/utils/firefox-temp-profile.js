import path from "path"
import os from "os"
import mkdirp from "make-dir"
import tmp from "tmp"
import fs from "fs"

tmp.setGracefulCleanup()

const TESTCAFE_EXT_TMP_DIRS_ROOT = path.join(os.tmpdir(), "testcafe-ext")

export default class Firefox_Temp_Profile {
  /**
   *
   * @param {number} marionettePort
   * @param {string} namePrefix
   */
  constructor(marionettePort, namePrefix = "firefox-profile") {
    if (
      typeof marionettePort === "undefined" ||
      typeof marionettePort !== "number"
    ) {
      throw new Error(
        "value for given parameter >>marionettePort<< is missing or not a number",
      )
    }
    this.marionettePort = marionettePort
    mkdirp.sync(TESTCAFE_EXT_TMP_DIRS_ROOT)
    this.profileDir = tmp.dirSync({
      dir: TESTCAFE_EXT_TMP_DIRS_ROOT,
      prefix: namePrefix + "-",
      keep: false,
      unsafeCleanup: true,
    })
  }

  /**
   * @param {{scaleFactor?: number, touch?: boolean, disableMultiprocessing?: boolean}} config
   */
  async generatePreferences(config = {}) {
    const prefsFileName = path.join(this.profileDir.name, "user.js")

    let prefs = [
      'user_pref("browser.link.open_newwindow.override.external", 2);',
      'user_pref("app.update.enabled", false);',
      'user_pref("app.update.auto", false);',
      'user_pref("app.update.mode", 0);',
      'user_pref("app.update.service.enabled", false);',
      'user_pref("browser.shell.checkDefaultBrowser", false);',
      'user_pref("browser.usedOnWindows10", true);',
      'user_pref("browser.rights.3.shown", true);',
      'user_pref("browser.startup.homepage_override.mstone","ignore");',
      'user_pref("browser.tabs.warnOnCloseOtherTabs", false);',
      'user_pref("browser.tabs.warnOnClose", false);',
      'user_pref("browser.sessionstore.resume_from_crash", false);',
      'user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);',
      'user_pref("toolkit.telemetry.enabled", false);',
      'user_pref("toolkit.telemetry.rejected", true);',
      'user_pref("datareporting.healthreport.uploadEnabled", false);',
      'user_pref("datareporting.healthreport.service.enabled", false);',
      'user_pref("datareporting.healthreport.service.firstRun", false);',
      'user_pref("datareporting.policy.dataSubmissionEnabled", false);',
      'user_pref("datareporting.policy.dataSubmissionPolicyBypassNotification", true);',
      'user_pref("app.shield.optoutstudies.enabled", false);',
      'user_pref("extensions.shield-recipe-client.enabled", false);',
      'user_pref("extensions.shield-recipe-client.first_run", false);',
      'user_pref("extensions.shield-recipe-client.startupExperimentPrefs.browser.newtabpage.activity-stream.enabled", false);',
      'user_pref("devtools.toolbox.host", "window");',
      'user_pref("devtools.toolbox.previousHost", "bottom");',
      'user_pref("signon.rememberSignons", false);',
    ]
    prefs = prefs.concat([
      `user_pref("marionette.port", ${this.marionettePort});`,
      'user_pref("marionette.enabled", true);',
    ])

    if (typeof config.scaleFactor !== "undefined") {
      prefs = prefs.concat([
        `user_pref("layout.css.devPixelsPerPx", "${config.scaleFactor}");`,
      ])
    }

    if (typeof config.touch !== "undefined") {
      prefs = prefs.concat([
        'user_pref("browser.touchmode.auto", false);',
        'user_pref("dom.w3c_touch_events.legacy_apis.enabled", true);',
      ])

      if (config.touch)
        prefs = prefs.concat(['user_pref("dom.w3c_touch_events.enabled", 1);'])
      else {
        prefs = prefs.concat(['user_pref("dom.w3c_touch_events.enabled", 0);'])
      }
    }

    if (config.disableMultiprocessing) {
      prefs = prefs.concat([
        'user_pref("browser.tabs.remote.autostart", false);',
        'user_pref("browser.tabs.remote.autostart.2", false);',
      ])
    }

    await fs.writeFileSync(prefsFileName, prefs.join("\n"))

    return this
  }
}
