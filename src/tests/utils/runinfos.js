const HEIGHT_RUNINFO_RE = /(?:height=)([0-9]+)/
const WIDTH_RUNINFO_RE = /(?:width=)([0-9]+)/
const CHROME_RUNINFO_RE = /(chrome\:)/
const FIREFOX_RUNINFO_RE = /(firefox\:)/

/**
 *
 * @param {TestController} t
 */
const getRunInfoDimensions = async function(t) {
  const result = {}

  const runInfo = await t.testRun.browserConnection.browserInfo.alias

  result.height = evalRegex(HEIGHT_RUNINFO_RE, runInfo)
  /**
   * @type {number | undefined}
   */
  result.width = evalRegex(WIDTH_RUNINFO_RE, runInfo)

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
  const runInfoDimensions = await getRunInfoDimensions(t)
  if (runInfoDimensions.width && runInfoDimensions.height) {
    await t.resizeWindow(runInfoDimensions.width, runInfoDimensions.height)
  }
}

/**
 *
 * @param {RegExp} regExp
 * @param {string} string
 */
function evalRegex(regExp, string) {
  const REResult = regExp.exec(string)
  if (REResult) {
    return Number.parseInt(REResult[1])
  }
}

export { getRunInfoDimensions, resizeToRunInfoDimensions }
