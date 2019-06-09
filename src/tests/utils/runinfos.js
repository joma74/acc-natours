const HEIGHT_RUNINFO_RE = /(?:-height=)([0-9]+|$)/
const WIDTH_RUNINFO_RE = /(?:-width=)([0-9]+|$)/
const TOUCH_RUNINFO_RE = /(?:-touch=)(.*?)(?=\s|$)/
const PROFILE_RUNINFO_RE = /(?:-profile\s)(.*?)(?=\s|$)/
const BROWSER_RUNINFO_RE = /^(\w+)(?=\s|:|$)/
const CHROME_RUNINFO_RE = /^(chrome)/
const FIREFOX_RUNINFO_RE = /^(firefox)/

/**
 * @typedef {{
 *      browserName: string | undefined;
 *      isTouchEnabled: boolean | undefined;
 *      height: number | undefined;
 *      width: number | undefined;
 *      profileDir: string | undefined;
 *   }} RunArgsBrowser - the cli args of the current browser
 */

/**
 * @typedef {{
 *      width: number;
 *      height: number;
 *      dpr: number;
 *      isTouchEnabled: boolean;
 * }} RunValuesBrowser - the runtime values of the current browser
 */

/**
 * @typedef {{
 *      ua: import("./useragent").UserAgentInfos
 *      runValuesBrowser: RunValuesBrowser,
 *      screenshotLeafDirName: string,
 *      screenshotDir: string,
 *      runArgsBrowser: RunArgsBrowser
 * }} RunInfoCtx - the ctx of the current fixture
 */

/**
 *
 * @param {TestController} t
 * @return {Promise<RunArgsBrowser>} runArgsBrowser
 */
const evaluateRunArgsBrowser = async function(t) {
  const result = {}

  const runArgsBrowser = await t.testRun.browserConnection.browserInfo.alias

  result.height = evalRegexAsInt(HEIGHT_RUNINFO_RE, runArgsBrowser)
  /**
   * @type {number | undefined}
   */
  result.width = evalRegexAsInt(WIDTH_RUNINFO_RE, runArgsBrowser)

  /**
   * @type {boolean | undefined}
   */
  result.isTouchEnabled = evalRegexAsBoolean(TOUCH_RUNINFO_RE, runArgsBrowser)

  result.browserName = evalRegexAsString(BROWSER_RUNINFO_RE, runArgsBrowser)

  if (FIREFOX_RUNINFO_RE.test(runArgsBrowser)) {
    result.profileDir = evalRegexAsString(PROFILE_RUNINFO_RE, runArgsBrowser)
  }

  /**
   * The opening dimensions are never the returned screenshot sizes.
   * Found out that
   * - chrome  width=1280 +15 corr
   * - firefox width=1280 +10 corr
   */
  if (result && result.width) {
    if (CHROME_RUNINFO_RE.test(runArgsBrowser)) {
      result.width = result.width + 15
    }
    if (FIREFOX_RUNINFO_RE.test(runArgsBrowser)) {
      result.width = result.width + 10
    }
  }

  return result
}

/**
 *
 * @param {TestController} t
 * @param {RunArgsBrowser} runArgsBrowser
 */
const resizeToRunInfoDimensions = async function(t, runArgsBrowser) {
  if (runArgsBrowser.width && runArgsBrowser.height) {
    await t.resizeWindow(runArgsBrowser.width, runArgsBrowser.height)
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

/**
 *
 * @param {RegExp} regExp
 * @param {string} string
 */
function evalRegexAsString(regExp, string) {
  const REResult = regExp.exec(string)
  if (REResult) {
    return REResult[1]
  }
}

export {
  evaluateRunArgsBrowser,
  resizeToRunInfoDimensions,
  setRunInfoCtx,
  getRunInfoCtx,
}
