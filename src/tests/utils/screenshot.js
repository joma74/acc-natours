import { getRunInfoCtx } from "./runinfos"

const path = require("path")
var fs = require("fs")

/**
 *
 * @param {TestController} t
 * @param {string} screenshotDirName
 * @param {string} screenshotFileName
 */
const takeScreenshot = async (t, screenshotDirName, screenshotFileName) => {
  const pathToScreenshot = path.join(
    t.testRun.test.fixture.name,
    t.testRun.test.name,
    screenshotDirName,
    screenshotFileName,
  )
  await t.takeScreenshot(pathToScreenshot)
}

/**
 *
 * @param {TestController} t
 * @param {string} screenshotFileName
 */
const takeScreenshotAtRunInfoContext = async (t, screenshotFileName) => {
  const runInfoCtx = getRunInfoCtx(t)
  const pathToScreenshot = path.join(
    t.testRun.test.fixture.name,
    t.testRun.test.name,
    runInfoCtx.screenshotLeafDirName,
    screenshotFileName,
  )
  await t.takeScreenshot(pathToScreenshot)
}

/**
 *
 * @param {TestController} t
 * @param {string} selector
 * @param {string} screenshotFileName
 */
const takeElementScreenshotAtRunInfoContext = async (
  t,
  selector,
  screenshotFileName,
) => {
  const runInfoCtx = getRunInfoCtx(t)
  const pathToScreenshot = path.join(
    t.testRun.test.fixture.name,
    t.testRun.test.name,
    runInfoCtx.screenshotLeafDirName,
    screenshotFileName,
  )
  await t.takeElementScreenshot(selector, pathToScreenshot)
}

/**
 *
 * @param {TestController} t
 * @param {string} screenshotDirName
 * @param {string} screenshotFileName
 */
const takeScreenshotGetByteBuffer = async (
  t,
  screenshotDirName,
  screenshotFileName,
) => {
  await takeScreenshot(t, screenshotDirName, screenshotFileName)
  const pathToScreenshot = path.join(
    t.testRun.opts.screenshotPath,
    screenshotDirName,
    screenshotFileName,
  )
  return fs.readFileSync(pathToScreenshot)
}

export {
  takeElementScreenshotAtRunInfoContext,
  takeScreenshot,
  takeScreenshotAtRunInfoContext,
  takeScreenshotGetByteBuffer,
}
