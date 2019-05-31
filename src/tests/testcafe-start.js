import { default as createTestCafe } from "testcafe"

const ENVAPPSRVPORT = require("../../config/env/ENVAPPSRVPORT")

/**
 * @type {TestCafe}
 */
let testcafe

createTestCafe()
  .then((tc) => {
    testcafe = tc
    const runner = testcafe.createRunner()

    return runner
      .browsers([
        "chrome:headless:emulation:width=1280;height=1024;scaleFactor=2",
        "chrome:headless:emulation:width=1280;height=1024;scaleFactor=1",
      ])
      .concurrency(2)
      .reporter([
        "spec",
        {
          name: "xunit",
          output: process.env["npm_package_config_reports_dev"] + "/report.xml",
        },
      ])
      .screenshots(
        // @ts-ignore
        process.env["npm_package_config_screenshots_dev"],
        true,
        process.env["npm_package_config_screenshot-path-pattern"],
      )
      .src(["src/tests/index-test.js"])
      .run({
        assertionTimeout: 7000,
        selectorTimeout: 50000,
        speed: 1.0,
        stopOnFirstFail: false,
        skipJsErrors: true,
        pageLoadTimeout: 8000,
        quarantineMode: true,
      })
  })
  .then((failed) => {
    console.log("Tests failed: " + failed)
    testcafe.close()
  })
