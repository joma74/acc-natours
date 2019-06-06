const HEIGHT_RUNINFO_RE = /(?:height=)([0-9]+)/
const WIDTH_RUNINFO_RE = /(?:width=)([0-9]+)/
const TOUCH_RUNINFO_RE = /(?:touch=)([0-9]+)/
const CHROME_RUNINFO_RE = /(chrome\:)/
const FIREFOX_RUNINFO_RE = /(firefox\:)/

/**
 * @typedef {{
 *      width: number;
 *      height: number;
 *      dpr: number;
 *      isTouchEnabled: boolean
 * }} RunInfoBrowser - the ctx of the current browser
 */

/**
 * @typedef {{
 *      ua: import("./useragent").UserAgentInfos
 *      browser: RunInfoBrowser,
 *      screenshotLeafDirName: string,
 *      screenshotDir: string
 * }} RunInfoCtx - the ctx of the current fixture
 */

/**
 *
 * @param {TestController} t
 */
const evaluateRunInfo = async function(t) {
  const result = {}

  const runInfo = await t.testRun.browserConnection.browserInfo.alias

  result.height = evalRegexAsInt(HEIGHT_RUNINFO_RE, runInfo)
  /**
   * @type {number | undefined}
   */
  result.width = evalRegexAsInt(WIDTH_RUNINFO_RE, runInfo)

  /**
   * @type {boolean | undefined}
   */
  result.isTouchEnabled = evalRegexAsBoolean(TOUCH_RUNINFO_RE, runInfo)

  /**
   * The opening dimensions are never the returned screenshot sizes.
   * Found out that
   * - chrome  width=1280 +15 corr
   * - firefox width=1280 +10 corr
   */
  if (result && result.width) {
    if (CHROME_RUNINFO_RE.test(runInfo)) {
      result.width = result.width + 15
    }
    if (FIREFOX_RUNINFO_RE.test(runInfo)) {
      result.width = result.width + 10
    }
  }

  return result
}

/**
 *
 * @param {TestController} t
 */
const resizeToRunInfoDimensions = async function(t) {
  const runInfoDimensions = await evaluateRunInfo(t)
  if (runInfoDimensions.width && runInfoDimensions.height) {
    await t.resizeWindow(runInfoDimensions.width, runInfoDimensions.height)
  }
}

/**
 *
 * @param {TestController} t
 * @param {RunInfoCtx} runInfoCtx
 */
const setRunInfoCtx = function(t, runInfoCtx) {
  t.ctx.runInfoCtx = runInfoCtx
}

/**
 *
 * @param {TestController} t
 * @return {RunInfoCtx} runInfoCtx
 */
const getRunInfoCtx = function(t) {
  return t.ctx.runInfoCtx
}

/**
 *
 * @param {RegExp} regExp
 * @param {string} string
 */
function evalRegexAsInt(regExp, string) {
  const REResult = regExp.exec(string)
  if (REResult) {
    return Number.parseInt(REResult[1])
  }
}

/**
 *
 * @param {RegExp} regExp
 * @param {string} string
 */
function evalRegexAsBoolean(regExp, string) {
  const REResult = regExp.exec(string)
  if (REResult) {
    return REResult[1] === "true"
  }
}

export {
  evaluateRunInfo,
  resizeToRunInfoDimensions,
  setRunInfoCtx,
  getRunInfoCtx,
}
