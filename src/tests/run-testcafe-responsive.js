import { default as runTestCafe } from "testcafe"
import FirefoxBrowserConfig from "./utils/firefox-browser-config"
import ChromeBrowserConfig from "./utils/chrome-browser-config"

const ENVMODE = require("../../config/env/ENVMODE")

/**
 * @type {TestCafe}
 */
let testcafe

runTestCafe()
  .then(async (tc) => {
    testcafe = tc
    const runner = testcafe.createRunner()

    return runner
      .browsers([
        (await new ChromeBrowserConfig.Builder()
          .withoutHeadless()
          .withoutEmulation()
          .withWidth(600)
          .withHeight(800)
          .withoutTouch()
          .build()).output(),
        // (await new ChromeBrowserConfig.Builder()
        //   .withoutHeadless()
        //   .withoutEmulation()
        //   .withWidth(601)
        //   .withHeight(800)
        //   .withoutTouch()
        //   .build()).output(),
        // (await new ChromeBrowserConfig.Builder()
        //   .withHeadless()
        //   .withWidth(600)
        //   .withHeight(800)
        //   .withoutTouch()
        //   .build()).output(),
        // (await new ChromeBrowserConfig.Builder()
        //   .withHeadless()
        //   .withWidth(601)
        //   .withHeight(800)
        //   .withoutTouch()
        //   .build()).output(),
        // "chrome:headless:emulation:width=1280;height=1024;scaleFactor=1;mobile=true;touch=false",
        // "chrome:headless:emulation:width=1280;height=1024;scaleFactor=2;mobile=true;touch=true",
        // (await new FirefoxBrowserConfig.Builder()
        //   .withoutHeadless()
        //   .withWidth(600)
        //   .withHeight(800)
        //   .withoutTouch()
        //   .build()).output(),
        // (await new FirefoxBrowserConfig.Builder()
        //   .withoutHeadless()
        //   .withWidth(601)
        //   .withHeight(800)
        //   .withoutTouch()
        //   .build()).output(),
        // (await new FirefoxBrowserConfig.Builder()
        //   .withHeadless()
        //   .withWidth(600)
        //   .withHeight(800)
        //   .withoutTouch()
        //   .build()).output(),
        // (await new FirefoxBrowserConfig.Builder()
        //   .withHeadless()
        //   .withWidth(601)
        //   .withHeight(800)
        //   .withoutTouch()
        //   .build()).output(),
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
      .src(["src/tests/responsive-test.js"])
      .run({
        assertionTimeout: 7000,
        selectorTimeout: 50000,
        debugMode: false,
        speed: 1.0,
        stopOnFirstFail: false,
        skipJsErrors: true,
        pageLoadTimeout: 8000,
        quarantineMode: false,
      })
  })
  .then((failed) => {
    console.log("Tests failed: " + failed)
    testcafe.close()
  })
  .finally(() => {})
