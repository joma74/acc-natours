import { default as runTestCafe } from "testcafe"

const ENVMODE = require("../../config/env/ENVMODE")

/**
 * @type {TestCafe}
 */
let testcafe

runTestCafe()
  .then((tc) => {
    testcafe = tc
    const runner = testcafe.createRunner()

    return (
      runner
        /**
         * chrome  width=1280 +15 corr / height=1024
         * firefox width=1280 +10 corr / height=1024
         */
        .browsers([
          "chrome:headless:emulation:width=1280;height=1024;scaleFactor=2",
          "chrome:headless:emulation:width=1280;height=1024;scaleFactor=1",
          "firefox:headless -width=1280 -height=1024",
        ])
        .concurrency(2)
        .reporter([
          "spec",
          {
            name: "xunit",
            output:
              (ENVMODE.hasVDevelopment()
                ? process.env["npm_package_config_reports_dev"]
                : process.env["npm_package_config_reports_prod"]) +
              "/report.xml",
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
          assertionTimeout: 7000,
          selectorTimeout: 50000,
          speed: 1.0,
          stopOnFirstFail: false,
          skipJsErrors: true,
          pageLoadTimeout: 8000,
          quarantineMode: true,
        })
    )
  })
  .then((failed) => {
    console.log("Tests failed: " + failed)
    testcafe.close()
  })
