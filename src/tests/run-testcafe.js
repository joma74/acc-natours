import { default as runTestCafe } from "testcafe"
import { default as freePort } from "get-port"
import Firefox_Temp_Profile from "./utils/firefox-temp-profile"

const ENVMODE = require("../../config/env/ENVMODE")

/**
 * @type {TestCafe}
 */
let testcafe

runTestCafe()
  .then(async (tc) => {
    testcafe = tc
    const runner = testcafe.createRunner()

    const ff_t_p_scaleFactor1_touchT = await new Firefox_Temp_Profile(
      await freePort(),
    ).generatePreferences({ scaleFactor: 1, touch: true })
    const ff_t_p_scaleFactor2_touchT = await new Firefox_Temp_Profile(
      await freePort(),
    ).generatePreferences({ scaleFactor: 1, touch: true })
    const ff_t_p_scaleFactor3_touchF = await new Firefox_Temp_Profile(
      await freePort(),
    ).generatePreferences({ scaleFactor: 2, touch: false })

    return runner
      .browsers([
        // "chrome:headless:emulation:width=320;height=480;scaleFactor=1;mobile=true;touch=true --no-sandbox --disable-gpu",
        // "chrome:headless:emulation:width=600;height=1024;scaleFactor=1;mobile=true;touch=true --no-sandbox --disable-gpu",
        "chrome:headless:emulation:width=1280;height=1024;scaleFactor=1;mobile=true;touch=false --no-sandbox",
        "chrome:headless:emulation:width=1280;height=1024;scaleFactor=2;mobile=true;touch=true --no-sandbox",
        // `firefox:headless:marionettePort=${ff_t_p_scaleFactor1_touchT.marionettePort} -profile ${ff_t_p_scaleFactor1_touchT.profileDir.name} -width=600 -height=1024 -scaleFactor=1 -touch=true`,
        `firefox:headless:marionettePort=${ff_t_p_scaleFactor2_touchT.marionettePort} -profile ${ff_t_p_scaleFactor2_touchT.profileDir.name} -width=1280 -height=1024 -scaleFactor=1 -touch=true`,
        `firefox:headless:marionettePort=${ff_t_p_scaleFactor3_touchF.marionettePort} -profile ${ff_t_p_scaleFactor3_touchF.profileDir.name} -width=1280 -height=1024 -scaleFactor=2 -touch=false`,
      ])
      .concurrency(1)
      .reporter([
        "spec",
        {
          name: "xunit",
          output:
            (ENVMODE.hasVDevelopment()
              ? process.env["npm_package_config_reports_dev"]
              : process.env["npm_package_config_reports_prod"]) + "/report.xml",
        },
      ])
      .screenshots(
        // @ts-ignore
        ENVMODE.hasVDevelopment()
          ? process.env["npm_package_config_screenshots_dev"]
          : process.env["npm_package_config_screenshots_prod"],
        true,
        process.env["npm_package_config_screenshot-path-pattern"],
      )
      .src(["src/tests/index-test.js"])
      .run({
        assertionTimeout: 5000,
        selectorTimeout: 5000,
        debugMode: false,
        speed: 1,
        stopOnFirstFail: false,
        skipJsErrors: true,
        pageLoadTimeout: 5000,
        quarantineMode: false,
      })
  })
  .then((failed) => {
    console.log("Tests failed: " + failed)
    testcafe.close()
  })
  .finally(() => {})
